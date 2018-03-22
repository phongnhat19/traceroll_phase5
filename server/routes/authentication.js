"use strict";
(function(Auth) {
	

	var passport = require('passport'),
		passportLocal = require('passport-local').Strategy,
		nconf = require('nconf'),
		winston = require('winston'),
		async = require('async'),
		validator = require('validator'),
		express = require('express'),

		Password = require('../controllers/password'),
		user = require('../models/users'),
		db = require('../database/mongo'),
		hotswap = require('./../controllers/hotswap'),
		utils = require('../../public/js/utils'),
		meta = {config:{}},
		loginStrategies = [];

	Auth.initialize = function(app, middleware) {
		app.use(passport.initialize());
		app.use(passport.session());

		app.use(function(req, res, next) {
			
			req.uid = req.user ? parseInt(req.user.uid, 10) : 0;
			next();
		});

		Auth.app = app;
		Auth.middleware = middleware;
	};

	Auth.getLoginStrategies = function() {
		return loginStrategies;
	};

	Auth.reloadRoutes = function(callback) {
		var router = express.Router();
		router.hotswapId = 'auth';

		loginStrategies.length = 0;
		passport.use(new passportLocal({passReqToCallback: true}, Auth.login));

		loginStrategies.forEach(function(strategy) {

			if (strategy.url) {
				router.get(strategy.url, passport.authenticate(strategy.name, {
					scope: strategy.scope
				}));
			}

			router.get(strategy.callbackURL, passport.authenticate(strategy.name, {
				successReturnToOrRedirect: nconf.get('relative_path') + '/',
				failureRedirect: nconf.get('relative_path') + '/login'
			}));
		});

		router.post('/logout', logout);
		router.post('/register', register);
		router.post('/login',login);
		router.post('/editUser',edit);

		hotswap.replace('auth', router);
		if (typeof callback === 'function') {
			callback();
		}
	};

	Auth.login = function(req, username, password, next) {
		if (!username || !password) {
			return next(new Error('[[error:invalid-password]]'));
		}

		winston.info('Auth.login');
		var userslug = utils.slugify(username);
		winston.info('userslug: ' + userslug);
		var uid, userData = {};

		async.waterfall([
			function(next) {
				winston.info('Getting user id by user slug')
				user.getUidByUserslug(userslug, next);
			},
			function(_uid, next) {
				winston.info('ipAdress: ', req.ip);
				if (!_uid) {
					return next(new Error('User not found'));
				}
				uid = _uid;
				user.isAdministrator(uid, function (err, isAdmin) {
					if (!err && isAdmin){
						//Bypass log attempt when account is administrator
						next();
					}else{

						user.auth.logAttempt(uid, req.ip, next);
					}
				});
				
				winston.info('userId: ' + uid);
			},
			function(next) {
				winston.info('Getting user data...')
				async.parallel({
					userData: function(next) {
						db.getObjectFields('user:' + uid, ['password', 'email', 'picture','firstname','lastname', 'username'], next);
					},
					isAdmin: function(next) {
						user.isAdministrator(uid, next);
					},
					isAgent: function(next) {
						user.isAgent(uid, next);
					}
				}, next);
			},
			function(result, next) {
				userData = result.userData;
				userData.uid = uid;
				userData.isAdmin = result.isAdmin;
				userData.isAgent = result.isAgent;
				if (!result.isAdmin && parseInt(meta.config.allowLocalLogin, 10) === 0) {
					return next(new Error('[[error:local-login-disabled]]'));
				}

				if (!userData || !userData.password) {
					return next(new Error('[[error:invalid-user-data]]'));
				}
				if (userData.banned && parseInt(userData.banned, 10) === 1) {
					return next(new Error('[[error:user-banned]]'));
				}
				Password.compare(password, userData.password, next);
			},
			function(passwordMatch, next) {
				if (!passwordMatch) {
					return next(new Error('Password incorrect'));
				}
				winston.info('Password matched');
				user.auth.clearLoginAttempts(uid);
				var status = 'online';
				db.setObjectField('user:'+uid,'status',status,function (err,result){

				})
				next(null, userData, '[[success:authentication-successful]]');
			}
		], next);
	};

	passport.serializeUser(function(user, done) {

		done(null, user.uid);
	});

	passport.deserializeUser(function(uid, done) {
		done(null, {
			uid: uid
		});
	});

	function login(req, res, next) {

		if (req.body.hasOwnProperty('returnTo') && !req.session.returnTo) {
			req.session.returnTo = req.body.returnTo;
		}

		var loginWith = 'username-email';

		if (req.body.username && utils.isEmailValid(req.body.username) && loginWith.indexOf('email') !== -1) {
			user.getUsernameByEmail(req.body.username, function(err, username) {
				if (err) {
					return next(err);
				}
				req.body.username = username ? username : req.body.username;
				Auth.continueLogin(req, res, next);
			});
		} else if (loginWith.indexOf('username') !== -1 && !validator.isEmail(req.body.username)) {
			winston.info('login with username');
			Auth.continueLogin(req, res, next);
		} else {
			res.status(500).send('[[error:wrong-login-type-' + loginWith + ']]');
		}
	}

	Auth.continueLogin = function(req, res, next) {
		winston.info('continuteLogin....');
		passport.authenticate('local', function(err, userData, info) {
			winston.info('in passport.authenticate');
			if (err) {
				winston.error('err: ' + err.message);
				return res.status(403).send(err.message);
			}
			winston.info('userData: ' + JSON.stringify(userData));
			if (!userData) {
				if (typeof info === 'object') {
					info = 'user-password-incorrect';
				}

				return res.status(403).send(info);
			}
			
			var passwordExpiry = userData.passwordExpiry !== undefined ? parseInt(userData.passwordExpiry, 10) : null;
			console.log(passwordExpiry);
			// Alter user cookie depending on passed-in option
			if (req.body.remember === 'on') {
				var duration = 1000*60*60*24*parseInt(meta.config.loginDays || 14, 10);
				req.session.cookie.maxAge = duration;
				req.session.cookie.expires = new Date(Date.now() + duration);
			} else {
				var loginExpiry = 1000 * 60 * 60 * 6;
				req.session.cookie.maxAge = loginExpiry;
				req.session.cookie.expires = new Date(Date.now() + loginExpiry);

			}

			if (passwordExpiry && passwordExpiry < Date.now()) {

				winston.verbose('[auth] Triggering password reset for uid ' + userData.uid + ' due to password policy');
				req.session.passwordExpired = true;
				user.reset.generate(userData.uid, function(err, code) {

					res.status(200).send(nconf.get('relative_path') + '/reset/' + code);
				});
			} else {

				req.login({
					uid: userData.uid
					
				}, function(err) {
					
					if (err) {
						return res.status(200).send(err.message);
					}
					if (userData.uid) {
						console.log('LogIP: ' + req);
						user.logIP(userData.uid, req.ip);

					}
					var userObj;
					
					if (!req.session.returnTo) {

						console.log('relative_path: ' + nconf.get('relative_path'));
						user.getUsers([userData.uid], function (err, data) {
								userObj = data[0];
								res.status(200).send(userObj);
						});
						
						
					} else {
						var next = req.session.returnTo;
						delete req.session.returnTo;
						user.getUsers([userData.uid], function (err, data) {
								userObj = data[0];
								userObj.returnTo = next;

								res.status(200).send(userObj);
							});					
					}
				});
			}

		})(req, res, next);
	};

	function register(req, res) {
		if (parseInt(meta.config.allowRegistration, 10) === 0) {
			return res.sendStatus(403);
		}

		var userData = {};

		for (var key in req.body) {
			if (req.body.hasOwnProperty(key)) {
				userData[key] = req.body[key];
			}
		}
		winston.info(userData);
		var uid;
		async.waterfall([
			function(next) {
				if (!userData.email) {
					return next(new Error('Invalid email'));
				}

				if (!userData.username || userData.username.length < 3/*meta.config.minimumUsernameLength*/) {
					return next(new Error('Username too short'));
				}

				if (userData.username.length > 20/*meta.config.maximumUsernameLengt*/) {
					return next(new Error('Username too long'));
				}

				if (!userData.password || userData.password.length < 3/*meta.config.minimumPasswordLength*/) {
					return next(new Error('Password too short'));
				}
				
				next(null,userData);
			},
			function(data, next) {
				
				user.create(data, next);
			},
			function(_uid, next) {
				
				uid = _uid;
				req.login({uid: uid}, next);
			},
			function(next) {
				//user.logIP(uid, req.ip);

				//user.notifications.sendWelcomeNotification(uid);

				//plugins.fireHook('filter:register.complete', {uid: uid, referrer: req.body.referrer}, next);
				//console.log(req.body.referrer);
				next()
			}
		], function(err, data) {
			
			if (err) {
				return res.status(400).send(err.message);
			}
			user.getUsers([uid], function (err, data) {
								var userObj = data[0];
								res.status(200).send(userObj);
			});

		});
	}

	function edit(req, res) {

		
		if (parseInt(meta.config.allowRegistration, 10) === 0) {
			return res.sendStatus(403);
		}

		var userData = {};

		for (var key in req.body) {
			if (req.body.hasOwnProperty(key)) {
				userData[key] = req.body[key];
			}
		}
		var uid;
		async.waterfall([
			function(next) {
				if (!userData.email) {
					return next(new Error('Invalid email'));
				}

				if (!userData.username || userData.username.length < 3/*meta.config.minimumUsernameLength*/) {
					return next(new Error('Username too short'));
				}

				if (userData.username.length > 20/*meta.config.maximumUsernameLengt*/) {
					return next(new Error('Username too long'));
				}

				if (!userData.password || userData.password.length < 3/*meta.config.minimumPasswordLength*/) {
					return next(new Error('Password too short'));
				}
				
				next(null,userData);
			},
			function(data, next) {
			
				user.edit(data, next);
			},
			function(_uid, next) {
				
			//id = _uid;
				//req.login({uid: uid}, next);
				
				next();
			},
			function(next) {
				//user.logIP(uid, req.ip);

				//user.notifications.sendWelcomeNotification(uid);

				//plugins.fireHook('filter:register.complete', {uid: uid, referrer: req.body.referrer}, next);
				//console.log(req.body.referrer);
				next()
			}
		], function(err, data) {
			
			if (err) {
				return res.status(400).send(err.message);
			}
			res.status(200).send(nconf.get('relative_path') + '/administration');

		});
	}


	function logout(req, res, next) {
		var status = 'offline';
		const uid = req.user.uid;
		if (parseInt(uid, 10) > 0 && req.sessionID) {
			db.setObjectField('user:'+ uid,'status',status,function (err,result){

			})
			user.updateOnlineUsers(uid,function(err) {
				if (err) {
					return next(err);
				}
			});
			user.updateLastOnlineTime(uid,function(err) {
				if (err) {
					return next(err);
				}
			});
			db.sessionStore.destroy(req.sessionID, function(err) {
				if (err) {
					return next(err);
				}
				req.session.destroy();
				req.user = null;
				res.status(200).send('');
			});


		} else {
			db.setObjectField('user:'+ uid,'status',status,function (err,result){

			})
			user.updateOnlineUsers(uid,function(err) {
				if (err) {
					return next(err);
				}
			});
			user.updateLastOnlineTime(uid,function(err) {
				if (err) {
					return next(err);
				}
			});
			res.status(200).send('');
		}
	}

}(exports));
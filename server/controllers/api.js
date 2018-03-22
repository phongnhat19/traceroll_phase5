"use strict";

var user = require('./../models/users'),
	element = require('./../models/elements'),
	frame = require('./../models/frames'),
	winston = require('winston'),
	users = require('./../models/users'),
	nconf = require('nconf'),
	async = require('async'),
	frontendConfig = require('./../models/configs');

var apiController = {};

var RESPONSE_STATUS = {
	'SUCCESS': 'SUCCESS',
	'FAILED':'FAILED'
};

var user_fields = ['username', 'userslug', 'userId', 'picture', 'fullname'];

//API handler for getting server config
apiController.getConfig = function(req, res, next) {

	winston.info('info','getConfig API');
	
	function filterConfig() {
		if (res.locals.isAPI) {

			res.status(200).json(config);
		} else {
			next(null,config);
		}
	}

	var config = {};
	config.relative_path = nconf.get('relative_path');
	config.version = nconf.get('version');
	config.environment = process.env.NODE_ENV;
	config.loggedIn = !!req.user;
	config.csrf_token = req.csrfToken();

	if (!req.user) {
		return filterConfig();
	}
	
	user.getSettings(req.user.uid, function(err, settings) {
		if (err) {
			return next(err);
		}

		//User configuration from database

		filterConfig();
	});
};

//API handler for getting workspace from user
apiController.getWorkspace = function (req, res, next) {
	winston.info("Getting workspace");
	//TODO: Get user's worspace from DB and return json format
	
	user.getUidByUserslug(req.params.userslug,function (err, userId) {
		if (err){
			res.json({status:RESPONSE_STATUS.FAILED, reason:err});
		}else{
			element.getElementsByUser(userId, 0, 1000, function (err, elements) {
				if (err){
					res.json({status:RESPONSE_STATUS.FAILED, reason:err});
				}else{
					var sessionUid = req.user.uid || -100;
					user.getUsers([sessionUid], function (err, user) {
						if (err){
							user = {};
						}
						res.json({status:RESPONSE_STATUS.SUCCESS, data:elements, user: user[0]});
					});
				}
			});
		}
	});
	
}

//API handler for getting join date of user
apiController.getJoinDate = function(req,res,next){
	winston.info("Getting join date by user");
	winston.info("Userslug: "+req.params.userslug);
	winston.info("Session user: "+req.user);

	user.getUidByUserslug(req.params.userslug,function (err, userId) {
		if (!userId) {
			res.status(404).json({status:'User not founded', reason:err});
			return;
		}
		if (err){
			res.json({status:RESPONSE_STATUS.FAILED, reason:err});
		}else{
			user.getUserById(userId, function (err, userData) {
				winston.info("User data: "+JSON.stringify(userData));
				if (err){
					res.json({status:RESPONSE_STATUS.FAILED, reason:err});
				} else {
					var sessionUid 
					if (req.user){
						sessionUid= req.user.uid || -100;
					}
					user.getUsers([sessionUid], function (err, requestUser) {
						if (err){
							requestUser = {};
						}
						res.json({status:RESPONSE_STATUS.SUCCESS, data:userData, user: requestUser[0], owner: userId});
					});
				}
			});
		}
	});
}


//API handler for getting list of elements of user
apiController.getElementsByUser = function (req, res, next) {
	winston.info("Getting element by user");
	winston.info("Userslug: "+req.params.userslug);
	winston.info("Session user: "+req.user);
	//TODO: Get user's worspace from DB and return json format
	user.getUidByUserslug(req.params.userslug,function (err, userId) {
		if (!userId) {
			res.status(404).json({status:'User not founded', reason:err});
			return;
		}
		if (err) {
			res.json({status:RESPONSE_STATUS.FAILED, reason:err});
		} else {
			element.getElementsByUser(userId, 0, 1000, function (err, elements) {
				if (err) {
					res.json({status:RESPONSE_STATUS.FAILED, reason:err});
				} else {
					var sessionUid 
					if (req.user){
						sessionUid= req.user.uid || -100;
					}
					user.getUsers([sessionUid], function (err, requestUser) {
						if (err){
							requestUser = {};
						}
						res.json({status:RESPONSE_STATUS.SUCCESS, data:elements, user: requestUser[0], owner: userId});
					});
				}
			});
		}
	});
	
}

//API handler for getting list of elements of user
apiController.getElementsByUserPaging = function (req, res, next) {
	winston.info("Getting element by user");
	winston.info("Userslug: "+req.params.userslug);
	winston.info("PageSize: "+req.params.pageSize);
	winston.info("PageNum: "+req.params.pageNum);
	winston.info("CurrentElementId: "+req.params.currentElementId);
	winston.info("Session user: "+req.user);
	//TODO: Get user's worspace from DB and return json format
	user.getUidByUserslug(req.params.userslug,function (err, userId) {
		if (err){
			res.json({status:RESPONSE_STATUS.FAILED, reason:err});
		}else{
			element.getElementsByUserPaging(userId, req.params.pageNum, req.params.pageSize, req.params.currentElementId, function (err, elements) {
				if (err){
					res.json({status:RESPONSE_STATUS.FAILED, reason:err});
				}else{
					var sessionUid 
					if (req.user){
						sessionUid= req.user.uid || -100;
					}
					user.getUsers([sessionUid], function (err, requestUser) {
						if (err){
							requestUser = {};
						}
						res.json({status:RESPONSE_STATUS.SUCCESS, currentElementId: req.params.currentElementId, data:elements, user: requestUser[0], owner: userId});
					});
				}
			});
		}
	});
}

//GET Request controller to retrieve list of newsfeed
apiController.getNewsfeed = function (req, res, next) {
	if (!req.user) {
		res.json({status:RESPONSE_STATUS.FAILED, reason:'NOT LOGGED IN'});
	}
	else {
		winston.info("Getting newsfeed");
		winston.info("offset: " + req.params.offset);
		
		var pageSize = 10;
		winston.info("current page size: "+pageSize);

		//TODO:
		element.getAllElements(req.params.offset, pageSize, function (err, elements) {
			if (err){
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}else{
				if (!req.user) {
					res.json({status:RESPONSE_STATUS.FAILED, reason:'NOT LOGGED IN'});
				}
				else {
					users.getUserFields(req.user.uid, user_fields, function(err, user){
						res.json({status:RESPONSE_STATUS.SUCCESS, data : elements, user:user});
					});
				}
				
				//res.json({status:RESPONSE_STATUS.SUCCESS, data : elements});
			}
		});
	}

	
}

//POST Request controller to save an element (Text or Image)
apiController.saveElement = function (req, res, next) {
	
	winston.info("Saving element");

	//TODO: 
	element.create(req.body.ownerid, 
					req.body.uid, 
					req.body.type, 
					req.body.content, 
					req.body.stage,
					null, 
		function (err) {
			if (err){
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}else{
				res.json({status:RESPONSE_STATUS.SUCCESS});
			}
	});
}

//API handler for sa
apiController.saveTextElement = function (req, res, next) {

	winston.info("Saving TEXT element");
	winston.info("Data: " + JSON.stringify(req.body));

	//TODO: 
	element.create(req.body.ownerid, 
					req.body.uid, 
					'text', 
					req.body.content, 
					req.body.stage,
					null,
					'',
		function (err, dataElement) {
			if (!err){
				res.json({status:RESPONSE_STATUS.SUCCESS, data:dataElement});
			}else{
				res.json({status:RESPONSE_STATUS.FAILED, reason:JSON.stringify(err)});
			}
	});
}

//API handler for saving shape
apiController.saveDrawingElement = function (req, res, next) {

	winston.info("Saving Drawing element");
	winston.info("Data: " + JSON.stringify(req.body));
	var stage = req.body.stage;
	var drawingType = req.body.drawing_type ? req.body.drawing_type : "";

	element.create(req.body.ownerid, 
							req.body.uid, 
							drawingType,
							'', 
							stage,
							req.body.key,
							'',
				function (err, dataElement) {
					if (!err){
						res.json({status:RESPONSE_STATUS.SUCCESS, data:dataElement});
					}else{
						res.json({status:RESPONSE_STATUS.FAILED, reason:JSON.stringify(err)});
					}
			});
	
}
//API handler for update shape such as moving
apiController.updateDrawingElement = function (req, res, next) {

	winston.info("Updating Drawing element");
	winston.info("Data: " + JSON.stringify(req.body));

	var stage = req.body.stage;

	element.update(req.body.key,
					req.body.uid, 
					'drawing', //Element Type is not used in update functionality  
					req.body.content, 
					req.body.stage, 
		function (err) {
			if (!err){
				res.json({status:RESPONSE_STATUS.SUCCESS});
			}else{
				console.log(err);
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}
	});
	
}

//POST Request controller to update text element
apiController.updateTextElement = function (req, res, next) {

	winston.info("Update TEXT element");
	winston.info("Data: " + JSON.stringify(req.body));
	//TODO: 
	element.update(req.body.key,
					req.body.uid, 
					'text', 
					req.body.content, 
					req.body.stage, 
		function (err) {
			if (!err){
				res.json({status:RESPONSE_STATUS.SUCCESS});
			}else{
				console.log(err);
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}
	});
}	

//POST Request controller to save video element 
apiController.saveVideoElement = function(req, res, next){
	winston.info("Saving VIDEO element");

	//TODO:
	element.createVideo(req.body.ownerid, 
					req.body.uid, 
					'video', 
					req.body.content_thumb,
					req.body.content_video,
					req.body.path,
					req.body.pathThumb,
					req.body.stage,
					null,
					req.body.caption,
		function (err, dataElement) {
			if (err){
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}else{
				res.json({status:RESPONSE_STATUS.SUCCESS, data:dataElement});
			}
	});
}

//POST Request controller to save image element 
apiController.saveImageElement = function (req, res, next) {

	winston.info("Saving IMAGE element");
	winston.info("Data: " + JSON.stringify(req.body));
	//TODO: 
	element.create(req.body.ownerid, 
					req.body.uid, 
					'image', 
					req.body.content, 
					req.body.stage,
					null,
					req.body.caption,
		function (err, dataElement) {
			if (err){
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}else{
				res.json({status:RESPONSE_STATUS.SUCCESS, data:dataElement});
			}
	});
}

//POST Request controller to update image element
apiController.updateImageElement = function (req, res, next) {

	winston.info("Saving IMAGE element");
	winston.info("Data: " + JSON.stringify(req.body));
	//TODO: 
	element.update(req.body.key,
					req.body.uid, 
					'image', 
					req.body.content, 
					req.body.stage, 
		function (err) {
			console.log(err);
			if (!err){
				res.json({status:RESPONSE_STATUS.SUCCESS});
			}else{
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}
	});
}

//POST Request controller to delete text element
apiController.deleteElement = function (req, res, next) {

	winston.info("Deleting element");
	winston.info("Data: " + JSON.stringify(req.body));
	//TODO: 
	element.delete(req.body.key,
					req.body.uid,
		function (err) {
			if (!err){
				res.json({status:RESPONSE_STATUS.SUCCESS});
			}else{
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}
	});
}

//POST Request controller to save a frame
apiController.saveFrame = function(req,res,next){
	winston.info("Saving frame");
	winston.info("Data: " + JSON.stringify(req.body));

	frame.create(req.body.ownerid,req.body.uid,req.body.data
				,function(err){
					if (!err) {
						res.json({status:RESPONSE_STATUS.SUCCESS});
					}
					else {
						res.json({status:RESPONSE_STATUS.FAILED, reason:err});
					}
				})
}

//POST Request controller to delete frame
apiController.deleteFrame = function (req, res, next) {
	winston.info("Deleting frame");
	winston.info("Data: " + JSON.stringify(req.body));

	frame.delete(req.body.uid,
		function (err) {
			if (!err){
				res.json({status:RESPONSE_STATUS.SUCCESS});
			}else{
				console.log('err', err);
				res.json({status:RESPONSE_STATUS.FAILED, reason:err});
			}
	});
}

//GET Request controller to get a frame
apiController.getFrame = function(req,res,next){
	winston.info("Getting frame by user");
	winston.info("Userslug: "+req.params.userslug);
	winston.info("Session user: "+req.user);
	//TODO: Get user's worspace from DB and return json format
	user.getUidByUserslug(req.params.userslug,function (err, userId) {
		if (err){
			res.json({status:RESPONSE_STATUS.FAILED, reason:err});
		}else{
			frame.getFrameByUser(userId, 0, 1000, function (err, frame) {
				if (err){
					res.json({status:RESPONSE_STATUS.FAILED, reason:err});
				}else{
					var sessionUid 
					if (req.user){
						sessionUid= req.user.uid || -100;
					}
					user.getUsers([sessionUid], function (err, requestUser) {
						if (err){
							requestUser = {};
						}
						res.json({status:RESPONSE_STATUS.SUCCESS, data:frame, user: requestUser[0], owner: userId});
					});
				}
			});
		}
	});
}

//GET Request controller to get all frontend config
apiController.getFrontendConfig = function(req,res,next){
	winston.info("Getting all config");

	frontendConfig.getConfig(function (err, Configs) {

		if (err) {
			res.json({
				status:RESPONSE_STATUS.FAILED, reason: err
			});
		}
		else {
			res.json({
				status:RESPONSE_STATUS.SUCCESS,
				data: Configs
			});
		}

	});
}

apiController.searchUserName = function(req, res, next){
	console.log('=== searchUserName === controllers');
	console.log(req.body);
	
	var inputSearch = req.body.contentSearch;

	user.searchUserByName(inputSearch, function(err, listUsers){
		console.log(err, listUsers);
		
		if(err){
			console.log('Error during search ', err);
			res.json({
						error: 1,
						message: new Error(err)
					});
		}else if(listUsers.length === 0){
			res.json({
						error: 2,
						message: "Dont have user want to search",
						listUsers: listUsers,
					});
		}else{
			res.json({
						error: 0,
						message: "Searched",
						listUsers: listUsers
					})
		}
	})

}

apiController.updateProfileImage = function(req, res) {
	user.updateProfileImage(req.body, function (err) {
		if (err) {
			res.json({status: RESPONSE_STATUS.FAILED, reason: err});
		} else {
			res.json({status: RESPONSE_STATUS.SUCCESS});
		}
	})
}


apiController.saveComments = function(req, res, next) {
	var	content = req.body.content,
		userID = req.body.userID,
		elementID = req.body.elementID;

	element.createComment(content, userID, elementID, function(err, createdComment){
		if(err){
			console.log('error while create comment');
			res.json({
						error: 1,
						data: createdComment
					})
		}else{
			res.json({
						error: 0,
						data: createdComment
					});
		}
	})

}

apiController.elementLike = function(req, res, next){
	var elementID = req.body.elementID,
		userID = req.body.userID;

	element.increaseLikeByElement(elementID, userID, function(err, results){
		res.json({error: err, results: results});
	})
}

apiController.elementDislike = function(req, res, next){
	var elementID = req.body.elementID,
		userID = req.body.userID;

	element.descreaseLikeByElement(elementID, userID, function(err, results){
		res.json({error: err, results: results});
	})
}

module.exports = apiController;
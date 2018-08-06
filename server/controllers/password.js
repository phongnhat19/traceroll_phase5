'use strict';

(function(module) {
	var fork = require('child_process').fork;

	module.hash = function(rounds, password, callback) {

		forkChild({type: 'hash', rounds: rounds, password: password}, callback);
	};

	module.compare = function(password, hash, callback) {
		forkChild({type: 'compare', password: password, hash: hash}, callback);
	};

	function forkChild(message, callback) {
		var nconf = require('nconf');
		var child = fork(nconf.get('__dirname')+'/server/bcrypt.js', {
				silent: false
			});
		
		child.on('message', function(msg) {
			if (msg.err) {
				return callback(new Error(msg.err));
			}

			callback(null, msg.result);
		});
		
		child.send(message);
	}

	return module;
})(exports);
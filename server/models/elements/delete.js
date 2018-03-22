'use strict';

var async = require('async'),
	winston = require('winston'),
	helpers = require('./../helpers'),
	utils = require('../../../public/js/utils'),
	db = require('../../database/mongo');

var fs = require('fs');

module.exports = function(Elements){

	/**
	 * Create element document
	 * @param  {Int}   uid      User ID
	 * @param  {String}   type     Type of element. There are 2 types (image and text)
	 * @param  {String}   content  For text type this param is content, for image type is image's url
	 * @param  {Function} callback Callback function (err, elementId)
	 * @return {Function}            Callback function
	 */
	Elements.delete = function (_key, uid, callback) {
		console.log('== delete ==');
		console.log(_key, uid);
		if (!uid){
			var errMessage = 'User is required';
			winston.info(errMessage);
			return callback(new Error(errMessage));
		}

		var now = Date.now();
		
		var elementData = {};

		Elements.deleteVideoLink(_key, function(err, isSuccess){
			console.log(err, isSuccess);
			if(err){
				console.log("Error when delete uploads file: "+ err);
				winston.info("Error when delete uploads file: "+ err);
			}else if(isSuccess === false){
				console.log("Failed deleted file");
				winston.info("Failed deleted file");
			}else{
				console.log("Success deleted file");
				winston.info("Success deleted file");
			}
		})

		async.waterfall([
					function(next) {
						//Getting available element ID
						db.getObject(_key, next);
					},
					function(element, next) {
						if (!element)	{
							return next(new Error("Element is not exist"));
						}
						elementData = element;				
						db.delete(_key, next);
					},
					function(next) {
						async.parallel([
							function(next) {
								db.sortedSetRemove('elements:created-date', elementData.id, next);
							},
							function(next) {
								db.sortedSetRemove('user:'+elementData.ownerid+':elements', elementData.id, next);
							},
							function(next) {
								db.sortedSetAdd('element:deleted_by', uid, elementData.id, next);
							},
							function(next){
								Elements.descreaseLikeByElement(_key, uid, next);
							},
							function(next){
								var elementIDs = [elementData.id];
								Elements.deleteComments(elementIDs, next);
							}
						], next);
					}
				], callback);
	}

	Elements.deleteVideoLink = function(_key, callback){

		db.getObjectFields(_key, ["path","pathThumb"], function(err, path){
			if(path.path !== null){
				var linkVideo = path.path.toString();
				var linkThumb = path.pathThumb.toString();
				var isSuccess;

				fs.exists(linkVideo, (exists) => {
					var arrayLinks = [linkVideo, linkThumb];

					if(exists){
						for(var i = 0; i < arrayLinks.length; i++){
							fs.unlink(arrayLinks[i], (err) => {
						        if (err) {
						            console.log("Failed to delete file: "+arrayLinks[i]+" - "+err);
						            isSuccess = false;
						            callback(err, isSuccess);
						        } else {
						        	console.log('Successfully deleted file: '+arrayLinks[i]);
						        	isSuccess = true;
						        	callback(err, isSuccess);                          
						        }
							});
						}

					}else{
						callback(new Error('File do not exist'));
					}
				})
			}else{
				console.log('Path do not exist');
			}
		})
	}

	Elements.descreaseLikeByElement = function(elementID, userID, callback){
		console.log('== descreaseLikeByElement ==');
		console.log(elementID, userID);
		async.parallel([
			function(next){
				db.sortedSetRemove('user:'+userID+':like-elements', elementID, next);
			},
			function(next){
				db.sortedSetRemove(elementID+':likes', userID, next);
			}
		], function(err){
			if(err){
				callback(new Error(err));
			}else{
				callback(err, 'dislike successed');
			}
		})
	}

	Elements.deleteComments = function(elementIDs, callback){
		Elements.getCommentIdsByElements(elementIDs, function(err, commentIds){
			var commentIDs	= commentIds[0];

			async.waterfall([
				function(next){
					var _keys = helpers.buildKeys('comment', commentIDs, 'userid');

					db.getMultipleSortedSetRangeByScore(_keys, 0, -1, 0, Date.now(), function(err, newArray){
						var _keys = helpers.buildKeys('user', newArray, 'comments');
						db.sortedSetRemove(_keys, commentIDs, next);
					})
				},
				function(next){
					async.parallel([
						function(next_parallel){
							var _keys = helpers.buildKeys('comment', commentIDs);
							db.deleteAll(_keys, next_parallel);
						},
						function(next_parallel){
							var _keys = helpers.buildKeys('comment', commentIDs, 'userid');
							db.deleteAll(_keys, next_parallel);
						},
						function(next_parallel){
							var _keys = helpers.buildKeys('comment', commentIDs, 'elementid');
							db.deleteAll(_keys, next_parallel);
						},
						function(next_parallel){
							var _keys = helpers.buildKeys('element', elementIDs, "comments");
							db.deleteAll(_keys, next_parallel);
						}
					], next)				
				}

			], callback);
		})
	}
};
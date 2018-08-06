'use strict';

var async = require('async'),
	winston = require('winston'),
	helpers = require('./../helpers'),
	utils = require('../../../public/js/utils'),
	db = require('../../database/mongo');

var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

var uploadPath = nconf.get('upload_path');
var uploadVideoPath = nconf.get('uploadVideo_path');
/**
 * Config for upload to S3
 */
var AWS = require("aws-sdk");

const Album_Bucket_Name = 'traceroll-bucket';
const Bucket_Region = 'us-east-1';
const IdentityPoolId = 'us-east-1:76a5f0fb-8a49-4dad-82b3-b250339a916c';

AWS.config.update({
	region: Bucket_Region,
	credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: IdentityPoolId
	})
});

const s3 = new AWS.S3({
	apiVersion: '2006-03-01',
	params: { Bucket: Album_Bucket_Name }
});
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

		Elements.deleteMediaFile(_key, function(err, data) {

			if (err) console.log("Error when delete uploads file: ", err)
            else     console.log("Success deleted file")
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

    Elements.deleteMediaFile = function(_key, callback) {

        db.getObjectFields(_key, ["type", "content", "path", "pathThumb"], function(err, item) {
					let linkImage,
					 		linkVideo,
					 		linkThumb,
							linkDraw;
					if(item) {
						if (item.type === 'image') {
							//let linkImage = item.content;
							//check for Amazon CDN
							if ( item.content.indexOf('d2w4sqd6q4mas4') != -1 ){
								linkImage = `${item.content.slice( item.content.indexOf(".net") +5 )}`;
								console.log(linkImage);
								deleteObjectOnS3(linkImage, "image");
							}else {
								linkImage = item.content;
								deleteObjectOnServer(linkImage);
							}

						} else if (item.type === 'video') {
								//check for Amazon CDN
								if( item.path.indexOf('d2w4sqd6q4mas4') != -1 ){
									linkVideo = `${item.path.slice( item.path.indexOf(".net") +5 )}`;
									deleteObjectOnS3(linkVideo, "video");
								}else {
									linkVideo = item.path;
									deleteObjectOnServer(linkVideo);
								}
								//check for Amazon CDN
								if( item.pathThumb.indexOf('d2w4sqd6q4mas4') != -1 ){
									linkThumb = `${item.pathThumb.slice( item.pathThumb.indexOf(".net") +5 )}`;
									deleteObjectOnS3(linkThumb, "thumbnail");
								}else {
									linkThumb = item.pathThumb;
									deleteObjectOnServer(linkThumb);
								}
						} else if (item.type === 'drawing:group' ){
						if( item.content.indexOf('d2w4sqd6q4mas4') != -1 ){
							linkDraw = `${item.content.slice( item.content.indexOf(".net") +5 )}`;
							deleteObjectOnS3(linkDraw, "drawing");
						}else {
							linkDraw = item.content;
							deleteObjectOnServer(linkDraw);
						}
					} else {
                console.log('Item does not exist');
            }
        }
    	})
		}

    function deleteObjectOnS3(item, type, callback) {
			let key,
					mediaArr = item.split('/');
			switch(type){
				case "drawing":
					key = 'uploads/drawings/' + mediaArr[mediaArr.length - 1];
					break;
				case "image":
					key = 'uploads/images/' + mediaArr[mediaArr.length - 1];
					break;
				case "video":
					key = 'uploads/videos/' + mediaArr[mediaArr.length - 1];
					break;
				case "thumbnail":
					key = 'uploads/videos/thumbnails/' + mediaArr[mediaArr.length - 1];
					break;
				default:
					break;
			}
			if (item && item.includes('uploads/')) {
				let params = {
							Bucket: Album_Bucket_Name,
							Key: key
						};
				s3.deleteObject(params, function(err, data) {
					if (err) {
						console.log('deleteObjectS3 err=', err)
					}
				});
			}

    }

    function deleteObjectOnServer (item, callback) {

        const unlinkCallback = err => {
            if (err) {
                console.log('unlink', err)
                return 1
            }
            return 0
        }

        getKeysNeedDelete(item, (key, type) => {

            let filePath
            switch (type) {

                case 'image':
                    filePath = path.resolve(__dirname, `../../../${uploadPath}/${key}`)
                    return fs.unlink(filePath, unlinkCallback)
                case 'video':
                    filePath = path.resolve(__dirname, `../../../${uploadVideoPath}/${key}`)
                    return fs.unlink(filePath, unlinkCallback)
                case 'thumb':
                    filePath = path.resolve(__dirname, `../../../${uploadVideoPath}/thumbnails/${key}`)
                    return fs.unlink(filePath, unlinkCallback)
            }
        })
    }

    function getKeysNeedDelete (item, renderKey) {

        const arr = []

        switch (item.type) {

            case 'drawing:group':
            case 'image':

                const key = getObjectName(item.content)

                key && arr.push({
                    Key: renderKey(key, 'image')
                })

                break

            case 'video':

                const linkVideo = item.path,
                    linkThumb = item.pathThumb,
                    keyVideo = getObjectName(linkVideo),
                    keyThumb = getObjectName(linkThumb)

                keyVideo && arr.push({
                    Key: renderKey(keyVideo, 'video')
                })
                keyThumb && arr.push({
                    Key: renderKey(keyThumb, 'thumb')
                })

                break
        }

        return arr
    }

    function getObjectName(link) {

        if (typeof(link) === 'string') {

            const data = link.trim().split('/')

            return data.pop()
        }
    }

	Elements.descreaseLikeByElement = function(elementID, userID, callback){
		async.parallel([
			function(next){
				db.sortedSetRemove('user:'+userID+':like-elements', elementID, next);
			},
			function(next){
				db.sortedSetRemove(elementID+':likes', userID.toString(), next);
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

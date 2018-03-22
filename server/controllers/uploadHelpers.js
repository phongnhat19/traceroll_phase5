"use strict";

var fs = require('fs');
var path = require('path');
var async = require('async');
var nconf = require('nconf');
var validator = require('validator');
var winston = require('winston');
var mime = require('mime');
var multer = require('multer');

var meta 	= {config:{}};
var users = require('./../models/users');
var elements = require('./../models/elements');
var uploadImagePath = nconf.get('upload_path');
var uploadVideoPath = nconf.get('uploadVideo_path');
var imagePath = nconf.get('image_path');
var videoPath = nconf.get('video_path');
var thumbnailPath = nconf.get('thumb_path');
var hostname = nconf.get('url');
var thumbler = require('video-thumb');
var uploadHelpers = {};


uploadHelpers.upload = function (req, res, next) {   
	var uploadedFile;
    var elementType;
    var destination;

	upload(req,res,function(err){
            if(err){
                res.json({	error_code: 1, 
                			error_message: err});
            }


            uploadedFile = req.file;
            elementType = uploadedFile.mimetype.substring(0, uploadedFile.mimetype.lastIndexOf("/"));
            destination = req.file.destination;

            if(elementType === "image"){
                var filePath = hostname + imagePath + "/" + uploadedFile.filename;
                winston.info(filePath);

                res.json({  error_code: 0, 
                            file_path: filePath,
                            elementDropType: elementType
                        });
            }else if(elementType === "video"){
                var fileName = uploadedFile.filename.substring(0, uploadedFile.filename.lastIndexOf("."));
                var path_thumbnail = path.resolve(__dirname, '../../' +  uploadVideoPath +"/thumbnails/"+ fileName +".png").replace(new RegExp('\\' + path.sep, 'g'), '/');
                var video_path = path.resolve(__dirname, '../../' +  uploadVideoPath );
                var f_path = path.join(video_path, uploadedFile.filename).replace(new RegExp('\\' + path.sep, 'g'), '/');

                fs.exists(f_path, (exists) => {                    
                    if(exists){
                        async.waterfall([
                            function(next){
                                thumbler.extract(f_path, path_thumbnail, '00:00:01', '200x200', function(err){
                                    if(err){
                                        console.log("snapshot video can not create", err);
                                        next(err);
                                    }

                                    console.log('snapshot saved to '+path_thumbnail);
                                    next();
                                });
                            }

                        ], function(err){
                            var filePath = hostname + videoPath + "/" + uploadedFile.filename;
                            var thumbPath = hostname + thumbnailPath+ "/" + fileName + ".png";
                            // var thumbPath = path.join(hostname, thumbnailPath, fileName+".png");
                            winston.info(filePath);
                            
                            if(err){
                                res.json({  error_code: 1,
                                            error_message: err,
                                            file_path: filePath,
                                            thumbnail_path: null,
                                            elementDropType: elementType,
                                            path: f_path,
                                            pathThumb: path_thumbnail
                                        });
                            }

                                res.json({  error_code: 0, 
                                            file_path: filePath,
                                            thumbnail_path: thumbPath,
                                            elementDropType: elementType,
                                            path: f_path,
                                            pathThumb: path_thumbnail
                                        });
                        })

                    }else{

                    }
                });

            }

            
            
        });
	
}

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, next) {
            var elementStrorageType = file.mimetype.substring(0, file.mimetype.lastIndexOf("/"));

            //var subFolder = nconf.get(req.params.location) || '';
            switch(elementStrorageType){
                case "image":
                    next(null, path.resolve(__dirname, '../../' +  uploadImagePath ));
                    break;
                case "video":
                    next(null, path.resolve(__dirname, '../../' +  uploadVideoPath ));
                    break;
                default:
                    break;
            }

        },
        filename: function (req, file, next) {
            var datetimestamp = Date.now();
            
            next(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

//Create thumbnail element video
uploadHelpers.createThumbnailVideo = function(req, res, next){
    var fileName = req.body.link.substring(req.body.link.lastIndexOf("/")+1, req.body.link.lastIndexOf("."));
    var path_thumbnail = path.resolve(__dirname, '../../' +  uploadVideoPath +"/thumbnails/"+ fileName+"-"+Date.now()+".png").replace(new RegExp('\\' + path.sep, 'g'), '/');
    var thumbPath = hostname + thumbnailPath+ "/" + fileName+"-"+Date.now()+".png";
    thumbler.extract(req.body.link, path_thumbnail, '00:00:01', '200x200', function(err){
        if(err){
            console.log("snapshot video can not create");
            res.json({
                error_code: 1,
                error_message: err,
                link: req.body.link,
                thumbnail_path: thumbPath,
                elementDropType: req.body.elementDropType
            }) 
        }else{
            console.log("snapshot video created at "+path_thumbnail);
            res.json({
                error_code: 0,
                error_message: null,
                link: req.body.link,
                thumbnail_path: thumbPath,
                elementDropType: req.body.elementDropType
            })  
        }
    });
}

module.exports = uploadHelpers;
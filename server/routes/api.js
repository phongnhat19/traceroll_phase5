"use strict";

var express = require('express'),
	helpers = require('./helpers')
	;


module.exports =  function(app, middleware, controllers) {

	var router = express.Router();
	app.use('/api', middleware.authorized, router);

	router.get('/config', middleware.applyCSRF, controllers.api.getConfig);
	router.get('/get-workspace/:userslug', middleware.authorized, controllers.api.getWorkspace);  //API route for getting workspace of user
	router.get('/element/list/:userslug', middleware.authorized, controllers.api.getElementsByUser); //API route for getting list of element of user
	router.get('/element/list/:userslug/:pageNum/:pageSize/:currentElementId', middleware.authorized, controllers.api.getElementsByUserPaging); //API route for getting list of element of user by paging
	// router.get('/newsfeed/list/:offset', middleware.authorized, controllers.api.getNewsfeed); //API route for getting newsfeed
	router.get('/newsfeed/list/:offset', middleware.authorized, controllers.api.getNewsfeed); //API route for getting newsfeed
	router.get('/frame/:userslug', middleware.authorized, controllers.api.getFrame); //API route for getting frame of user

	router.get('/user/join-date/:userslug', middleware.authorized, controllers.api.getJoinDate); //API route for getting join date of user

	router.get('/frontend-config/', middleware.authorized, controllers.api.getFrontendConfig); // API route for getting frontend config from server
	
	router.post('/upload', middleware.authorized, controllers.uploadHelper.upload); //API route for uploading image
	router.post('/element/save', middleware.authorized, controllers.api.saveElement); //API route for saving element
	router.post('/element/delete', middleware.authorized, controllers.api.deleteElement); //API route for deleting element
	router.post('/element/text/save', middleware.authorized, controllers.api.saveTextElement); //API route for saving text element
	router.post('/element/image/save', middleware.authorized, controllers.api.saveImageElement); //API route for saving image element
	router.post('/element/drawing/save', middleware.authorized, controllers.api.saveDrawingElement); //API route for saving image element
	router.post('/element/video/save', middleware.authorized, controllers.api.saveVideoElement); //API route for saving video element
	router.post('/element/drawing/update', middleware.authorized, controllers.api.updateDrawingElement); //API route for update drawing element
	router.post('/element/text/update', middleware.authorized, controllers.api.updateTextElement); //API route for updating text element
	router.post('/element/image/update', middleware.authorized, controllers.api.updateImageElement); //API route for updating image element
	router.post('/element/video/create-thumb', middleware.authorized, controllers.uploadHelper.createThumbnailVideo); //API route for create video thumbnail
	router.post('/frame/save', middleware.authorized, controllers.api.saveFrame); //API route for saving frame
	router.post('/frame/delete', middleware.authorized, controllers.api.deleteFrame); //API route for delete frame
	router.post('/search/username', middleware.authorized, controllers.api.searchUserName); //API route for search username
	router.post('/update-profile-image', middleware.authorized, controllers.api.updateProfileImage);
	router.post('/comments/save', middleware.authorized, controllers.api.saveComments); //API save comments
	router.post('/element/like', middleware.authorized, controllers.api.elementLike); // API save like
	router.post('/element/dislike', middleware.authorized, controllers.api.elementDislike); // API save dislike
};


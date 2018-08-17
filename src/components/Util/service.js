import Utils from './utils.js';
import axios from 'axios';

const TrService = {
    updateElementOnDb(requestBody, callback){
        Utils.showProcessingBar();
        axios.post('/api/element/drawing/update', requestBody)
            .then(function(response) {
                Utils.hideProcessingBar();
                callback && callback();
        });
    },
    deleteElementOnDb(uid, key, callback) {
        Utils.showProcessingBar();
        axios.post('/api/element/delete',{
                uid: uid,
                key: key,
            }).then(function(response){
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    updateText(requestBody, callback){
        Utils.showProcessingBar();
        axios.post('/api/element/text/update', requestBody)
        .then(function(response){
            Utils.hideProcessingBar();
            callback && callback(response);
        })
        .catch(Utils.axiosError);
    },
    uploadImage(file, callback) {
        let data = new FormData();
        data.append('file', file);
        
        const config = {
            headers: { 'content-type': 'multipart/form-data' },
            contentType: false,
            processData: false
        }

        axios.post('/api/upload', data, config)
            .then(function(response){
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    updateProfileImagePath(requestBody, callback) {
        axios.post('/api/update-profile-image', requestBody)
            .then(function(response) {
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    updateImage(requestBody, callback) {
        Utils.showProcessingBar();
        axios.post('/api/element/image/update', requestBody)
            .then(function(response){
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    getNewsfeed(pageNum, callback) {
        axios.get('/api/newsfeed/list/' + pageNum)
            .then(function (response) {
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    saveDrawingElement(requestBody, callback) {
        axios.post('/api/element/drawing/save', requestBody)
            .then(function (response) {
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    getUserJoinDate(userslug, callback) {
        axios.get('/api/user/join-date/' + userslug)
            .then(function(response){
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    getElementList(userslug, callback) {
        axios.get('/api/element/list/' + userslug)
            .then(function(response){
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    saveText(requestBody, callback) {
        Utils.showProcessingBar();
        axios.post('/api/element/text/save', requestBody)
            .then(function (response) {
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    saveVideo(requestBody, callback) {
        Utils.showProcessingBar();
        axios.post('/api/element/video/save', requestBody)
            .then(function (response) {
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    saveImage(requestBody, callback) {
        Utils.showProcessingBar();
        axios.post('/api/element/image/save', requestBody)
            .then(function (response) {
                Utils.hideProcessingBar();
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    createThumbnailVideo(requestBody, callback) {
        axios.post('/api/element/video/create-thumb', requestBody)
            .then(function (response) {
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    searchUser(requestBody, callback) {
        axios.post('/api/search/username', requestBody)
            .then(function (response) {
                callback && callback(response);
            })
            .catch(Utils.axiosError);
    },
    getUserProfile(callback) {
        axios.get('/api/profile')
        .then(function(response){
            console.log(response);
            callback && callback(response);
        })
        .catch(Utils.axiosError);
    }
}

export default TrService;
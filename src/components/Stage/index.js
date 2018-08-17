import React, { Component } from 'react';
import {Stage, Group, Layer} from 'react-konva-traceroll';
import Dropzone from 'react-dropzone';
import $ from 'jquery';
import async from 'async';
import {request} from 'request';

import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';


import axios from 'axios';
import {TRText, TRImage, TRImageVideo, TRMenu, TRDrawing, TRLine,TRLineBrush,
		TRSelectMoveGroup, TRTheatre, TRLineGroup, TRSearch, TRProfileImage} from './../Elements';
import TRContextMenu from '../ContextMenu';
import Const from '../Util/const.js';
import Utils from '../Util/utils.js';
import TrService from '../Util/service.js';
import { linesInsidePolygon } from '../Elements/SelectMoveGroup';

import './style.css';


class TR_Stage extends Component{
	constructor(props){
		super(props);
		this.state = {
			container: 'root',
			//default width and height of Stage (cover the screen)
			width: window.innerWidth,
			height: window.innerHeight,
			//List elements of Stage
			childs: [],
			userslug: this.props.params.userslug,
			user: {
				picture: null
			},
			loginUser: {},
			focusId: this.props.params.elementId || -1,
			joinDate:0,
			now:Date.now(),
			step:1000,
			swiperOption:{
				auto: 0,
					speed: 300,
					disableScroll: 'true',
					continuous: 'true'
			},
			options: {
            	color: props.color || "black",
            	mode: 'pen'
            },
            line: {
            	points: [],
            	mode: 'pen',
            	color: ''
            },
            lines: [],
            groupArr: [],
            showTimeLine: false,
			showTheatre: false,
			showDrawTool: false,
			currentElement: '',
			isPointer: false,
			x1: 0,
            y1: 0,
            x2: window.innerWidth,
            y2: window.innerHeight,
			showContextMenu: false,
			isValidLink: true,
			openProfileWindow: false
		}

		// Context menu
		this.evt = null;
		this.elementTarget = null;

		// Canvas
		this.canvasPos = {
			canvasPosX: 0,
			canvasPosY: 0
		}

		this.windowMouseDown = false;

		//======================================
		//bind events to Stage Component
		//======================================

		this.handleAddText = this.handleAddText.bind(this)
		this.toggleTimeline = this.toggleTimeline.bind(this)
		this.handleChangeTimeline = this.handleChangeTimeline.bind(this)
		this.toggleTheatreMode = this.toggleTheatreMode.bind(this)
		this.toggleDrawingMenu = this.toggleDrawingMenu.bind(this)
		this.handle = this.handle.bind(this)
		this.handlerChangePointer = this.handlerChangePointer.bind(this)
		this.handlerMenuChange = this.handlerMenuChange.bind(this)
		this.addNewLine = this.addNewLine.bind(this)
		this.getCurrentOption = this.getCurrentOption.bind(this)
		this.handleMouseWheel = this.handleMouseWheel.bind(this)
		this.addImageOrTextClick=this.addImageOrTextClick.bind(this)
		this.showContextMenu = this.showContextMenu.bind(this)
		this.resetDefaultMode = this.resetDefaultMode.bind(this)
		this.handleStageContentMouseDown = this.handleStageContentMouseDown.bind(this)
		this.handleDropElement = this.handleDropElement.bind(this)
		this.handleAddVideo = this.handleAddVideo.bind(this)
		this.handleStageContentContextMenu = this.handleStageContentContextMenu.bind(this)
		this.handleWindowMouseUp = this.handleWindowMouseUp.bind(this);
		this.handleWindowMouseDown = this.handleWindowMouseDown.bind(this);
		this.updateCanvasPos = this.updateCanvasPos.bind(this);
		this.getCanvasPos = this.getCanvasPos.bind(this);
		this.handleAddLink = this.handleAddLink.bind(this);
	}

	handleRedirectPage = () => {
		let showDrawTool = this.state.showDrawTool;
		let showTimeLine = this.state.showTimeLine;
		this.resetDefaultMode(showDrawTool, showTimeLine);
		return true;
	}

	addNewLine = (line) => {
		if (line.mode === Const.MODE.SELECT) {
			const selectedLines = this.getSelectedLines(line.stage);
			this.setState({
				line: line.stage,
				selectedLines: selectedLines
			});
		} else {
			line.uid = this.state.uid;
			line.ownerid = this.state.ownerid;
			let lines = this.state.lines;
			lines.push(line);
			this.setState({lines: lines});
		}
	}

	getSelectedLines = (line) => {
		const points = line.points;
		let selectedLines = [];
		if (points.length > 0) {
			const shapeLineArray = this.getLineArr();
			selectedLines = linesInsidePolygon(shapeLineArray, points);
		}
		return selectedLines;
	}

	getLineArr = () => {
		const self = this,
			stage = this.refs.mainStage.getStage(),
			groupNewLine = stage.findOne('.' + Const.KONVA.NEW_LINES_CONTAINER_NAME);
		const lineArr = groupNewLine.getChildren(function(node){
			return Utils.isLine(node);
		});
		return lineArr;
	}

	addImageOrTextClick(){
		let showDrawTool = this.state.showDrawTool;
		let showTimeLine = this.state.showTimeLine;

		$('#owner-caption').val('');

		this.setState((prevState, props) => ({
			showTimeLine: false,
			showTheatre: false,
			showDrawTool: false
		}));
		this.resetDefaultMode(showDrawTool, showTimeLine);
	}

	timeConverter(UNIX_timestamp){
			var a = new Date(UNIX_timestamp);
			var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
			var year = a.getFullYear();
			var month = months[a.getMonth()];
			var date = a.getDate();
			var time = date + '/' + month + '/' + year ;
			return time;
	}

	handle(props){
		const Handle = Slider.Handle;
			const { value, dragging, index, ...restProps } = props;
			return (
				<Tooltip
					prefixCls="rc-slider-tooltip"
					overlay={this.timeConverter(value)}
					visible={dragging}
					placement="bottom"
					key={index}
				>
					<Handle value={value} {...restProps} />
				</Tooltip>
			);
	}

	toggleTimeline(){
		let showDrawTool = this.state.showDrawTool;
		let showTimeLine = this.state.showTimeLine;

		this.setState((prevState, props) => ({
			showTimeLine: !prevState.showTimeLine,
			showTheatre: false,
			showDrawTool: false
		}));

		if (!showTimeLine) {
			this.setState({
				now: Date.now()
			})
		}

		this.resetDefaultMode(showDrawTool, showTimeLine);
	}

	resetDefaultMode(showDrawTool, showTimeLine){
		const stage = this.refs['mainStage'].getStage();
		if (showDrawTool) {
			const trSelectedLines = this.trSelectedLines;
			trSelectedLines.finishSelectMove();

			setTimeout(function() {
				this.createAndSaveGroup();
			}.bind(this), 50);

			stage.container().style.cursor = Const.CURSOR.default;
			this.setState({
	    		options: {
					color: 'black',
					mode: 'pen'
				}
	    	})
	    	this.addNewLine(
			{
				mode: 'select',
				stage: {
					points: [],
					color: 'black'
				}
			});
		}

		if (showTimeLine) {
			let element_list = Utils.getTimeLineElementList(stage);
			element_list.forEach(function(item){
				item.show();
			})
			stage.batchDraw();
		}
	}

    createAndSaveGroup = () => {
    	const group = this.newLinesGroup,
    		children = group ? group.getChildren() : [];
		if (children.length > 0) {
			Utils.showProcessingBar();

			let json = group.toJSON();
			let	now = Date.now(),
				rect = Utils.getClientRect(group),
				uid = this.state.uid,
				ownerid = this.state.ownerid,
				localKey = uid + "-" + now,
				requestBody = {
					uid: uid,
					ownerid: ownerid,
					drawing_type: Const.SHAPE_TYPE.GROUP,
					stage: {
						json: json,
						rect: rect,
						x: 0,
						y: 0
					},
					key: localKey
				};
			const node = {
					uid: uid,
					ownerid: ownerid,
					drawing_type: Const.SHAPE_TYPE.GROUP,
					stage: {
						json: json,
						rect: rect,
						x: 0,
						y: 0
					},
					newCreated: true,
					_key: 'element:' + localKey,
					date_created: now
				},
				groupArr = this.state.groupArr;

			groupArr.push(node);

			setTimeout(() => {
				group.destroyChildren();
				this.setState({
					groupArr: groupArr
				})
			}, 1);

			TrService.saveDrawingElement(requestBody)
		}
    }

	//Toggle Theatre mode
	toggleTheatreMode(currentElement){
		let showDrawTool = this.state.showDrawTool;
		let showTimeLine = this.state.showTimeLine;
		let showTheatre = this.state.showTheatre;

		if (showTheatre) {
			this.addWheelListener();
		} else {
			this.removeWheelListener();
		}

		let result = typeof currentElement === 'string' ? currentElement : '';
		this.setState((prevState, props) => ({
			showTimeLine: false,
			showTheatre: !prevState.showTheatre,
			showDrawTool: false,
			currentElement: result
		}));

		this.resetDefaultMode(showDrawTool, showTimeLine);
	}
	
	handleChangeTimeline(cur_value){
		const stage = this.refs['mainStage'].getStage(),
			element_list = Utils.getTimeLineElementList(stage);
		element_list.forEach(function(item){
			if (item.getAttr('date_created') > cur_value) {
				item.hide();
			} else {
				item.show();
			}
		})
		stage.batchDraw();
	}

	handleStageContentMouseDown(e){
		const mode = this.state.options.mode,
			showDrawTool = this.state.showDrawTool,
			stage = this.refs.mainStage.getStage(),
			button = e.evt.button;
		if (button === 0) {
			if(mode === 'eraser'){
				this.handlerChangePointer('eraser-on');
			}
		}
		else if (button === 2) {
			stage.container().style.cursor = 'pointer';
			stage.startDrag();
		}
		let shape = stage.getIntersection(stage.getPointerPosition());
		if (shape && !Utils.isObjectContainString(Const.SHAPE_TYPE, shape.name())) {
			shape = null;
		}
		this.evt = e.evt,
		this.elementTarget = showDrawTool ? null : shape
	}

	handleStageContentContextMenu(e) {
		e.evt.preventDefault();
		if (this.elementTarget) {
			this.showContextMenu(true);
		}
	}

	showContextMenu(showContextMenu) {
		this.setState((prevState, props) => ({
			showContextMenu: showContextMenu,
		}));
	}

	/* Event change pointer in drawing*/
	handlerChangePointer(mode) {
		let stage = this.refs['mainStage'].getStage();
		stage.container().style.cursor = Const.CURSOR[mode];
	}

	//==========================================
	// Handle mouse wheel
	//==========================================
	handleMouseWheel = (e) => {
		e.preventDefault();
		if (this.windowMouseDown) {
			return;
		}
		let stage = this.refs.mainStage.getStage(),
			pointerPos = stage.getPointerPosition();
		if (pointerPos) {
			let oldScale = stage.scaleX();
			let mousePointTo = {
				x: (pointerPos.x - stage.x()) / oldScale,
				y: (pointerPos.y - stage.y()) / oldScale,
			};
			//new scale ratio via scroll delta
			const newScale = e.deltaY > 0 ? oldScale * Const.SCALE_BY : oldScale / Const.SCALE_BY
			if (newScale >= Const.ZOOM.max || newScale <= Const.ZOOM.min) {
	        	return;
	        }
			stage.scale({ x: newScale, y: newScale });
			let newPos = {
				x: -(mousePointTo.x - pointerPos.x / newScale) * newScale,
				y: -(mousePointTo.y - pointerPos.y / newScale) * newScale
			};
			stage.position(newPos);
			this.updateCanvasPos();
			this.updateTransformCircle(newScale);
			stage.batchDraw();
		}
	}

	updateCanvasPos() {
		const stage = this.refs.mainStage.getStage(),
			stageScale = stage.scaleX();
		this.canvasPos = {
			canvasPosX: (-stage.getX()) / stageScale,
			canvasPosY: (-stage.getY()) / stageScale
		}
		if (this.drawing) {
			const image = this.drawing.image;
			image.setPosition({
				x: this.canvasPos.canvasPosX,
				y: this.canvasPos.canvasPosY
			})
			image.getLayer().batchDraw();
		}
	}

	updateTransformCircle = (newScale) => {
        if(this.oldTransform) {
            this.oldTransform.fire(Const.EVENTS.STAGE_WHEEL);
        }
	}

	getCanvasPos() {
		return this.canvasPos;
	}

	componentWillMount() {
		const userslug = this.state.userslug;

		//Getting join_date of stage owner
		const getUserJoinDateCallback = function(response) {
			const body = response.data;
			this.setState({
				joinDate:body.data.joinDate,
				user: body.data,
				loginUser: body.user
			});
			TrService.getElementList(userslug, getElementListCallback.bind(this));
		}

		const getUserProfileCallback = (response) => {
			const body = response.data;
			console.log(body);
			// this.setState({
			// 	...this.state,
			// 	profile: body.data
			// })
		}

		TrService.getUserJoinDate(userslug, getUserJoinDateCallback.bind(this));
		TrService.getUserProfile(getUserProfileCallback);

		//Getting list of element from server
		const getElementListCallback = function(response) {
			let elementList = response.data;
			this.setState({
				//Element arrays
				childs: elementList.data,
				//Current login user
				uid: elementList.user.userId,
				//Workspace owner
				ownerid: elementList.owner
			})
		}
	}

	componentDidUpdate() {
		//============================
		//Zoom on Component on click
		//============================
		const focusId = this.state.focusId,
			children = this.state.childs;

		if (focusId !== -1 && children.length !== 0) {
			const stage = this.refs.mainStage.getStage(),
				viewportW = window.innerWidth,
				viewportH = window.innerHeight;

			let frameW, frameH,
				x, y;

			children.some(item => {
				if (item._key === "element:" + focusId) {
					if (item.type === "text") {
						// Get Width + Height element is Text by using rect wrapper
						// this.refs["element:10406"].refs["element:10406_wrapper"].width()
						let element_text = this.refs[item._key].text;
						frameW = element_text.width();
						frameH = element_text.height();
						x = item.stage.x;
						y = item.stage.y;
					} else {
						let rect = Utils.getRect(item),
							posX = item.stage.x,
							posY = item.stage.y;
						if (item.type !== 'image') {
							rect.x += posX;
							rect.y += posY;
						}

						x = rect.x;
						y = rect.y;
						frameW = rect.width;
						frameH = rect.height;
					}
					return true;
				}
				return false;
			}, this);

			const ratioW = viewportW / frameW,
				ratioH = viewportH / frameH;
			
			let scale = Math.min(ratioW, ratioH);
			scale = this.getRightScale(scale);

			if (frameW && frameH) {
				//Scale and move Stage
				stage.x( - x * scale - (frameW * scale - viewportW) / 2);
				stage.y( - y * scale - (frameH * scale - viewportH) / 2);
				stage.scaleX(scale);
				stage.scaleY(scale);
			}
			this.setState({focusId:-1});
		}
		// turn on add image button
		document.getElementById('confirm_add_image').disabled=false;
	}

	getRightScale(scale) {
		let newScale = scale;
		if (newScale < Const.ZOOM.min) {
			newScale = Const.ZOOM.min;
		}
		else if (newScale > Const.ZOOM.max) {
			newScale = Const.ZOOM.max;
		}
		return newScale;
	}

	getCurrentOption() {
		return this.state.options;
	}

	componentDidMount() {
		this.addWheelListener();
		window.addEventListener("mouseup", this.handleWindowMouseUp);
		window.addEventListener("mousedown", this.handleWindowMouseDown);
		window.addEventListener("mousemove", this.handleWindowMouseMove);
	}

	addWheelListener = () => {
		window.addEventListener('wheel', this.handleMouseWheel);
	}

	handleWindowMouseUp(e) {
		const mode = this.state.options.mode,
			showDrawTool = this.state.showDrawTool,
			stage = this.refs.mainStage.getStage(),
			button = e.button;
		if (button === 0) {
			if(mode === 'eraser'){
				this.handlerChangePointer(mode);
			}
		}
		else if (button === 2) {
			if (showDrawTool) {
				this.updateCanvasPos();
				stage.container().style.cursor = Const.CURSOR[mode];
			} else {
				stage.container().style.cursor = 'default';
			}
		}
		this.windowMouseDown = false;
		this.evt = e.evt
	}

	/**
	* Function to check if we clicked inside an element with a particular class
	* name.
	* 
	* @param {Object} e The event
	* @param {String} className The class name to check against
	* @return {Boolean}
	*/
	clickInsideElement(e, className) {
		let el = e.srcElement || e.target;

		if (el.classList.contains(className)) {
			return el;
		} else {
			while (el = el.parentNode) {
				if (el.classList && el.classList.contains(className)) {
					return el;
				}
			}
		}
		return false;
	}

	// if not click on context menu item is hide context menu
	handleWindowMouseDown(e) {
		this.windowMouseDown = true;
		let el = this.clickInsideElement(e, 'context-menu__item');
		if (!el && this.state.showContextMenu) {
			this.showContextMenu(false);
		}
	}

	handleWindowMouseMove = (event) => {
		if (this.lastMousePos) {
            const deltaX = this.lastMousePos.x - event.clientX,
                deltaY = this.lastMousePos.y - event.clientY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
                this.mouseDirection = Const.MOUSE_DIRECTION.Left;
            } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
                this.mouseDirection = Const.MOUSE_DIRECTION.Right;
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
                this.mouseDirection = Const.MOUSE_DIRECTION.Up;
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
                this.mouseDirection = Const.MOUSE_DIRECTION.Down;
            }
        }
        this.lastMousePos = {
            x : event.clientX,
            y : event.clientY
        };
	}

	getMouseDirection = () => {
		return this.mouseDirection;
	}

	componentWillUnmount() {
	this.removeWheelListener();
	window.removeEventListener("mouseup", this.handleWindowMouseUp);
	window.removeEventListener("mousedown", this.handleWindowMouseDown);
	window.removeEventListener("mousemove", this.handleWindowMouseMove);
	}

	removeWheelListener = () => {
		window.removeEventListener('wheel', this.handleMouseWheel);
	}

	//======================================
	//Handle add text from modal
	//======================================
	handleAddText() {
		if($("#text").val().trim() !== '') {

			const tempContent=$('#text').val();
			$('#text').val('');

			const content = tempContent;
			const textPos = {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2 + Const.PROFILE_IMAGE_SIZE
			};
			const requestBody = {
				uid:this.state.uid,
				ownerid:this.state.ownerid,
				content:content,
				stage: textPos
			};
			const callback = function(response) {
				let dateNow = Date.now(),
					body = response.data;
				const element = {
					_key: body.data.id,
					type: 'text',
					content: content,
					ownerid: this.state.ownerid,
					stage: {
						x: textPos.x,
						y: textPos.y
					},
					date_created: body.data.data.date_created
				};
				//clear input text
				$("#text").val("");
				//close modal add text
				$("#close_add_text_modal").trigger("click");
				this.setState({childs:[...this.state.childs,element]});
			}
			TrService.saveText(requestBody, callback.bind(this));
		}
		else {
			alert('Text isn\'t blank, please!!! ');
		}
	}

	//=============================================
	//Handle add video from modal - in progress
	//=============================================
	handleAddVideo(video_link, thumb_link, path, pathThumb, ownerCaption) {
		var video = document.createElement('video');

		video.onloadeddata = () => {
			const ratio = video.videoWidth / video.videoHeight;

            //set default Size of Img
            const thumbHeight = Const.IMAGE_HEIGHT;
            const thumbWidth = ratio * thumbHeight;

			//set default position of video
			const thumbX = window.innerWidth / 2 + Const.PROFILE_IMAGE_SIZE;
			const thumbY = window.innerHeight / 2 - thumbHeight / 2;
			const requestBody = {
				ownerid:this.state.ownerid,
				uid:this.state.uid,
				content_thumb:thumb_link,
				content_video:video_link,
				path: path,
				pathThumb: pathThumb,
				caption: ownerCaption,
				stage:{
					x:thumbX,
					y:thumbY,
					width: thumbWidth,
					height: thumbHeight
				}
			};
			const callback = function(response) {
				const element = {
					uid:this.state.uid,
					ownerid:this.state.ownerid,
					_key: response.data.data.id,
					content:thumb_link,
					content_video:video_link,
					caption: ownerCaption,
					type:'video',
					stage:{
						x:thumbX,
						y:thumbY,
						width:thumbWidth,
						height:thumbHeight
					},
					date_created: Date.now(),
				};
				this.setState({childs:[...this.state.childs,element]});
				
				//Hide add image dialog when upload image successfully
				$("#close_add_image_modal").trigger("click");
			}

			TrService.saveVideo(requestBody, callback.bind(this));
		}

		video.onerror = this.showAlertFileInvalid;
		video.src = video_link;
	}

	showAlertFileInvalid() {
		alert('Your file is invalid. The file must be an image or video (mp4, ogg, webm).');
	}

	//=============================================
	//Handle add image from modal - in progress
	//=============================================
	handleAddImage(link, ownerCaption) {
		$("#image_link").val("");
	
		const img = new Image();
		img.onload = () => {
			const ratio = img.width / img.height;
			//set default Size of Img
			const imageHeight = Const.IMAGE_HEIGHT;
			const imageWidth = ratio * imageHeight;
			//set default position of Img
			const imageX = window.innerWidth / 2 + Const.PROFILE_IMAGE_SIZE;
			const imageY = window.innerHeight / 2 - imageHeight / 2;
			const requestBody = {
				ownerid:this.state.ownerid,
				uid:this.state.uid,
				content:link,
				caption: ownerCaption,
				stage:{
					x:imageX,
					y:imageY,
					width: imageWidth,
					height: imageHeight
				}
			}
			const callback = function(response) {
				const element = {
					uid:this.state.uid,
					ownerid:this.state.ownerid,
					_key: response.data.data.id,
					content:link,
					caption: ownerCaption,
					type:'image',
					stage:{
						x:imageX,
						y:imageY,
						width:imageWidth,
						height:imageHeight
					},
					date_created: Date.now(),
				};
				this.setState({childs:[...this.state.childs,element]});
				$("#close_add_image_modal").trigger("click");
			}

			TrService.saveImage(requestBody, callback.bind(this));
		}

		img.onerror = this.showAlertFileInvalid;
		img.src = link;
	}

	//Check input link is image or video
	handleAddLink(link, caption){
        if (!link || link.trim().length === 0) {
            alert('You must attach a file or link.');
            return;
        }
		const newImage = new Image(),
			Caption = caption.trim();

		newImage.onload = (e) => {
			this.handleAddImage(link, Caption);
		};

		newImage.onerror = (e) => {
			const newVideo = document.createElement('video');
			newVideo.onloadeddata = () => {
				const requestBody = {
					link: link,
					elementDropType: 'video'
				}
				const callback = function(response){
					if(response.data.error_code === 1) {
						alert('Error during create video thumb: ' + response.data.error_message);
					} else {
						this.handleAddVideo(response.data.link, response.data.thumbnail_path, Caption);
					}
				}
				TrService.createThumbnailVideo(requestBody, callback.bind(this));
			};

			newVideo.onerror = this.showAlertFileInvalid;
			newVideo.src = link;
		};

		newImage.src = link;
	}
	
	// Handle drop image to dropzone in modal
	handleDropElement(file) {
        if (!file || file.length < 1) {
            return;
        }

		if(!this.validFileType(file[0])) {
            this.showAlertFileInvalid();
            return;
        };
        const fileUpload = file[0];

		document.getElementById('confirm_add_image').disabled = true;
		
		const callback = function(response) {
			const body = response.data;
			if (body.status !== "FAILED"){
				//Get caption from modal
				let ownerCaption = $('#owner-caption').val().trim();

				switch(body.elementDropType){
					case "image":
						this.handleAddImage && this.handleAddImage(body.file_path, ownerCaption);
						break;
					case "video":
						if (body.error_code === 1) {
							alert('Error happened during upload video');
						} else if (body.error_code !== 1) {
							this.handleAddVideo && this.handleAddVideo(body.file_path, body.thumbnail_path, body.path, body.pathThumb, ownerCaption);
						}
						break;
					default:
						break;
				}   
			}else{
				alert("Error happened during upload element");
			}
		}

		TrService.uploadImage(fileUpload, callback.bind(this));
	}

	validFileType(file) {
        const type = file.type;
        return type.includes('image/') || type === 'video/mp4' || type === 'video/ogg' || type === 'video/webm';
    }

	// ========== MENU ==
	/* MENU EVENT */
	handlerMenuChange(options) {
		this.setState({
			line: {
            	points: [],
            	color: 'black'
            },
			selectedLines: [],
			options: options
		});
	}

	// Handler event on/off drawing mode
    toggleDrawingMenu() {
		let showDrawTool = this.state.showDrawTool;
		let showTimeLine = this.state.showTimeLine;

    	this.setState((prevState, props) => ({
			showTimeLine: false,
			showTheatre: false,
			showDrawTool: !prevState.showDrawTool
		}));

    	if (!showDrawTool) {
			this.updateCanvasPos();
			this.refs.mainStage.getStage().container().style.cursor = Const.CURSOR.pen
    	}

		this.resetDefaultMode(showDrawTool, showTimeLine);
    }

    renderLine(data) {
    	let rect = Utils.getRect(data);
    	return (
    		<TRLine
                key={data._key}
				ref={data._key}
				points={data.stage.points}
				stroke={data.stage.color}
				strokeWidth={data.stage.strokeWidth}
				date_created={data.date_created}
				rect={rect}
				uid={this.state.uid}
				getOptions={this.getCurrentOption}
				handleDblClick={this.toggleTheatreMode}
				draggable={!this.state.showDrawTool}
			/>
    	)
    }

    renderLineBrush(data) {
    	let rect = Utils.getRect(data);
    	return (
    		<TRLineBrush
                key={data._key}
				ref={data._key}
				dbkey={data._key}
				points={data.stage.points}
				stroke={data.stage.color}
				date_created={data.date_created}
				rect={rect}
				uid={this.state.uid}
				getOptions={this.getCurrentOption}
				handleDblClick={this.toggleTheatreMode}
				draggable={!this.state.showDrawTool}
			/>
    	)
    }

    renderLineGroup(data) {
    	let rect = Utils.getRect(data);
    	return (
    		<TRLineGroup
                key={data._key}
				ref={data._key}
				dbkey={data._key}
				data={data.stage}
				date_created={data.date_created}
				rect={rect}
				uid={this.state.uid}
				x={data.stage.x}
				y={data.stage.y}
				newCreated={data.newCreated}
				strokeEnabled={true}
				toggleTheatreMode={this.toggleTheatreMode}
				draggable={!this.state.showDrawTool}
				drawMode={this.state.showDrawTool}
				getOptions={this.getCurrentOption}
				getMouseDirection={this.getMouseDirection}
			/>
    	)
    }

    handleStageContentClick = (e) => {
        const stage = e.currentTarget,
			target = stage.getIntersection(stage.getPointerPosition());

        if (target && target.className === 'Circle') {
            return;
        }

		if (!target || !target.hasName(Const.SHAPE_TYPE.IMAGE)) {
			this.hideOldTransforms();
			return;
		}

		if (target === this.oldTransform) {
            return;
		}

        this.hideOldTransforms(stage);

        target.fire(Const.EVENTS.SHOW_TRANSFORM);
        this.oldTransform = target;
	}

	hideOldTransforms = () => {
		const node = this.oldTransform;
        node && node.fire(Const.EVENTS.HIDE_TRANSFORM);
        this.oldTransform = null;
	}

	handleOpenProfileWindow = () => {
		console.log(123);
		this.setState({
			...this.state,
			openProfileWindow: true
		})
	}

	handleCloseProfileWindow = () => {
		this.setState({
			...this.state,
			openProfileWindow: false
		})
	}


	
	//Render stage
	render() {
		let marks={};
		marks[this.state.joinDate] = { label:'ACCOUNT CREATED' };
		marks[this.state.now] = {
			style: { float:'right' },
			label: 'NOW'
		};

		let mode = this.state.options.mode;
		const stage = {
			width: window.innerWidth,
			height: (this.state.showDrawTool ? window.innerHeight - 134 : window.innerHeight - 54)
		}
		return(	
				/* Menu zone  */
			<div className="">
				<nav className="navbar navbar-inverse no-border-radius active-hover">
					<div className="container-fluid">
						<div className="navbar-header controll-style">
							<button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span> 
							</button>
							<a className="navbar-brand homelink" href="/home" onClick={this.handleRedirectPage}><span className="glyphicon glyphicon-home"></span> NEWSFEED</a>
						</div>
						
						<div className="collapse navbar-collapse" id="myNavbar">
							<ul className="nav navbar-nav navbar-right">
								<li>
									<a href="#" onClick={this.toggleTimeline}>
										<span className="glyphicon glyphicon-time"></span> TIMELINE
									</a>
								</li>
								<li>
									<a href="#" onClick={this.toggleTheatreMode}>
									<span className="glyphicon glyphicon-film"></span> THEATRE MODE
									</a>
								</li>
								<li>
									<a href="#" onClick={this.addImageOrTextClick} id="add_image" data-toggle="modal" data-target="#add_image_modal">
										<span className="glyphicon glyphicon-picture"></span> ADD IMAGE
									</a>
								</li>
								<li>
									<a href="#" onClick={this.addImageOrTextClick} id="add_text" data-toggle="modal" data-target="#add_text_modal">
										<span className="glyphicon glyphicon-text-height"></span> ADD TEXT
									</a>
								</li>
								<li>
									<a href="#" id="drawing_mode" onClick={this.toggleDrawingMenu}>
										<span className="glyphicon glyphicon-pencil"></span> DRAW
									</a>
								</li>
							</ul>
						</div>
					</div>
				</nav>
				{
					this.state.showTimeLine &&
					<div id='filter_bar' style={{position: 'absolute'}}>
						<Slider
							min={this.state.joinDate}
							max={this.state.now}
							marks={marks}
							defaultValue={this.state.now}
							onChange={this.handleChangeTimeline}
							step={this.state.step}
							handle={this.handle}
						/>
					</div>
				}

				{/* Modal add image zone  */}
				<div id="add_image_modal" className="modal fade" role="dialog">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal">×</button>
								<h4 className="modal-title">Add Image</h4>
							</div>
							<div className="modal-body">
								<form className="form-horizontal">
									<div className="form-group">
										<label htmlFor="image_link" className="control-label col-md-2">Link:</label>
										<div className="col-md-10">
											<input type="text" className="form-control" id="image_link"/>
										</div>
									</div>
									<div className="form-group" style={{padding: "5px 0px 0px 0px",}}>
										<label htmlFor="owner-caption" className="control-label col-md-2">Caption:</label>
										<div className="col-md-10">
											<input type="text" className="form-control" id="owner-caption" maxLength="100"/>
										</div>
									</div>
									<div className="form-group">
										<label htmlFor="image_link" className="control-label col-md-2">Link:</label>
										<div className="col-md-10">
											<Dropzone onDrop={this.handleDropElement}>
													<p>DROP FILE OR CLICK TO UPLOAD.</p>
											</Dropzone>
										</div>
									</div>
									
								</form>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-default" onClick={()=>this.handleAddLink($('#image_link').val(), $('#owner-caption').val())}  id="confirm_add_image">Add</button>
								<button type="button" id="close_add_image_modal" className="btn btn-default" data-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>
				{
					this.state.showTheatre &&
					<TRTheatre
						toggleTheatreMode={this.toggleTheatreMode}
						userslug={this.state.userslug}
						currentElement={this.state.currentElement}
						showTheatre={this.state.showTheatre}
						loginUser={this.state.loginUser}
					/>
				}
				{/* Modal add text zone  */}
				<div id="add_text_modal" className="modal fade" role="dialog">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal">×</button>
								<h4 className="modal-title">Add Text</h4>
							</div>
							<div className="modal-body">
								<form className="form-horizontal">
									<div className="form-group">
										<label htmlFor="text" className="control-label col-md-2">Content:</label>
										<div className="col-md-10">
											<input type="text" className="form-control" id="text" />
										</div>
									</div>
								</form>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-default" id="confirm_add_text" onClick={this.handleAddText}>Add</button>
								<button type="button" id="close_add_text_modal" className="btn btn-default" data-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>

				{
					this.state.openProfileWindow &&
					<div id="profile-window" className="profile-window-container">
						<div className="user-name">forrestgump</div>
						<div>
							<span className="user-follower">452 Followers</span>
							<span className="user-following">17 Following</span>
						</div>
						{/* <div className="modal-dialog">
							<div className="modal-content">
								<div className="modal-header">
									<button type="button" className="close" data-dismiss="modal">×</button>
									<h4 className="modal-title">asdasd</h4>
								</div>
								<div className="modal-body">
									<form className="form-horizontal">
										<div className="form-group">
											<label htmlFor="text" className="control-label col-md-2">Content:</label>
											<div className="col-md-10">
												<input type="text" className="form-control" id="text" />
											</div>
										</div>
									</form>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-default" id="confirm_add_text" onClick={this.handleAddText}>Add</button>
									<button type="button" id="close_add_text_modal" className="btn btn-default" data-dismiss="modal" onClick={this.handleCloseProfileWindow}>Close</button>
								</div>
							</div>
						</div> */}
					</div>
				}
				
				{/* Main Canvas's zone  */}
				<Stage ref="mainStage"
					width={stage.width}
					height={stage.height}
					draggable={!this.state.showDrawTool}
					onContentMouseDown={this.handleStageContentMouseDown}
					onContentContextMenu={this.handleStageContentContextMenu}
					onContentClick={this.handleStageContentClick}
					>
					<Layer ref={layer => (this.oldElements = layer)}>
						{/*Render element on stage which is getting from Database*/}
						{this.state.childs.map(function(el, i){
							switch(el.type){
								case "image":
									return <TRImage
										key={el._key}
										ref={el._key}
										uid={this.state.uid}
										ownerid={this.state.ownerid}
										dbkey={el._key}
										src={el.content}
										x={el.stage.x}
										y={el.stage.y}
										width={el.stage.width}
										height={el.stage.height}
										date_created={el.date_created}
										handleDblClick={this.toggleTheatreMode}
										el_type={el.type}
										caption={el.caption}
										/>
									break;
								case "video":
									return <TRImageVideo
										key={el._key}
										ref={el._key}
										uid={this.state.uid}
										ownerid={this.state.ownerid}
										dbkey={el._key}
										src={el.content}
										x={el.stage.x}
										y={el.stage.y}
										width={el.stage.width}
										height={el.stage.height}
										date_created={el.date_created}
										handleDblClick={this.toggleTheatreMode}
										el_type={el.type}
										caption={el.caption}
									/>
								default:
									break;
							};
						},this)}

						{this.state.childs.map(function(el, i){
							switch(el.type){
								case "text":
									return <TRText 
										key={el._key}
										ref={el._key}
										dbkey={el._key}
										content={el.content}
										x={el.stage.x}
										y={el.stage.y}
										uid={this.state.uid}
										fontSize={el.stage.fontSize}
										date_created={el.date_created}
										handleDblClick={this.toggleTheatreMode}
									/>;
									break;
								default:
									break;
							};
						}, this)}
						{
							this.state.showDrawTool && this.state.options.mode === 'eraser' &&
							<TRDrawing
								getCanvasPos={this.getCanvasPos}
								addNewLine={this.addNewLine}
								uid={this.state.uid} 
								ownerid={this.state.ownerid}
								options={this.state.options}
							/>
						}
						{this.state.childs.map(function(item, i){
							switch(item.type){
								case "drawing:pen":
								case "drawing:pencil":
									return this.renderLine(item)
								case "drawing:brush":
									return this.renderLineBrush(item)
								case "drawing:group":
									return this.renderLineGroup(item)
								default:
									break;
							};
						}, this)}
					</Layer>
					{/*Drawing layer*/}
					<Layer>
						{
							this.state.groupArr.map(function(item, i) {
								return this.renderLineGroup(item)
							}, this)
						}

						<Group
							ref={node => (this.newLinesGroup = node)}
							name={Const.KONVA.NEW_LINES_CONTAINER_NAME}>
							{
								this.state.lines.map((item, index) => {
									switch(item.stage.mode){
										case "pen":
										case "pencil":
											return this.renderLine(item)
										case "brush":
											return this.renderLineBrush(item)
										default:
									}
								}, this)
							}
						</Group>

                        {
                            this.state.showDrawTool && this.state.options.mode !== 'eraser' &&
                            <TRDrawing
                            	ref={node => this.drawing = node}
								getCanvasPos={this.getCanvasPos}
                                addNewLine={this.addNewLine}
                                uid={this.state.uid}
                                ownerid={this.state.ownerid}
                                options={this.state.options}
                            />
                        }
                        {
							<TRSelectMoveGroup
								trSelectedLinesRef={el => this.trSelectedLines = el}
								line={this.state.line}
								selectedLines={this.state.selectedLines}
							/>
						}
						<TRProfileImage
							centerPos={
								{
									x: stage.width / 2,
									y: stage.height / 2
								}
							}
							username={this.state.userslug}
							src={this.state.user.picture}
							uid={this.state.uid}
							ownerid={this.state.ownerid}
							showDrawTool={this.state.showDrawTool}
							showProfileWindow={this.handleOpenProfileWindow}
						/>
					</Layer>
				</Stage>
				{
					this.state.showContextMenu &&
					<TRContextMenu
                        showContextMenu={this.showContextMenu}
                        evt={this.evt}
                        elementTarget={this.elementTarget}
                    />
				}

				{/* Drawing menu*/}
				<Stage
					width={window.innerWidth}
					height={(this.state.showDrawTool ? 80 : 0)}>
					<Layer>
						<TRMenu
							width={window.innerWidth}
							height={80}
							handlerMenuChange={this.handlerMenuChange} 
							handlerChangePointer={this.handlerChangePointer} 
							options={this.state.options}/>
					</Layer>
				</Stage>

				{/* To select new profile image */}
				<input type="file" id="profile_image" name="profile_image" accept="image/*" style={{display:'none'}}/>

				{/*Input Edit text*/}
				<div id="newTextWrapper" style={{display:'none'}}>
						<input type="text" id="newText"/>
				</div>
				{/*Saving message*/}
				<div id="snackbar">Saving...</div>
				{/*Serach engine*/}
				<TRSearch
					handleRedirectPage={this.handleRedirectPage}
				/>
			</div>
		);
	}
};

export default TR_Stage;
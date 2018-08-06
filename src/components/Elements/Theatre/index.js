import React, { Component } from 'react';
import {Stage, Layer} from 'tr-react-konva';
import {TRVideo, TRLineGroup, TRInteractive} from './../';
import $ from 'jquery';
import './style.css';
import '../TRInteractive/style.css';
import Utils from '../../Util/utils.js';
import Const from '../../Util/const.js';
import TrService from '../../Util/service.js';
import TRSocket from '../../Util/socket.js';

class TRTheatre extends Component {
	constructor(props){
		super(props);
		this.state = {
			userslug: this.props.userslug,
			loginUser: this.props.loginUser,
			theatreChilds: [],
			position: 0,
			pageCount: 0,
			elementPerPage: 10,
			elementCount: 0,
			showLoading: 'block',
			showTheatreMode: this.props.showTheatre ? this.props.showTheatre : false,
			fontSize: 30
		}
		/**
	     * action
	     * 0: init carousel
	     * 1: next carousel item
	     * -1: prev carousel item
	     */
		this.action = 0;
		this.socket = TRSocket.getInstance()
	}


	handlePrev(){
		this.action = -1;
		this.setState((prevState, props) => ({
			position: prevState.position === 0 ? (prevState.elementCount - 1) : (prevState.position - 1)
		}));
		this.stopPlayingVideo();
	}

	handleNext(){
		this.action = 1;
		this.setState((prevState, props) => ({
			position: prevState.position + 1
		}));
		this.stopPlayingVideo();
		// axios.get('/api/newsfeed/list/' + this.state.pageCount)
		// 	.then(function(response){
		// 		let elementList = response.data;
		// 		this.setState(function(prevState, props){
		// 			let theatreChilds = prevState.theatreChilds;
		// 			elementList.map((el, i) => {
		// 				theatreChilds.push(el);
		// 			});
					
		// 			return {
		// 				theatreChilds: theatreChilds,
		// 				elementCount: theatreChilds.length
		// 			}
		// 		});
		// 	});
	}


	componentDidUpdate() {
		this.getCurrentActiveTextEl(this.action);
	}

	getCurrentActiveTextEl(action) {
		const oldActiveEls = $('#myCarousel .active');

		let currentIndex = oldActiveEls.index();

		if (currentIndex !== -1) {
			let tagH3
			if (action === 0) {
				const divContainer = oldActiveEls[0];
				tagH3 = divContainer.getElementsByTagName('h3');
				if (tagH3.length > 0) {
					tagH3 = tagH3[0];
					this.handleResizeElementText(tagH3);
				}
			}
			else {
				const carouselChildren = $('#myCarousel .carousel-inner').children();
				const childrenCount = carouselChildren.length;
				let currentActiveEl;
				if (action === 1) {
					currentActiveEl = carouselChildren[currentIndex < childrenCount - 1 ? currentIndex + 1 : 0];
				}
				else {
					currentActiveEl = carouselChildren[currentIndex > 0 ? currentIndex - 1 : childrenCount - 1];
				}

				tagH3 = currentActiveEl.getElementsByTagName('h3');
				if (tagH3.length > 0) {
					tagH3 = tagH3[0];
					this.handleResizeElementText(tagH3);
				}
			}
		}
	}

    handleResizeElementText(tagText) {
		const parentHeight = window.innerHeight * 0.7 /*div wrapper: .wrapper-element { height: 70vh; }*/ - 20 /*parent padding*/;
        let oldFontSize, newFontSize;
        while (tagText.offsetHeight > parentHeight) {
            oldFontSize = tagText.style.fontSize.slice(0, -2);
            newFontSize = parseInt(oldFontSize, 10) - 1;
            tagText.style.fontSize = `${newFontSize}px`;
        }
    }

	stopPlayingVideo() {
		let activeItem = $('#myCarousel .carousel-inner').children('.active');
		if (activeItem && activeItem.length > 0){
			activeItem = activeItem[0].getElementsByTagName('video');

			if (activeItem && activeItem.length > 0){
				const video = activeItem[0];
				video.pause();
			}
		}		
	    
	}
	
	componentWillMount(){
		this.setState({
			showLoading: 'block'
		});
		const userslug = this.state.userslug;
		const callback = function(response) {
			let body = response.data;
			if (body.status !== 'FAILED') {
				this.setState({
					theatreChilds: body.data,
					elementCount: body.data.length,
					showLoading: 'none'
				});
			}
		}
		TrService.getElementList(userslug, callback.bind(this))
	}

	componentDidMount(){
		this.handleEventsCarousel.addEventListener('slid.bs.carousel', this.handleEventSlidCarousel);
	}

	handleCarouselChangeItem(){
		$('.carousel').on('click', function(){
			let currentElement = $('.carousel-inner .active');
			console.log(currentElement.index());
			let listItemCarousel = $('.carousel-inner .item');
			for(var i=0; i < listItemCarousel.length; i++){
				if($('.active')[i]){
					console.log(listItemCarousel[i], i);
				}
				//console.log(listItemCarousel[i], i);
			}
		})
	}

	handleEventSlidCarousel(e){
		console.log(e);
		alert('run slid carousel');
	}

	/*componentDidUpdate(){
		let element = $('.carousel-inner .active');
		if(element.length > 0){
			while( element.find('.frame h3').height() > element.height() ) {
				let fontSize = element.find('.frame h3').css('font-size').slice(0, -2);
        		element.find('.frame h3').css('font-size', (parseInt(fontSize) - 1) + "px" );
        	}
		}
	}*/

	setCurrentCommentOpen = (el) => {
		this.currentCommentOpen = el;
	}

	getCurrentCommentOpen = () => {
		return this.currentCommentOpen;
	}

	renderInteractive = (obj) =>{
		return(
			<div className={obj.elementId+" wrapper-element-right col-lg-4"}>
		        <div className="col-lg-12 userInfo align-content">
		        	<a className="userNameTheatre" href={obj.createdUser.userslug}><p className="user-name">{obj.createdUser.username}</p></a>
		        </div>
				<TRInteractive
					caption={obj.caption}
					comment={obj.comment}
					main_user={obj.user}
					createdUser={obj.createdUser}
					element_id={obj.elementId}
					likeTimes={obj.likeTimes}
					usersLiked={obj.usersLiked}
					userIds={obj.userIds}
					shareLink={obj.shareLink}
					element={obj.element}
					mode='theatre'
					setCurrentCommentOpen={this.setCurrentCommentOpen}
					getCurrentCommentOpen={this.getCurrentCommentOpen}
					isShowTheatre={this.state.showTheatreMode}
					loginUser={this.state.loginUser}
                    socket={this.socket}
				/>
			</div> 
		)
	}

	render() {
		const currentElement = this.props.currentElement;
		const mainContent = {
			width: (window.innerWidth - 100) * 0.8 * 0.6666666667
		};
		return (
			<div id='theater_mode_div' style={{display:'flex'}}>
				<div id='theatre_container'>
					<div className='pull-top-right'>
						<a onClick={this.props.toggleTheatreMode}>
							<span className="glyphicon glyphicon-remove"/>
						</a>
					</div>
					<div ref={node => (this.handleEventsCarousel = node)} id="myCarousel" className="carousel slide" data-interval="false">
						<div id='carousel_inner' className="carousel-inner">
							{
								this.state.theatreChilds.map(function(el, i){
								
								    const active = currentElement === el._key ? ' active' : (i === 0 && currentElement.length === 0) ? ' active' : '',
    									obj = {
    										user: el.owner,
    										createdUser: el.createdUser,
    										caption: el.caption,
    										comment: el.comment ? el.comment : [],
    										elementId: el.id,
    										likeTimes: el.likeTimes ? el.likeTimes : 0,
    										usersLiked: el.usersLikedElement,
    										userIds: el.userLikedIds,
    										shareLink: document.location.origin + "/stage/" + el.owner.userslug + '/' + el.id,
    										element: el
    									},
                                        type = el.type

								if(el.type === "text"){
									return(
										<div key = {el.id}
											className={el.id +" wrapper-element row item slide text-slide" + active}>
												<div className="frame col-lg-8" style={{width: mainContent.width}}>	
												<h3 style={{fontSize: this.state.fontSize+'px'}}>{el.content}</h3>
											</div>
											{this.renderInteractive(obj)}
										</div>
									)
								}
								
								else if (type === Const.SHAPE_TYPE.IMAGE || (type === Const.SHAPE_TYPE.GROUP && el.content)) {
									return (
						                <div key = {el.id}
						                	className={"wrapper-element row item slide image-slide" + active}>
						                	<div className="frame col-lg-8">
	                                        	<img
                                                    alt=''
    	                                        	src={el.content}
    	                                        	height={el.stage.height} 
    	                                        	width={el.stage.width}
                                                />
	                                        </div>
	                                        {this.renderInteractive(obj)}
	                                    </div>  
									)
								}

								else if (el.type === "video"){
									return(
										<div key = {el.id}
											className={"wrapper-element row item slide image-slide" + active}
                                            >
											<div className="frame col-lg-8">
												<TRVideo
    												videoUrl={el.content_video}
    												el_id={el.id}
												/>
											</div>
											{this.renderInteractive(obj)}
										</div>
									)
								}
								
								else {
									const containerId = "theatre" + el.id,
										parentWidth = (window.innerWidth - 100) * 0.8 * 0.6666666667,
										parentHeight = window.innerHeight * 0.7,
										rect = Utils.getRect(el);
									if (rect) {
										const itemWidth = parentWidth,
											itemHeight = parentHeight;
										let scale = Math.min(itemHeight / rect.height, itemWidth / rect.width);
										if (scale > 1) {
											scale = 1;
										}
										const stagePositionX = - rect.x * scale + Math.abs((rect.width * scale - itemWidth) / 2),
							        		stagePositionY = - rect.y * scale + Math.abs((rect.height * scale - itemHeight) / 2);
										let shape;

										if (el.type === "drawing:group") {
											shape = <TRLineGroup
												dbkey={el._key}
												uid={el.uid}
												data={el.stage}
												rect={rect}
											/>
										}
										return (
											<div key = {el.id}
												className={"wrapper-element row item slide group" + active}>
												<div
													className="col-lg-8"
                                                    style={{padding: 0}}
													id={containerId}
													>
													<Stage
														x={stagePositionX}
														y={stagePositionY}
														container={containerId}
														height={itemHeight}
														width={itemWidth}
														scaleX={scale}
														scaleY={scale}
														>
														<Layer hitGraphEnabled={false}>
															{ shape }
														</Layer>
													</Stage>
												</div>
												{this.renderInteractive(obj)}
											</div>
										)
									}
								}
							}, this)}
						</div>
						<p className="loading"
							style={{
								display: this.state.showLoading,
								color: 'white',
								textAlign: 'center',
	    						fontSize: '28px'
	    					}}	
	    				>LOADING ... </p>
						<a className={"left carousel-control" + (this.state.showLoading === 'block' ? ' disabled' : '')}
							href="#myCarousel" data-slide="prev" onClick={this.handlePrev.bind(this)}>
							<span className="glyphicon glyphicon-chevron-left"/>
							<span className="sr-only">Previous</span>
						</a>
						<a className={"right carousel-control" + (this.state.showLoading === 'block' ? ' disabled' : '')}
							href="#myCarousel" data-slide="next" onClick={this.handleNext.bind(this)}>
							<span className="glyphicon glyphicon-chevron-right"/>
							<span className="sr-only">Next</span>
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default TRTheatre;
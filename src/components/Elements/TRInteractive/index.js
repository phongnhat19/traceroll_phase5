import React, { Component } from 'react'; import {Stage, Layer} from 'react-konva-traceroll';
import {TRText, TRImage, TRLine, TRLineBrush, TRVideo, TRLineGroup} from './../';
import axios from 'axios';
import Jquery from 'jquery';
import FontAwesome from 'react-fontawesome';
import './style.css';

class TRInteractive extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loginUser: this.props.loginUser,
			commentZoneHeight: '',
			elementIsComment:'',
			counterLike: 0,
			likeCounter: this.props.likeTimes,
			userLiked: this.props.usersLiked ? this.props.usersLiked : [],
			showModalLike: false,
			showModalShare: false,
			showTheatreMode: this.props.isShowTheatre ? this.props.isShowTheatre : false
		}

		this.getHeightCommentZone = this.getHeightCommentZone.bind(this);
		this.handleReactiveButtonClick = this.handleReactiveButtonClick.bind(this);
	}

	componentWillMount() {
		this.setState({
			main_user: this.props.main_user,
		})

	}	

	componentWillUnMount() {
        document.removeEventListener('mousedown', this.handleMouseDown);
	}	

	componentDidMount() {
		this.getHeightCommentZone && this.getHeightCommentZone();
        document.addEventListener('mousedown', this.handleMouseDown);
	}

    handleMouseDown = (e) => {
        const parent = e.target.parentElement;
        let classNames;
        if (parent) {
        	classNames = parent.getAttribute('class')
        }
        if (classNames && classNames.includes('modal-container')) {
            return;
        }
        const showModalShare = this.state.showModalShare,
            showModalLike = this.state.showModalLike;
        if (showModalShare) {
            this.handleToggleModalShare();
        }
        if (showModalLike) {
            this.handleToggleModalLike();
        }

    }

	componentWillReceiveProps() {

	}

	getHeightCommentZone(){
		if(!this.state.showTheatreMode === false){
			let availableHeight = Jquery('.wrapper-element').height();

			this.setState({
				commentZoneHeight: availableHeight - 100,
			})

			Jquery('.comment-style').css({'height': '-webkit-fill-available'});
		}
	}

	// handle like, share, comment click event
	handleReactiveButtonClick(el){

		const btnType = el.currentTarget.attributes[2].nodeValue;
		const elementId = el.currentTarget.attributes[3].value;
		let userName = this.state.main_user.username;
		let userID = this.state.main_user.userId;

		if(btnType === 'like'){
			if(this.state.showTheatreMode === true){
				userName = this.state.loginUser.username;
				userID = this.state.loginUser.userId;
			}
			const self = this;
			let element = Jquery('.'+elementId+' .reactiveLike');
			let counter = Jquery('.'+elementId+' .like-counter');
			let count, suffix;

			if(!element.hasClass('active')){
				count = Number(counter.val()) + 1;
                suffix = "Likes";
				element.css("color", "#FBC305");
				element.addClass('active');
				element.find('span').removeClass('icon-Star');
				element.find('span').addClass('icon-yellow-Star');
				counter[0].innerHTML = count + ' ' + suffix;
				counter.val(count);
				this.state.userLiked.push(userName);

				var likes = {
						elementID:"element:"+elementId,
						userID: userID
					}

				axios.post('/api/element/like', likes)
				.then(function(response){
					self.setState({
						likeCounter: count
					})
				})
			}else{
				count = Number(counter.val()) - 1;
                suffix = "Likes";
				element.css("color", "#676767");
				element.removeClass('active');
				element.find('span').removeClass('icon-yellow-Star');
				element.find('span').addClass('icon-Star');		
				counter[0].innerHTML = count + ' ' + suffix;
				counter.val(count);
				this.state.userLiked.splice(this.state.userLiked.indexOf(userName), 1);

				var dislike = {
						elementID:"element:"+elementId,
						userID: userID
					}

				axios.post('/api/element/dislike', dislike)
				.then(function(response){

					self.setState({
						likeCounter: count
					})
				})
			}

		}else if(btnType === 'comment'){
			if(this.state.showTheatreMode === true){
				userName = this.state.loginUser.username;
				userID = this.state.loginUser.userId;
			}
			this.setState({
				elementIsComment: elementId,
			})

            let currentCommentOpen = this.props.getCurrentCommentOpen ? this.props.getCurrentCommentOpen() : null;
            currentCommentOpen && currentCommentOpen.addClass('hide-commentZone');

			Jquery('.'+elementId+' .comment-zone').removeClass("hide-commentZone");
			Jquery('.'+elementId).removeClass("hide-commentInput");
			Jquery('.'+elementId+' .comment-input').focus();
			
            currentCommentOpen = Jquery('.'+elementId+' .commentInsertField');
            currentCommentOpen.removeClass("hide-commentZone");

            this.props.setCurrentCommentOpen && this.props.setCurrentCommentOpen(currentCommentOpen);

			window.addEventListener("keypress", function(e){
				const content = Jquery('.'+elementId+' .comment-input').val().trim(),
					elementID = "element:"+elementId,
					isFocus = !currentCommentOpen[0].getAttribute('class').includes('hide-commentZone');
			    if (e.keyCode === 13 && content !== '' && isFocus){ // 13 is enter press
					var encodedStr = content.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
					   return '&#'+i.charCodeAt(0)+';';
					});
					Jquery('.'+elementId+' .listComments').append("<li><strong>"+userName+":&nbsp;&nbsp;</strong><p class='comment-content'>"+encodedStr+"</p></li>");
					Jquery('.'+elementId+' .comment-input').val('');		

					var comment_info = {
							content: content,
							userID: userID,
							elementID: elementID
						}
					var elem = Jquery('.commentsDetail');
						elem.scrollTop = elem.scrollHeight;

					// sent comment infomation save to database
					if(content !== ''){
						axios.post("/api/comments/save", comment_info)
						.then(function(response){
						})
					}

				}
			});
			
		}else if(btnType === 'seeComments'){

			Jquery('.'+elementId+' .listComments').children('li').removeClass("hide-commentInput");
			Jquery('.'+elementId+' .see-all-comment').addClass("hide-commentInput");
		}
	}

	handleLoadComments = (comments, elementId) => {
		if(comments.length !== 0){
			Jquery('.'+elementId+' .comment-zone').removeClass("hide-commentZone");
		}
		const length = comments.length - 1;
		return(
			<div className="commentsDetail comment-style">
				<ul className="listComments">
					{
						comments.map(function(comment, index){
							let classHide = 'hide-commentInput';
							if (index === length || index === length - 1) {
								classHide = '';
							}
							return (
								<li className={classHide}>
									<strong>{comment.username}:&nbsp;&nbsp;</strong>
                                    <p className='comment-content'>{comment.content}</p>
								</li>
							)
						})
					}
				</ul>
			</div>
		)
	}

	handleShowSeeAll = (comments, likedUsers) => {
		if(comments.length > 2){
			return(
				<button id="seeAllComment" className="social-button see-all-comment" name="seeComments" value={this.props.element_id} onClick={this.handleReactiveButtonClick}>
					<FontAwesome
						className="showMoreButton" 
						name="chevron-down"
						size='2x'
						style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'}}
					/>
					See All Comments
				</button>
			)
		}
	}

	handleLikeButton = (likeTimes, userIds, mainUser) => {
		let listUids = userIds;
		let checkUid = this.state.showTheatreMode === true ? this.state.loginUser.userId : mainUser;

		if(likeTimes > 0 && listUids.includes(checkUid.toString()) === true){
			return(
				<button id="" className="reactiveLike social-button active" style={{color: "#FBC305",}} name="like" value={this.props.element_id} onClick={this.handleReactiveButtonClick}>
					{/*<FontAwesome
						className="likeButton" 
						name="star"
						size='2x'
						style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
					/>*/}
					<span class="icon-yellow-Star"></span>
				</button>
			)
		}else{
			return(
				<button id="" className="reactiveLike social-button" name="like" value={this.props.element_id} onClick={this.handleReactiveButtonClick}>
					{/*<FontAwesome
						className="likeButton" 
						name="star-o"
						size='2x'
						style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
					/>*/}
					<span class="icon-Star"></span>
				</button>
			)
		}
	}

	handleToggleModalLike = () => {

		this.setState((prevState, props) => ({
			showModalLike: !prevState.showModalLike
		}))
	}

	handleToggleModalShare = () => {

		this.setState((prevState, props) => ({
			showModalShare: !prevState.showModalShare
		}))
	}

	copyShareLink = (e) =>{
		const copyText = e.currentTarget.parentElement.getElementsByTagName('textarea')[0];
		copyText.select();
		document.execCommand("Copy");
	}

	render() {
        const likeCount = this.state.likeCounter;
        const likeSuffix = "Likes";

		return(
	        <div className={this.props.element_id+" col-lg-12"} style={{padding: "0px", height: this.state.commentZoneHeight}}>
	        	<div className="col-lg-12 caption align-content">
	        		<p className="theatre-caption">{this.props.caption}</p>
	        	</div>
		        <div className="col-lg-12 cover-main-interactive" style={{height: this.state.commentZoneHeight,}}>
			        <div className="col-lg-12 interactive-zone align-content">
						<div className="" style={{margin: "0px",}}>
							<div className="col-lg-4 align-button">
								{this.handleLikeButton(this.props.likeTimes, this.props.userIds, this.props.main_user.userId)}
							</div>
							<div className="col-lg-4 align-button">
								<button id="reactiveComment" className="social-button" name="comment" value={this.props.element_id} onClick={this.handleReactiveButtonClick}>
									{/*<FontAwesome
										className="commentButton" 
										name="comment-o"
										size='2x'
										style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
									/>*/}
									<span class="icon-Comment"></span>
								</button>
							</div>
							<div className="col-lg-4 align-button">
								<button id="reactiveShare" className="social-button" name="share" value={this.props.element_id} onClick={this.handleToggleModalShare}>
									{/*<FontAwesome
										className="shareButton" 
										name="share-alt-square"
										size='2x'
										style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
									/>*/}
									<span class="icon-Share"></span>
								</button>
								{
									this.state.showModalShare &&
									<div className={ 'modal-container share ' + this.props.mode}>
                                        <h1 className='title'>Share</h1>
                                        <button type="button" class="close button" onClick={this.handleToggleModalShare}>
                                            <span aria-hidden="true">×</span>
                                            <span class="sr-only">Close</span>
                                        </button>
                                        <textarea>{this.props.shareLink}</textarea>
                                        <button className='copy-share-link' onClick={this.copyShareLink}>Copy Link</button>
									</div>
								}
							</div>
							<div className="col-lg-12">									
								<button id="countLikes" className="like-counter social-button" name="count" value={this.props.likeTimes ? this.props.likeTimes : '0'} onClick={this.handleToggleModalLike}>
									{ likeCount + ' ' + likeSuffix }
								</button>
								{	
									this.state.showModalLike &&
									<div className={ 'modal-container like ' + this.props.mode}>
                                        <h1 className='title'>Likes</h1>
                                        <button type="button" class="close" onClick={this.handleToggleModalLike}>
                                            <span aria-hidden="true">×</span>
                                            <span class="sr-only">Close</span>
                                        </button>
                                        {
                                            this.state.userLiked.map(function(user, index) {
                                                return <h4 className='item'>{user.username === undefined ? user : user.username}</h4>;
                                            })
                                        }
									</div>
								}
							</div>
						</div>
			        </div>
					<div className="col-lg-12 comment-zone align-content" style={{maxHeight: "calc("+this.state.commentZoneHeight+"px - 110px)"}}>
						{this.handleLoadComments(this.props.comment, this.props.element_id)}
						<div className={"commentInsertField hide-commentInput " + this.props.element_id} style={{display: "-webkit-box", padding: "5px 0px 5px 0px",}}>
							<strong style={{padding: "0px 10px 0px 0px",}}>{this.state.showTheatreMode === true ? this.state.loginUser.username : this.state.main_user.username} :</strong>
							<input type="text" className={this.props.element_id+" comment-input comment-input-style"} name="comment" placeholder="" maxlength="150"/>
						</div>
						{this.handleShowSeeAll(this.props.comment)}
			        </div>
			    </div>
			</div>                
		)
	}
}

export default TRInteractive;
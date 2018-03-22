import React, { Component } from 'react';
import { Stage, Layer, Group, Line, Rect} from 'react-konva-traceroll';
import { TRLine, TRLineBrush, TRVideo, TRLineGroup, TRSearch, TRInteractive} from '../Elements';
import FontAwesome from 'react-fontawesome';
import axios from 'axios';
import './style.css';
import Jquery from 'jquery';
import Const from '../Util/const.js';
import Utils from '../Util/utils.js';
import TrService from '../Util/service.js';
import '../Elements/TRInteractive/style.css';


class Home extends Component {
	constructor(props) {
			super(props);
			this.state = {
				page: 0,
				numChildren: 0,
				list: [],
				loading: "none",
				counterLike: 10,
				isShowTheatre: false
			};

			this.handleLoadItem = this.handleLoadItem.bind(this);
			this.handleScroll = this.handleScroll.bind(this);
			this.handleLogout = this.handleLogout.bind(this);
		}
	componentWillMount() {
		//add Event scroll
		window.addEventListener('scroll', this.handleScroll);
		
        const callback = function(response) {
            const items = this.state.list,
                body = response.data;

            this.setState({
                user: body.user
            });

            body.data.map((item)=>{
                this.handleLoadItem(items, item);
                return true;
            }); 

            this.setState({list: items});
        }

        TrService.getNewsfeed(0, callback.bind(this));
	}

	handleLogout() {
		axios.post("/logout", {})
		.then(function (response) {
			if (response.status == 200) {
				window.location.href = "/login";
			}
		});
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll);
	}

	//Handle scroll to bottom event - lazyload
	handleScroll(event) {
		//if user scroll to the bottom of the page
		 if(Jquery(window).scrollTop() + Jquery(window).height() >= (Jquery(document).height()-2)) {
			this.setState({page:this.state.page + 1, loading:"block"})

            const callback = function(response) {
                const items = this.state.list;
                response.data.data.map((item)=>{
                        this.handleLoadItem(items, item);
                    return true;
                }); 
                this.setState({list: items, loading:"none"});
            }

            TrService.getNewsfeed(this.state.page, callback.bind(this))
        }
	}

	setCurrentCommentOpen = (el) => {
		this.currentCommentOpen = el;
	}

	getCurrentCommentOpen = () => {
		return this.currentCommentOpen;
	}

	renderInteractive = (obj) =>{
		return(
			<TRInteractive
				caption={obj.caption}
				comment={obj.comment}
				main_user={this.state.user}
				element_id={obj.elementId}
				likeTimes={obj.likeTimes}
				usersLiked={obj.usersLiked}
				userIds={obj.userIds}
				shareLink={obj.shareLink}
				mode='newsfeed'
				setCurrentCommentOpen={this.setCurrentCommentOpen}
				getCurrentCommentOpen={this.getCurrentCommentOpen}
				isShowTheatre= {this.state.isShowTheatre}
			/>
		)
	}

	handleLoadItem(container, item){
		if (container && item) {
			const type = item.type,
			obj = {
				caption: item.caption,
				comment: item.comment,
				elementId: item.id,
				likeTimes: item.likeTimes,
				usersLiked: item.usersLikedElement,
				userIds: item.userLikedIds,
				shareLink: document.location.origin + "/stage/" + item.owner.userslug + '/' + item.id
			};

			if (type === Const.SHAPE_TYPE.IMAGE) {
				container.push(
					<li>
						<article className="canvasitem">
							<header>
								<a href={"/stage/"+item.createdUser.username}>{item.createdUser.username}</a>
							</header>
							<a href={"/stage/"+item.owner.userslug+"/"+item.id}>
								<div className="content">
										<img src={item.content} alt={item.content}/>
								</div>
							</a>
						</article>
						<div className="row row-align">
							{this.renderInteractive(obj)}
						</div>
					</li>
				);
			} else if (type === Const.SHAPE_TYPE.VIDEO) {
				container.push(
					<li>
						<article className="canvasitem">
							<header>
								<a href={"/stage/"+item.createdUser.username}>{item.createdUser.username}</a>
							</header>
							<a>
								<div className="content" style={{position: 'relative'}}>
									<TRVideo
										videoUrl={item.content_video}
										el_id={item.id}
										href={"/stage/"+item.owner.userslug+"/"+item.id}
									/>
								</div>
							</a>
						</article>
						<div className="row row-align">
							{this.renderInteractive(obj)}
						</div>
					</li>
				)
			} else if (type === Const.SHAPE_TYPE.TEXT) {
				const textLength = item.content.length;
				const fontSize = Utils.calculateTextSizeByTextLength(textLength);
				container.push(
					<li>
						<article className="canvasitem">
							<header>
								<a href={"/stage/"+item.createdUser.username}>{item.createdUser.username}</a>
							</header>
							<a href={"/stage/"+item.owner.userslug+"/"+item.id}>
								<div className="content">
									<h2 style={{'font-size': `${fontSize}px`}}>{item.content}</h2>
								</div>
							</a>
						</article>
						<div className="row row-align">
							{this.renderInteractive(obj)}
						</div>
					</li>
				);
			} else {
				const parentWidth = Jquery('.canvaslist').width(),
					maxHeight = parentWidth * 2 / 3,
					rect = Utils.getRect(item);
				if (rect) {
					let	scale = rect.width / rect.height,
						itemWidth = parentWidth,
						itemHeight = itemWidth / scale;
						itemHeight = Math.min(itemHeight, maxHeight, rect.height);

					scale = itemHeight / rect.height;
					if (scale > 1) {
						scale = 1;
					}
					const stagePositionX = - rect.x * scale + Math.abs((rect.width * scale - itemWidth) / 2),
		        		stagePositionY = - rect.y * scale;
					let shape;
					if (type === Const.SHAPE_TYPE.PEN || type === Const.SHAPE_TYPE.PENCIL) {
						shape = <TRLine
							dbkey={item._key}
							width={item.stage.width}
							height={item.stage.height}
							points = {item.stage.points}
							stroke= {item.stage.color}
							strokeWidth={item.stage.strokeWidth}
							draggable="false"
						/>
					} else if (type === Const.SHAPE_TYPE.BRUSH) {
						shape = <TRLineBrush
							dbkey={item._key}
							uid={item.ownerid}
							date_created={item.date_created}
							points = {item.stage.points}
							stroke={item.stage.color}
						/>
					} else {
						shape = <TRLineGroup
							dbkey={item._key}
							uid={item.uid}
							data={item.stage}
							rect={rect}
						/>
					}

					container.push(
						<li>
							<article className="cavnasitem">
								<header>
									<a href={"/stage/"+item.createdUser.username}>{item.createdUser.username}</a>
								</header>
								<a href={"/stage/"+item.owner.userslug+"/"+item.id}>
									<div className="content-drawing" id={item.id}>
										<Stage
											x={stagePositionX} 
											y={stagePositionY} 
											container={item.id}
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
								</a>
							</article>
							<div className="row row-align">
								{this.renderInteractive(obj)}
							</div>
						</li>
					);
				}
			}			
		}
	}

	render() {
		//children: all element of homepage
		const children = this.state.list;
		if (this.state.user) {
			return (
				<div>
						{/*Loading message*/ }
						<p className="loading" style={{display: this.state.loading, position: 'fixed', bottom:'0px'}}>LOADING ... </p>
						<ParentComponent
							addChild={this.onAddChild.bind(this)}
							user={this.state.user}
							handleLogout={this.handleLogout}
							>
							{children}
						</ParentComponent>
				</div>
			)
		}
		else {
			return(<div></div>)
		}
	}

	//Increase number of newsfeed
	onAddChild (){
		this.setState({
			numChildren: this.state.numChildren + 1
		})
	}
}
	
class ParentComponent extends Component{

	render(){
		return(
			/*NAV area */
			<div className="home_wrapper col-lg-6">
				<nav className="navbar navbar-inverse no-border-radius active-hover navbar-fixed-top">
					<div className="container-fluid">
							<div className="navbar-header controll-style">
								<button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
									<span className="icon-bar"></span>
									<span className="icon-bar"></span>
									<span className="icon-bar"></span> 
								</button>
								<a className="navbar-brand homelink" href="/home"><span className="glyphicon glyphicon-home"></span> NEWSFEED</a>
								<TRSearch/>							
							</div>
							<div className="collapse navbar-collapse" id="myNavbar">
								<ul className="nav navbar-nav navbar-right">
									<li>
										<a href="#" onClick={this.props.handleLogout}>
											<span className="glyphicon glyphicon-log-out"></span> LOGOUT
										</a>
									</li>
									<li>
										<a href={"/stage/"+this.props.user.userslug} id="add_image">
											<span className="glyphicon glyphicon-user"></span> MY CANVAS
										</a>
									</li>
								</ul>
							</div>
					</div>
				</nav>
				<ul className="canvaslist">
				{/*render list element*/ }
					{this.props.children}
				</ul>
			</div>
			)
	}
}

export default Home;
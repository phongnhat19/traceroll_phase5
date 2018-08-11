import React, { Component } from 'react';
import {Rect, Group, Text, Circle} from 'tr-react-konva';
import Const from '../../Util/const.js';
import Utils from '../../Util/utils.js';
import TrService from '../../Util/service.js';
import './style.css';

class TRText extends Component{
    constructor(props){
        super(props);
        this.state = {
            width: 0,
            height: 0,
            x: this.props.x,
            y: this.props.y,
            fontSize: this.props.fontSize,
            anchor: {
				stroke: '#666',
				fill: '#ddd',
				radius: 6,
				strokeWidth: 2
            },
            visibleTransform: false
        }
    }

    componentDidMount(){
        const text = this.text;
        if (text) {
            this.setState({
                width: text.width(),
                height: text.height()
            });
        }
    }

    updateOnDb = () => {
        const text = this.text;
        const requestBody = {
            uid: this.props.uid,
            key: this.props.dbkey,
            content: this.props.content,
            stage: {
                x: text.x() + text.getParent().x(),
                y: text.y() + text.getParent().y(),
                fontSize: text.fontSize()
            }
        }
        TrService.updateText(requestBody);
    }

    dragBoundFunc = (pos) => {
        const group = this.group,
            stage = group.getStage();
        return Utils.dragBoundProfileImage.call(this, stage, group, pos, Utils.intersectProfileImage);
    }

    //handle double click open theatre mode
    handleOnDoubleClick = () => {
        let el_key = this.props.dbkey;
        this.props.handleDblClick && this.props.handleDblClick(el_key);
    }

    handleRemoving = () => {
        let key = this.props.dbkey,
            uid = this.props.uid;
        TrService.deleteElementOnDb(uid, key);
    }

    handleEnterGroup = (e) => {
        Utils.showBorder(e, true);
    }

    handleLeaveGroup = (e) => {
        Utils.showBorder(e, false);
    }

    //Update and re-draw the image
	update = (endPos, originalPos) => {
		const topLeft = this.TL,
			topRight = this.TR,
			bottomRight = this.BR,
			bottomLeft =this.BL;
			// captionText = this.Caption;

		const minX = Math.min(endPos.x, originalPos.x),
			minY = Math.min(endPos.y, originalPos.y),
			maxX = Math.max(endPos.x, originalPos.x),
			maxY = Math.max(endPos.y, originalPos.y),
			topLeftPos = {
				x: minX,
				y: minY
			},
			topRightPos = {
				x: maxX,
				y: minY
			},
			botLeftPos = {
				x: minX,
				y: maxY
			},
			botRightPos = {
				x: maxX,
				y: maxY
			};

		switch (this.anchor) {
			case 'topLeft':
				topRight.position(topRightPos);
				bottomLeft.position(botLeftPos);
				break;

			case 'topRight':
				topLeft.position(topLeftPos);
				bottomRight.position(botRightPos);
				break;

			case 'bottomRight':
				bottomLeft.position(botLeftPos);
				topRight.position(topRightPos);
				break;

			case 'bottomLeft':
				bottomRight.position(botRightPos);
				topLeft.position(topLeftPos);
				break;

			default:
		}

		const newWidth = endPos.x - originalPos.x,
			newHeight = endPos.y - originalPos.y,
			text = this.text;

		let ratio = newHeight / text.height()

        text.position(topLeftPos);
        text.width(Math.abs(newWidth));
        text.height(Math.abs(newHeight));
        text.fontSize(Math.round(Math.abs(text.fontSize()*ratio))); 
        
    }

    updateCircleScale = () => {
    	const frame = this.frame;
    	if (frame) {
	        const stage = frame.getStage();
	        if (stage) {
		        const scale = {
		            x: 1 / stage.scaleX(),
		            y: 1 / stage.scaleX()
		        };
		        this.TL.scale(scale);
		        this.TR.scale(scale);
		        this.BL.scale(scale);
		        this.BR.scale(scale);
	        }
    	}
    }

    handleShowTransform = () => {
    	this.updateCircleScale();
        this.setState((prevState, props) => ({
            visibleTransform: true
        }))
    }

    handleHideTransform = () => {
        this.setState((prevState, props) => ({
            visibleTransform: false
        }))
    }

    handleStageWheel = () => {
    	this.updateCircleScale();
    }

    handleMouseDown = (e) => {
		this.frame.listening(false);

		const node = e.target;
		switch (node.getName()) {
			case 'topLeft':
				this.originalPos = this.BR.position();
				break;
			case 'topRight':
				this.originalPos = this.BL.position();
				break;
			case 'bottomRight':
				this.originalPos = this.TL.position();
				break;
			case 'bottomLeft':
				this.originalPos = this.TR.position();
				break;
			default:
		}
		this.anchor = node.getName();
		this.originalSize = this.text.size();
	}

	handleDragMove = (e) => {
		const node = e.currentTarget;
		let pointerPos = node.position(),
			originalPos = this.originalPos;
			
		const newPos = this.getNewPos(originalPos, pointerPos, this.originalSize);
		this.update(newPos, originalPos);
		this.group.draw();
	}
	
	getNewPos(original, pointer, originalSize) {
		let scaleX = (pointer.x - original.x) / originalSize.width,
			scaleY = (pointer.y - original.y) / originalSize.height,
			scale = Math.max(Math.abs(scaleX), Math.abs(scaleY))
		if (Math.abs(scaleX)===1) {
			scale = Math.abs(scaleY)
		}
		else if (Math.abs(scaleY)===1) {
			scale = Math.abs(scaleX)
		}
		let fX = scaleX > 0 ? 1 : -1,
			fY = scaleY > 0 ? 1 : -1,
			newSize = {
				width: originalSize.width * scale,
				height: originalSize.height * scale
			};
		return {	
			x: original.x + newSize.width * fX,
			y: original.y + newSize.height * fY
		}
	}
    
    //change course and stroke when move mouse in/out img
	handleMouseOver(e) {
		let layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        this.setStrokeWidth(4);
        layer.draw();
	}

	handleMouseOut(e) {
		let layer = this.getLayer();
        document.body.style.cursor = 'default';
        this.setStrokeWidth(2);
        layer.draw();
	}

    render(){
        return (
            <Group
                ref={node => this.group = node}
                name={Const.KONVA.TIME_LINE_NODE}
                date_created = {this.props.date_created}
                onDblclick = {this.handleOnDoubleClick}
                dragBoundFunc={this.dragBoundFunc}
                onDragEnd = {this.updateOnDb}
                draggable = {true}
                >

                <Text ref = {node => this.text = node}
                    x = {this.state.x}
                    y = {this.state.y}
                    fontSize = {this.state.fontSize}
                    fontFamily = {this.props.fontFamily}
                    text = {this.props.content}
                    fill = {this.props.color}
                    padding = {8}
                    date_created = {this.props.date_created}
                />
                <Rect
                    ref={node => this.frame = node}
                    name={Const.SHAPE_TYPE.IMAGE}
                    x={this.state.x}
                    y={this.state.y}
                    stroke='rgb(102, 102, 255)'
                    strokeEnabled={false}
                    width={this.state.width}
                    height={this.state.height}
                    onShowTransform={this.handleShowTransform} ///// Click chuot vo thi se chay ham nay...Ben Image thi la vay :))
                    onHideTransform={this.handleHideTransform}
                    onRemove={this.handleRemoving}
                    onMouseOver={this.handleEnterGroup}
                    onMouseOut={this.handleLeaveGroup}
                    onStageWheel={this.handleStageWheel}
                />

                {/* Top Left Anchor  */}
				<Circle
					ref={node => (this.TL = node)}
					x={this.state.x} 
					y={this.state.y} 
					draggable={true}
					stroke={this.state.anchor.stroke}
					fill={this.state.anchor.fill}
					strokeWidth={this.state.anchor.strokeWidth}
					radius={this.state.anchor.radius}
					name="topLeft"
                    visible={this.state.visibleTransform}
					onDragMove={this.handleDragMove}
					onMouseDown={this.handleMouseDown}
					onMouseOver={this.handleMouseOver}
					onMouseOut={this.handleMouseOut}
				/>

				{/* Top Right Anchor  */}
				<Circle
					ref={node => (this.TR = node)}
					x={this.state.x + this.state.width} 
					y={this.state.y}
					draggable={true}
					stroke={this.state.anchor.stroke}
					fill={this.state.anchor.fill}
					strokeWidth={this.state.anchor.strokeWidth}
					radius={this.state.anchor.radius}
					name="topRight"
                    visible={this.state.visibleTransform}
					onDragMove={this.handleDragMove}
					onMouseDown={this.handleMouseDown}
					onMouseOver={this.handleMouseOver}
					onMouseOut={this.handleMouseOut}
				/>

				{/* Bottom Right Anchor  */}
				<Circle
					ref={node => (this.BR = node)}
					x={this.state.x + this.state.width}
					y={this.state.y + this.state.height}
					draggable={true}
					stroke={this.state.anchor.stroke}
					fill={this.state.anchor.fill}
					strokeWidth={this.state.anchor.strokeWidth}
					radius={this.state.anchor.radius}
					name="bottomRight"
                    visible={this.state.visibleTransform}
					onDragMove={this.handleDragMove}
					onMouseDown={this.handleMouseDown}
					onMouseOver={this.handleMouseOver}
					onMouseOut={this.handleMouseOut}
				/>

				{/* Bottom Left Anchor  */}
				<Circle
					ref={node => (this.BL = node)}
					x={this.state.x}
					y={this.state.y + this.state.height}
					draggable={true}
					stroke={this.state.anchor.stroke}
					fill={this.state.anchor.fill}
					strokeWidth={this.state.anchor.strokeWidth}
					radius={this.state.anchor.radius}
					name="bottomLeft"
                    visible={this.state.visibleTransform}
					onDragMove={this.handleDragMove}
					onMouseDown={this.handleMouseDown}
					onMouseOver={this.handleMouseOver}
					onMouseOut={this.handleMouseOut}
				/>
            </Group>
        );
    }
}

TRText.defaultProps = {
    dbkey: '',
    uid: '',
    content: '    ',
    x: 0,
    y: 0,
    fontSize: 24,
    fontFamily: 'Calibri',
    color: '#000000',
    date_created: Date.now()
}

export default TRText;
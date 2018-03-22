import React, { PropTypes, Component } from 'react';
import {Layer, Rect, Stage, Group, Circle, Image} from 'react-konva-traceroll';

import './style.css';
//=========================================
// ANCHOR: COMPONENT TO RESIZE IMG
//=========================================
class TR_Anchor extends Component{
	constructor(props){
		super(props);
		this.state = {
			//Position of anchor
			x: parseInt(props.x) || 0,
			y: parseInt(props.y) || 0,
			//Stroke, fill color, radius, name, type
			stroke: props.stroke || '#666',
			fill: props.fill || '#ddd',
			radius: props.radius || 3,
			name: props.name,
			type: props.type,
			draggable: true,
			dragOnTop: false,
			groupRef: props.group
			
		}
		//bind event 
		this.handleDragMove = this.handleDragMove.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleDragEnd = this.handleDragEnd.bind(this);
		this.handleMouseOver = this.handleMouseOver.bind(this);
		this.handleMouseOut = this.handleMouseOut.bind(this);
	}
	
	//==========================
	//Save to layer and group after mounting component
	//==========================
	componentDidMount(){
		//get the layer and group of anchor
		this.layer = this.refs.anchor.getLayer();
		this.group = this.refs.anchor.getParent();
	}

	layer = null;
	group = null;

	//==========================
	//Update anchor and redraw layer on dragging anchor
	//==========================
	handleDragMove = () => {
		this.update(this.refs.anchor, this.state.type);
		this.layer.draw();
	}

	//==========================
	//Set layer to undraggable and move anchor to top (to select anchor)
	//==========================
	handleMouseDown = () => {
		this.layer.setDraggable(false);
		this.refs.anchor.moveToTop();
	}

	//==========================
	//Redraw frame on drag end
	//==========================
	handleDragEnd = () => {
		this.group.setDraggable(true);
		this.layer.draw();
	}

	//==========================
	//Focus anchor on mouse over
	//==========================
	handleMouseOver = () => {
		document.body.style.cursor = 'pointer';
		this.refs.anchor.setStrokeWidth(4);
		this.layer.draw();

	}

	//==========================
	//Unfocus anchor on mouse out
	//==========================
	handleMouseOut = () => {
		document.body.style.cursor = 'default';
		this.refs.anchor.setStrokeWidth(2);
		this.layer.draw();

	}
	
	//==========================
	//Update picture position, width, height of corresponding image
	//Param
	//	activeAnchor: current selected anchor
	//	type: node type (image)
	//==========================
	update = (activeAnchor, type) => {
		//Get group - container of image and 4 anchor
		var group = activeAnchor.getParent();

		//Get 4 anchor of group
		var topLeft = group.get('.topLeft')[0];
		var topRight = group.get('.topRight')[0];
		var bottomRight = group.get('.bottomRight')[0];
		var bottomLeft = group.get('.bottomLeft')[0];

		//Get image of group
		var node = group.get(type)[0];

		//Get coordinate of current anchor
		var anchorX = activeAnchor.getX();
		var anchorY = activeAnchor.getY();

		// update anchor positions
		switch (activeAnchor.getName()) {
			case 'topLeft':
				topRight.setY(anchorY);
				bottomLeft.setX(anchorX);
				break;
			case 'topRight':
				topLeft.setY(anchorY);
				bottomRight.setX(anchorX);
				break;
			case 'bottomRight':
				bottomLeft.setY(anchorY);
				topRight.setX(anchorX);
				break;
			case 'bottomLeft':
				bottomRight.setY(anchorY);
				topLeft.setX(anchorX);
				break;
		}

		//Update position, width and height of image
		node.position(topLeft.position());
		var width = topRight.getX() - topLeft.getX();
		var height = bottomLeft.getY() - topLeft.getY();
		if(width && height) {
			node.width(width);
			node.height(height);
		}

	}

	//==========================
	//Render anchor
	//==========================
	render(){
		return (
			<Circle ref="anchor" 
					x={this.state.x} 
					y={this.state.y} 
					stroke={this.state.stroke}
					fill={this.state.fill}
					strokeWidth="2"
					radius="3"
					name={this.state.name}
					draggable={this.state.draggable}
					dragOnTop={this.state.dragOnTop}
					onDragMove={this.handleDragMove}
					onMouseDown={this.handleMouseDown}
					onTouchstart={this.handleMouseDown}
					onMouseOver={this.handleMouseOver}
					onMouseOut={this.handleMouseOut}>
			</Circle>
			
		);
	}

}

export default TR_Anchor;
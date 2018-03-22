import React, {Component} from 'react';
import { Shape } from 'react-konva-traceroll';
import Utils from '../../Util/utils.js';
import Const from '../../Util/const.js';
import TrService from '../../Util/service.js';

const BASE_POINT = Const.BASE_POINT;

class LineBrush extends Component{
	constructor(props){
		super(props);
		this.state={
			hitPoints: [],
			imagePoints: []
		}

        this.handleRemoving = this.handleRemoving.bind(this);
        this.sceneFunc = this.sceneFunc.bind(this);
        this.hitFunc = this.hitFunc.bind(this);
        this.calculateData = this.calculateData.bind(this);
	}

	handleRemoving = () => {
        if (this.props.getOptions().mode === 'eraser'){
            return;
        }
        const key = this.props.dbkey,
            uid = this.props.uid;
        TrService.deleteElementOnDb(uid, key);
    }

	sceneFunc(context){
		this.drawScene(context, this.state.imagePoints);
	}

	drawScene(context, imagePoints){
        const stroke = this.props.stroke;
		context.globalAlpha = 0.1;
		let point, gradient;
		for (let i = 0, n = imagePoints.length; i < n; i++) {
			point = imagePoints[i];

        	gradient = context.createLinearGradient(0, 0, BASE_POINT.width, 0);
			gradient.addColorStop(0, stroke);
			gradient.addColorStop(1, stroke);
			context.fillStyle = gradient;
			context.fillRect(point.x, point.y, BASE_POINT.width, BASE_POINT.height);
		}
	}

	hitFunc(context){
		let node = this.shape;
        if (node) {
    		this.drawHit(context, this.state.hitPoints);
            context.fillStrokeShape(node);
        }
	}

	drawHit(context, points){
        if (points && points.length > 0) {
            context.beginPath();
            let point = points[0];
            if (point) {
                context.moveTo(point.x, point.y);
                for (let i = 1, n = points.length; i < n; i++) {
                    point = points[i];
                    context.lineTo(point.x, point.y);
                }
                context.closePath();
            }
        }
	}

	componentWillMount(){
        const points = this.props.points;
        if (points) {
            this.calculateData(points);
        }
	}

	calculateData(points){
	    let i, n,
            start,
	    	end,
	    	dist,
	    	angle,
	    	x, y,
	    	hit = [],
	    	imagePoints = [];

	    for (i = 0, n = points.length; i < n; i += 4) {
	        start={
	            x:points[i],
	            y:points[i+1]
	        };
	        end={
	            x:points[i+2],
	            y:points[i+3]
	        };

	        if (i == 0) {
                hit.push({
                    x: start.x,
                    y: start.y
                });
            }else{
                hit.push({
                    x: end.x,
                    y: end.y
                });
            }
	        
	        dist = Utils.distanceBetween(start, end);
	        angle = Utils.angleBetween(start, end);
	        for (let j = 0; j < dist; j++) {
	            x = start.x + Math.sin(angle) * j;
	            y = start.y + Math.cos(angle) * j;
	            imagePoints.push({
	            	x: x,
	            	y: y
	            });
	        }
	    }

        // Line has two points
        if (n == 4) {
            hit.push({
                x: end.x,
                y: end.y
            });
        }

	    let hitPoints = hit.concat(hit.map(item => ({
            x: item.x + BASE_POINT.width,
            y: item.y + BASE_POINT.height
        })).reverse());

        this.setState({
        	hitPoints: hitPoints,
        	imagePoints: imagePoints
        });
	}

    componentDidMount() {
        //for improve performance
        let node = this.shape;
        if (node) {
            node.transformsEnabled('position');
            node.setPosition({
                x: this.props.x,
                y: this.props.y
            })
        }
    }

	render(){
		return(
			<Shape
                ref={node => (this.shape = node)}
                name={Const.SHAPE_TYPE.BRUSH}
                fill='black'
                draggable={this.props.draggable}
                points={this.props.points}
                stroke={this.props.stroke}
                rect={this.props.rect}
                onRemove={this.handleRemoving}
                sceneFunc={this.sceneFunc}
                hitFunc={this.hitFunc}
        		perfectDrawEnabled={false}
                date_created = {this.props.date_created}
            />
		);
	}
}

LineBrush.defaultProps = {
    x: 0,
    y: 0
}

export default LineBrush;
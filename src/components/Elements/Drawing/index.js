import React from 'react';
import { Image } from 'react-konva-traceroll';
import Const from '../../Util/const.js';
import Utils from '../../Util/utils.js';

class TRDrawing extends React.Component {
	
	constructor(props){
		super(props);
		this.line = {
			points: []
		}
	}
    
	componentDidMount(){
		const stage = this.image.getStage(),
			canvas = document.createElement("canvas"),
			context = canvas.getContext("2d"),
			scaleMin = Const.ZOOM.min;

		canvas.width = stage.width() / scaleMin;
		canvas.height = stage.height() / scaleMin;
		context.lineJoin = "round";
		context.lineCap = "round";

		this.image.image(canvas);

		this.canvas = canvas;
		this.ctx = context;
		this.stage = stage;

		stage.on('mouseover', this.handleMouseOver);
		stage.on('mousemove', this.handleMouseMove);
		stage.on('mousedown', this.handleStageMouseDown);
		window.addEventListener('mouseup', this.handleWindowMouseUp);
	}

	handleStageMouseDown = (e) => {
		const button = e.evt.button;
		if (Utils.isLeftClick(button)) {
			
			//If is drawing mode and using eraser tool
			this.isErasing = this.props.options.mode === Const.MODE.ERASER;
		}
	}

	//Handle mouse down event on canvas
	handleMouseDown = (e) => {
		const button = e.evt.button;
		if (Utils.isLeftClick(button)) {
			this.isDrawing = true;

			const options = this.props.options;
			this.line.mode = options.mode;
			this.line.color = options.color;

			const stage = this.stage;
			this.lastPointerPosition = stage.getPointerPosition();
			
			//clear select line
			this.props.addNewLine && this.props.addNewLine({
				mode: Const.MODE.SELECT,
				stage: {
					points: [],
					color: 'black'
				}
			});
		}
	}

	handleMouseMove = (e) => {
		const node = e.target;

		const context = this.ctx,
			isDrawing = this.isDrawing,
			isErasing = this.isErasing;

		if (isDrawing && !isErasing) {
			if (node && node.name() === Const.KONVA.PROFILE_IMAGE) {
				node.fire(Const.EVENTS.SHOW_ALERT_PROFILE_IMAGE);
				return;
			}
            
			const stage = this.stage,
				mode = this.props.options.mode,
				color = this.props.options.color,
				scale = stage.scaleX();

			context.strokeStyle = color;

			const stagePos = stage.position(),
				pointerPos = stage.getPointerPosition(),
				startOnCanvas = {
					x: (this.lastPointerPosition.x - stagePos.x) / scale - this.image.x(),
					y: (this.lastPointerPosition.y - stagePos.y) / scale - this.image.y()
				},
				endOnCanvas = {
					x: (pointerPos.x - stagePos.x) / scale - this.image.x(),
					y: (pointerPos.y - stagePos.y) / scale - this.image.y()
				};

			switch(mode){
				case Const.MODE.PEN:
					context.lineWidth = 4;
					this.updateCanvasByLine(startOnCanvas, endOnCanvas);
					break;
				case Const.MODE.PENCIL:
					context.lineWidth = 2;
					this.updateCanvasByLine(startOnCanvas, endOnCanvas);
					break;
				case Const.MODE.BRUSH:
					this.updateCanvasByBrush(startOnCanvas, endOnCanvas, scale);
					break;
				case Const.MODE.SELECT:
					context.strokeStyle = 'black'
					context.lineWidth = 1;
					this.updateCanvasByLine(startOnCanvas, endOnCanvas);
					break;
				default:
			};

			const start = {
					x: (this.lastPointerPosition.x - 2 * stagePos.x) / scale - this.image.x(),
					y: (this.lastPointerPosition.y - 2 * stagePos.y) / scale - this.image.y()
				},
				end = {
					x: (pointerPos.x - 2 * stagePos.x) / scale - this.image.x(),
					y: (pointerPos.y - 2 * stagePos.y) / scale - this.image.y()
				};

			this.line.points.push(start.x, start.y, end.x, end.y);
			this.line.strokeWidth = context.lineWidth;

			this.lastPointerPosition = pointerPos;
		}
	};

	// Drawing Thin & Thick line
	updateCanvasByLine(start, end) {
		const ctx = this.ctx;
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
		ctx.closePath();
		this.image.getLayer().draw();
	}

	updateCanvasByBrush(start, end, scale) {
		const ctx = this.ctx;
		ctx.globalAlpha = 0.1;

		const dist = Utils.distanceBetween(start, end),
			angle = Utils.angleBetween(start, end),
			w = 10,
        	h = 20;
        let x, y, gradient;

		for (let j = 0; j < dist; j += 1) {
			x = start.x + Math.sin(angle) * j;
			y = start.y + Math.cos(angle) * j;

			gradient = ctx.createLinearGradient(0, 0, w, 0);
			gradient.addColorStop(0, this.line.color);
			gradient.addColorStop(1, this.line.color);
			ctx.fillStyle = gradient;
			ctx.fillRect(x, y, w, h);
		}
		this.image.getLayer().draw();
	}

	handleWindowMouseUp = (e) => {
		//only add new line if real drawing instead of just click
        if (this.isDrawing && this.line.points.length > 0) {
			this.addNewLine();
		}
		this.isDrawing = this.isErasing = false;
	}

	addNewLine = () => {
		const line = this.line,
			rect = Utils.getSelfRect(this.line.points),
			padding = 16;

		rect.x -= padding;
		rect.y -= padding;

		if (this.props.options.mode === Const.MODE.BRUSH) {
			rect.width += Const.BASE_POINT.width + padding *  2;
			rect.height += Const.BASE_POINT.height + padding *  2;
		} else {
			rect.width += line.strokeWidth + padding *  2;
			rect.height += line.strokeWidth + padding *  2;
		}
		line.rect = rect;

		this.line = {
			points: []
		}

		this.props.addNewLine && this.props.addNewLine(
		{
			mode: this.props.options.mode,
			stage: line
		});
		this.clearLayerDrawing();
	}

	// Clear canvas area
	clearLayerDrawing = () => {
		const context = this.ctx,
			canvas = this.canvas;
		context.clearRect(0, 0, canvas.width, canvas.height);
		this.image.getLayer().draw();
	}

	//Handle mouse over event on stage
	handleMouseOver = (e) => {
		const node = e.target;
		if (node && this.isErasing){
			this.handleErasing(node);
		}
	}

	//Handle erasing event on eraser tool
	handleErasing = (node) =>{
		if (Utils.isLine(node)) {
			const layer = node.getLayer();
			const parent = node.getParent();
			if (parent.hasName(Const.KONVA.NEW_LINES_CONTAINER_NAME)) {
				node.fire(Const.EVENTS.REMOVE);
				node.destroy();
				layer.draw();
			}
		}
	}

	componentWillUnmount(){
        const stage = this.image.getStage();
        
		stage.off('mouseover', this.handleMouseOver);
		stage.off('mousemove', this.handleMouseMove);
		stage.off('mousedown', this.handleStageMouseDown);
		window.removeEventListener('mouseup', this.handleWindowMouseUp);
	}

	render() {
		const canvasPos = this.props.getCanvasPos();
		return (
			<Image
				x={canvasPos.canvasPosX}
				y={canvasPos.canvasPosY}
				ref={node => (this.image = node)}
				onMouseDown={this.handleMouseDown}
			/>
		);
	}
}

export default TRDrawing;
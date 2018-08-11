import React from 'react';
import { Image } from 'tr-react-konva';
import Const from '../../Util/const.js';
import Utils from '../../Util/utils.js';

class TRDrawing extends React.Component {
	
	constructor(props){
		super(props);

        this.state = {
            x: 0,
            y: 0,
            canvas: null
        }

		this.line = {
			points: [],
		}
    }
    
    handleBeforeUnload = (e)=>{
		let currentCountDrawed = localStorage.getItem('tracerollCountDrawed') || 0
		currentCountDrawed = parseInt(currentCountDrawed,10)
		if (currentCountDrawed>0) {
			e.returnValue = "You have unsaved drawing. Are you sure you want to leave ?"
		}
	}
    
    componentDidMount() {

        const stage = this.image.getStage(),
            canvas = document.createElement("canvas"),
            context = canvas.getContext("2d")

        context.lineJoin = "round"
        context.lineCap = "round"

        this.canvas = canvas
        this.ctx = context
        this.stage = stage

        this.updateCanvas(canvas)

        this.setState({
            canvas: canvas
        })

		stage.on('mouseover', this.handleMouseOver)
        stage.on('mousemove', this.handleMouseMove)
        stage.on('mousedown', this.handleStageMouseDown)
        window.addEventListener('mouseup', this.handleWindowMouseUp)
        window.addEventListener('wheel', this.handleMouseWheel)
        window.addEventListener('beforeunload',this.handleBeforeUnload);
	}

    updateCanvas = (canvas) => {
        const stage = this.image.getStage(),
            scale = stage.scaleX(),
            width = stage.width() / scale,
            height = stage.height() / scale

        if (canvas) {
            canvas.width = width
            canvas.height = height
        }

        this.setState({
            x: (-stage.getX()) / scale,
            y: (-stage.getY()) / scale,
        })

        // This is a trick to solve lag problem when drag drop canvas
        this.clearLayerDrawing()
    }

    handleMouseWheel = () => {
        this.updateCanvas(this.state.canvas)
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
			
            this.setupMouseDown()
		}
	}

    setupMouseDown = () => {
        this.isDrawing = true

        const options = this.props.options
        this.line.mode = options.mode
        this.line.color = options.color

        const stage = this.stage,
            pos = stage.getPointerPosition(),
            start = {
                x: ~~ (0.5 + (pos.x - 2 * stage.x()) / stage.scaleX() - this.image.x()),
                y: ~~ (0.5 + (pos.y - 2 * stage.y()) / stage.scaleX() - this.image.y())
            }

        this.line.points.push(start.x, start.y)
        this.lastPointerPosition = pos

        //clear selectd line
        this.props.addNewLine && this.props.addNewLine({
            mode: Const.MODE.SELECT,
            stage: {
                points: [],
                color: 'black'
            }
        })
    }

	handleMouseMove = (e) => {
		const node = e.target;

		const context = this.ctx,
			isDrawing = this.isDrawing,
            isErasing = this.isErasing,
            stage = this.stage,
            mode = this.props.options.mode,
            color = this.props.options.color,
            scale = stage.scaleX();
        
        if (isDrawing) {

            const stagePos = stage.position(),
                pointerPos = stage.getPointerPosition(),
                startOnCanvas = {
                    x: ~~ (0.5 + (this.lastPointerPosition.x - stagePos.x) / scale - this.image.x()),
                    y: ~~ (0.5 + (this.lastPointerPosition.y - stagePos.y) / scale - this.image.y())
                },
                endOnCanvas = {
                    x: ~~ (0.5 + (pointerPos.x - stagePos.x) / scale - this.image.x()),
                    y: ~~ (0.5 + (pointerPos.y - stagePos.y) / scale - this.image.y())
                },
                end = {
                    x: ~~ (0.5 + (pointerPos.x - 2 * stagePos.x) / scale - this.image.x()),
                    y: ~~ (0.5 + (pointerPos.y - 2 * stagePos.y) / scale - this.image.y())
                }

            if (isErasing) {
                if (true) {
                    const line = this.getLineIntersect(end, this.props.lines, scale)
                    if (line) {
                        this.handleErasing(line)
                    }
                }
            } else {

                if (node && node.name() === Const.KONVA.PROFILE_IMAGE) {
                    node.fire(Const.EVENTS.SHOW_ALERT_PROFILE_IMAGE);
                    return;
                }

                context.strokeStyle = color;

                

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

                this.line.points.push(end.x, end.y);
                this.line.strokeWidth = context.lineWidth;

                this.lastPointerPosition = pointerPos;
            }
			
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
        ctx.fillStyle = this.line.color;

		const dist = Utils.distanceBetween(start, end),
			angle = Utils.angleBetween(start, end),
			w = 10,
        	h = 20,
            sin = Math.sin(angle),
            cos = Math.cos(angle)
        let x, y

		for (let j = 0; j < dist; j += 1) {
			x = start.x + sin * j;
			y = start.y + cos * j;

			ctx.fillRect(x, y, w, h);
		}
		this.image.getLayer().draw();
	}

	handleWindowMouseUp = (e) => {

		//only add new line if real drawing instead of just click
        this.setupMouseUp()

        const button = e.button

        if (button === 2) {
            let currentCountDrawed = localStorage.getItem('tracerollCountDrawed') || 0
			currentCountDrawed = parseInt(currentCountDrawed,10)
			localStorage.setItem('tracerollCountDrawed',currentCountDrawed+1)
            this.updateCanvas(this.state.canvas)
        }
	}

    setupMouseUp = () => {

        if (this.isDrawing && this.line.points.length > 2) {
            this.addNewLine();
        }
        this.isDrawing = this.isErasing = false;
        this.line = {
            points: []
        }
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

			if (parent && parent.hasName(Const.KONVA.NEW_LINES_CONTAINER_NAME)) {
                let currentCountDrawed = localStorage.getItem('tracerollCountDrawed') || 0
				currentCountDrawed = parseInt(currentCountDrawed,10) - 1
				localStorage.setItem('tracerollCountDrawed',currentCountDrawed)
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
        window.removeEventListener('wheel', this.handleMouseWheel);
        window.removeEventListener('beforeunload',this.handleBeforeUnload);
	}

    getLineIntersect = (pointer, lines, scale) => {

        const offset = 10 / scale
        let line, point1 = {}, point2 = {}, i, n, dist, isInRange

        if (pointer && lines) {
            for (i = 0, n = lines.length; i < n; i++) {
                const shape = lines[i],
                    attrs = shape.attrs,
                    points = attrs.points

                for (let j = 0, k = points.length; j < k - 2; j += 2) {

                    point1.x = points[j]
                    point1.y = points[j + 1]

                    point2.x = points[j + 2]
                    point2.y = points[j + 3]

                    dist = this.distanceToLine(pointer, point1, point2)
                    isInRange = this.isPointInRangeOfLine(pointer, point1, point2)
                    if (isInRange && dist < offset) {
                        line = shape
                        break
                    }
                }

                if (line) {
                    break
                }
            }
        }
        
        return line
    }

    distanceToLine = (point, v, w) => {
        const x0 = point.x,
            y0 = point.y,
            x1 = v.x,
            y1 = v.y,
            x2 = w.x,
            y2 = w.y,
            a = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1),
            b = Math.sqrt((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1))
        return a/b
    }

    isPointInRangeOfLine = (point, v, w) => {
        const x0 = point.x,
            y0 = point.y,
            x1 = v.x,
            y1 = v.y,
            x2 = w.x,
            y2 = w.y,
            dx = x2 - x1,
            dy = y2 - y1,
            innerProduct = (x0 - x1)*dx + (y0 - y1)*dy;
        return 0 <= innerProduct && innerProduct <= dx*dx + dy*dy;
    }

	render() {
		return (
			<Image
				x = {this.state.x}
                y = {this.state.y}
                image = {this.state.canvas}
				ref = {node => this.image = node}
				onMouseDown = {this.handleMouseDown}
			/>
		);
	}
}

export default TRDrawing;
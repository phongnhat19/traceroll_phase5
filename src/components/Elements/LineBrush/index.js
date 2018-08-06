import React, {Component} from 'react';
import { Shape, Group, Image } from 'tr-react-konva';
import Utils from '../../Util/utils.js';
import Const from '../../Util/const.js';
import TrService from '../../Util/service.js';

const BASE_POINT = Const.BASE_POINT;

class LineBrush extends Component{
    constructor(props){
        super(props);
        this.state={
            image: null
        }

        this.handleRemoving = this.handleRemoving.bind(this);
    }

    handleRemoving = () => {
        if (this.props.getOptions().mode === 'eraser') {
            return;
        }
        const key = this.props.dbkey,
            uid = this.props.uid;
        TrService.deleteElementOnDb(uid, key);
    }

    componentDidMount() {

        const self = this,
            rect = this.props.rect,
            clone = this.group.clone()

        clone.toImage({
            callback: function(img) {
                clone.destroy()
                self.group.destroy()

                self.setState({
                    image: img
                })
                self.image.position({
                    x: rect.x,
                    y: rect.y
                })
                // self.image.cache()
                // self.image.drawHitFromCache()

            },
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        })
    }

    render() {

        const rect = this.props.rect

        return (

            this.state.image ?
            <Image
                ref = {node => (this.image = node)}
                name = {Const.SHAPE_TYPE.BRUSH}
                image = {this.state.image}
                points = {this.props.points}
                onRemove = {this.handleRemoving}
                rect = { rect }
                date_created = {this.props.date_created}
            /> :
            <Group
                ref = {node => (this.group = node)}
                >
                <Shape
                    fill = 'black'
                    sceneFunc = { context => {

                        const stroke = this.props.stroke,
                            width = BASE_POINT.width,
                            height = BASE_POINT.height,
                            points = this.props.points

                        context.globalAlpha = 0.1
                        context.fillStyle = stroke

                        let start,
                            end,
                            dist,
                            angle,
                            sin,
                            cos,
                            x, y

                        if (points.length > 1) {

                            start = {
                                x: points[0],
                                y: points[1]
                            }

                            for (let i = 2, n = points.length; i < n; i += 2) {

                                end = {
                                    x: points[i],
                                    y: points[i+1]
                                }

                                dist = Utils.distanceBetween(start, end)
                                angle = Utils.angleBetween(start, end)
                                sin = Math.sin(angle)
                                cos = Math.cos(angle)
                                for (let j = 0; j < dist; j += 1) {
                                    x = start.x + sin * j
                                    y = start.y + cos * j
                                    context.fillRect(x, y, width, height)
                                }

                                start = end
                            }
                        }
                    }}
                    perfectDrawEnabled = { false }
                />
            </Group>
        )
    }
}

export default LineBrush;
import React, { Component } from 'react';
import {Group, Rect, Line} from 'react-konva-traceroll';
import MenuButton from './Button';
import MenuCircle from './Circle';

import './style.css';

class TRMenu extends Component {
    static cursorsArr = ['url(/img/tools/pen-tool.png),auto', 'url(/img/tools/brush-tool.png),auto', 'url(/img/tools/pencil-tool.png),auto', 'url(/img/tools/eraser-tool.png) 6 12,auto', 'url(/img/tools/choosen.png) 10 15,auto'];
    static drawModes = ['pen', 'brush', 'pencil', 'eraser', 'select']
    // static cursorsArr = ['pointer', 'move', 'crosshair', 'not-allowed']
    constructor(props){
        super(props)
        this.state = {
            //default width and height of Stage (cover the screen)
            color: props.options.color,
            mode: props.options.mode,
            width: props.width,
            height: props.height
        }
    }

    componentDidMount() {
        // log Konva.Circle instance
        //console.log(this.refs.circle);
        
    }

    /* Event change color */
    handleColorSelected = (color) => {
        this.setState({color: color});
        this.handlerMenuChange();
    }
    
    /* Event change mode */
    handleModeSelected = (mode) => {
        this.setState({mode: mode});
        this.handlerMenuChange();
        this.handlerChangePointer(mode);
    }

    /* Change cursor*/
    handlerChangePointer = (choosen) => {
        this.props.handlerChangePointer && this.props.handlerChangePointer(choosen);
    }

    /* Update parent options */
    handlerMenuChange = () => {
        this.props.handlerMenuChange && this.props.handlerMenuChange(this.state);
    }

     componentWillReceiveProps(nextProps){
        this.setState({
            color: nextProps.options.color,
            mode: nextProps.options.mode
        })
     }

    render() {
        let containerwidth = this.state.width;
        let containerheight = this.state.height;
        let pading = 40;
        let centerpos = containerwidth / 2;
        const buttons = [
                {mode: 'pen', img: '/img/tools/pen.png', x: centerpos          - pading*5, y: 20, active: true},
                {mode: 'brush', img: '/img/tools/brush.png', x: centerpos      - pading*4, y: 20},
                {mode: 'pencil', img: '/img/tools/pencil.png', x: centerpos    - pading*3, y: 20},
                {mode: 'eraser', img: '/img/tools/easer.png', x: centerpos     - pading*2 , y: 20},
                {mode: 'select', img: '/img/tools/selection.png', x: centerpos - pading*1 , y: 20},
            ],
            colors = [
                {color: 'black', x: centerpos  + 20, y: 60},
                {color: 'blue', x: centerpos   + 20 + pading*1, y: 60},
                {color: 'green', x: centerpos  + 20 + pading*2, y: 60},
                {color: 'yellow', x: centerpos + 20 + pading*3, y: 60},
                {color: 'red', x: centerpos    + 20 + pading*4 , y: 60},
            ];
        return (
            <Group ref="menuGroup" x="0" y='0'>
                <Rect x="0" y="0" width={containerwidth} height="10" />
                <Rect x="0" y="0" width={containerwidth} height="1" fill="#ccc"/>
                <Line fill="red" closed="true" stroke="green" strokeWidth="2" points={5, 70, 140, 23, 250, 60, 300, 20} />
                {buttons.map((value, index) => {
                    return <MenuButton key={index} active={value.active} hasActive={value.mode === this.state.mode} mode={value.mode} color={this.state.color} src={value.img} x={value.x} y={value.y} onClick={this.handleModeSelected}/>;
                })}
                {colors.map((value, index) => {
                    return <MenuCircle key={index} colorActive={value.color === this.state.color} color={value.color} x={value.x} y={value.y} onClick={this.handleColorSelected} />;
                })}
            </Group>
        );
    }
}

export default TRMenu;
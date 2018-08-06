import React, { Component } from 'react';
import {Rect, Group, Text} from 'tr-react-konva';
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
                fontSize: this.props.fontSize
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

    render(){
        return (
            <Group
                ref={node => this.group = node}
                name={Const.KONVA.TIME_LINE_NODE}
                date_created = {this.props.date_created}
                onDblclick = {this.handleOnDoubleClick}
                dragBoundFunc={this.dragBoundFunc}
                onDragEnd = {this.updateOnDb}
                draggable = {this.props.hasPermission}
                >

                <Text ref = {node => this.text = node}
                    x = {this.props.x}
                    y = {this.props.y}
                    fontSize = {this.props.fontSize}
                    fontFamily = {this.props.fontFamily}
                    text = {this.props.content}
                    fill = {this.props.color}
                    padding = {8}
                    date_created = {this.props.date_created}
                />
                <Rect
                    ref={node => this.frame = node}
                    name={Const.SHAPE_TYPE.TEXT}
                    createdBy={this.props.createdBy}
                    x={this.props.x}
                    y={this.props.y}
                    stroke='rgb(102, 102, 102)'
                    strokeEnabled={false}
                    width={this.state.width}
                    height={this.state.height}
                    onRemove={this.handleRemoving}
                    onMouseOver={this.handleEnterGroup}
                    onMouseOut={this.handleLeaveGroup}
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
    fontFamily: "'Gaegu', Helvetica",
    color: '#000000',
    date_created: Date.now()
}

export default TRText;

import React, { Component } from 'react';
import {Group, Rect, Shape, Label, Tag, Text} from 'react-konva-traceroll';
import Const from '../../Util/const.js';
import TrService from '../../Util/service.js';
import Utils from '../../Util/utils.js';

class TRProfileImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null
        }

        const size = Const.PROFILE_IMAGE_SIZE;
        this.profile = {
            x: props.centerPos.x - size / 2,
            y: props.centerPos.y - size / 2,
            width: size,
            height: size
        };
        this.fontSize = 22;
        this.rect = {
            x: this.profile.x,
            y: this.profile.y,
            width: this.profile.width,
            height: this.profile.height + this.fontSize
        }
    }

    componentWillMount() {
        let input = this.getInputFile();
        input.addEventListener('change', this.updateImageDisplay)
    }

    componentDidMount() {
        this.loadImage(this.props.src);
    }

    loadImage = (src, callback) => {
        if (!src) {
            return;
        }
        const image = new window.Image();
        image.onload = () => {
            this.setState({
                image: image
            })
            callback && callback();
        }
        image.onerror = (e) => {
            alert("Can't open this file.");
            callback && callback(e);
        }
        image.src = src;
        this.src = src;
        this.isUpdated = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.src !== this.src && !this.isUpdated) {
            this.loadImage(nextProps.src);
        }
    }

    sceneFunc = (ctx) => {
        const profile = this.profile,
            image = this.state.image;

        if (image) {
            const params = [
                image,
                0,
                0,
                image.width,
                image.height,
                profile.x,
                profile.y,
                profile.width,
                profile.height
            ];

            ctx.lineWidth = 7;
            ctx.save();
            ctx.beginPath();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
            ctx.strokeStyle = "#b7b7b7";
            ctx.clearRect(profile.x, profile.y, profile.width, profile.height);
            ctx.arc(profile.x + profile.width / 2, profile.y + profile.height / 2, (profile.width - ctx.lineWidth) / 2, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.arc(profile.x + profile.width / 2, profile.y + profile.height / 2, (profile.width - ctx.lineWidth) / 2, 0, 2 * Math.PI, false);
            ctx.clip();

            ctx.drawImage.apply(ctx, params);
            
            ctx.restore();
            this.drawText(ctx);
        }
    }
     
    drawText = (ctx) => {
        const text = this.props.username,
            profile = this.profile;

        ctx.textAlign = 'center';
        ctx.font = 'bold ' + this.fontSize + 'px/1 "Roboto", sans-serif';
        ctx.fillStyle = '#464646'
        ctx.fillText(text, profile.x + profile.width / 2, this.fontSize + profile.y + profile.height);
    }

    hitFunc = (ctx) => {
        const profile = this.profile;

        ctx.beginPath();
        ctx.arc(profile.x + profile.width / 2, profile.y + profile.height / 2, profile.width / 2, 0, 2 * Math.PI, false);
        ctx.closePath();

        if (this.image) {
            ctx.fillStrokeShape(this.image);
        }
    }

    getInputFile() {
        return document.querySelector('#profile_image');
    }

    handleClickProfileImage = (e) => {
        const button = e.evt.button
        if (this.props.uid !== 0 &&
            this.props.ownerid !== 0 &&
            this.props.uid === this.props.ownerid &&
            !this.props.showDrawTool && Utils.isLeftClick(button)) {
            let input = this.getInputFile();
            input.click();
        }
    }

    updateImageDisplay = (e) => {
        const input = e.target;
        if (input) {
            const files = input.files;
            if (files.length > 0) {
                const file = files[0];
                if (this.validFileType(file)) {
                    this.loadImage(window.URL.createObjectURL(file), function(err) {
                        if (!err) {
                            this.updateProfileImage(this.props.uid, file);
                            this.isUpdated = true;
                        }
                    }.bind(this));
                } else {
                    alert(file.name + ': Not an image file.')
                }
            }
        }
    }

    updateProfileImage = (uid, file) => {
        Utils.showProcessingBar();
        const callback = function(response) {
            const body = response.data;
            if (body && body.status !== "FAILED"){
                const filePath = body.file_path;
                TrService.updateProfileImagePath({
                    uid: uid,
                    filePath: filePath
                });
            }
        }
        TrService.uploadImage(file, callback.bind(this))
    }

    validFileType(file) {
        return file.type.includes('image/');
    }

    showAlert = () => {
        const node = this.frame;
        if (node) {
            const stage = node.getStage(),
                scale = stage.scaleX(),
                mousePos = stage.getPointerPosition(),
                tooltip = this.tooltip,
                layer = tooltip.getLayer();

            tooltip.position({
                x : (mousePos.x - stage.x()) / scale,
                y : (mousePos.y - 5 - stage.y()) / scale
            });
            tooltip.show();
            this.showFrame(node);
            layer.batchDraw();
            this.setAutoHideAlert(tooltip, layer, node)
        }
    }

    showFrame = (rect) => {
        if (rect) {
            rect.strokeEnabled(true);
        }
    }

    setAutoHideAlert = (tooltip, layer, node) => {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.timeout = setTimeout((() => {
            tooltip.hide();
            this.hideFrame(node);
            layer.batchDraw();
        }).bind(this), 100);
    }

    hideFrame = (rect) => {
        if (rect) {
            rect.strokeEnabled(false);
        }
    }

    componentWillUnmount() {
        let input = this.getInputFile();
        input.removeEventListener('change', this.updateImageDisplay)
    }

    render() {
        const rect = this.rect;

        return (
            <Group>
                <Shape
                    ref={node => this.image = node}
                    sceneFunc={this.sceneFunc}
                    hitFunc={this.hitFunc}
                    listening={false}
                />
                <Rect
                    ref={node => this.frame = node}
                    name={Const.KONVA.PROFILE_IMAGE}
                    x={rect.x}
                    y={rect.y}
                    stroke='rgb(225, 0, 0)'
                    strokeEnabled={false}
                    width={rect.width}
                    height={rect.height}
                    listening={true}
                    onShowAlert={this.showAlert}
                    onClick={this.handleClickProfileImage}
                />
                <Label
                    ref={node => this.tooltip = node}
                    opacity={0.75}
                    visible={false}
                    listening={false}
                    >
                    <Tag
                        fill={'black'}
                        pointerDirection={'down'}
                        pointerWidth={10}
                        pointerHeight={10}
                        lineJoin={'round'}
                        shadowColor={'black'}
                        shadowBlur={10}
                        shadowOffset={10}
                        shadowOpacity={0.2}
                    />
                    <Text
                        text={'This is not possible!'}
                        fontFamily={'Calibri'}
                        fontSize={18}
                        padding={5}
                        fill='white'
                    />
                </Label>
            </Group>
        );
    }
}

TRProfileImage.defaultProps = {
    src: '/img/tools/no-profile-picture-icon.jpeg',
    centerPos: {
        x: 100,
        y: 100
    },
    username: 'unknown',
    uid: 0,
    ownerid: 0,
    showDrawTool: false
}

export default TRProfileImage;
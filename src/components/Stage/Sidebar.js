import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import {
    TRMenu
} from './../Elements';
import {Stage, Layer} from 'tr-react-konva';
import $ from 'jquery';
import './style.css'

class Sidebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedDraw:0,
            text:"",
            width: window.innerWidth,
        }
    }

    render(){
        return(
            <div className="sidebar container">
                {/* <div className="sidebar-item row" >
                    <section id="Stage__drawing-menu">
                        <Stage
                            width={this.state.width}
                            height={80}>
                            <Layer>
                                <TRMenu
                                    width={this.state.width}
                                    height={80}
                                    handlerMenuChange={this.props.handlerMenuChange}
                                    handlerChangePointer={this.props.handlerChangePointer}
                                    options={this.props.options}
                                />
                            </Layer>
                        </Stage>
                    </section>
                </div> */}
                <div className="sidebar-item row">
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <strong>Add stuff</strong>
                    </div>
                </div>
                <div className="sidebar-item row">
                    <div className="sidebar-item-title col-md-12 col-xs-12 col-sm-12">
                        <strong>A</strong> Photo / Video
                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <Dropzone onDrop={this.props.handleDropElement}>
                            <p>
                                <u>Click to Upload</u> from computer or <u>Drag & Drop file</u>
                            </p>
                        </Dropzone>
                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <h3>or</h3>
                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <div className="form-group">
                            <input type="text" className="form-control" id="image_link" placeholder="Paste link of photo/video/GIF" /> 
                        </div>
                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <div className="form-group">
                            <input type="text" className="form-control" id="owner-caption" maxLength="100" placeholder="Caption (optional)" />
                        </div>
                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <button type="button" className="btn btn-primary" onClick={()=>this.props.handleAddLink($('#image_link').val(), $('#owner-caption').val())}  id="confirm_add_image">Post image</button>
                    </div>
                </div>
                <div className="sidebar-item row">
                    <div className="sidebar-item-title col-md-12 col-xs-12 col-sm-12">
                        <strong>A</strong> Write
                    </div>
                    <div className="col-md-12 col-xs-12 col-sm-12">
                        <div className="form-group" >
                            <input type="text" className="form-control" id="text" />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <button type="button" className="btn btn-primary" id="confirm_add_text" onClick={this.props.handleAddText}>Post text</button>
                    </div>
                </div>
                
            </div>
        )
    }
}

export default Sidebar
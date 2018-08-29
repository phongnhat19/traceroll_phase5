import React, { Component } from 'react';
import './style.css';

export default class Canvas extends Component{
  render(){
    return(
      <div id="canvas" className="canvas_wrapper wrapper">
          <img className="canvas-image" src="/img/login/canvas.png"  alt="Canvas exmample" />
          <img className="canvas-mobile" src="/img/mobile_images/Canvas_Mobile.png"  alt="Canvas exmample" />

          <div id="canvas_top" className="canvas_content_wrapper content_wrapper">
            <h2 class="headline">Share your stories & ideas</h2>
            <p>Share your stories with friends in a new way with photos, videos & drawings.</p>
          </div>
          <div id="canvas_bottom" className="canvas_content_wrapper content_wrapper">
            <h2 class="headline">Create your own profile <br/>with photos, videos & drawings</h2>
            <p>Share your photos & videos and create group spaces <br/>between your friends to share ideas & jokes. </p>
          </div>
      </div>
    )
  }
}

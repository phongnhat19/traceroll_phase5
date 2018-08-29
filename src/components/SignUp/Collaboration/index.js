import React, { Component } from 'react';
import ScrollAnimation from 'react-animate-on-scroll';
import './style.css';

export default class Platforms extends Component{
  render(){
    return(
      <div id="collaboration">
        <div className="platforms_wrapper1 wrapper">
            <img className="drawing-collaboration" src="/img/login/drawing_collaboration.png" width="670" height="670" alt="" />
            <div id="platform_top" className="platforms_content_wrapper1 content_wrapper">
                <h2 className="headline">Draw and collaborate <br />easily with friends</h2>
                <p>Draw something interesting on your canvas,<br /> or work with friends on new ideas.</p>
            </div>
	      <div id="platform_bottom" className="platforms_content_wrapper1 content_wrapper">
	         <h2 className="headline">Draw and collaborate <br />easily with friends</h2>
            <p>Draw something interesting on your canvas, or work with friends on new ideas..</p>
	      </div>
        </div>

      </div>
      )
    }
}

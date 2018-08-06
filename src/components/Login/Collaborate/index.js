import React, { Component } from 'react';

import './style.css';

export default class Collaborate extends Component{
  render(){
    return(
      <div id="collaborate" class="collaborate_wrapper wrapper">
        <img src="/img/login/Collaboration.png" alt="" />
        <p>&nbsp;</p>
        <div id="collaborate_top" class="collaborate_content_wrapper content_wrapper">
          <h2 class="headline">Traceroll allows you to <br/>collaborate with friends</h2>
          <p>Now you and your friends can create share  your <br />personal stories and ideas in a whole new way.</p>
        </div>
        <div id="collaborate_bottom" class="collaborate_content_wrapper content_wrapper">
          <h2 class="headline">Traceroll allows you to collaborate with friends</h2>
          <p>Now you and your friends can create share  your personal stories and ideas in a whole new way.</p>
        </div>
    	</div>
    )
  }
}

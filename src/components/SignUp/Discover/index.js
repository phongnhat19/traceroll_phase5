import React, { Component } from 'react';
import ScrollAnimation from 'react-animate-on-scroll';
import './style.css';

export default class Discover extends Component{
  render(){
    return(
      <div id="platforms">
         <div className="platforms_wrapper2 wrapper">
           <img className="platform-image1" src="/img/login/discover1.png" width="375.77px" height="656.5px" alt="" />
           <img className="platform-image2" src="/img/login/discover2.png" width="238.97px" height="656.5px" alt="" />
          <div className="platforms_content_wrapper2 content_wrapper">
            <h2 className="headline">Reach your audience,<br /> follow creative people </h2>
            <p>Like, comment and share photos and drawings.
              <br />Discover photographers, artists and designers.</p>
            <h5>Learn about how people are using Traceroll:</h5>
            <a href="#"><button className="blog">Blog</button></a>
          </div>
      	</div>
      </div>
      )
    }
}

import React, { Component } from 'react';

import './style.css';

export default class Intro extends Component{
    render(){
      return (
        <div id="intro" className="intro_wrapper">
            <div className="imageandtext">
            <img className="logo" align="left" src="/img/logo/Logo_200x200.png" width="115" height="115" alt="Traceroll Logo"/>
                <div className="text_wrapper">
                  <p className="heading">Traceroll <span class="beta">BETA</span></p>
                  <br /><p className="tagline">the creative space of the internet</p>
                </div>
            </div>
            <div className="buttons">
                <a href="/about">About</a>
                <a href="#">Blog</a>
                <a href="https://docs.google.com/forms/u/1/d/e/1FAIpQLSfkLITqj6OLagmIyZyllV3RIoKeyAB9rY2hNHQ18i3KENkhCw/viewform?usp=send_form">Contact Us</a>
                <a href="/login" className="login">Log-in</a>
            </div>
        </div>
      );
    }
}

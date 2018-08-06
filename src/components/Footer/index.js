import React, { Component } from 'react';
import { Link } from 'react-router';
import './style.css';

export default class Footer extends Component{

  render(){
    return(
      <div className="footer_content">
        <img className="footer_logo" src="/img/logo/Logo_75x75.png" width="75"/>
          <Link to="/">
            <img id="copyright-image" src="/img/icons/copyright.svg" width="141"/>
          </Link>
            <h4><a href="/about">About</a></h4>
            <h4>Blog</h4>
            <h4><a href="https://goo.gl/forms/PEbIz84CsJXCkUZg2">Contact Us</a></h4>
            <h4>Terms of Service</h4>
            <h4>Privacy Policy</h4>
            <br />
      </div>
    );
  }
}

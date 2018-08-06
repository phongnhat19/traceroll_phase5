import React, { PropTypes, Component } from 'react';
import Footer from '../Footer/index';
import BodyBackground from '../BodyBackground/index';
import './style.css';

export default class About extends Component {

  render() {
    return (
      <BodyBackground background={true}>
        <div id="about">
          <img id="home-button" src="/img/buttons/homeintro.svg" width="125" height="49.52"/>
          <div id="about_wrapper">
            <h1>
              About Traceroll
            </h1>
            <p>Traceroll was founded by <a href="https://www.linkedin.com/in/tolga-mizrakci-023482bb">Tolga Mizrakci</a> & <a href="https://www.linkedin.com/in/victor-wu-98450716/">Victor Wu</a> in the summer of 2017.</p>
            <p>Our company is located in 303 Spring St. New York NY 10282.</p>
            <p>Please feel free to contact us from the one of the links below.</p>
            <p>Enjoy using Traceroll!</p>
            <img className="social-icons first-icon" src="/img/icons/email.svg" width="40" height="40" alt=""/>
            <img className="social-icons" src="/img/icons/twitter.svg" width="40" height="40" alt=""/>
            <img className="social-icons" src="/img/icons/medium.png" width="40"  height="40" alt=""/>
          </div>
          <Footer />
        </div>
    </BodyBackground>
    );
  }
}

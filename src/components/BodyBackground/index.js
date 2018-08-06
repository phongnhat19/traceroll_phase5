import React, { Component } from 'react';

class BodyBackground extends Component{
  
   componentWillMount() {
     this.props.background ? document.body.classList.add('background') : document.body.classList.remove('background');
   }
   render() {
     return this.props.children;
   }
}

export default BodyBackground;

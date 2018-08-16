import React, { Component } from 'react';
import './style.css'

class Sidebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedDraw:0,
            text:""
        }
    }

    render(){
        return(
            <div className="sidebar">
                <div className="sidebar-item">
                    <h3><strong>Add stuff</strong></h3>
                </div>
            </div>
        )
    }
}

export default Sidebar
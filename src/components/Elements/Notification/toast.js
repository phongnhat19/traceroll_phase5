import React, { Component } from 'react';
import './toast.css';
import $ from 'jquery';

class TRToast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            msg: ''
        }
        this.timeout = null
    }

    componentWillMount() {

    }

    showAutoHide = (msg, length = 2000) => {
        if (this.el) {
            this.setState({
                msg: msg
            })
            if (this.timeout) {
                clearTimeout(this.timeout)
            }
            $(this.el).addClass('show')
            this.timeout = setTimeout(this.hide, length)
        }
    }

    show = (msg) => {
        if (this.el) {
            this.setState({
                msg: msg
            })
            $(this.el).addClass('show')
        }
    }

    hide = () => {
        if (this.el) {
            $(this.el).removeClass('show')
        }
    }

    componentDidMount() {
        const height = $('.sticky-header').outerHeight()
        if (height) {
            this.setState({
                topOffset: height
            })
        }
    }

    render() {
        return (
            <section ref={(node) => {this.el = node}}
                className="toast-box">
                <h4>{ this.state.msg }</h4>
            </section>
        )
    }
}

export default TRToast;
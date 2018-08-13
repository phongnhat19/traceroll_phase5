import React, { Component } from 'react';
import axios from 'axios';
import Utils from '../Util/utils.js';
import Jquery from 'jquery';

import './style.css';
//=====================================
// LOGIN FORM
//=====================================
export default class NonRegistration extends Component {
    constructor(props){
        super(props);
        //State to save Usernam and Pass
        this.state={
            token: this.props.params.tokenNonRegis
        }

        var width = window.innerWidth;
        //handle Responsive change one column to one column
        if (width<768){
            this.state={
                display: "none",
                displayop:"block"
            }
        }
        else{
            this.state={
                display:"block"
            }
        }
    }

    componentWillMount(){
        const self = this;
        const urlToken = this.props.params.tokenNonRegis;

        axios.get('/api/user/non-register/'+urlToken)
        .then(function(response){
            if(response.data.status === "FAILED"){
                self.setState({
                    isNonRegistExist: false,
                })
            }else{
                self.setState({
                    isNonRegistExist: true,
                })
            }
        })
    }

    //HANLDE REDIRECT LOGIN PAGE
    handleRedirectLogin(e){
        window.location.href = "/login"
    }

    render() {

        return (
            /*container*/
            <div className="login_wraper">
                <div className="loginmodal">
                    {/*Resgister FOrm*/}
                    <div className="signup signform" style={{display:this.state.display}}>
                        {/*Resgister FOrm*/}
                        <div id="registerWrapper">
                        </div>
                    </div>
                    {/*DELETED NON-REGISTRATION MESSAGE*/}
                    {   this.state.isNonRegistExist &&
                        <div className="signin signform" style={{display:this.state.displayop}}>
                            <h3 style={{marginTop: "100px", textAlign: "center", lineHeight: "inherit"}}>YOUR REGISTERED ACCOUNT HAS BEEN DELETED</h3>
                            <button id="btnlogin" onClick={(event) => this.handleRedirectLogin(event)}>LOGIN OR REGISTER</button>
                        </div>
                    }
                    {/*NON-REGISTRATION ACCOUNT NOT EXIST MESSAGE*/}
                    {
                        this.state.isNonRegistExist === false && 
                        <div className="signin signform" style={{display:this.state.displayop}}>
                            <h3 style={{marginTop: "100px", textAlign: "center", lineHeight: "inherit"}}>YOUR REGISTERED ACCOUNT NOT EXIST OR DELETED</h3>
                            <button id="btnlogin" onClick={(event) => this.handleRedirectLogin(event)}>LOGIN OR REGISTER</button>
                        </div>
                    }
                    {/*SPLASH IMG*/}
                    <div className="coverimg" id="coverimg" style={{transform:this.state.transform}}>
                        <h2>TRACEROLL</h2>
                    </div>
                </div>
            </div>
        );
    }
}

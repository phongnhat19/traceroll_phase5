import React, { Component } from 'react';
import axios from 'axios';
import Utils from '../Util/utils.js';
import Const from '../Util/const.js';
import Jquery from 'jquery';

import './style.css';
//=====================================
// LOGIN FORM
//=====================================
export default class ResetPwd extends Component {
    constructor(props){
        super(props);
        //State to save Usernam and Pass
        this.state={
            newPwd:'',
            confirmPwd:'',
            token: this.props.params.token
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
        const token = {
            "token": this.props.params.token
        }

        axios.post('/user/recover-password/isExpired', token)
        .then(function(response){
            if(response.status !== 200 || response.data.uid === null){
                // prompt reset email expired
                self.setState({
                    emailExpired: false,
                });
            }else{
                self.setState({
                    emailExpired: true,
                    requestEmail: response.data.email,
                    requestUid: response.data.uid
                });
            }
        })
    }

    //Register handler
    handleChangePwd(e){
        const newPassword = this.state.newPwd;
        const confirmPassword = this.state.confirmPwd;
        const regex = new RegExp(Const.PASSWORD_REGEXP, 'gm');

        if(!regex.test(newPassword)){
            alert(Const.INVALID_PASSWORD);
        }else if(newPassword.length >= 3 && confirmPassword.length >= 3 ){
            if(confirmPassword.localeCompare(newPassword) === 0){
                const newPwdData = {
                    "recoverPassword": newPassword,
                    "recoverUid": this.state.requestUid,
                    "recoverEmail": this.state.requestEmail
                }

                axios.post('/user/recover-password', newPwdData)
                .then(function(response){
                    // console.log('recoverPassword response =================' ,response);
                    if(response.status === 200){
                        window.location.href = "/login";
                    }else{
                        alert('Can not reset password, try again please!');
                    }
                })

            }else{
                // corfirm password not equal
                alert('Confirm password not matching!');
            }
        }else if(newPassword.length < 3 && confirmPassword.length < 3 ){
            // missing input password/ confirm password
            alert("New password is too short");
        }else if(newPassword.length == 0 && confirmPassword.length == 0){
            alert("New password/ Confirm password is empty");
        } 
    }

    /*HANLDE REDIRECT LOGIN PAGE*/
    handleRedirectLogin(e){
        window.location.href = "/login"
    }

    render() {
        // console.log('token ================', this.state.token);

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
                    {/*CHANGE PASSWORD FORM*/}
                    {   this.state.emailExpired &&
                        <div className="signin signform" style={{display:this.state.displayop}}>
                            <h2 style={{marginTop: "100px"}}>CHANGE PASSWORD</h2>
                            <label htmlFor="newpwd">New Password</label>
                            <input type="password" id="newpwd" onChange={(e) => this.setState({newPwd: e.target.value})}/>
                            <label htmlFor="confirmpwd">Confirm Password</label>
                            <input type="password" id="confirmpwd" onChange={(e) => this.setState({confirmPwd: e.target.value})}/>
                            <button id="btnlogin" onClick={(event) => this.handleChangePwd(event)}>CHANGE PASSWORD</button>
                        </div>
                    }
                    {/*RECOVER EMAIL EXPIRED*/}
                    {   this.state.emailExpired === false &&
                        <div className="signin signform" style={{display:this.state.displayop}}>
                            <h2 style={{marginTop: "100px"}}>RECOVER EMAIL EXPIRED</h2>
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

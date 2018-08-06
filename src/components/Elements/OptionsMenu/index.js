import React, { Component } from 'react';
import './style.css';
import Jquery from 'jquery';
import axios from 'axios';
import Utils from '../../Util/utils.js';
import Const from '../../Util/const.js';

class TROptMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showOptMenu: this.props.showOptMenu ? this.props.showOptMenu : false,
            editInfo: false,
            userInfomation: this.props.user_info,
            showReportModal: false,
            showSettingModal: false,
        }

        this.handleOptLogout = this.handleOptLogout.bind(this);
        this.toggleEditUserInfo = this.toggleEditUserInfo.bind(this);
        this.handleDelUser = this.handleDelUser.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.sendMail = this.sendMail.bind(this);
    }

    sendMail(reportDetails) {

        if(reportDetails !== ''){
            Jquery('.send-report').prop('disabled', true);
            Jquery('#report_issue .modal-footer').removeClass('hide-element');
            const userData = this.state.userInfomation;
            const reportData = {    reportDetails: reportDetails.trim(),
                                    senderEmail: userData.email,
                                    fullName: userData.fullname
                                }

            axios.post("/api/user/report", reportData)
            .then(function(response){
                Jquery('.send-report').prop('disabled', false);
                Jquery('#report_issue .modal-footer').addClass('hide-element');

                if(response.status == 200){
                    alert('Send report success !');
                    Jquery('#issueReport').val('');
                }else{
                    alert('Can not send report !');
                }
            })  
        }else{
            alert('Your report is empty !');
        }
        
    }

    saveEdit(crPass, newPass, confPass) {
        const self = this;
        /*Minimum eight characters, at least one uppercase letter, one lowercase letter and one number:*/
        const regex = new RegExp(Const.PASSWORD_REGEXP, 'gm');

        if(crPass === ""){
            alert('Please input current password !');
        }else if(newPass === ""){
            alert('Please input new password !');
        }else if(confPass === ""){
            alert('Please input confirm password !');
        }else{
            if(regex.test(newPass)){
                if(newPass.localeCompare(confPass) == 0 ){
                    var dataPwd = { uid: this.state.userInfomation.userId,
                                    data:{ oldpassword: crPass,
                                        rpassword: newPass} 
                                    }

                    axios.post("/api/user/change-pass", dataPwd)
                    .then(function(response){
                        if(response.data.error == null){
                            alert('Password changed !');
                            Jquery('.modal-body').find("#user_password, #new_user_password, #confirm_user_password").val("");
                            // self.handleOptLogout();
                        }else{
                            alert('Cannot change password !')
                        }               
                    });
                    // .catch(Utils.axiosError);
                }else{
                    alert('Confirm password not match !');
                }
            }else{
                alert(Const.INVALID_PASSWORD);
            }
        }
    }

    handleDelUser(userKey, userID, userName, userEmail) {
        const self = this;

        let userDelInfo = {
                userKey : userKey, 
                userId: userID, 
                userName: userName,
                userEmail: userEmail
            }

        axios.post("/api/user/delete", userDelInfo)
        .then(function (response) {
            if (response.status == 200) {
                self.handleOptLogout();
            }else {
                alert('Error when delete user !');
            }
        });
        // .catch(Utils.axiosError);
    }

    handleOptLogout() {
        axios.post("/logout", {})
        .then(function (response) {
            if (response.status == 200) {
                window.location.href = "/login";
            }
        });
    }

    showSettingModal = () => {
        this.setModalVisibility('showSettingModal', true)
        this.setModalVisibility('showReportModal', false)
        this.props.setShowNotification && this.props.setShowNotification(false, true)
    }

    showReportModal = () => {
        this.setModalVisibility('showReportModal', true)
        this.setModalVisibility('showSettingModal', false)
        this.props.setShowNotification && this.props.setShowNotification(false, true)
    }

    setModalVisibility = (modal, visibility) => {

        const data = {}
        data[modal] = visibility

        this.setState(data)
    }

    toggleEditUserInfo() {
        let editInfo = this.state.editInfo;

        this.setState((prevState, props) => ({
            editInfo: !prevState.editInfo,
        }));
    }

    render() {
        const self = this;
        const userInfo = this.state.userInfomation;
        const userSettingInfo = this.props.user_info ? this.props.user_info : null;
        let isEditInfo = this.state.editInfo;
        let renderElement = isEditInfo ? (
                <div>
                    <div className="custom-form">
                        <label htmlFor="userpassword" className="control-label-account-setting col-md-3">Current Password</label>
                        <div className="col-md-9">
                            <input type="password" name="password" className="form-control-account-setting" id="user_password" maxLength="100"/>
                        </div>
                    </div>
                    <div className="custom-form">
                        <label htmlFor="new_userpassword" className="control-label-account-setting col-md-3">New Password</label>
                        <div className="col-md-9">
                            <input type="password" name="password" className="form-control-account-setting" id="new_user_password" maxLength="100"/>
                        </div>
                    </div>
                    <div className="custom-form">
                        <label htmlFor="confirm_userpassword" className="control-label-account-setting col-md-3">Confirm Password</label>
                        <div className="col-md-9">
                            <input type="password" name="password" className="form-control-account-setting" id="confirm_user_password" maxLength="100"/>
                        </div>
                    </div>
                    <div className="button-action col-md-9" style={{float: 'right', padding: '0px 8px', display: 'grid',}}>
                        <input type="submit" className="edit-info info-action" value="Save Edit" onClick={() => this.saveEdit(Jquery('#user_password').val(), Jquery('#new_user_password').val(), Jquery('#confirm_user_password').val())}/>
                        <input type="submit" className="del-info info-action" value="Cancel Edit"  onClick={this.toggleEditUserInfo}/>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="custom-form">
                        <label htmlFor="userpassword" className="control-label-account-setting col-md-3">Password</label>
                        <div className="col-md-9">
                            <input type="password" name="password" className="form-control-account-setting" id="user_password" maxLength="100" readOnly/>
                        </div>
                    </div>
                    <div className="button-action col-md-9" style={{float: 'right', padding: '0px 8px', display: 'grid',}}>
                        <input type="submit" className="edit-info info-action" value="Edit Account Information" onClick={this.toggleEditUserInfo}/>
                        {/*<input type="submit" className="del-info info-action" value="Delete Account" onClick={() => this.handleDelUser(userInfo._key, userInfo.userId, userInfo.username)}/>*/}
                        <input type="submit" className="del-info info-action" value="Delete Account" data-toggle="modal" data-target="#confirmModal"/>
                    </div>
                </div>  
            )

        const fullWidthOption = this.props.showNotification || this.state.showSettingModal || this.state.showReportModal

        return (
            <div id="options_menu_zone" style={{top: "0", position: "absolute"}}>
                <div id='options-menu' style={{position: 'fixed'}} className={fullWidthOption ? 'full-width' : ''}> 
                    <span className="optionTitle"><b>Options</b></span>
                    <ul className="listOptions">
                        <li>
                            <a onClick={this.showSettingModal}>
                                Account Settings
                            </a>
                        </li>
                        <li>
                            <a onClick={this.showReportModal}>
                                Report an issue
                            </a>
                        </li>
                        <li>
                            <a onClick={this.handleOptLogout}>
                                Sign out
                            </a>
                        </li>
                    </ul>
                </div>

                {/*Modal for account setting*/}

                {
                    this.state.showSettingModal && !this.props.showNotification &&
                    <div id="account_setting_modal" className="modal-dialog custom-modal">
                        <div className="modal-content" style={{borderRadius: '0px'}}>
                            {/*<div className="modal-header"></div>*/}
                            <div className="modal-body">
                                <div className="row" style={{margin: '0px', padding: '20px 10px'}}>
                                    <div className="custom-form">
                                        <label htmlFor="username" className="control-label-account-setting col-md-3">Username</label>
                                        <div className="col-md-9">
                                            <input type="text" value={userSettingInfo.username ? userSettingInfo.username : null} className="form-control-account-setting" id="user_name" maxLength="100" readOnly/>
                                        </div>
                                    </div>
                                    <div className="custom-form">
                                        <label htmlFor="fullname" className="control-label-account-setting col-md-3">Name</label>
                                        <div className="col-md-9">
                                            <input type="text" value={userSettingInfo.fullname ? userSettingInfo.fullname : null} className="form-control-account-setting" id="user_full_name" maxLength="100" readOnly/>
                                        </div>
                                    </div>
                                    <div className="custom-form">
                                        <label htmlFor="useremail" className="control-label-account-setting col-md-3">Email Address</label>
                                        <div className="col-md-9">
                                            <input type="text" value={userSettingInfo.email ? userSettingInfo.email : null} className="form-control-account-setting" id="user_email" maxLength="100" readOnly/>
                                        </div>
                                    </div>

                                    {renderElement}

                                </div>
                            </div>
                            {/*<div className="modal-footer"></div>*/}
                        </div>
                    </div>
                }

                {/*Modal for report issue*/}

                {
                    this.state.showReportModal && !this.props.showNotification &&
                    <div id="report_issue" className="modal-dialog custom-modal">
                        <div className="modal-content" style={{borderRadius: '0px'}}>
                            {/*<div className="modal-header"></div>*/}
                            <div className="modal-body">
                                <div className="row" style={{margin: '0px', padding: '20px 50px'}}>
                                    <textarea id="issueReport" className="textarea-report" rows="4" cols="50" placeholder="Describe your issue or share your ideas" style={{color: 'rgba(153, 153, 153, 1)',}}></textarea>
                                    <div className="button-action">
                                        <input onClick={() => this.sendMail(Jquery('#issueReport').val())} type="submit" className="send-report edit-info info-action" value="Send"/>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer hide-element">
                                <p style={{color: 'red', textAlign: 'center',}}>(*) REPORT EMAIL SENDING ....</p>
                            </div>
                        </div>
                    </div>
                }

                {/*Modal confirm*/}

                <div id="confirmModal" className="modal fade" role="dialog">
                    <div className="modal-dialog" style={{margin: '200px auto',}}>
                        <div className="modal-content">
                            <div className="modal-body">
                                <p style={{textAlign: 'center', fontSize: '2em',}}>Would you like delete your account ?</p>
                            </div>
                            <div className="modal-footer" style={{padding: '0px',}}>
                                <div className="button-action" style={{width: '100%', padding: '0px 200px', display: 'inline-flex',}}>
                                    <input type="submit" className="edit-info info-action" data-dismiss="modal" onClick={() => this.handleDelUser(userInfo._key, userInfo.userId, userInfo.username, userInfo.email)} value="Confirm"/>
                                    <input type="submit" className="edit-info info-action" data-dismiss="modal" value="Cancel"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 

            </div>
        )
    }
}

export default TROptMenu;
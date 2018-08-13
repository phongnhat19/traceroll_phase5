import React, { Component } from 'react';
import axios from 'axios';
import Utils from '../Util/utils.js';
import Const from '../Util/const.js';
import TrService from '../Util/service';
import CheckBrowser from './Util/CheckBrowser/index';
import HandleRegister from './Util/HandleRegister/index'
import Intro from './Intro/index';
import MobileApp from './MobileApp/index';
import Whiteboards from './Whiteboards/index';
import Platforms from './Platforms';
import Canvas from './Canvas/index';
import Collaborate from './Collaborate/index'
import LoginFooter from './LoginFooter/index';
import cryptoJS from 'crypto-js';
import './style.css';
import TRToast from '../Elements/Notification/toast'

const _ONBOARDING_URL = 'http://onboarding.traceroll.com/tour/1';

const _EmailError = Const.EMAIL_ERROR

//=====================================
// LOGIN FORM
//=====================================
export default class Login extends Component {
		constructor(props){
			super(props);
			this.handleEmail=this.handleEmail.bind(this);
			this.handleUsername=this.handleUsername.bind(this);
			this.handlePassword=this.handlePassword.bind(this);
			this.handlePasswordMatch=this.handlePasswordMatch.bind(this);
			this.handleRegister=this.handleRegister.bind(this);
			HandleRegister.handleFullName=HandleRegister.handleFullName.bind(this);
			this.state={
				username: '',
				password: '',
				username_login: '',
				password_login: '',
				fullname: '',
				email: '',
				fullNameCheck: false,
				usernameCheck: false,
				passwordCheck: false,
				emailCheck: false,
				passwordMatch: false,
				formError: '',
                showForgotPwdDialog: false,
                isValidRecoveryEmail: true,
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
			//	this.moveright = this.moveright.bind(this);
			//	this.handleRedirect = this.handleRedirect.bind(this);
	}
	//event slide right IMG show Resgister form
	moveright(condition){
		var width = window.innerWidth;
		if (width<768){
			this.setState({
				transform: "translateX(100%)",
				display: "block",
				displayop:"none",
				showRegister: condition
			})
		}
		else{
			this.setState({
				transform: "translateX(100%)",
				showRegister: condition
			})
		}

	}

	//Event slide Left IMG to show Login Form
	moveleft(){
		var width = window.innerWidth;
		if (width<768){
			this.setState({
				display: "none",
				displayop:"block"
			})
		}
		else{
			this.setState({
				transform: "translateX(0%)",
			})
		}
	}

	//Login handler
	handleLogin(event){
		//setting
		var apiBaseUrl = "/login";
		var payload={
			"username": this.state.username_login,
			"password": this.state.password_login
		}
		//call API login, data = payload
		axios.post(apiBaseUrl, payload)
		.then(function (response) {
			if (response.data.username){
				window.location.href = "/stage/"+response.data.userslug;
			}
		})
		.catch(function(err) {
			const body = err.response.data;
			alert(body);
		})

	}
	// Call function handlelogin when press Enter while filling password
	handleLoginPress = (e) =>{
		if(e.key === 'Enter'){
				this.handleLogin();
			}
	}

	handleEmail(e){
		this.setState({email:e.target.value});
			const email = e.target.value;
			const _ErrorClass = 'hasDanger-border';
			const _NoError = '';

		if(!Utils.validateEmail(email)) {
                this.setState({
                        emailClass: _ErrorClass,
                        emailError: _EmailError,
                        emailCheck: false,
                        formError: 'error'
                });
                return;
                //alert(`Email ${email} is invalid.`);
        }else{
                this.setState({
                        emailClass: _NoError,
                        emailError: _NoError,
                        emailCheck: true
                })
        }

    }

    handleUsername(e){
        const _UsernameError = 'Please enter a username without caps or special characters';
        const _ErrorClass = 'hasDanger-border';
        const _NoError = '';
        this.setState({username:e.target.value})
        const username=e.target.value;
        if(!username){
            this.setState({
                usernameClass: _ErrorClass,
                usernameError: _UsernameError,
                usernameCheck: false,
                formError: 'error'
            })
        }else if( username.match(/[A-Z]|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\:|\s/g) ) {
            this.setState({
                usernameClass: _ErrorClass,
                usernameError: _UsernameError,
                usernameCheck: false,
                formError: 'error'
            })
        }else{
            this.setState({
                usernameClass: _NoError,
                usernameError: _NoError,
                usernameCheck: true
            })
        }
    }

    handlePassword(e){
        const _ErrorClass = 'hasDanger-border',
            _NoError = '',
            _PasswordLength = 'Password should atleast have 6 characters',
            _PasswordCapital = 'Password must have a capital letter',
            _PasswordSmall= 'Password must have a small letter',
            _PasswordNumber = 'Password must contain a number',
            numberCheck = new RegExp("(?=.*[0-9])"),
            capitalCheck=new  RegExp("(?=.*[A-Z])"),
            smallCheck= new RegExp("(?=.*[a-z])"),
            lengthCheck = new RegExp("(?=.{6,})")

        this.setState({password:e.target.value});
        const password=e.target.value;
        if(!capitalCheck.test(password)) {
            this.setState({
                passwordClass:_ErrorClass,
                passwordError:_PasswordCapital,
                passwordCheck: false,
                formError: 'error'
            })
        }
        else if(!smallCheck.test(password)) {
            this.setState({
                passwordClass:_ErrorClass,
                passwordError:_PasswordSmall,
                passwordCheck: false,
                formError: 'error'
            })
        }
        else if(!numberCheck.test(password)) {
            this.setState({
                passwordClass:_ErrorClass,
                passwordError:_PasswordNumber,
                passwordCheck: false,
                formError: 'error'
            })
        }
        else if(!lengthCheck.test(password)) {
            this.setState({
                passwordClass:_ErrorClass,
                passwordError:_PasswordLength,
                passwordCheck: false,
                formError: 'error'
            })
        }
        else {
            this.setState({
                passwordClass: _NoError,
                passwordError: _NoError,
                passwordMisMatch: _NoError,
                passwordCheck:true
            })
        }
    }

    handlePasswordMatch(e){
        const _PasswordMismatch = 'Password mismatch',
            _ErrorClass = 'hasDanger-border',
            _Password = this.state.password,
            _ConfirmPassword = e.target.value,
            _NoError = ''

        if(_Password !== _ConfirmPassword){
            this.setState({
                passwordClass: _ErrorClass,
                passwordMisMatch: _PasswordMismatch,
                passwordMatch:false,
                formError: 'error'
            })
        }
        else {
            this.setState({
                passwordClass: _NoError,
                passwordMisMatch: _NoError,
                passwordMatch:true
            })
        }
    }

	//Register handler
	handleRegister(e){
		const _SECRETKEY = 'ADtCrhPcSQ';
		const _ErrorClass='hasDanger-border';
		const _UsernameError = 'Please enter a username without caps or special characters';
		const _PasswordError='Please enter a password';
		const _PasswordMismatch='Please enter a matching password';
		const _NameError = 'Please enter a valid name';

		if(!this.state.usernameCheck){
						this.setState({
								usernameClass: _ErrorClass,
								usernameError: _UsernameError
						})
		}
		if(!this.state.passwordCheck){
						this.setState({
								passwordClass:_ErrorClass,
								passwordError:_PasswordError
						})
		}
		if(!this.state.passwordMatch){
						this.setState({
								passwordClass: _ErrorClass,
								passwordMisMatch: _PasswordMismatch
						})
		}
		if(!this.state.emailCheck){
						this.setState({
								emailClass: _ErrorClass,
								emailError: _EmailError
						})
		}
		if(!this.state.fullNameCheck){
				this.setState({
					fullNameClass:_ErrorClass,
					fullNameError:_NameError
			})
		}

		if( this.state.fullNameCheck && this.state.usernameCheck && this.state.passwordCheck && this.state.emailCheck && this.state.passwordMatch ) {

			var apiBaseUrl = "/register";
			var payload={
				"username": this.state.username.replace(/ +/g, "").toLowerCase(),
				"password": this.state.password,
				"fullname": this.state.fullname,
				"email": this.state.email
			}
			//CALL API, data = payload
			axios.post(apiBaseUrl, payload)
			.then(function (response) {
				const body = response.data;
				if (body.username){
					//Redirect URL with encryption on username
					var key = cryptoJS.AES.encrypt(""+response.data.userslug, _SECRETKEY);
					window.location.href = `${_ONBOARDING_URL}?username=${response.data.userslug}&id=${key}`;
				}else{
					alert('login error');
				}
			})
			.catch(function(err) {
				const body = err.response.data;
				alert(body);
			})
		}else{
			this.setState({formError: "error"});
		}

	}
	// Call function hadnleRegister when press Enter
	handleRegisterPress = (e) =>{
		if(e.key === 'Enter'){
				this.handleRegister();
			}
	}

	//code for browser check
	componentDidMount(){
		CheckBrowser.check();
	}

    handleForgotPassword = () => {
        this.setState({
            showForgotPwdDialog: true
        })
    }

    handleHideDialog = (e) => {
        const dialog = e.target.dataset.dialog
        this.setState({
            [dialog]: false
        })
    }

    handleValidateEmail = (e) => {
        const input = e.target,
            email = e.target.value,
            isValid = Utils.validateEmail(email),
            input_value = input.dataset.input_value,
            input_error = input.dataset.input_error

        this.setState({
            [input_value]: email,
            [input_error]: isValid
        })

    }

    handleResetPwd = (e) => {
        const { recoveryEmail, isValidRecoveryEmail } = this.state

        if(isValidRecoveryEmail) {

            this.TRToast.showAutoHide('Sending...')

            const requestBody = {
                "email": recoveryEmail
            }

            TrService.resetPassword(requestBody, response => {
                const error = response.data.error
                if (error !== null) this.TRToast.showAutoHide(error)
                else                this.TRToast.showAutoHide(`We sent a recovery link to ${recoveryEmail}`, 5000)
            })

            this.setState({
                showForgotPwdDialog: false
            })
        }
    }

	render() {
		return (
			<div id="home">
				<Intro />
				<Whiteboards />
				<Platforms />
				<Canvas />
				<Collaborate />
				<MobileApp />
				<div id="footer">
					<div id="login" className="login_wrapper">
						{/*modal login*/}
						<div className={ (this.state.formError) ? "loginmodal " + this.state.formError : 'loginmodal'}>
								{/*LOGIN FORM*/}
								<div className="signin signform" style={{display:this.state.display}}>
										<h2>Sign-in</h2>
										<input
											type="text"
											id="username"
											placeholder="Username"
											onChange = {(e) => this.setState({username_login:e.target.value}) } />
										<input
											type="password"
											id="pass"
											placeholder="Password"
											onChange = {(e) => this.setState({password_login:e.target.value})} onKeyPress={this.handleLoginPress} required/>
										<button id="btnlogin" onClick={(event) => this.handleLogin(event)}>Log-in</button>
										<button className="Login__forgotpwd-btn" onClick={this.handleForgotPassword}>Forgot password?</button>
								</div>

                                {/* Forgot password dialog */}
                                {
                                    this.state.showForgotPwdDialog &&
                                    <section className="ForgotPwd__container" data-dialog="showForgotPwdDialog" onClick={this.handleHideDialog}>
                                        <section className="ForgotPwd">
                                            <h2 className="ForgotPwd__title">Forgot Password</h2>
                                            <p className="ForgotPwd__info">Type in your email address so we can send your password.</p>
                                            <input
                                                className={`ForgotPwd__email-input${this.state.isValidRecoveryEmail?'':' hasDanger-border'}`}
                                                type="email"
                                                placeholder="E-mail Address"
                                                onChange={this.handleValidateEmail}
                                                data-input_value="recoveryEmail"
                                                data-input_error="isValidRecoveryEmail"
                                            />
                                            {
                                                !this.state.isValidRecoveryEmail &&
                                                <p className="hasDanger">{_EmailError}</p>
                                            }
                                            <button className="ForgotPwd__send-btn" onClick={this.handleResetPwd}>Send</button>
                                        </section>
                                    </section>
                                }

								{/*Resgister FOrm*/}
								<div className="signin signform" style={{display:this.state.display}}>
										<h2>Create an Account</h2>
										<input
											type="text"
											className={this.state.fullNameClass}
											id="fullname"
											placeholder="Full Name"
											onChange = {HandleRegister.handleFullName}/>
											<p className="hasDanger">{this.state.fullNameError}</p>
											<input
												type="email"
												className={this.state.emailClass}
												placeholder="Email Address"
												id="email"
												value={this.state.email}
												onChange = {this.handleEmail}
												onKeyPress={this.handleRegisterPress}
											/>
											<p className="hasDanger">{this.state.emailError}</p>
											<input
												type="text"
												className={this.state.usernameClass}
												id="username_register"
												placeholder="Username"
												value={this.state.username}
												onChange = {this.handleUsername}/>
											<p className="hasDanger">{this.state.usernameError}</p>
											<input
												type="password"
												className={this.state.passwordClass}
												id="pass_register"
												placeholder="Password"
												value={this.state.password}
												onChange = {this.handlePassword}/>
											<p className="hasDanger">{this.state.passwordError}</p>
											<input
												type="password"
												className={this.state.passwordClass}
												id="confirm_register"
												placeholder="Confirm password"
												onChange = {this.handlePasswordMatch}/>
											<p className="hasDanger">{this.state.passwordMisMatch}</p>
											<p className="legal">By clicking Sign Up, you agree to our Terms of Service and Privacy Policy</p>
											<button id="btnreg" onClick={this.handleRegister}>Sign-up</button>
								</div>
						</div>
					</div>
					<div id="login_mobile" className="login_wrapper">
						{/*modal login*/}
						<div className={ (this.state.formError) ? "loginmodal " + this.state.formError : 'loginmodal'}>
								{/*LOGIN FORM*/}
								<div className="signin signform" style={{display:this.state.displayop}}>
									<h2>Please use our web app from a desktop browser until we release our mobile apps.</h2>
								</div>
						</div>
					</div>
					<LoginFooter />
				</div>
                <TRToast ref={node => this.TRToast = node}/>
			</div>
		);
	}
}

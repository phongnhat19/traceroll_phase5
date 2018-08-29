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
import Exhibition from './Exhibition/index';
import Collaboration from './Collaboration/index';
import Canvas from './Canvas/index';
import Discover from './Discover/index';
import LoginFooter from './LoginFooter/index';
import cryptoJS from 'crypto-js';
import './style.css';
import TRToast from '../Elements/Notification/toast'

const _ONBOARDING_URL = 'http://onboarding.traceroll.com/tour/1';

const _EmailError = Const.EMAIL_ERROR;

//=====================================
// LOGIN FORM
//=====================================
export default class SignUp extends Component {
		constructor(props){
			super(props);
			this.handleEmail=this.handleEmail.bind(this);
			this.verifyEmail=this.verifyEmail.bind(this);
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
				formError: ''
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
	verifyEmail(e){
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

	handleEmail(e){
		this.setState({email:e.target.value});
			const email = e.target.value;
			const _ErrorClass = 'hasDanger-border';
			const _NoError = '';
    }

		handleUsername(e){
				const _UsernameError = 'Please enter without caps or special between 3 to 20 characters';
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
				}else if( username.match(/[A-Z]|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\:|\s/g) || username.length < 3 || username.length > 20 ) {
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

  handleHideDialog = (e) => {
      const dialog = e.target.dataset.dialog
      this.setState({
          [dialog]: false
      })
  }

	render() {
		return (
			<div id="home">
				<Intro />
				<div id="login" className="login_wrapper">
					<img src="/img/login/sign-up-image.png" width="525" />
					{/*modal login*/}
					<div className={ (this.state.formError) ? "loginmodal " + this.state.formError : 'loginmodal'}>
							{/*LOGIN FORM */}

							{/*Create an Account Form*/}
							<div className="signin signform">
									<h2>Welcome to Traceroll</h2>
									<input
										type="text"
										className={this.state.usernameClass}
										id="username_register"
										placeholder="Username"
										value={this.state.username}
										onChange = {this.handleUsername}/>
									<p className="hasDanger">{this.state.usernameError}</p>
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
											placeholder="E-mail Address"
											id="email"
											value={this.state.email}
											onChange = {this.handleEmail}
											onBlur = {this.verifyEmail}
											onKeyPress={this.handleRegisterPress}
										/>
										<p className="hasDanger">{this.state.emailError}</p>
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
										<button id="btnreg" onClick={this.handleRegister}>Sign-up</button>
										<br />
										<p className="legal">By clicking Sign Up, you agree to <br />
our <u>Terms of Service</u> & <u>Privacy Policy</u></p>
							</div>
					</div>
				</div>
				<Whiteboards />
				<Exhibition/>
				<Collaboration />
				<Canvas />
				<Discover />
				<MobileApp />
				<div id="login_mobile" className="login_wrapper">
					<p>Traceroll beta is currently available on the web via laptop / desktop</p>
					{/*modal login
					<div className={ (this.state.formError) ? "loginmodal " + this.state.formError : 'loginmodal'}>
							<div className="signin signform" style={{display:this.state.displayop}}>
							</div>
					</div>*/}
				</div>
				<div id="footer">
					<LoginFooter />
				</div>
        <TRToast ref={node => this.TRToast = node}/>
			</div>
		);
	}
}

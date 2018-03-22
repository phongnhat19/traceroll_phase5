import React, { Component } from 'react';
import axios from 'axios';
import Utils from '../Util/utils.js';

import './style.css';
//=====================================
// LOGIN FORM
//=====================================
export default class Login extends Component {
	constructor(props){
		super(props);
		//State to save Usernam and Pass
		this.state={
			username:'',
			password:''
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
	//event slide right IMG show Resgister form
	moveright(){
		var width = window.innerWidth;
		if (width<768){
			this.setState({
				transform: "translateX(100%)",
				display: "block",
				displayop:"none"
			})
		}
		else{
			this.setState({
				transform: "translateX(100%)",
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
			"username": this.state.username,
			"password": this.state.password
		}
		//call API login, data = payload
		axios.post(apiBaseUrl, payload)
		.then(function (response) {
			if (response.data.username){
				window.location.href = "/stage/"+response.data.userslug;
				//Redrirect user to new URL
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
	//Register handler
	handleRegister(e){
		const email = this.state.email;
		if(!Utils.validateEmail(email)) {
			alert(`Email ${email} is invalid.`);
			return;
		}

		//Setting data
		var apiBaseUrl = "/register";
		var payload={
			"username": this.state.username,
			"password": this.state.password,
			"fullname": this.state.fullname,
			"email": email
		}
		//CALL API, data = payload
		axios.post(apiBaseUrl, payload)
		.then(function (response) {
			const body = response.data;
			if (body.username){
				//Redirect URL
				window.location.href = "/stage/"+response.data.userslug;
			}
		})
		.catch(function(err) {
			const body = err.response.data;
			alert(body);
		})

	}
	// Call function hadnleRegister when press Enter
	handleRegisterPress = (e) =>{
		if(e.key === 'Enter'){
	    	this.handleRegister();
	  	}
	}


	render() {
		return (
			/*container*/
			<div className="login_wraper">
				{/*modal login*/}
				<div className="loginmodal">
						{/*Resgister FOrm*/}
						<div className="signup signform" style={{display:this.state.display}}>
								<h2>REGISTER</h2>
								<label htmlFor="username">Username</label>
								<input type="text" id="username_register"  onChange = {(e) => this.setState({username:e.target.value})}/>
								<label htmlFor="pass">Password</label>
								<input type="password" id="pass_register" onChange = {(e) => this.setState({password:e.target.value})}/>
								<label htmlFor="fullname">Full name</label>
								<input type="text" id="fullname" onChange = {(e) => this.setState({fullname:e.target.value})}/>
								<label htmlFor="email">E-mail</label>
								<input type="email" id="email" onChange = {(e) => this.setState({email:e.target.value})} onKeyPress={this.handleRegisterPress}/>
								<button id="btnreg" onClick={(event) => this.handleRegister(event)}>REGISTER</button>
								<div className="or_wrap">
										<div className="br"></div>
										<span className="or">or</span>
										<div className="br"></div>
								</div>
								<button id="btnlogin" onClick={this.moveleft.bind(this)}>LOG IN</button>
						</div>
						{/*LOGIN FORM*/}
						<div className="signin signform" style={{display:this.state.displayop}}>
								<h2>SIGN IN</h2>
								<label htmlFor="username">Username</label>
								<input type="text" id="username" onChange = {(e) => this.setState({username:e.target.value}) }/>
								<label htmlFor="pass">Password</label>
								<input type="password" id="pass" onChange = {(e) => this.setState({password:e.target.value})} onKeyPress={this.handleLoginPress}/>
								<button id="btnlogin" onClick={(event) => this.handleLogin(event)}>LOG IN</button>
								<div className="or_wrap">
										<div className="br"></div>
										<span className="or">or</span>
										<div className="br"></div>
								</div>
								<button id="btnreg" onClick={this.moveright.bind(this)}>REGISTER</button>
						</div>
						{/*SPLASH IMG*/}
						<div className="coverimg" id="coverimg" style={{transform:this.state.transform}}>
							<h2>TRACEROLL</h2>
						</div>
				</div>
			</div>
		);
	}
}

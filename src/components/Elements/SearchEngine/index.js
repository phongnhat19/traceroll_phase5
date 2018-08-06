import React, { Component } from 'react';
import './style.css';
import Jquery from 'jquery';
import TrService from '../../Util/service.js';

class Search extends Component {
	constructor(props) {
			super(props);

			this.state = {
				listUser: [],
				// listUserSlug: [],
				content_search: ''
			}

			this.handleInputSearch = this.handleInputSearch.bind(this);
			this.handleSetTimeOut = this.handleSetTimeOut.bind(this);
			this.handleWindowMouseUp = this.handleWindowMouseUp.bind(this);
	}

	componentWillMount(){
		window.addEventListener("mouseup", this.handleWindowMouseUp);
	}

	componentWillUnmount() {
		window.removeEventListener("mouseup", this.handleWindowMouseUp);
	}

    keypressValidate(event) {
        const regex = new RegExp("^[a-zA-Z0-9]+$");
        const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
           event.preventDefault();
           return false;
        }
    }

	handleWindowMouseUp = (e) => {
		if(e.target.id !== "search-input"){
			Jquery('#dropDown-username').addClass("hide");
			Jquery('#search-input').val('');
		}
	}

	timeOut = undefined;

	handleInputSearch(){
		let inputSearch = Jquery("#search-input").val();
		this.setState({content_search: inputSearch})

		this.handleSetTimeOut(inputSearch);
	}

	handleSetTimeOut(inputSearch) {
		let specialChars = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
		let self = this;

		if (this.timeOut) {
			clearTimeout(this.timeOut);
			this.timeOut = undefined;
		}

		this.timeOut = setTimeout(function(){
			let trim_inputSearch = inputSearch.trim();
			let input_length = trim_inputSearch.toString().length;

			if (input_length === 0) {
				Jquery('#dropDown-username').addClass("hide");
				self.setState({listUser: []});
			} else if (Jquery("#search-input").val().trim().length !== 0) {
				if(specialChars.test(trim_inputSearch) === true){
					return;
				}
				const requestBody = {
					contentSearch: trim_inputSearch
				};
				const callback = function(response){

					let list = response.data.listUsers,
						userNameArr = [];
					//Handle search error and success
					if (response.data.error === 1) {
						userNameArr = userNameArr;

					} else if (response.data.error === 2) {
						userNameArr = [];

						self.setState({listUser: userNameArr}, function(){
							Jquery('#dropDown-username').addClass("hide");
						});

					} else {
						if (Jquery("#search-input").val().trim().length !== 0) {
							userNameArr = list;
						} else {
							userNameArr = [];
						}

						self.setState({listUser: userNameArr}, function(){
							Jquery('#dropDown-username').removeClass("hide");
						});
					}
				}

				TrService.searchUser(requestBody, callback.bind(this))
			}
		}, 500);
	}

	render(){
		const searchInfo = this.state.content_search;
		return(
			<div id="search-engine">
				<input type="image" class="searchbutton" name="search" src="/img/icons/search2.svg" alt="Search" width="18" height="18"></input>
				<input 	id="search-input"
						classame="sfield"
						type="text"
						name="search"
						placeholder="Search"
						onInput={this.handleInputSearch}
						maxLength="40"
						size="29">
				</input>
				<ul id="dropDown-username" className="hide search-style">
					{this.state.listUser.map(function(userObj, index){
						const userSlug = userObj.userslug,
							fullName = userObj.fullname;
						let representName;

						if(userSlug.length >= searchInfo.length){
							representName = userSlug;
						}else{
							representName = fullName;
						}

						return <li><a href={"/stage/"+userObj.userslug} onClick={this.props.handleRedirectPage}>{representName}</a></li>
					}, this)}
				</ul>
			</div>
		)
	}
}

export default Search;

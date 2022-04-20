import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import '../../js/jsLib.js';
import '../../js/data.js';

declare var togglePopup:any;
declare var gCards:any;
declare var getTextFieldValue:any;
declare var $:any;
declare var getHostname:any;
declare var showThisPopup:any;
declare var closePopup:any;
declare var setTextValue:any;
declare var saveGame:any;

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
public cards=gCards;
public selectedCard = gCards[0];
public emailAddress='';
public username='';
public gameList=[];
public selectedGame:any;
public createFlg=false;
public avatarId=1;
public avatarList = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

  constructor(private router: Router) { }

  ngOnInit() {
  	this.selectedGame = {name: 'test'};
	this.emailAddress=localStorage.email;
	this.username=localStorage.username;
	console.log('gameId', localStorage.gameId);
	console.log('inGameFlg', localStorage.inGameFlg);
//	console.log('code', localStorage.code);
	
	if(localStorage.inGameFlg && localStorage.inGameFlg=='Y')
		this.showPopup('inGamePopup');
  }

  showPopup(name) {
  	togglePopup(name);
  }
  login() {
  	var email = getTextFieldValue('email');
  	var password = getTextFieldValue('password');
	if(email.length==0) {
		this.showAlertPopup('Email field is blank');
		return;
	}
	if(password.length==0) {
		this.showAlertPopup('Password field is blank');
		return;
	}
  	this.showPopup('busyPopup');
  	closePopup('loginPopup');
  	this.loginToSystem(email, password);
  }
  loginToSystem(email, password) {
  	const url = getHostname()+"/login.php";
  	const postData = {
	    method: 'POST', 
	    headers: new Headers(),
	    body: JSON.stringify({email:email, password:password})
    	};

  	fetch(url, postData).then( (resp) => resp.json())
  	.then(data=>{ 
 	  	this.showPopup('busyPopup');
 	  	//alert(JSON.stringify(data));
  		if(!data || data.status !='success') {
  			this.showAlertPopup(data.errorMsg);
  		} else {
  			this.setUserDefaults(data.email, data.username, password);
  		}
 	}) 
  	.catch(error=>alert(error));
  }
  userLogout() {
	this.setUserDefaults('', '', '');
  }
  setUserDefaults(email, username, password) {
	this.emailAddress = email; 
	this.username = username; 
	localStorage.email = email;
	localStorage.username = username;
	localStorage.password = password;
  	var code = '22'+btoa(password);
	localStorage.code = code;
  }
  showAlertPopup(message) {
		this.showPopup('messagePopup');
	var e = document.getElementById('popupMessageText');
	if(e) {
		e.innerHTML = message;
	} else
		alert('not found: popupMessageText');
	
  }
  selectCard(card) {
  	this.selectedCard=card;
  	showThisPopup('selectedCardPopup', true);
  }
  refreshPressed() {
 	 this.showPopup('joinGamePopup');
 	 this.joinGamePressed();
  }
  startSinglePlayer() {
  	if(!this.username || this.username.length==0) {
  		localStorage.username = 'Guest';
  		this.username = 'Guest';
  	}
	if(localStorage.inGameFlg && localStorage.inGameFlg=='Y')
		this.showAlertPopup('Already in a game!');
	else {
		this. startUpNewGame();
		localStorage.gameId=0;
  		this.router.navigate(['/board']);
  	}
  }
  startUpNewGame() {
    	var card = gCards[0];
  	var players = [
  		{id: 1, name: 'bill', avatar: 'avatar2.png', avatarId: 2, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		{id: 2, name: 'chuck', avatar: 'avatar4.png', avatarId: 4, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		{id: 3, name: 'anne', avatar: 'avatar13.png', avatarId: 3, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		{id: 4, name: localStorage.username, avatar: 'avatar5.png', avatarId: 5, points: 0, gamePoints: 0, cardId: 0, checkFlg: false, card: card, wonFlg: false, revealFlg: false, hostFlg: true, leftId: 3, rightId: 5, leftName: 'anne', rightName: 'bob'},
  		{id: 5, name: 'bob', avatar: 'avatar6.png', avatarId: 6, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		{id: 6, name: 'joan', avatar: 'avatar1.png', avatarId: 1, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		];
  	
  	var gameObj = {gameId: 1, name: 'Single Player Test', spf: true, host: localStorage.username, status: 'Init', round: 1, phase: 'Joining', players: players, hostFlg: true, allReadyFlg: false, cardList: [], middleCards: []};
  	saveGame(gameObj);
  }
  passChecks() {
	if(0 && localStorage.inGameFlg && localStorage.inGameFlg=='Y') {
		this.showAlertPopup('Already in a game!');
		return false;
	}
  	if(localStorage.email && localStorage.email.length>0)
  		return true;
  	else
  		this.showAlertPopup('Log in first!');
  	return false;
  }
  joinGamePressed() {
  	if(this.passChecks())
  		this.joinGameLookup();
  }
  createGamePressed() {
  	if(this.passChecks()) {
		this.showPopup('createGamePopup');
		setTextValue('gameName', localStorage.username+'\'s Game');
	}
  }
  createGame() {
  	var gameName = getTextFieldValue('gameName');
	if(gameName.length==0) {
		this.showAlertPopup('Game name field is blank');
		return;
	}
	closePopup('createGamePopup');
	this.postGameRequest(JSON.stringify({host: localStorage.username, email:localStorage.email, password:localStorage.password, gameName:gameName, action: 'createGame'}), 'createGame');
  }
  postGameRequest(body, action='') {
  	this.showPopup('busyPopup');
  	const url = getHostname()+"/copsGame.php";
  	const postData = {
	    method: 'POST', 
	    headers: new Headers(),
	    body: body
    	};

  	fetch(url, postData).then( (resp) => resp.json())
  	.then(data=>{ 
 	  	this.showPopup('busyPopup');
 	  	//alert(JSON.stringify(data));
  		if(!data || data.status !='success') {
  			this.showAlertPopup(data.errorMsg || data.status);
  		} else {
  			if(action=='createGame') {
  				localStorage.inGameFlg='Y';
  				localStorage.gameId=data.gameId;
  				this.showAlertPopup('Game Created!');
  				this.router.navigate(['/board']);
  			} else if(action=='joinOpenGame') 
  				this.enterGame();
  			else
	  			this.showAlertPopup('done');
  		}
 	}) 
  	.catch(error=> { this.showAlertPopup('invalid json returned!' +error); this.showPopup('busyPopup');} );
  }
  joinGameLookup() {
  	this.showPopup('busyPopup');
  	this.showGameRequest();
  }
  showGameRequest() {
  	const url = getHostname()+"/copsGame.php";
  	console.log(url);
  	const postData = {
	    method: 'POST', 
	    headers: new Headers(),
	    body: JSON.stringify({host: localStorage.username, email:localStorage.email, password:localStorage.password, action: 'showOpenGames'})
    	};

  	fetch(url, postData).then( (resp) => resp.json())
  	.then(data=>{ 
 	  	this.showPopup('busyPopup');
 	  	//alert(JSON.stringify(data));
  		if(!data || data.status !='success') {
  			this.showAlertPopup(data.errorMsg || data.status);
  		} else {
		  	this.showPopup('joinGamePopup');
		  	var games = data.games.split("<a>");
		  	var gameList = [];
			games.forEach(function(gameStr) {
				var c = gameStr.split("|");
				var host = c[1];
				var name = c[2];
				var players = c[2];
				var round = c[2];
				var phase = c[2];
				var hostFlg = c[2];
				if(name && name.length>0)
					gameList.push({name: name, row_id: c[0], host: c[1], players: c[3], round: c[4], phase: c[5], hostFlg: c[6], inGameFlg: c[7], status: c[8]});
			});
  			this.gameList = gameList;
  		}
 	}) 
  	.catch(error=> { this.showAlertPopup(error); this.showPopup('busyPopup');} );
  }
  selectGame(game) {
  	this.selectedGame=game;
  	this.showPopup('joinSelectedGamePopup');
  }
  joinOpenGame() {
  	this.startWebCall('joinOpenGame');
  }
  exitGame() {
  	this.startWebCall('exitGame');
  }
  enterGame() {
	localStorage.inGameFlg='Y';
	localStorage.gameId=this.selectedGame.row_id;
	this.router.navigate(['/board']);
  }
  cancelGame() {
  	this.startWebCall('cancelGame');
  }
  addBot() {
  	this.startWebCall('addBot');
  }
  startGame() {
  	this.showAlertPopup('not coded yet!');
  	//this.startWebCall('startGame');
  }
  startWebCall(action) {
  	closePopup('joinGamePopup');
  	closePopup('joinSelectedGamePopup');
	this.postGameRequest(JSON.stringify({gameId:this.selectedGame.row_id, email:localStorage.email, password:localStorage.password, action: action}), action);
  }
  createOptionPressed() {
  	this.createFlg = !this.createFlg;
  }
  changeAvatarPressed() {
  	this.avatarId++;
  	if(this.avatarId>20)
  		this.avatarId=1;
  }
  createButtonPressed() {
  	var email = getTextFieldValue('email');
  	var firstName = getTextFieldValue('firstName');
  	var password = getTextFieldValue('password');
  	var password2 = getTextFieldValue('password2');
	if(email.length==0) {
		this.showAlertPopup('Email field is blank');
		return;
	}
	if(password.length==0) {
		this.showAlertPopup('Password field is blank');
		return;
	}
	if(password != password2) {
		this.showAlertPopup('Passwords do not match');
		return;
	}
  	this.showPopup('busyPopup');
  	closePopup('loginPopup');
  	this.createNewAccount(email, password, firstName, this.avatarId);
  }
  createNewAccount(email, password, firstName, avatarId) {
  	const url = getHostname()+"/login.php";
  	const postData = {
	    method: 'POST', 
	    headers: new Headers(),
	    body: JSON.stringify({email:email, password:password, firstName:firstName, avatarId:avatarId, action:'createAccount'})
    	};

  	fetch(url, postData).then( (resp) => resp.json())
  	.then(data=>{ 
 	  	this.showPopup('busyPopup');
 	  	//alert(JSON.stringify(data));
  		if(!data || data.status !='success') {
  			this.showAlertPopup(data.errorMsg);
  		} else {
  			this.setUserDefaults(data.email, data.username, password);
  		}
 	}) 
  	.catch(error=>alert(error));
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var togglePopup:any;
declare var gCards:any;
declare var showThisPopup:any;
declare var pad:any;
declare var saveGame:any;
declare var loadGame:any;
declare var getHostname:any;
declare var closePopup:any;
declare var numberVal:any;


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  public gameObj:any;
  public youPlayer:any;
  public selectedPlayer:any;
  public selectedCard:any;
  public advanceButtonMessage:any;
  public cards=gCards;
  public playingCards=[];
  public secondsRemaining=0;
  public refreshSeconds=10;
  public discoveryFind='';
  public timer='';
  public testMode = false;
  public timerFlg = false;
  public refreshingFlg = false;
  public serverUpdate = {readyFlg: false, playerFlg: false, gameFlg: false, testFlg: false};
  
  constructor(private router: Router) { }

  ngOnInit() {
  	//localStorage.gameId=5;
  	console.log('localStorage.gameId', localStorage.gameId);

  	if(localStorage.gameId>0)
		this.postGameRequest(JSON.stringify({gameId:localStorage.gameId, username: localStorage.username, email:localStorage.email, password:localStorage.password, action: 'loadGame'}), 'loadGame');
  	else
	  	this.loadThisGame();
  }
  postGameRequest(body, action='') {
	this.refreshSeconds=6;
  //	this.showPopup('busyPopup');
  	const url = getHostname()+"/copsGame.php";
  	const postData = {
	    method: 'POST', 
	    headers: new Headers(),
	    body: body
    	};

  	fetch(url, postData).then( (resp) => resp.json())
  	.then(data=>{ 
 	  	//this.showPopup('busyPopup');
 	  	//console.log('postGameRequest', JSON.stringify(data));
 	  	//alert(JSON.stringify(data));
  		if(!data || data.netStatus !='success') {
  			this.showAlertPopup(data.errorMsg || data.status);
  		} else {
  			if(1 || action=='loadGame') {
  				var gameObj=data;
  				console.log('refreshType', gameObj.refreshType);
  				if(gameObj.refreshType=='full')
  					this.gameObj=gameObj;
  					
   				if(gameObj.readyFlags && gameObj.readyFlags.length>0)
   					this.updateReadyFlags(gameObj.readyFlags);
   					
 				this.gameObj.spf=false;
			  	this.serverUpdate.readyFlg=false;
			  	this.serverUpdate.playerFlg=false;
			  	this.serverUpdate.gameFlg=false;
  				this.saveThisGame();
  			} else
	  			this.showAlertPopup('action '+action);
  		}
 	}) 
  	.catch(error=> { console.log('error!!!'); this.showAlertPopup('Whoa!! '+error); } );
  }
  updateReadyFlags(middleFlags) {
  	var flags = middleFlags.split(':');
  	console.log('flags', flags);
  	var i=0;
  	var allReadyFlg=true;
  	this.gameObj.players.forEach(function(player) {
		player.checkFlg=(flags[i++]=='Y');
		if(!player.checkFlg)
			allReadyFlg=false;
	});
  	this.gameObj.allReadyFlg=allReadyFlg;
  }
  showPopup(name) {
  	togglePopup(name);
  }
  selectCard(card) {
  	this.selectedCard=card;
  	showThisPopup('selectedCardPopup', true);
  	this.selectedPlayer=null;
  }
  dismisCard() {
  	this.showPopup('selectedCardPopup');
  }
  readyButtonPressed() {
  	this.youPlayer.checkFlg=true;
  	this.serverUpdate.readyFlg=true;
  	if(this.gameObj.hostFlg)
		this.checkForAdvance();
	this.serverUploadButtonPressed();
  }
  readyAllButtonPressed() {
  	this.serverUpdate.readyFlg=true;
  	this.gameObj.players.forEach(function(player) {
		player.checkFlg=true;
	});
	this.checkForAdvance();
  }
  arrestButtonPressed() {
  	this.youPlayer.checkFlg=true;
  	this.gameObj.discoveryAction=0;
  	this.youPlayer.arrestId = this.selectedPlayer.id;
  	this.youPlayer.arrestCardId = this.selectedPlayer.cardId;
  	this.youPlayer.arrestName = this.selectedPlayer.name;
  	this.selectedPlayer=null;
  	this.checkForAdvance();
  	this.serverUpdate.readyFlg=true;
  	this.serverUpdate.playerFlg=true;
	this.serverUploadButtonPressed();
  }
  checkForAdvance() {
	var allReadyFlg=true;
	this.gameObj.players.forEach(function(player) {
		if(!player.checkFlg)
			allReadyFlg=false;
	});
  	this.gameObj.allReadyFlg=allReadyFlg;
	this.setAdvanceButtonMessage();
  }
  advanceButtonPressed() {
  	if(this.gameObj.players.length<4) {
  		this.showAlertPopup('You must have at least 4 players to play!');
  		return;
  	}
	this.advanceGame();
	this.setAdvanceButtonMessage();
	this.serverUpdate.gameFlg=true;
	this.serverUploadButtonPressed();
  }
  getCardList() {
  	var cardList = [];
  	var allCards = [6,1,7,3,10,2,6,1,8,4,9,4,11,5,6,1,6,1,6,1];
	if(this.gameObj.players.length<=6 && Math.floor((Math.random() * 2))==0)
		allCards = [6,1,7,3,8,2,6,1,10,4,9,4,11,5,6,1,6,1,6,1];

	for(var i=0; i<this.gameObj.players.length; i++) {
		cardList.push(allCards[i]);
	}
	cardList.push(allCards[this.gameObj.players.length]);
	cardList.push(allCards[this.gameObj.players.length+1]);
	cardList.push(allCards[this.gameObj.players.length+2]);
	
	var shuffleNum = Math.floor((Math.random() * 6));
	for(var i=0; i<shuffleNum; i++) {
		var card = cardList.shift();
		cardList.push(card);
	}
  	
  	return cardList;
  }
  populatePlayingCards() {
	var cardListArray = this.getCardList();
	this.gameObj.cardListStr = cardListArray.join(':');
	this.cardListFromCardStr();
  }
  cardListFromCardStr() {
  	this.playingCardsCardStr();
	this.gameObj.middleCards=[];
	this.gameObj.arrestedPlayer=null;
	this.youPlayer.card=gCards[0];
  }
  playingCardsCardStr() {
  	if(!this.gameObj.cardListStr || this.gameObj.cardListStr.length==0 || Array.isArray(this.gameObj.cardListStr))
  		return;
	console.log('playingCardsCardStr', this.gameObj.cardListStr);
 	var cardList = this.gameObj.cardListStr.split(':');
	var sortedCardList = cardList.sort(function(a,b){return a-b});
  	this.playingCards = [];
  	for(var i=0; i<cardList.length; i++) {
  		this.playingCards.push(gCards[sortedCardList[i]]);
  	}
	this.gameObj.sortedCardList = sortedCardList;
	this.gameObj.cardList = cardList;
  }
  populatePlayerCardsFromCardListStr() {
  	var middleCards = [];
  	var shuffledCards = [];
  	if(!this.gameObj || !this.gameObj.cardListStr || this.gameObj.cardListStr.length==0 || Array.isArray(this.gameObj.cardListStr))
  		return;
	console.log('populatePlayerCardsFromCardListStr', this.gameObj.cardListStr);
  	var cardList = this.gameObj.cardListStr.split(':');
  	for(var i=0; i<cardList.length; i++) {
  		shuffledCards.push(gCards[cardList[i]]);
  	}

  	if(shuffledCards.length<=this.gameObj.players.length) {
  		alert('shuffledCards error'+shuffledCards.length);
  		return;
  	}
  	var numMax = Math.ceil(this.gameObj.players.length/2);
  	var copCount = 0;
  	var criminalCount = 0;
  	var cardNum=1;
	this.gameObj.players.forEach(function(player) {
			
	  	var card;
		card = shuffledCards.shift();
		if( (copCount==numMax && !card.criminalFlg) || (criminalCount==numMax && card.criminalFlg)) {
			shuffledCards.push(card);
			card = shuffledCards.shift();
		}
		if(card.criminalFlg)
			criminalCount++;
		else
			copCount++;
		card.cardNum = cardNum++;
		player.card = card;
		player.cardId = player.card.id;
		player.criminalFlg=player.card.criminalFlg;
	});
	var num = shuffledCards.length;
	cardNum=-3;
	for(var i=0; i<num; i++) {
		var card = shuffledCards.shift();
		card.cardNum = cardNum++;
		card.peekList = [];
		middleCards.push(card);
	}
	this.gameObj.middleCards = middleCards;
  }
  setDiscoverAction() {
  	this.gameObj.discoveryAction=0;
  	if(!this.youPlayer)
  		return;
  	if((!this.youPlayer.leftId || !this.youPlayer.rightId) && this.gameObj.phase!='Joining')
  		this.gameObj.discoveryAction=99;
  		
  	var peekId = numberVal(this.youPlayer.peekId);
  	if(this.gameObj.phase=='Discovery') {
  		if(this.youPlayer.cardId==6 && peekId==0)
  			this.gameObj.discoveryAction=1;
  		if(this.youPlayer.cardId==7 && peekId==0)
  			this.gameObj.discoveryAction=1;
  		if(this.youPlayer.cardId==8 && this.youPlayer.middlePeekId==0)
  			this.gameObj.discoveryAction=2;
  		if(this.youPlayer.cardId==9 && this.gameObj.middleTurnList.length<2) {
  			this.gameObj.discoveryAction=4;
  			this.youPlayer.turnCount=0;
  		}
  		if(this.youPlayer.cardId==10 && this.youPlayer.switchCards.length==0)
  			this.gameObj.discoveryAction=5;
  		if(this.youPlayer.cardId==11 && this.youPlayer.middlePeekId==0)
  			this.gameObj.discoveryAction=2;
  			
  		if(this.youPlayer.criminalFlg && peekId==0) {
	  		this.gameObj.discoveryAction=3;
  		}
  	}
  	if(this.gameObj.phase=='Make an Arrest' && this.youPlayer.arrestId==0) {
		this.gameObj.discoveryAction=99;
  	}
  }
  syncGameWithBoard() {
  	console.log('==>syncGameWithBoard ', this.gameObj.phase);
  	this.playingCardsCardStr();
  	if(this.gameObj.phase!='Dealing Cards')
	  	this.populatePlayerCardsFromCardListStr();
  	this.selectedCard = gCards[0];
  	if(this.gameObj.phase=='Discovery')
		this.checkForDiscoveryFind();
  	this.loadBoardForGame();
  	if(this.gameObj.phase=='Discussion') {
  		this.secondsRemaining=120-this.gameObj.seconds;
  		if(!this.timerFlg)
	  		this.startTimer();
  	}
 	
  	this.setAdvanceButtonMessage();
  	this.checkForDiscoveryFind();
  	this.setDiscoverAction();
	this.selectedPlayer=null;
	if(this.gameObj.spf)
		this.resetCheckMarks();
  }
  advanceGame() {
  	this.selectedPlayer=null;
  	this.gameObj.allReadyFlg=false;
  	this.gameObj.discoveryAction=0;
  	this.serverUpdate.gameFlg=true;
  	
  	if(this.gameObj.phase=='Joining') {
  		this.gameObj.phase="Dealing Cards";
		return;
  	}
  	if(this.gameObj.phase=='Dealing Cards' || this.gameObj.phase=='End of Round') {
  		this.gameObj.phase="Discovery";
  		this.populatePlayingCards();
  		this.populatePlayerCardsFromCardListStr();
		return;
  	}
  	if(this.gameObj.phase=='Discovery') {
  		this.gameObj.phase="Discussion";
  		this.secondsRemaining=120;
  		this.startTimer();
  		return;
  	}
  	if(this.gameObj.phase=='Discussion') {
  		this.gameObj.phase="Make an Arrest";
  		return;
  	}
  	if(this.gameObj.phase=='Make an Arrest') {
  		this.gameObj.phase="Points Awarded";
  		this.scoreThisGame();
  		return;
  	}
  	if(this.gameObj.phase=='Points Awarded') {
  		this.gameObj.phase="Dealing Cards";
  		this.gameObj.round++;
  		this.resetPlayersForNewRound();
	  	this.populatePlayingCards();
	  	this.serverUpdate.gameFlg=true;
  		return;
  	}
  }
  startTimer() {
  	this.timerFlg=true;
  	if(this.secondsRemaining<0)
  		this.secondsRemaining=0;
  	var timerDelay = (this.gameObj.spf)?10:1000;
  	var min = Math.floor(this.secondsRemaining/60);
  	var seconds = this.secondsRemaining-(min*60);
  	this.timer=min+':'+pad(seconds);
  	this.secondsRemaining--;
  	if(this.secondsRemaining>=0)
	  	setTimeout(()=> { this.startTimer(); }, timerDelay);
	else {
		this.timerFlg=false;
	}
  }
  
  scoreThisGame() {
  	var playerIdHash = {};
  	var winningPlayerId;
  	var mostPoints=0;
	for(var i=0; i<this.gameObj.players.length; i++) {
		var player = this.gameObj.players[i];
		if(player.arrestId && player.arrestId>0) {
			if(playerIdHash[player.arrestId])
				playerIdHash[player.arrestId]++;
			else
				playerIdHash[player.arrestId]=1;
			if(playerIdHash[player.arrestId]>mostPoints) {
				mostPoints=playerIdHash[player.arrestId];
				winningPlayerId=player.arrestId;
			}
		}
	}
	for(var i=0; i<this.gameObj.players.length; i++) {
		var player = this.gameObj.players[i];
		if(player.id==winningPlayerId)
			this.gameObj.arrestedPlayer = player;
	}
	console.log(mostPoints, winningPlayerId);
	console.log(this.gameObj.players);
	var gamePointsStr = '';
	for(var i=0; i<this.gameObj.players.length; i++) {
		var player = this.gameObj.players[i];
		var gamePoints = this.gamePointsForPlayer(player);
		player.gamePoints = gamePoints;
		player.points += gamePoints;
		gamePointsStr += gamePoints.toString()+':';
		if(player.points>=20) {
			player.winnerFlg=true;
			this.gameObj.phase="Game Over!";
			this.gameObj.winningPlayerId=player.id;
			this.gameObj.winningPlayer=player;
		}
	};
  	this.serverUpdate.gameFlg=true;
	this.gameObj.arrestedPlayerId=this.gameObj.arrestedPlayer.id;
  	this.gameObj.phase='addPoints';
	this.gameObj.gamePoints = gamePointsStr;
	console.log('gamePointsStr', gamePointsStr);
  }
  gamePointsForPlayer(player) {
	player.wonFlg=this.gameObj.arrestedPlayer.criminalFlg != player.criminalFlg;
	var points = 0;
	if(player.cardId==1 && player.wonFlg)
		points=3;
	if(player.cardId==2) { //remorseful
		if(player.wonFlg)
			points=2;
		if(this.gameObj.arrestedPlayer.cardId==2)
			points=8;
	}
	if(player.cardId==3) { //hitman
		if(player.wonFlg)
			points=1;
		if(player.leftId==this.gameObj.arrestedPlayer.id || player.rightId==this.gameObj.arrestedPlayer.id)
			points+=5;
	}
	if(player.cardId==4) { //snitch
		if(player.wonFlg)
			points=2;
		if(this.gameObj.arrestedPlayer.cardId==4 && this.gameObj.arrestedPlayer.id!=player.id)
			points+=8;
	}
	if(player.cardId==5) { //boss
		if(player.wonFlg)
			points=1;
		if(this.gameObj.arrestedPlayer.cardId==4 || this.gameObj.arrestedPlayer.cardId==2)
			points+=4;
	}
	if(player.criminalFlg && this.gameObj.arrestedPlayer.cardId==11)
		points+=3;
		
	//----cops----
	if(player.cardId==6 && player.wonFlg) //cop
		points=3;
	if(player.cardId==7) {	//guard
		if(player.wonFlg)
			points=2;
		if(player.leftId!=this.gameObj.arrestedPlayer.id && player.rightId!=this.gameObj.arrestedPlayer.id && player.id!=this.gameObj.arrestedPlayer.id)
			points+=3;
	}
	if(player.cardId==8 && player.wonFlg) // detective
		points=3;
	if(player.cardId==9 && player.wonFlg) // forensic
		points=3;
	if(player.cardId==10) {	// bumbler
		if(player.wonFlg)
			points=2;
		if(this.gameObj.arrestedPlayer.cardId==2)
			points+=5;
	}
	if(player.cardId==11) {	//chief
		if(player.wonFlg)
			points=2;
		if(player.arrestCardId==5)
			points+=3;
	}
	if(!player.criminalFlg && this.gameObj.arrestedPlayer.cardId==5)
		points+=3;

  	return points;
  }
  resetCheckMarks() {
	this.selectedPlayer=null;
  	this.gameObj.allReadyFlg=false;
  	var spf = this.gameObj.spf;
	this.gameObj.players.forEach(function(player) {
		if(spf && !player.youFlg)
			player.checkFlg=true;
		else
			player.checkFlg=false;
	});
	this.setDiscoverAction();
  	this.serverUpdate.readyFlg=false;
  	this.serverUpdate.playerFlg=false;
  	this.serverUpdate.gameFlg=false;
  }
  resetButtonPressed() {
  	var card = gCards[0];
  	var players = [
  		{id: 1, name: 'bill', avatar: 'avatar2.png', avatarId: 2, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		{id: 2, name: 'chuck', avatar: 'avatar4.png', avatarId: 4, points: 0, gamePoints: 0, cardId: 0, card: card, wonFlg: false, revealFlg: false},
  		{id: 3, name: 'anne', avatar: 'avatar13.png', avatarId: 3, points: 0, gamePoints: 0, cardId: 0, checkFlg: true, card: card, wonFlg: false, revealFlg: false},
  		{id: 4, name: 'Rick', avatar: 'avatar5.png', avatarId: 5, points: 0, gamePoints: 0, cardId: 0, card: card, wonFlg: false, revealFlg: false, hostFlg: true},
  		{id: 5, name: 'bob', avatar: 'avatar6.png', avatarId: 6, points: 0, gamePoints: 0, cardId: 0, card: card, wonFlg: false, revealFlg: false},
  		{id: 6, name: 'joan', avatar: 'avatar1.png', avatarId: 1, points: 0, gamePoints: 0, cardId: 0, card: card, wonFlg: false, revealFlg: false},
  		];
  	
  	this.gameObj = {name: 'test name', spf: true, host: 'Rick', status: 'Playing', round: 1, phase: 'Joining', players: players, hostFlg: true, allReadyFlg: false, cardList: []};
	if(!localStorage.username || localStorage.username.length==0)
		this.showAlertPopup('You are not logged in!!!');
	else
		this.playAgainButtonPressed();
  	this.gameObj.phase="Joining";
  }
  resetPlayersForNewRound() {
  	var youPlayer;
  	var username = localStorage.username;
  	this.discoveryFind='';
	this.gameObj.players.forEach(function(player) {
		player.cardId=0;
	  	player.card = gCards[0];
	  	player.peekId=0;
	  	player.switchCards='';
	  	player.middlePeekId=0;
	  	player.revealFlg=false;
	  	player.arrestName='';
		player.criminalFlg=false;
		if(player.name==username) {
			youPlayer=player;
			player.youFlg=true;
		}
	});
	this.gameObj.arrestedPlayerId=0;
	this.gameObj.arrestedPlayer=null;
	this.youPlayer = youPlayer;
  	if(this.youPlayer)
  		this.youPlayer.card = gCards[0];
	else
	  	this.showAlertPopup('You are not in this game!!!');
  }
  playAgainButtonPressed() {
  	this.resetPlayersForNewRound();
	this.gameObj.players.forEach(function(player) {
		player.points=0;
	});
  	this.resetCheckMarks();
  	this.populatePlayingCards();
  	this.gameObj.status='Playing';
  	if(this.gameObj.phase!='Joining')
  		this.gameObj.phase="Dealing Cards";
  }
  showAlertPopup(message) {
	this.showPopup('messagePopup');
	var e = document.getElementById('popupMessageText');
	if(e) {
		e.innerHTML = message;
	} else
		alert('not found: popupMessageText');
	
  }
  redoLeftRightButtonPressed() {
  	this.youPlayer.leftId=0;
  	this.youPlayer.rightId=0;
  }
  clickPlayer(player) {
  	var prevSelectedFlg = this.selectedPlayer && this.selectedPlayer.selectedFlg;
  	if(this.gameObj.discoveryAction==5 && prevSelectedFlg) {
  		this.youPlayer.switchCards = this.selectedPlayer.id+':'+player.id;
  		this.showAlertPopup(this.selectedPlayer.name+' and '+player.name+' cards have been switched!');
	  	this.serverUpdate.playerFlg=true;
  		this.gameObj.discoveryAction=0;
  	}

  	if(player.selectedFlg && this.selectedPlayer) {
	  	player.selectedFlg=false;
  		this.selectedPlayer=null;
  	} else {
	  	player.selectedFlg=true;
  		this.selectedPlayer=player;
  	}
  	if(this.gameObj.phase=='Joining')
  		return;
  	if(!this.youPlayer.leftId) {
  		if(player.id==this.youPlayer.id) {
  			this.showAlertPopup('Cannot be yourself! click on the player sitting on your left.');
  			return;
  		}
  		this.youPlayer.leftId=player.id;
  		this.youPlayer.leftName=player.name;
	  	this.serverUpdate.playerFlg=true;
  		return;
  	}
  	if(!this.youPlayer.rightId) {
  		if(player.id==this.youPlayer.id || player.id==this.youPlayer.leftId) {
  			this.showAlertPopup('Cannot be yourself or the player to your left! click on the player sitting on your right.');
  			return;
  		}
  		this.youPlayer.rightId=player.id;
  		this.youPlayer.rightName=player.name;
	  	this.serverUpdate.playerFlg=true;
	  	this.gameObj.discoveryAction=0;
  		return;
  	}
  	if((this.gameObj.discoveryAction==1 || this.gameObj.discoveryAction==3) && player.revealFlg==false) {
  		this.gameObj.discoveryAction=0;
	  	player.revealFlg=true;
	  	this.youPlayer.peekId = player.id;
	  	this.selectedCard=player.card;
	  	this.serverUpdate.playerFlg=true;
	  	console.log('gameObj', this.gameObj);
	}
  }
  clickMiddleCard(card) {
  	if((this.gameObj.discoveryAction==2 || this.gameObj.discoveryAction==4) && !card.revealFlg) {
  		card.revealFlg=true;
  		if(this.gameObj.discoveryAction==4) {
  			this.youPlayer.turnCount++;
  			card.faceUpFlg = true;
  			this.gameObj.middleTurnList.push(card.cardNum);
	  	}
	  	if(this.gameObj.discoveryAction==2 || this.youPlayer.turnCount>=2)
	  		this.gameObj.discoveryAction=0;
	  	this.youPlayer.middlePeekId = card.cardNum;
	  	console.log(this.gameObj);
  	}
  	if(card.revealFlg)
  		this.selectCard(card);
  	else
  		this.selectCard(gCards[0]);
  }
  playerStyles(selFlag, criminalFlg) {
  	if(selFlag)
  		return {'background-color': 'yellow'};
  	if(criminalFlg)
  		return {'background-color': 'orange'};
  }
  setAdvanceButtonMessage() {
  	this.advanceButtonMessage='Advance Game';
  	if(this.gameObj.phase=='Joining')
  		this.advanceButtonMessage='Start Game!';
  	if(this.gameObj.phase=='Dealing Cards')
  		this.advanceButtonMessage='Deal Cards';
  	if(this.gameObj.phase=='Discovery')
  		this.advanceButtonMessage='Start Discussion';
  	if(this.gameObj.phase=='Discussion')
  		this.advanceButtonMessage='Discussion Complete';
  	if(this.gameObj.phase=='Make an Arrest')
  		this.advanceButtonMessage='Add Up Scores';
  	if(this.gameObj.phase=='Points Awarded')
  		this.advanceButtonMessage='Start New Round';
  }
  saveThisGame() {
  	console.log('==>saveThisGame', this.gameObj);
  	saveGame(this.gameObj);
  	this.loadThisGame();
  }
  loadThisGame() {
  	this.gameObj = loadGame(this.cards);
  	console.log('==>loadThisGame', this.gameObj);
  	this.syncGameWithBoard();
  	this.refreshSeconds=7;
  	if(!this.gameObj.spf && !this.refreshingFlg)
  		this.checkForRefreshGame();
  }
  checkForRefreshGame() {
  	this.refreshingFlg=true;
  	var e = document.getElementById('copsLogo');
  	if(!e)
  		return;
  	this.refreshSeconds--;
  	console.log('refreshGame ', this.refreshSeconds);
  	if(this.refreshSeconds>0)
	  	setTimeout(()=> { this.checkForRefreshGame(); }, 1000);
	else {
		this.refreshingFlg=false;
		console.log('refresh!');
		this.serverDownloadButtonPressed();
	}
		
  }
  addBotButtonPressed() {
  	this.startWebCall('addBot');
  }
  bootPlayerButtonPressed() {
  	this.showAlertPopup('not coded yet!');
  }
  startWebCall(action) {
  	closePopup('joinGamePopup');
  	closePopup('joinSelectedGamePopup');
	this.postGameRequest(JSON.stringify({gameId:this.gameObj.gameId, email:localStorage.email, password:localStorage.password, action: action}));
  }
  serverUploadButtonPressed() {
  	console.log('serverUploadButtonPressed', this.gameObj.spf, this.serverUpdate.readyFlg, this.serverUpdate.playerFlg, this.serverUpdate.gameFlg);
  	if(this.gameObj.spf) {
  		this.saveThisGame();
  		return;
  	}
  	if(this.serverUpdate.gameFlg)
		this.postGameRequest(JSON.stringify({gameId:this.gameObj.gameId, playerId: this.youPlayer.id, email:localStorage.email, password:localStorage.password, action: 'uploadGameFlg', gamePhase: this.gameObj.phase, gamePoints: this.gameObj.gamePoints, cardList: this.gameObj.cardListStr, arrestedPlayerId: this.gameObj.arrestedPlayerId, winningPlayerId: this.gameObj.winningPlayerId, round: this.gameObj.round}));
  	else if(this.serverUpdate.playerFlg)
		this.postGameRequest(JSON.stringify({gameId:this.gameObj.gameId, playerId: this.youPlayer.id, email:localStorage.email, password:localStorage.password, action: 'uploadPlayerFlg', arrestPlayer: this.youPlayer.arrestId, leftId: this.youPlayer.leftId, rightId: this.youPlayer.rightId, cardId: this.youPlayer.cardId, peekId: this.youPlayer.peekId, switchCards: this.youPlayer.switchCards, gamePhase: this.gameObj.phase, numPlayers: this.gameObj.players.length}));
  	else if(this.serverUpdate.readyFlg)
		this.postGameRequest(JSON.stringify({gameId:this.gameObj.gameId, playerId: this.youPlayer.id, email:localStorage.email, password:localStorage.password, action: 'uploadReadyFlg', gamePhase: this.gameObj.status, numPlayers: this.gameObj.players.length}));
	else
		this.showAlertPopup('hey, no flags set!');
  }
  serverDownloadButtonPressed() {
  	console.log('serverDownloadButtonPressed');
	this.postGameRequest(JSON.stringify({gameId:localStorage.gameId, username: localStorage.username, email:localStorage.email, password:localStorage.password, action: 'loadGame', gamePhase: this.gameObj.phase, numPlayers: this.gameObj.players.length}), 'loadGame');
  }
  checkForDiscoveryFind() {
  	this.discoveryFind='';
  	if(!this.youPlayer || !this.youPlayer.cardId || this.youPlayer.cardId==0)
  		return;
  	if(this.youPlayer.cardId!=8 && this.youPlayer.cardId!=11)
  		return;
  		
  	var criminalCount=0;
  	var bossCount=0;
  	var leftId = this.youPlayer.leftId;
  	var rightId = this.youPlayer.rightId;
	this.gameObj.players.forEach(function(player) {
		if(player.criminalFlg && leftId==player.id)
			criminalCount++;
		if(player.criminalFlg && rightId==player.id)
			criminalCount++;
		if(player.cardId==5 && leftId==player.id)
			bossCount++;
		if(player.cardId==5 && rightId==player.id)
			bossCount++;
			
	});
  	if(this.youPlayer.cardId==8) { // detective
  		if(criminalCount>0)
	  		this.discoveryFind='You are sitting next to one or more criminals!';
	  	else
	  		this.discoveryFind='No criminals are sitting by you.';
	}
  	if(this.youPlayer.cardId==11) { // detective
  		if(bossCount>0)
	  		this.discoveryFind='You are sitting next to the Crime Boss!';
	  	else
	  		this.discoveryFind='No Crime Boss sitting by you.';
	}
  }
  loadBoardForGame() {
  	var youPlayer;
  	var username = localStorage.username;
	this.gameObj.players.forEach(function(player) {
		if(player.name==username) {
			youPlayer=player;
			player.youFlg=true;
		}
	});
	this.youPlayer = youPlayer;
  }
  exitGame() {
  	if(this.gameObj.phase=='Game Over!')
	  	localStorage.inGameFlg='';
  	this.router.navigate(['']);
  }

}

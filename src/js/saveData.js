function saveGame(obj) {
//	console.log('saveGame', obj);
	var arrestedPlayerId=0;
	if(obj && obj.arrestedPlayer && obj.arrestedPlayer.id)
		arrestedPlayerId = obj.arrestedPlayer.id;
	var gameObj = {gameId: obj.gameId, name: obj.name, spf: flagOf(obj.spf), host: obj.host, status: obj.status, round: obj.round, phase: obj.phase, cardListStr: obj.cardList, discoveryAction: obj.discoveryAction, arrestedPlayerId: obj.arrestedPlayerId, winningPlayerId: obj.winningPlayerId, middleTurnList: obj.middleTurnList, readyFlags: obj.readyFlags, seconds: obj.seconds};
	var players=[];
	
	var middleCards = [];
	if(obj.middleCards && obj.middleCards.length>0) {
		obj.middleCards.forEach(function(c) {
			middleCards.push({id: c.id, cardNum: c.cardNum});
		});
	}
	gameObj.middleCards=middleCards;
	gameObj.middleCards = obj.middleCards || [];
	obj.players.forEach(function(p) {
		players.push({id: p.row_id || p.id, user_id: p.user_id, name: p.name, leftId: p.leftId, leftName: p.leftName, rightId: p.rightId, rightName: p.rightName, avatarId: p.avatarId, points: p.points, gamePoints: p.gamePoints, cardId: p.cardId || 0, checkFlg: flagOf(p.checkFlg), peekId: p.peekId, middlePeekId: p.middlePeekId, arrestId: p.arrestId, arrestCardId: p.arrestCardId, arrestName: p.arrestName, switchCards: p.switchCards});
	});
	localStorage.gameObj = JSON.stringify(gameObj);
	localStorage.players = JSON.stringify(players);
//	console.log(JSON.stringify(gameObj));
//	console.log(JSON.stringify(players));
}
function loadGame(cards) {
	var gameObj = JSON.parse(localStorage.gameObj);
	var players = JSON.parse(localStorage.players);
	var username = localStorage.username;
	gameObj.spf =  booleanOf(gameObj.spf);
	gameObj.hostFlg = (gameObj.host==username);
	var allReadyFlg=true;
	var winningPlayer;
	var winningPlayer;
  	var arrestedPlayer;
  	var arrestedPlayerId = numberVal(gameObj.arrestedPlayerId);
	players.forEach(function(p) {
		if(arrestedPlayerId==p.id)
			arrestedPlayer=p;
		if(numberVal(p.avatarId)==0)
			p.avatarId=4;
		p.avatar = 'avatar'+p.avatarId+'.png';
		p.card = cards[p.cardId];
		p.wonFlg = false;
		p.checkFlg = booleanOf(p.checkFlg);
		p.hostFlg = (p.name==gameObj.host);
		p.youFlg = (p.name==username);
		p.revealFlg = (p.name==username);
		p.criminalFlg = (p.cardId>0 && p.cardId<=5);
		if(!p.checkFlg)
			allReadyFlg=false;
		if(p.id==gameObj.arrestedPlayerId)
			gameObj.arrestedPlayer=p;
		if(gameObj.winningPlayerId>0 && gameObj.winningPlayerId==p.id)
			winningPlayer=p;
	});
	gameObj.arrestedPlayer=arrestedPlayer;
	gameObj.middleTurnList = gameObj.middleTurnList || [];
	var mid1 = 0;
	var mid2 = 0;
	if(gameObj.middleTurnList.length>0)
		mid1 = gameObj.middleTurnList[0];
	if(gameObj.middleTurnList.length>1)
		mid2 = gameObj.middleTurnList[1];
	var middleCards = [];
	gameObj.middleCards.forEach(function(c) {
		var card = cards[c.id];
		card.cardNum=c.cardNum;
		card.revealFlg=false;
		if(card.cardNum==mid1 || card.cardNum==mid2)
			card.revealFlg=true;
		middleCards.push(card);
		
	});
	gameObj.middleCards = middleCards;
	if(gameObj.winningPlayerId>0)
		gameObj.winningPlayer=winningPlayer;
	gameObj.allReadyFlg = allReadyFlg;
	gameObj.players = players;
	return gameObj;
}
function flagOf(flag) {
	return (flag)?'Y':'N';
}
function booleanOf(flag) {
	return (flag=='Y')?true:false;
}

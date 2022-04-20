<?php 
header('Access-Control-Allow-Origin: *');
include("../pages/PHP_Scripts.pm"); 
include("PokerScripts.pm"); 




$gameName = format_text_for_database($_POST['gameName']);
$host = format_text_for_database($_POST['host']);
$email = format_text_for_database($_POST['email']);
$password = format_text_for_database($_POST['password']);
$action = format_text_for_database($_POST['action']);
$gameId = format_text_for_database($_POST['gameId']);
$playerId = format_text_for_database($_POST['playerId']);
$arrestPlayer = format_text_for_database($_POST['arrestPlayer']);
$leftId = format_text_for_database($_POST['leftId']);
$rightId = format_text_for_database($_POST['rightId']);
$gamePhase = format_text_for_database($_POST['gamePhase']);
$numPlayers = format_text_for_database($_POST['numPlayers']);
$winningPlayerId = format_text_for_database($_POST['winningPlayerId']);
$arrestedPlayerId = format_text_for_database($_POST['arrestedPlayerId']);
$cardList = format_text_for_database($_POST['cardList']);
$round = format_text_for_database($_POST['round']);
$gamePoints = format_text_for_database($_POST['gamePoints']);
$peekId = format_text_for_database($_POST['peekId']);
$switchCards = format_text_for_database($_POST['switchCards']);
$code = format_text_for_database($_POST['code']);

if($gameName=="") {
	$params = json_decode(file_get_contents('php://input'),true);
	$email = format_text_for_database($params['email']);
	$password = format_text_for_database($params['password']);
	$gameName = format_text_for_database($params['gameName']);
	$host = format_text_for_database($params['host']);
	$action = format_text_for_database($params['action']);
	$gameId = format_text_for_database($params['gameId']);
	$playerId = format_text_for_database($params['playerId']);
	$arrestPlayer = format_text_for_database($params['arrestPlayer']);
	$leftId = format_text_for_database($params['leftId']);
	$rightId = format_text_for_database($params['rightId']);
	$gamePhase = format_text_for_database($params['gamePhase']);
	$numPlayers = format_text_for_database($params['numPlayers']);
	$winningPlayerId = format_text_for_database($params['winningPlayerId']);
	$arrestedPlayerId = format_text_for_database($params['arrestedPlayerId']);
	$cardList = format_text_for_database($params['cardList']);
	$round = format_text_for_database($params['round']);
	$gamePoints = format_text_for_database($params['gamePoints']);
	$peekId = format_text_for_database($params['peekId']);
	$switchCards = format_text_for_database($params['switchCards']);
	$code = format_text_for_database($params['code']);
}

if($code!="") 
	$password = base64_decode(substr($code,2));

$username = translate_username($email);

$obj->host = $host;
$obj->status = 'pending';

$dbh = db_connect();
$user_id = get_sql_item($dbh, "select row_id from POKER_USER where username = '$username'");;
if($user_id>0) {
	$name = get_sql_item($dbh, "select firstName from POKER_USER where row_id = '$user_id'");
	$pwd = get_sql_item($dbh, "select password from POKER_USER where row_id = '$user_id'");
		
	if($pwd==$password) {
		$obj->username = $name;
		$obj->status = 'validated';
		$obj->netStatus = 'validated';
		
		if($action=="createGame") {
			$avatarId = get_sql_item($dbh, "select avatarId from POKER_USER where row_id = '$user_id'");
			if($avatarId=="")
				$avatarId = 4;
			execute_sql($dbh, "insert into COPS_GAME (row_id, user_id, host, name, players, round, status, phase, created) values(null, $user_id, '$name', '$gameName', 1, 1, 'Open', 'Joining', sysdate())");
			
			$gameId = get_sql_item($dbh, "select row_id from COPS_GAME where name = '$gameName' order by row_id desc LIMIT 1");
			if($gameId>0) {
				execute_sql($dbh, "insert into COPS_PLAYER (row_id, user_id, game, name, status, avatarId, created) values(null, $user_id, $gameId, '$name', 'Joining', $avatarId, sysdate())");
				$obj->gameId = $gameId;
				$obj->status = 'success';
			}
		}
		if($action=="showOpenGames") {
			$sql = "select * from COPS_GAME  where status = 'Open'";
			$result = mysql_query($sql, $dbh);
			print mysql_error();
			$games = "";
			while($row = mysql_fetch_array($result)) {
				$row_id = $row['row_id'];
				$host = $row['host'];
				$host_id = $row['user_id'];
				$name = $row['name'];
				$players = $row['players'];
				$round = $row['round'];
				$phase = $row['phase'];
				$status = $row['status'];
				
				$hostFlg = ($host_id==$user_id)?"Y":"N";
				$count = get_sql_item($dbh, "select count(*) from COPS_PLAYER where user_id = '$user_id' AND game = '$row_id'");
				$players = get_sql_item($dbh, "select count(*) from COPS_PLAYER where game = '$row_id'");
				$inGameFlg = ($count>0)?"Y":"N";
				$games .= "$row_id|$host|$name|$players|$round|$phase|$hostFlg|$inGameFlg|$status|<a>";
			}
			$obj->status = 'success';
			$obj->games = $games;
		}
		if($action=="") {
			$obj->status = 'no action!';
		}
		if($action=="joinOpenGame" && $gameId>0) {
			$avatarId = get_sql_item($dbh, "select avatarId from POKER_USER where row_id = '$user_id'");
			if($avatarId=="")
				$avatarId = 4;
			execute_sql($dbh, "insert into COPS_PLAYER (row_id, user_id, game, name, status, avatarId, created) values(null, $user_id, $gameId, '$name', 'Joining', $avatarId, sysdate())");
			$obj->status = 'success';
		}		
		if($action=="exitGame" && $gameId>0) {
			execute_sql($dbh, "delete from COPS_PLAYER where user_id = '$user_id' AND game = '$gameId'");
			$obj->status = 'success';
		}		
		if($action=="cancelGame" && $gameId>0) {
			execute_sql($dbh, "delete from COPS_GAME where row_id = '$gameId'");
			$obj->status = 'success';
		}		
		if($action=="addBot" && $gameId>0) {
			$players = get_sql_item($dbh, "select count(*) from COPS_PLAYER where game = '$gameId'");
			$uid = 100+$players;
			$uName = get_sql_item($dbh, "select firstName from POKER_USER where row_id = '$uid'");
			execute_sql($dbh, "insert into COPS_PLAYER (row_id, user_id, avatarId, game, name, status, created) values(null, $uid, $players, $gameId, '$uName', 'Joining', sysdate())");
			$obj->status = 'success';
		}		
		if($action=="uploadReadyFlg" && $gameId>0) {
			execute_sql($dbh, "update COPS_PLAYER set checkFlg = 'Y' where row_id = '$playerId'");
			$obj->netStatus = 'success';
			$action="loadGame";
		}
		if($action=="uploadPlayerFlg" && $gameId>0) {
			execute_sql($dbh, "update COPS_PLAYER set checkFlg = 'Y', arrestPlayer = '$arrestPlayer', leftId = '$leftId', rightId = '$rightId', peekId = '$peekId', switchCards = '$switchCards' where row_id = '$playerId'");
			$obj->netStatus = 'success';
			$action="loadGame";
		}
		if($action=="uploadGameFlg" && $gameId>0) {
			$oldRound = get_sql_item($dbh, "select round from COPS_GAME where row_id = '$gameId'");
			$oldPhase = get_sql_item($dbh, "select phase from COPS_GAME where row_id = '$gameId'");
			execute_sql($dbh, "update COPS_PLAYER set checkFlg = '' where game = '$gameId'");
			execute_sql($dbh, "update COPS_GAME set middleFlags = '', phase = '$gamePhase', cardList = '$cardList', arrestedPlayerId = '$arrestedPlayerId', winningPlayerId = '$winningPlayerId', round = '$round' where row_id = '$gameId'");
			$obj->oldPhase = $oldPhase;
			$obj->newPhase = $gamePhase;
			if($oldPhase=="Discovery" && $gamePhase=="Discussion")
				execute_sql($dbh, "update COPS_GAME set timerStamp = sysdate() where row_id = '$gameId'");
				
			$status = get_sql_item($dbh, "select status from COPS_GAME where row_id = '$gameId'");
			if($status=="Open")
				execute_sql($dbh, "update COPS_GAME set status = 'Playing' where row_id = '$gameId'");
			
			if($oldRound != $round) {
				execute_sql($dbh, "update COPS_PLAYER set arrestPlayer = '0', middleFlags = '', cardId = '0', peekId = '0', switchCards = '' where game = '$gameId'");
			}
			if(strlen($gamePoints)>0 && $gamePhase=="addPoints") {
				$gamePhase="Points Awarded";
				$pointArray = split(':', $gamePoints);
				$sql = "select * from COPS_PLAYER where game = '$gameId' order by row_id";
				$result = mysql_query($sql, $dbh);
				print mysql_error();
				$i=0;
				$winningPlayerId=0;
				while($row = mysql_fetch_array($result)) {
					$row_id = $row['row_id'];
					$points = $row['points'];
					
					$gamePoints = $pointArray[$i++];
					$points+=$gamePoints;
					if($points>=20) {
						$gamePhase="Game Over!";
						$winningPlayerId=$row_id;
					}
					execute_sql($dbh, "update COPS_PLAYER set gamePoints = '$gamePoints', points = '$points' where row_id = '$row_id'");
				}
				execute_sql($dbh, "update COPS_GAME set phase = '$gamePhase', winningPlayerId = '$winningPlayerId' where row_id = '$gameId'");
			}
			$obj->netStatus = 'success';
			$action="loadGame";
		}
		if($action=="loadGame" && $gameId>0) {
			$obj->refreshType = "noChange";
			$sql = "select * from COPS_GAME  where row_id = '$gameId'";
			$result = mysql_query($sql, $dbh);
			print mysql_error();
			$games = "";
			while($row = mysql_fetch_array($result)) {
				$row_id = $row['row_id'];
				$gameName = $row['name'];
				$host = $row['host'];
				$round = $row['round'];
				$status = $row['status'];
				$phase = $row['phase'];
				$cardList = $row['cardList'];
				$arrestedPlayerId = $row['arrestedPlayerId'];
				$winningPlayerId = $row['winningPlayerId'];
				$middleFlags = $row['middleFlags'];
				$timerStamp = $row['timerStamp'];
			}
			$obj->gameId = $row_id;
			$obj->netStatus = 'success';
			$obj->name = $gameName;
			$obj->host = $host;
			$obj->round = $round;
			$obj->status = $status;
			$obj->phase = $phase;
			$obj->cardList = $cardList;
			$obj->arrestedPlayerId = $arrestedPlayerId;
			$obj->winningPlayerId = $winningPlayerId;
			$obj->readyFlags = $middleFlags;
			
			$seconds="1";
			if(strlen($timerStamp)>0 && $phase=="Discussion")
				$seconds = get_sql_item($dbh, "select TIMESTAMPDIFF(SECOND, timerStamp, sysdate()) from COPS_GAME where row_id = $gameId");
			$obj->seconds = $seconds;
			
			
			$players = array();
			$sql = "select * from COPS_PLAYER where game = '$gameId' order by row_id";
			$result = mysql_query($sql, $dbh);
			print mysql_error();
			$games = "";
			$middleFlags2 = "";
			$numP=0;
			while($row = mysql_fetch_array($result)) {
				$numP++;
				$p1 = new stdClass();
				$p1->row_id = $row['row_id'];
				$p1->user_id = $row['user_id'];
				$p1->name = $row['name'];
				$p1->points = $row['points'];
				$p1->card = $row['card'];
				$p1->cardId = $row['cardId'];
				$p1->arrestPlayer = $row['arrestPlayer'];
				$p1->cardName = $row['cardName'];
				$p1->status = $row['status'];
				$leftId = $row['leftId'];
				$rightId = $row['rightId'];
				$p1->leftId = $leftId;
				$p1->rightId = $rightId;
				$p1->arrestId = $row['arrestPlayer'];
				$p1->peekId = $row['peekId'];
				$p1->switchCards = $row['switchCards'];
				if($leftId>0)
					$p1->leftName = get_sql_item($dbh, "select name from COPS_PLAYER where row_id = '$leftId'");
				if($rightId>0)
					$p1->rightName = get_sql_item($dbh, "select name from COPS_PLAYER where row_id = '$rightId'");
				$p1->avatarId = $row['avatarId'];
				$p1->gamePoints = $row['gamePoints'];
				$checkFlg = $row['checkFlg'];
				$p1->checkFlg = $checkFlg;
				$middleFlags2 .= $checkFlg.":";
				$p1->peekList = $row['peekList'];
				$p1->readyFlags = $row['middleFlags'];
				array_push($players, $p1);
			}
			if($middleFlags2 != $middleFlags) {
				execute_sql($dbh, "update COPS_GAME set middleFlags = '$middleFlags2' where row_id = '$gameId'");
				$obj->refreshType = "middleFlags";
				$obj->readyFlags = $middleFlags2;
			}
			if($gamePhase != $phase || $numPlayers != $numP) {
				$obj->refreshType = "full";
				$obj->players = $players;
				$obj->numPlayers = $numPlayers;
				$obj->numP = $numP;
			}
		}
		
		
	} else {
		$obj->errorMsg = "invalid password";
	}
} else {
	$obj->errorMsg = "email $email not found";
}

$json = json_encode($obj);

print $json;


db_close($dbh);

?>
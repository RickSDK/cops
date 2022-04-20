<?php 
header('Access-Control-Allow-Origin: *');
include("../pages/PHP_Scripts.pm"); 
include("PokerScripts.pm"); 




$gameName = format_text_for_database($_POST['gameName']);
$host = format_text_for_database($_POST['host']);
$email = format_text_for_database($_POST['email']);
$password = format_text_for_database($_POST['password']);
$action = format_text_for_database($_POST['action']);

if($gameName=="") {
	$params = json_decode(file_get_contents('php://input'),true);
	$email = format_text_for_database($params['email']);
	$password = format_text_for_database($params['password']);
	$gameName = format_text_for_database($params['gameName']);
	$host = format_text_for_database($params['host']);
	$action = format_text_for_database($params['action']);
}

$username = translate_username($email);

$obj->gameName = $gameName;
$obj->host = $host;
$obj->status = 'pending';

$dbh = db_connect();
$user_id = get_sql_item($dbh, "select row_id from POKER_USER where username = '$username'");;
if($user_id>0) {
	$name = get_sql_item($dbh, "select firstName from POKER_USER where row_id = '$user_id'");
	$pwd = get_sql_item($dbh, "select password from POKER_USER where row_id = '$user_id'");
	if($pwd==$password) {
		
		if($action=="createGame") {
			execute_sql($dbh, "insert into COPS_GAME (row_id, user_id, host, name, players, round, status, phase, created) values(null, $user_id, '$name', '$gameName', 1, 0, 'Open', 'Joining', sysdate())");
			$gameId = get_sql_item($dbh, "select row_id from COPS_GAME where name = '$gameName' order by row_id desc LIMIT 1");
			if($gameId>0) {
				execute_sql($dbh, "insert into COPS_PLAYER (row_id, user_id, game, name, status, created) values(null, $user_id, $gameId, '$name', 'Joining', sysdate())");
				$obj->username = $name;
				$obj->status = 'success';
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
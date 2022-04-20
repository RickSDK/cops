<?php 
header('Access-Control-Allow-Origin: *');
include("../pages/PHP_Scripts.pm"); 
include("PokerScripts.pm"); 




$email = format_text_for_database($_POST['email']);
$password = format_text_for_database($_POST['password']);
$firstName = format_text_for_database($_POST['firstName']);
$avatarId = format_text_for_database($_POST['avatarId']);
$action = format_text_for_database($_POST['action']);

if($email=="") {
	$params = json_decode(file_get_contents('php://input'),true);
	$email = format_text_for_database($params['email']);
	$password = format_text_for_database($params['password']);
	$firstName = format_text_for_database($params['firstName']);
	$avatarId = format_text_for_database($params['avatarId']);
	$action = format_text_for_database($params['action']);
}

$username = translate_username($email);

$obj->email = $email;
$obj->password = $password;
$obj->status = 'pending';

$dbh = db_connect();

if($action=="createAccount") {
	$row_id = get_sql_item($dbh, "select row_id from POKER_USER where alias_name = '$username'");
	if($row_id>0) {
		$obj->errorMsg =  "That email already is use. Click 'Forgot Pass' to have it emailed to you.";
		$json = json_encode($obj);		
		print $json;
		db_close($dbh);
		exit;
	}
	execute_sql($dbh, "insert into POKER_USER (row_id, username, email, firstName, password, alias_name, avatarId, created) values(null, '$username', '$email', '$firstName', '$password', '$username', '$avatarId', sysdate())");
}

$user_id = get_sql_item($dbh, "select row_id from POKER_USER where username = '$username'");;
if($user_id>0) {
	$name = get_sql_item($dbh, "select firstName from POKER_USER where row_id = '$user_id'");
	$pwd = get_sql_item($dbh, "select password from POKER_USER where row_id = '$user_id'");
	if($pwd==$password) {
		$obj->username = $name;
		$obj->status = 'success';
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
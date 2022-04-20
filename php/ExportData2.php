<?php 
include("../pages/PHP_Scripts.pm"); 

$Username = $_POST['Username'];
$Password = $_POST['Password'];
$data = $_POST['data'];
$numGames = $_POST['numGames'];
$blockNum = $_POST['blockNum'];

$alias_name = translate_username($Username);
$Username = format_text_for_database($Username);
$Password = format_text_for_database($Password);
$blockNum = format_text_for_database($blockNum);

if($Username=="") {
	print "No username received";
	exit;
}

if($Password=="") {
	print "No password received";
	exit;
}

$dbh = db_connect();

$user_id = get_sql_item($dbh, "select row_id from POKER_USER where alias_name = '$alias_name'");
if($user_id==0) {
	print "Sorry, user for email ($Username) not found on server!";
	exit;
}

$pswd = get_sql_item($dbh, "select password from POKER_USER where alias_name = '$alias_name'");
if($pswd != $Password) {
	print "Sorry, password credentials for $Username do no match what's on the server!";
	exit;
}

$row_id = get_sql_item($dbh, "select row_id from PTP_GAME_DATA where user_id = '$user_id' and blockNum = '$blockNum'");
$data = format_text_for_database($data);
if($row_id>0) {
	$oldData = get_sql_item($dbh, "select data from PTP_GAME_DATA where row_id = '$row_id'");
	$backupData = get_sql_item($dbh, "select backupData from PTP_GAME_DATA where row_id = '$row_id'");
	execute_sql($dbh, "update PTP_GAME_DATA set data = '$data', lastUpd = sysdate() where row_id = '$row_id'");
	if(strlen($oldData) > strlen($data) && strlen($oldData) > strlen($backupData))
		execute_sql($dbh, "update PTP_GAME_DATA set backupData = '$oldData' where row_id = '$row_id'");
	
} else {
	execute_sql($dbh, "insert into PTP_GAME_DATA(row_id, user_id, data, created, blockNum, lastUpd) values(null, '$user_id', '$data', sysdate(), '$blockNum', sysdate())");
}

$row_id = get_sql_item($dbh, "select row_id from PTP_GAME_DATA where user_id = '$user_id' and blockNum = '$blockNum'");
if($row_id>0) {
	execute_sql($dbh, "update PTP_GAME_DATA set numGames = '$numGames' where row_id = '$row_id'");
	print "Success";
} else
	print "Sorry, bad data transfer";



?>
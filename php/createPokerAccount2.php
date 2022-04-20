<?php 

include("../pages/PHP_Scripts.pm"); 

$Username = $_POST['Username'];
$Firstname = $_POST['Firstname'];
$Password = $_POST['Password'];

$alias_name = translate_username($Username);
$Username = format_text_for_database($Username);
$Firstname = format_text_for_database($Firstname);
$Password = format_text_for_database($Password);

if($Username=="") {
	print "No username received";
	exit;
}

if($Firstname=="") {
	print "No first name received";
	exit;
}

if($Password=="") {
	print "No password received";
	exit;
}

$dbh = db_connect();

$row_id = get_sql_item($dbh, "select row_id from POKER_USER where alias_name = '$alias_name'");
if($row_id>0) {
	print "That email already is use. Click 'Forgot Pass' to have it emailed to you.";
	exit;
}

execute_sql($dbh, "insert into POKER_USER(row_id, alias_name, username, email, firstName, password, status, created, lastSynced, location) values(null, '$alias_name', '$alias_name', '$Username', '$Firstname', '$Password', 'Active', sysdate(), sysdate(), 'x')");

$row_id = get_sql_item($dbh, "select row_id from POKER_USER where alias_name = '$alias_name'");
if($row_id>0) {
	print "Success";
	exit;
}




print "Database error. Admin has been notified. Try again later.";


?>
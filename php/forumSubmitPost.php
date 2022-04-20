<?php 
include("../pages/PHP_Scripts.pm"); 
include("PokerScripts.pm"); 

$Username = $_POST['Username'];
$Password = $_POST['Password'];
$category = $_POST['category'];
$postId = $_POST['postId'];
$title = $_POST['title'];
$body = $_POST['body'];

$dbh = db_connect();

$pass=true;
$user_id = verifyUser($dbh, $Username, $Password);
if($user_id>0) {

	$title = verify_text_field($title);
	$body = verify_text_field($body);
	
	$sql = "insert into POKER_FORUM(row_id, name, body, category, post_id, user_id, created, last_upd) values(null, '$title', '$body', '$category', '$postId', '$user_id', sysdate(), sysdate())";
	
	execute_sql($dbh, $sql);
	
	if($postId>0)
		execute_sql($dbh, "update POKER_FORUM set last_upd = sysdate() where row_id = '$postId'");
	
	
	print "Success<br>";

		
}

db_close($dbh);



?>
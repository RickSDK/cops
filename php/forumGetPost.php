<?php 
include("../pages/PHP_Scripts.pm"); 
include("PokerScripts.pm"); 

$Username = $_POST['Username'];
$Password = $_POST['Password'];
$category = $_POST['category'];
$postId = $_POST['postId'];

$dbh = db_connect();

$pass=true;
$user_id = verifyUser($dbh, $Username, $Password);
if($user_id>0) {

	if($postId==0) {
		print "Invalid post";
		exit;
	}

	print "Success<br>$postId";
	
	getForumPost($dbh, $postId, $user_id);
	
	getForumHeadlines($dbh, $postId, $user_id, 50);
	execute_sql($dbh, "update POKER_USER set last_viewed_forum2 = sysdate() where row_id = '$user_id'");
}

db_close($dbh);

function getForumPost($dbh, $postId, $user_id) {
	$sql = "select * from POKER_FORUM  where row_id = '$postId'";
	$result = mysql_query($sql, $dbh);
	print mysql_error();
	while($row = mysql_fetch_array($result)) {
		$row_id = $row[row_id];
		$category = $row[category];
		$name = $row[name];
		$body = $row[body];
		$post_id = $row[post_id];
		$created = $row[created];
		$uid = $row[user_id];
		
		$first_name = get_sql_item($dbh, "select firstName from POKER_USER where row_id = '$uid'");
		$city = get_sql_item($dbh, "select city from POKER_USER where row_id = '$uid'");
		$state = get_sql_item($dbh, "select state from POKER_USER where row_id = '$uid'");
		$country = get_sql_item($dbh, "select country from POKER_USER where row_id = '$uid'");
		
		$location = "$city, $state";
		if($country != "USA")
			$location = "$city, $country";
			
		$last10Stats = get_sql_item($dbh, "select last10Stats from POKER_UNIVERSE where user_id = '$uid'");
		$components = split("\|", $last10Stats);
		$risked = $components[3];
		$profit = $components[4];
		
		print "$category|$post_id|$row_id|$name|$body|$created|$first_name|$location|$uid|$risked|$profit<br>";
	}
	print "<a>";
}

function getForumHeadlines($dbh, $postId, $user_id, $limit) {
	$last_viewed_forum = get_sql_item($dbh, "select last_viewed_forum2 from POKER_USER where row_id = '$user_id'");
	$sql = "select * from POKER_FORUM  where post_id = '$postId' order by created limit $limit";
	$result = mysql_query($sql, $dbh);
	print mysql_error();
	while($row = mysql_fetch_array($result)) {
		$row_id = $row[row_id];
		$category = $row[category];
		$name = $row[name];
		$post_id = $row[post_id];
		$uid = $row[user_id];
		$last_upd = $row[last_upd];
		$body = $row[body];
		
		$first_name = get_sql_item($dbh, "select firstName from POKER_USER where row_id = '$uid'");
		$created = get_sql_item($dbh, "select DATE_FORMAT(created, '%b %D') from POKER_FORUM where row_id = '$row_id'");
		
		$newFlg="N";
		
		$minSince = get_sql_item($dbh, "SELECT TIMESTAMPDIFF(MINUTE, '$last_upd','$last_viewed_forum') from DUAL;");
		
		if($minSince<0)
			$newFlg="Y";

		if($last_viewed_forum=="")
			$newFlg="N";

#		$body = substr($body,0,100);
		$replies = get_sql_item($dbh, "select count(*) from POKER_FORUM where post_id = '$row_id'");

		$last10Stats = get_sql_item($dbh, "select last10Stats from POKER_UNIVERSE where user_id = '$uid'");
		$components = split("\|", $last10Stats);
		$risked = $components[3];
		$profit = $components[4];
		
		print "$category|$post_id|$row_id|$name|$newFlg|$first_name|$minSince|$created|$body|$replies|$risked|$profit<b>";
	}
	print "<a>";
}

?>
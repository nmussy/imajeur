<?php
	require_once '../mysql_password.php';
	$imajeur_conn = new PDO('mysql:host=localhost;dbname=db_imajeur;charset=utf8', 'ftp', $MYSQL_PASS);
	$imajeur_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$register_user_stmt = $imajeur_conn->prepare('INSERT INTO `tbl_user`');
	$register_user_stmt->execute();
?>
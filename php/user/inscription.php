<?php
//pour test !!
require "./profileTemplate.php";

echo "test";
createProfile("Bobb","lstName","Pseudal","202020","avatar","isPublic");


	require_once '../mysql_password.php';
	$imajeur_conn = new PDO('mysql:host=localhost;dbname=db_imajeur;charset=utf8', 'php', $MYSQL_PASS);
	$imajeur_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$register_user_stmt = $imajeur_conn->prepare(
		'INSERT INTO tbl_imajeur (IMAJEUR_email, IMAJEUR_first_name, IMAJEUR_last_name, IMAJEUR_dob, IMAJEUR_gender, IMAJEUR_hash, IMAJEUR_salt, IMAJEUR_public, IMAJEUR_avatar_path)' .
		' VALUES (:email, :first_name, :last_name, :dob, :gender, :hash, :salt, :public, :avatar_path)'
	);
	$register_user_stmt->bindParam(':email', $_REQUEST['email']);
	$register_user_stmt->bindParam(':first_name', $_REQUEST['firstName']);
	$register_user_stmt->bindParam(':last_name', $_REQUEST['lastName']);
	$register_user_stmt->bindParam(':dob', $_REQUEST['dobYear'] . '-' . $_REQUEST['dobMonth'] . '-' . $_REQUEST['dobDay']);
	$register_user_stmt->bindParam(':gender', $_REQUEST['gender']);

	$imajeur_salt = bin2hex(mcrypt_create_iv(256, MCRYPT_DEV_URANDOM));
	$imajeur_hash = bin2hex(crypt($_REQUEST['password'], '$5$' . $imajeur_salt));

	$email_salt = mcrypt_create_iv(48, MCRYPT_DEV_URANDOM);
	$email_hash = md5($_REQUEST['email'] . $email_salt);
	$register_user_stmt->bindParam(':hash', $imajeur_hash);
	$register_user_stmt->bindParam(':salt', $imajeur_salt);

	$register_user_stmt->bindParam(':public', (isset($_REQUEST['public']) && $_REQUEST['public'] == 'on' ? TRUE : FALSE));
	$register_user_stmt->bindParam(':avatar_path', 'LOLZ');
	$register_user_stmt->execute();
?>
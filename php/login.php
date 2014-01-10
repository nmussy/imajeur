<?php
	
	if(empty($_REQUEST['email']) OR empty($_REQUEST['password'])){
		echo 'erreur dans le couple mail/mot de passe';
	}

	else{
		require_once '../mysql_password.php';
	$imajeur_conn = new PDO('mysql:host=localhost;dbname=db_imajeur;charset=utf8', 'php', $MYSQL_PASS);
	$imajeur_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$login = $imajeur_conn->prepare(
		'SELECT IMAJEUR_ID,IMAJEUR_email,IMAJEUR_hash,IMAJEUR_salt FROM imajeur where IMAJEUR_email =:email')
	);


	$login->bindParam(':email', $_REQUEST['email']);
	$login->execute();
    $result = $login->fetchAll(PDO::FETCH_ASSOC);

    if(sizeof($result)==0){
    	echo json_encode(array('success'->false));
    	return;
    }
    else{
    	$hash=$result[0]['IMAJEUR_hash'];
    	$salt=$result[0]['IMAJEUR_salt'];
    	$imajeur_hash = bin2hex(crypt($_REQUEST['password'], '$5$' . $salt));

    	if($hash=$imajeur_hash){
    		echo json_encode(array('success'->true));
    		session_start();
    		$_SESSION['email']=$_REQUEST['mail'];
    		$_SESSION['id']=$result[0]['IMAJEUR_id'];

    	}
    	else {
    		echo json_encode(array('success'->false));
    		return;
    	}


    }
	}






?>
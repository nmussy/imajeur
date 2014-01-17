<?php

	$imaje = new PDO('mysql:host=localhost;dbname=db_imajeur;charset=utf8', 'php', $MYSQL_PASS);
	$imaje->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$imaje->prepare("SELECT IMAJE_id,IMAJE_path,IMAJE_name from tbl_IMAJE INNER JOIN tbl_imaje_imajeurie ON tbl_IMAJE.IMAJE_ID=tbl_imaje_imajeurie.IMAJE_ID NATURAL JOIN tbl_IMAJEURIE WHERE IMAJEURIE_ID=:id; ")
	$imaje->bindParam(':id', $_REQUEST['IMAJEURIE_id']);
	$imaje->execute();
    $result = $imaje->fetchAll(PDO::FETCH_ASSOC);

  	echo json_encode($result);

?>
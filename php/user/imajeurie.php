<?php
	
	$imajeurie = new PDO('mysql:host=localhost;dbname=db_imajeur;charset=utf8', 'php', $MYSQL_PASS);
	$imajeurie->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$imajeurie->prepare("SELECT IMAJEURIE_id,IMAJEURIE_name,IMAJEURIE_id_imajeur from tbl_imajeurie INNER JOIN tbl_imajeur on IMAJEURIE_id_imajeur=IMAJEUR_id WHERE IMAJEUR_id=:id;")
	$imajeurie->bindParam(':id', $_REQUEST['IMAJEUR_id']);
	$imajeurie->execute();
    $result = $imajeurie->fetchAll(PDO::FETCH_ASSOC);

    //retorune toutes les imajeuries ainsi que les phtoso en fonction de l'utilisateur, et une seule imaj par imajeurei grace au distinct
    $imajeurie2->prepare("SELECT DISTINCT(imaje_path,tbl_imajeurie.IMAJEURIE_ID) from tbl_imaje INNER JOIN tbl_imaje_imajerie ON tbl_image.IMAJE_ID=tbl_imaje_imajerie.IMAJE_ID INNER JOIN tbl_imajeurie ON tbl_imajeurie.IMAJEURIE_id=tbl_imaje_imajerie.IMAJEURIE_ID WHERE imajeur_id=:id;")
	$imajeurie2->bindParam(':id', $_REQUEST['IMAJEUR_id']);
	$imajeurie2->execute();
    $result2 = $imajeurie2->fetchAll(PDO::FETCH_ASSOC);

?>
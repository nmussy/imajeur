<?php
function createProfile($fstName,$lstName,$nckName,$dob,$avatar,$isPublic){

$header="<!DOCTYPE html>
  <!--[if lt IE 7]>      <html class=\"no-js lt-ie9 lt-ie8 lt-ie7\"> <![endif]-->
  <!--[if IE 7]>         <html class=\"no-js lt-ie9 lt-ie8\"> <![endif]-->
  <!--[if IE 8]>         <html class=\"no-js lt-ie9\"> <![endif]-->
  <!--[if gt IE 8]><!--> <html class=\"no-js\"> <!--<![endif]-->
      <head>
          <meta charset=\"utf-8\">
          <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
          <title>Imajeur - Inscription</title>
          <meta name=\"description\" content=\">
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">

          <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

          <!-- <link rel=\"stylesheet\" href=\"css/normalize.css\"> -->
          <link href=\"../../../lib/bootstrap-3.0.2/css/bootstrap.min.css\" rel=\"stylesheet\">
          <link rel=\"stylesheet\" href=\"../../../css/main.css\">
          <link rel=\"stylesheet\" href=\"css/main.css\">
          <script src=\"../js/vendor/modernizr-2.6.2.min.js\"></script>
          <style>
              body {
                  background-color: #CCC;
                  overflow-x: hidden;
                  padding-top: 70px;
              }
          </style>
    </head>";
/*creation du dossier de l'utilisateur */
mkdir($nckName);
$fp = fopen($nckName."/".$nckName.".html", 'w');
fwrite($fp, $header);

    $body="    <body>
        <!--[if lt IE 7]>
            <p class=\"browsehappy\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->

        <nav class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\">
          <!-- Brand and toggle get grouped for better mobile display -->
          <div class=\"navbar-header\">
            <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#bs-example-navbar-collapse-1\">
              <span class=\"sr-only\">Toggle navigation</span>
              <span class=\"icon-bar\"></span>
              <span class=\"icon-bar\"></span>
              <span class=\"icon-bar\"></span>
            </button>
            <a class=\"navbar-brand\" href=\"#\"><span style=\"color:#0026FF\">Imajeu</span><span style=\"color:#5AFF44\">r</span> &ndash; Inscription</a>
          </div>

          <!-- Collect the nav links, forms, and other content for toggling -->
          <div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-1\">
            <ul class=\"nav navbar-nav\">
              <li><a href=\"#\">Imajeur aléatoire</a></li>
              <li class=\"dropdown\">
                <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">Qu\"est-ce que Imajeur ? <b class=\"caret\"></b></a>
                <ul class=\"dropdown-menu\">
                  <li><a href=\"#\">Fonctionalités</a></li>
                  <li><a href=\"#\">Vie privée</a></li>
                  <li><a href=\"#\">Qui sommes-nous ?</a></li>
                  <li class=\"divider\"></li>
                  <li><a href=\"#\">API développeur</a></li>
                  <li class=\"divider\"></li>
                  <li><a href=\"#\">Contact</a></li>
                  <li><a href=\"#\">À propos de Imajeur</a></li>
                </ul>
              </li>
            </ul>
            <ul class=\"nav navbar-nav navbar-right\">
              <li><a href=\"#\">Mon imajeur</a></li>
            </ul>
          </div><!-- /.navbar-collapse -->
        </nav>


        <div id=\"center-block\" style=\"margin-left: 10px;\">
          <h1>".$nckName."</h1>
          <img height=\"250\" width=\"250\" src=\"".$avatar."\"/>
          <p>".$lstName."</p>
          <p>".$fstName."</p>
          
      </div>
        <!--<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script> -->
        <script>window.jQuery || document.write(\"<script src=\"../js/vendor/jquery-1.10.2.min.js\"><\/script>\")</script>
        <script src=\"../js/plugins.js\"></script>
        <script src=\"../lib/bootstrap-3.0.2/js/bootstrap.min.js\"></script>
        <script src=\"js/main.js\"></script>

        <script>
            (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
            e=o.createElement(i);r=o.getElementsByTagName(i)[0];
            e.src=\"//www.google-analytics.com/analytics.js\";
            r.parentNode.insertBefore(e,r)}(window,document,\"script\",\"ga\"));
            ga(\"create\",\"UA-45732265-1\");ga(\"send\",\"pageview\");
        </script>
    </body>
</html>";

fwrite($fp, $body);
fclose($fp);
  } 



?>




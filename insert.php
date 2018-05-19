<?php

require_once ('setting.php');

$insert_sentence = '';

switch($_POST['table']){

  case 'piles':
    $insert_sentence .= 'INSERT INTO piles (hand, user_id, score_id';
    for($i = 0; $i < 16; $i++){
      $insert_sentence .= ',cell'.$i;
    }
    $insert_sentence .= ') VALUES (';
    $insert_sentence .= '"'.$_POST['hand'].'"';
    $insert_sentence .= ','.$_POST['user_id'];
    $insert_sentence .= ','.$_POST['score_id'];
    for($i = 0; $i < 16; $i++){
      $insert_sentence .= ','.$_POST['cell'.$i];
    }
    $insert_sentence .= ');';
    break;

  case 'scores':
    $insert_sentence .= 'INSERT INTO scores (id, score';
    $insert_sentence .= ') VALUES (';
    $insert_sentence .= $_POST['score_id'];
    $insert_sentence .= ','.$_POST['score'];
    $insert_sentence .= ');';
    break;
}

$link = new mysqli(DB_HOST , DB_USER , DB_PASSWORD , DB_NAME);
$result = $link->query($insert_sentence);

if (!$result) {
  ob_start();

  $sql_error = $link->error;
  echo 'select failed.<br>' ;
  error_log($sql_error);
  //die($sql_error);

  var_dump($sql_error);
  $debug = ob_get_contents();
  ob_end_clean();

  file_put_contents('debug.txt', $debug);
}


?>
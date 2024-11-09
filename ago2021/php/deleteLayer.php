<?php

$dirName = 'layers';

$areas = json_decode($_POST['layers']);
//$filename = "";
//echo $_POST['layers'];
//$saida = json_decode('"usuario": '.'""');

foreach ($areas->areas as $area) {
    $ip = $area->ip;
    if ($ip == "")
        continue;
    $filename = $dirName . '/layers' . '_' . $ip . '.txt';
    $txtFile = file_get_contents($filename);
    $json = json_decode($txtFile);
    $saida = json_decode($txtFile);
    unset($saida->areas);
    $saida->areas = [];

    //$saida->usuario = $json->usuario;
    //$saida->ip = $json->ip;
    //$saida->descricao->$json->descricao;
    //echo file_get_contents($filename);

    $a = [];
    foreach ($json->areas as $areaFile) {
        //echo "passo" . $c;

        if ($area->coordenadas !== $areaFile->coordenadas) {
            array_push($saida->areas,$areaFile);
            echo json_encode($saida)."<br><br>";
        }
    }
    
    file_put_contents($filename, json_encode($saida));
}

//echo $filename . " => " . json_encode($json,true);


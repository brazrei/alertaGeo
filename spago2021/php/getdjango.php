<?php
include "deleteOldFiles.php";
$folder = "json";
deleteOldFiles($folder,12);
$data = $_GET['data'];
$rodada = $_GET['rodada'];
$offset = $_GET['offset'];
$level = $_GET['level'];
$tipo = $_GET['tipo'];
#$url = "http://localhost:8000/getjson/?data={$data}&rodada={$rodada}&offset={$offset}&level={$level}&tipo={$tipo}";
#$filename = "json/saida_{$data}_{$rodada}z_f{$offset}_{$level}_{$tipo}.json";
$filename = "saida_{$data}_{$rodada}z_f{$offset}_{$level}_{$tipo}.json";
$filepath = $folder . "/". $filename;

$url = "http://localhost:8000/get_json_wind/{$filename}/";
$tempfilename = "baixando.temp";
if (!file_exists("json"))
    makeDir("json");

//se o arquivo já estiver sento baixado
if (file_exists($tempfilename)) {
    $waittime = 600;
    $t1 = time();

    while ((time() - $t1) < $waittime && file_exists($tempfilename)) {
        sleep(1);
    }
    if (file_exists($tempfilename))
        exit(1);
}

if (!file_exists(($filepath))) {
    file_put_contents($tempfilename, "baixando");
    $content = file_get_contents($url);
    file_put_contents($filepath, $content);
    if (filesize($filepath) < 50000)
        unlink($filepath);
    if (file_exists($tempfilename))
        unlink($tempfilename);
} else
    $content = file_get_contents($filepath);

echo $content;
//file_put_contents($filename, $url); 

<?php
require 'utils.php';

function deleteOldFiles($idade = 5)
{ //idade em minutos
    $folderName = "layers";
    if (file_exists($folderName)) {
        foreach (new DirectoryIterator($folderName) as $fileInfo) {
            if ($fileInfo->isDot()) {
                continue;
            }
            if ($fileInfo->isFile() && time() - $fileInfo->getCTime() >= $idade * 60) {
                unlink($fileInfo->getRealPath());
            }
        }
    }
}

function getNewestFile($dir)
{
    $files = scandir($dir, SCANDIR_SORT_DESCENDING);
    return $files;
}


DeleteOldFiles(30);
$dir = 'layers';
$files = getNewestFile($dir);
$ip = getUserIP() . "";
$sep = '';
$cancel = $_GET['cancel'] == 'TRUE';
echo '{"usuarios": [';

foreach ($files as $file) {
    if (((!$cancel && !strpos($file, $ip)) || ($cancel && strpos($file, $ip))) && (strlen($file) > 2)) { //retorna apenas as plotagens de outrocs ips
        //   echo $file . '=>' . file_get_contents($dir . '/' . $file);
        echo $sep  . file_get_contents($dir . '/' . $file);
        $sep = ',';
    }
    //  echo $ip.'<br>'.$file.strpos($file, $ip);
}
echo ']}';


//echo $newest . '=>' . file_get_contents($dir . '/' . $newest);

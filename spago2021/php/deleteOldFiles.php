<?php
function deleteOldFiles($folderName,$idade = 12) //horas
{ //idade em minutos
    //$folderName = "json";
    $idade = $idade * 60;
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

<?php
require 'utils.php';

function createDir($dirName)
{
    //    $dirName = "cache";
    if (!file_exists($dirName)) {
        //mkdir($dirName, 0777);
        if (!@mkdir($dirName, 0777)) {
            $error = error_get_last();
            echo $error['message'];
        }
    }
}
$dirName = 'layers';
createDir($dirName);
$ip = getUserIP();

$ip = getUserIP();
$txt = $_POST['layers'];
$txt = str_replace("***@@IP@@***",$ip,$txt);
$usuario = $_POST['usuario'];
if ($usuario == "")
    $usuario = "nil";
$filename = $dirName . '/layers' . '_' . $ip . '.txt';
file_put_contents($filename, '{"usuario": "' . $usuario . '", ' . $txt . '}');

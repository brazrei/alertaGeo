<?php
    include "deleteOldFiles.php";
    deleteOldFiles("imgsat",12);
    ini_set('display_errors', 1);
    //header('Access-Control-Allow-Origin: *');
    
    $PROXY_HOST = "proxy.decea.intraer"; // Proxy server address
    $PROXY_PORT = "8080";    // Proxy server port
    $PROXY_USER = "brazrab";    // Username
    $PROXY_PASS = "12345678";   // Password

    // Username and Password are required only if your proxy server needs basic authentication

    $auth = base64_encode("$PROXY_USER:$PROXY_PASS");
    stream_context_set_default(
     array(
      'http' => array(
       'proxy' => "tcp://$PROXY_HOST:$PROXY_PORT",
       'request_fulluri' => true,
       'header' => "Proxy-Authorization: Basic $auth"
       // Remove the 'header' option if proxy authentication is not required
      )
     )
    );

    //echo file_get_contents($url);    
    function makeDir($dirName) {
        
        if (!file_exists($dirName)) {
           //mkdir($dirName, 0777);
           if (!@mkdir($dirName, 0777)) {
            $error = error_get_last();
            echo $error['message'];
           }
        }        
    }
    
    $url = $_POST['url'];
    $filename = "imgsat/".$_POST['filename'];

    makeDir("imgsat");
    
    echo $filename." - ".$url;
    file_put_contents($filename."z", $url); 
    if (!file_exists ($filename) || filesize($filename)==0 ) { 
        //gambiarra para funcionar no proxy do decea:
        $url = str_replace(".mil.",".gov.",$url);
        $datafile = file_get_contents($url);
        echo "Resposta => ".file_put_contents($filename, $datafile); 
    }

?>

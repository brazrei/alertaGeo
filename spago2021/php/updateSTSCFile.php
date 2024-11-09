<?php
	ini_set('allow_url_fopen', 'on');
	ini_set('safe_mode', 'Off');
	//set_time_limit(0);
	ini_set('post_max_size', '20M');
	ini_set('upload_max_filesize', '20M');
	function copia($origem, $destino){
		$fin = file_get_contents($origem);
		if (strlen($fin) > 0){
			return file_put_contents($destino, $fin);
		} else{
			return false;
		}
	}
	function atualizaPrecSatelite(){
		$arquivoPrecSat = 'kml/ultimaPrec.html';
		$arquivoPrecSatTMP = 'kml/ultimaPrecTMP.html';
		$urlPrecSat = 'http://satelite.cptec.inpe.br/home/download?arquivo=RFS_GOOGLE.KMZ';
		if (file_exists($arquivoPrecSat)){
			$tempoDecorrido = (time()-filemtime($arquivoPrecSat))/60;
		} else{
			$tempoDecorrido = 100;
		}
		
		if ($tempoDecorrido > 30) {
			unlink($arquivoPrecSatTMP);
			copia($urlPrecSat,$arquivoPrecSatTMP);
			unlink($arquivoPrecSat);
			rename($arquivoPrecSatTMP,$arquivoPrecSat);
		}
	}
	function atualizaPrevisaoCPTEC(){
		$arquivoPrev = 'xml/ultimaPrevisao.xml';
		$arquivoPrevTMP = 'xml/ultimaPrevisaoTMP.xml';
		$urlPrev = 'http://servicos.cptec.inpe.br/XML/capitais/previsao.xml';
		if (file_exists($arquivoPrev)){
			$tempoDecorrido = (time()-filemtime($arquivoPrev))/60;
		} else{
			$tempoDecorrido = 100;
		}
		
		if ($tempoDecorrido > 60) {
			if (file_exists($arquivoPrevTMP)){
				unlink($arquivoPrevTMP);
			}
			
			if (copia($urlPrev,$arquivoPrevTMP) && file_exists($arquivoPrev)){
				unlink($arquivoPrev);
				rename($arquivoPrevTMP,$arquivoPrev);
			} else {
				return false;
			}
		}
	}
	function atualizaDescEle(){
		$arquivoDescEle = 'kml/ultimaDescEle.html';
		$arquivoDescEleTMP = 'kml/ultimaDescEleTMP.html';
		$urlDescEle = 'http://satelite.cptec.inpe.br/home/download?arquivo=LDI_GOOGLE.KMZ';
		if (file_exists($arquivoDescEle)){
			$tempoDecorrido = (time()-filemtime($arquivoDescEle))/60;
		} else{
			$tempoDecorrido = 100;
		}
		
		if ($tempoDecorrido > 32) {
			unlink($arquivoDescEleTMP);
			copia($urlDescEle,$arquivoDescEleTMP);
			unlink($arquivoDescEle);
			rename($arquivoDescEleTMP,$arquivoDescEle);
		}
	}
	function removeExtensao($arquivo){
		$s = explode(".jpg",$arquivo);
		return $s[0];
	}
	function copiaDataHoraImg($imgSrc,$extensao){
		$arquivoImgSatTit = 'images/satelite/ultimaRealcadaTit.jpg';
		$src = imagecreatefromjpeg($imgSrc);
		$dest = imagecreatetruecolor(220, 34);

		// Copy
		imagecopy($dest, $src, 0, 0, 1650, 0, 220, 34);

		// Output and free from memory
		//header('Content-Type: image/gif');
		imagejpeg($dest,removeExtensao($imgSrc)."tit.".$extensao);
		unlink($arquivoImgSatTit);
		imagejpeg($dest,$arquivoImgSatTit);

		imagedestroy($dest);
		imagedestroy($src);	
	}
	function atualizaImgSatelite(){
		$arquivoImgSat = 'images/satelite/ultimaRealcada.jpg';
		$arquivoImgSatTMP = 'images/satelite/ultimaRealcadaTMP.jpg';
		$arquivoImgSatBackup = explode('.',$arquivoImgSat);
		$arquivoImgSatExt = $arquivoImgSatBackup[1];
		$arquivoImgSatBackup = $arquivoImgSatBackup[0];
	
		$urlImgSat = 'http://satelite.cptec.inpe.br/acervo/goes_anteriores.jsp';
		if (file_exists($arquivoImgSat)){
			$tempoDecorrido = (time()-filemtime($arquivoImgSat))/60;
		} else{
			$tempoDecorrido = 100;
		}
		if ($tempoDecorrido > 15){
		$arquivoImgSatBackup = $arquivoImgSatBackup.date( "H", filemtime($arquivoImgSat)).'.'.$arquivoImgSatExt;//arquivo + hora + extensão;
			$urlOrigemImg = 'http://pituna.cptec.inpe.br/repositorio5/goes12/goes12_web/ams_realcada_alta';
			$site = file_get_contents($urlImgSat);
			
			if (strpos($site,"ams_realcada_alta") === FALSE )
			{
				$dataImg = time()-(60*30);
				$minutoSistema = intval(date( "i", $dataImg) / 15)*15;
				if ($minutoSistema<10)
					$minutoSistema = "0".$minutoSistema;
				$fname = "http://pituna.cptec.inpe.br/repositorio5/goes12/goes12_web/ams_realcada_alta/".date("Y/m/", $dataImg)."S11219752_".date("YmdH", $dataImg).$minutoSistema;
				$fname = $fname.".jpg";
				$urlOrigemImg = $urlOrigemImg.$fname;
				echo "\n".$fname;
			} else {
				$data = explode("ams_realcada_alta",$site);
				$data = explode('"',$data[1]);
				$urlOrigemImg = $urlOrigemImg.$data[0];
			}
			//echo $urlOrigemImg;
			copia($urlOrigemImg, $arquivoImgSatTMP);
			unlink($arquivoImgSat);
			copia($arquivoImgSatTMP, $arquivoImgSat);
			unlink($arquivoImgSatBackup);
			rename($arquivoImgSatTMP,$arquivoImgSatBackup);
			copiaDataHoraImg($arquivoImgSatBackup,$arquivoImgSatExt);
			
		}
	}
	$horasPassadas = $_GET["horasPassadas"];
	if (!is_numeric($horasPassadas)){
		$horasPassadas = "1";
	}
	$diaArquivo=0;
	$diaSistema=0;
	$horaArquivo=0;
	$horaSistema=0;
	$minutoSistema=0;
	$arquivoXml  = "xml/metarTMP.xml";
	$arquivoXmlFinal = "xml/metar1.xml";
	$arquivoXml2  = "xml/metar2TMP.xml";
	$arquivoXmlFinal2 = "xml/metar2.xml";
	
	//tempo decorrido do metar de 2h atras..
	$tempoDecorrido=0;
	if (file_exists($arquivoXmlFinal2)) {
		
		$tempoDecorrido = time()-filemtime($arquivoXmlFinal2);
	}
	//echo "Tempo Decorrido metar2.xml: ".($tempoDecorrido)."\n";
	if ((!file_exists($arquivoXmlFinal2)) or (($tempoDecorrido/60)>=59)){
		$urlMetar ='http://weather.aero/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=~br&hoursBeforeNow=2';
		$urlMetar = preg_replace("/&#?[a-z0-9]+;/i","",$urlMetar);
		if (file_exists($arquivoXmlFinal2)){
		    if (file_exists($arquivoXml2))
				unlink($arquivoXml2);
			
			copia($urlMetar,$arquivoXml2);
			unlink($arquivoXmlFinal2);
			rename($arquivoXml2, $arquivoXmlFinal2);
			//unlink($arquivoXml2);
		} else{
			copia($urlMetar,$arquivoXmlFinal2);
		}
		//echo "\n Arquivo metar2.xml";
	}
	
	//tempo decorrido do metar atual
	$tempoDecorrido=0;
	$arquivoPHP = "xml/atualizarsite.php";
	if (file_exists($arquivoXmlFinal)){
		$objFopen = fopen($arquivoXmlFinal,"r");
		$diaArquivo = date( "d M Y", filemtime($arquivoXmlFinal));
		$diaSistema = date( "d M Y", time());
		$horaArquivo = date( "g", filemtime($arquivoXmlFinal));
		$horaSistema = date( "g", time());
		$minutoSistema = date( "i", time());
		$tempoDecorrido = date("i",time()-filemtime($arquivoXmlFinal)); //tempo decorrido em minutos
		fclose ($objFopen);
		//echo "Data do arquivo = ". $diaArquivo . "<br>";
		//echo "Data do sistema = ". $diaSistema . "<br>";
	}
	//para dar tempo de todos que estão acessando o site atualizar o arquivo
	if ($tempoDecorrido > 0){
		//echo "tempo decorrido: ".$tempoDecorrido."minutos";
		if (file_exists($arquivoPHP)){
			unlink($arquivoPHP);
		}
		file_put_contents($arquivoPHP,"<?php\n echo 'nao';\n ?>");
		echo "**NAO**";
	} else {
		echo "**SIM**";
	}
		
	if ((!file_exists($arquivoXmlFinal)) or ($diaArquivo !== $diaSistema) or ($horaArquivo !== $horaSistema) or ($minutoSistema<5) or ($minutoSistema==10) or ($tempoDecorrido>9))
	{
		if (file_exists($arquivoXml)){
			unlink($arquivoXml);
		}
		$urlMetar ='http://weather.aero/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=~br&hoursBeforeNow='.$horasPassadas;
		$urlMetar = preg_replace("/&#?[a-z0-9]+;/i","",$urlMetar);
		//echo $urlMetar;

		copia($urlMetar,$arquivoXml);
		$conteudoTMP = file_get_contents($arquivoXml);
				
		unlink($arquivoXmlFinal);
		unlink($arquivoPHP);
		copia($arquivoXml,$arquivoXmlFinal);
		file_put_contents($arquivoPHP,"<?php\n echo 'sim';\n ?>");//os dois arquivos irão possuir a mesma hora
		echo "**SIM**";
		unlink($arquivoXml);
	}
	atualizaImgSatelite();
	atualizaPrecSatelite();
	atualizaDescEle();
	atualizaPrevisaoCPTEC();
?>
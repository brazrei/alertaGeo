var TipoConsulta, oldResponse; 
var TempoCorrido;
var arrayTableFir = ["firAZtable", "firBStable", "firREtable", "firCWtable"];
var globalVisMax = 5000;
var globalVentoMax = 14;
var globalStrMetaresOffLine = ["","","",""];
var metaresFiltrados = [];
var redemet = false;
var primeiraVez = true;

var localidadesFIR = [
"SBEG,SBMN,SBBV,SBPV,SBRB,SBCY,SBSL,SBBE,SBJC,SBSN,SBMQ,SBCZ,SBTF,SBMY,SBAT,SBUA,SBCC,SBIH,SBTT,SBTK,SBJI,SBHT,SBMA,SBVH,SBTU,SBOI,SBCJ,SBCI,SBIZ,SBTS,SBTB,SBUY,SBIC,SBEK,SBGM,SBMD,SBAA,SBSO,SBRD,SBSI",
"SBAN, SBBH, SBBR, SBBW, SBCF, SBCN, SBGO, SBIP, SBIT, SBLS, SBMK, SBNV, SBPJ, SBPR, SBYS,SWLC",
"SBFZ, SBSG, SBNT, SBJP, SBKG, SBRF, SBMO, SBAR, SBPL, SBJU, SBSV, SBIL, SBPS, SBVC, SBLP, SBVT, SBTE, SBFN, SBPB, SBGV, SBMS, SBUF, SBLE, SBTC, SBFE,SBTV,SBAC,SBJE,SNBR,SNTF,SDIY,SNVB",
"SAEZ,SUMU,SGAS,SARE,SBUG,SBBG,SBPK,SBSM,SBNM,SBPF,SBPA,SBCO,SBCX,SBTR,SBCM,SBJA,SBLJ,SBCH,SBCD,SBFL,SBNF,SBJV,SBCT,SBBI,SBFI,SBPG,SSGG,SBPO,SBCA,SBTD,SBPP,SBDB,SBDO,SBCG,SBCR,SBTG,SBMG,SBLO,SBDN,SBML,SBBU,SBAE,SBAU,SBSP,SBMT,SBGR,SBST,SBTA,SBGW,SBSC,SBJR,SBAF,SBRJ,SBGL,SBBQ,SBZM,SBJF,SBES,SBBZ,SBCB,SBME,SBMM,SBEC,SBLB,SBCP,SBFS,SBJH,SDCO,SBGU,SBMI"
];

//Global ciclos, MaxCiclos As integer  ' É 1 CICLO POR SEGUNDO


function GetWebContent(url, idxFIR) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
  var erro = "ErroSM=";
    if (this.status > 0) {
      if (this.readyState == 4 && this.status == 200) {
//        $(".imgLoad").hide();
        $(".imgLoad").attr('src', 'pngs/green-button30.png');
        trataMetarRedemet(this.responseText, idxFIR);
        return this.responseText;
      } else if (this.readyState > 2 && this.status !== 200){
        erro = erro+this.responseText;
        //$(".imgLoad").hide();
        $(".imgLoad").attr('src', 'pngs/red-button30.png');

        trataMetarRedemet(erro, idxFIR);
        return erro;
      } 
      
    } 
//    else
//      trataMetarRedemet(erro+"Erro de Acesso à Internet!", idxFIR);
     
  };
//  $(".imgLoad").show();
  $(".imgLoad").attr('src', 'gifs/loading30x30.gif');
  xhttp.open('GET', url, true);
  xhttp.send();
}

function getCortante(metar) {
  return metar.includes(' WS '); 
}

function getTrovoada(metar) {
  return metar.includes(" TS ") || metar.includes("TSRA ") || metar.includes("TSGR ") || metar.includes("TSGRRA ") || metar.includes("TSRAGR ");
}

function getTeto(metar) {
  var resultado = [3];

  ibkn = metar.indexOf(" BKN00");;
  iovc = metar.indexOf(" OVC00");;
  ivv = metar.indexOf(" VV00");;

  var bkn00 = ibkn>-1;
  var bknbbb = metar.includes(" BKN///");
  var bkn = bkn00 || bknbbb;
  
  var ovc00 = iovc>-1;
  var ovcbbb =  metar.includes(" OVC///");
  var ovc = ovc00 || ovcbbb;
  
  var vv00 = ivv>-1;
  var vvbbb = metar.includes(" VV///");
  var vv  = vv00 || vvbbb;
  
  resultado[1] = "F";
  resultado[2] = "0";
  resultado[3] = "";
  
  

  var inicio = 0;
  var valorTeto = 0;

  if (bkn00) {
    inicio = metar.indexOf(" BKN00")+6;
    valorTeto = metar.substr (inicio, 1);
    resultado[2] = valorTeto; 
    resultado[3] = "BKN00"+valorTeto;
  }
  
  if (ovc00) {
   if ((iovc<ibkn) || (ibkn==-1)){
    inicio = metar.indexOf(" OVC00")+6;
    valorTeto = metar.substr (inicio, 1);
    resultado[2] = valorTeto; 
    resultado[3] = "OVC00"+valorTeto;
   }
  }
  
  if (vv00) {
    inicio = metar.indexOf(" VV00")+5;
    valorTeto = metar.substr (inicio, 1);
    resultado[2] = valorTeto; 
    resultado[3] = "VV00"+valorTeto;
  }

  if (bknbbb)
    resultado[3] = "BKN///";
  if (ovcbbb)
    resultado[3] = "OVC///";
  if (vvbbb)
    resultado[3] = "VV///";
    
  
  if (bkn || ovc || vv) {
    resultado[1] = "T";
  }
  
  return  resultado;
}

function getLocalidade(metar ) {
	var campos = []; 

	var idxLoc = 1;
	if (metar.indexOf(" COR ") > 0) {
		idxLoc = idxLoc + 1;
	}
	
	campos = metar.split(" ");
	
	return campos[idxLoc];
}


function replac(str1,str2,str3) {
  return str1.replace(str2,str3)
}

function getMetar (localidades , Legenda ,  idxFIR, onLine) {
    var  url,url1,url2; 
    if (redemet) {
    	url1 = "http://www.redemet.aer.mil.br/api/consulta_automatica/index.php?local=";
    	url2 = "&msg=metar";
    } else {//decea 
    	url1 = "https://api-redemet.decea.gov.br/api/mensagens/metar/";
    	url2 = "";
    }
    localidades = localidades.replace(/ /g,""); //retira os espaços
    url = url1 + localidades + url2;
    
    response = "";
    erro = "";
        
    if (onLine) {
       return GetWebContent(url, idxFIR);
    } else
       trataMetarRedemet(globalStrMetaresOffLine[idxFIR],idxFIR);   
}

function updateArrayStatus(localidade, status) { // retorna true se o status mudou
/*   var i = globalArrayLocStatus.indexOf(localidade);
   if (i > -1) {
     globalArrayLocStatus
   } 
*/	
}

function convertToRedemet(txt) {
  str = "";
  txt = txt.split('"mens":"');

  for (i=0;i<txt.length;i++) {
    s = txt[i];
    if (s.indexOf("METAR") == 0){
        metar = s.split("=")[0];
                     
	str = str + "0123456789 - " + metar.split("\\").join("")+"=";
    }
    if (s.indexOf("SPECI") == 0){
        metar = s.split("=")[0];
                     
	str = str + "0123456789 - " + metar.split("\\").join("")+"=";
    }
  }

  return str;
}

function limpaMsgErro(erro) {
  if (erro && (erro.indexOf("<title>")>-1))
    return (erro.split("<title>")[1]).split("</title>")[0];
  else
    return (erro);
}

function trataMetarRedemet(response, idxFIR) {
    var erroDeAcesso = response.includes("ErroSM=");
    if (!erroDeAcesso)   
       globalStrMetaresOffLine[idxFIR] = response;
    if  (response.includes("getaddrinfo failed") || erroDeAcesso) {
      erroDeAcesso = limpaMsgErro(erroDeAcesso);
      strToCell (["Erro ao tentar obter metares da Redemet! "+response.replace("ErroSM=",""),""],idxFIR);
      return;
    } 
    if (!redemet) {
        response = convertToRedemet(response);
    }
    dataHora = getDataHoraMetares (response);
    
    arrayMetares = SplitMetares(response, dataHora);
    
    c = arraySize(arrayMetares);

    CMA = true;
    CMV = true;
    
    ventoMaximo = getMaxVnt();
    visMinima = getMinVis();
    cont = 1;
    locAnterior = "";
    
    var i;
    for (i=1; i < c; i++){ //a primeira linha está em branco
    	metar = arrayMetares[i];
    	if (metar.includes("Mensagem ") ){
    	    metar = "";
    	}
        visibilidade = getVisibilidade(metar);
        if (metar !== "") {
    	  localidade = getLocalidade (metar);
	  arrayTeto = getTeto (metar);
	  tetoBaixo = (arrayTeto[1] == "T");
	      
	  VisibBaixa = (visibilidade > 0) && (visibilidade < visMinima);
	      
          //setor = getSetor (metar, fir)
		  
	  trovoada = getTrovoada(metar);

          vento = getVento(metar);
          
          ventoRaj = false;
          ventoAlto = false;
          cortante = getCortante(metar);

          var ventoRajStr = "";
          var ventoStr = "";
          
          if (parseInt(vento[1]) > ventoMaximo) {
            ventoRajStr = " | RAJADA = "+vento[1]+"KT |";
            ventoRaj = true;
          }  
	        
          if (parseInt(vento[0]) > ventoMaximo) {
            ventoStr = " | VNT ="+vento[0]+"KT |";
            ventoAlto = true;
          }
          
          cortanteStr = ""
          if (cortante) {
            cortanteStr = " | WS |"
          }
          
          trovoadaStr = ""
          if (trovoada) {
            trovoadaStr = " | TS |"
          }
          
          var condicaoFiltro = false;
          
          if (CMA) {
             condicaoFiltro = (ventoAlto || ventoRaj || cortante || trovoada);
          }
          
          if (CMV) {
          	condicaoFiltro = (condicaoFiltro || (VisibBaixa || tetoBaixo));
          }
          
          if (locAnterior == localidade) { //se o speci for da mesma localidade então mostra 
            condicaoFiltro = true;
          }
          var novo = false;
	  if (condicaoFiltro) {
                var indNovo01 = metaresFiltrados.indexOf("1"+metar); //malabarismo pra mostrar por 2 minutos ;
                var indNovo02 = metaresFiltrados.indexOf("2"+metar); 
		novo = (indNovo01==-1 && indNovo02==-1);
		achou = !novo;
		if (achou) {
  		  if (indNovo01>-1) { // achou o 1  segunda passagem, transforma em 2
		    metaresFiltrados[indNovo01] = metaresFiltrados[indNovo01].replace("1"+metar, "2"+metar);
  		  }
		} else {
		    if (primeiraVez)
		      metaresFiltrados.push("2"+metar);
		    else
		      metaresFiltrados.push("1"+metar);
		}
		novo = ((indNovo01>-1) || novo);
		
                locAnterior = localidade; //apenas se mostrar ele 
	        //strToCell (metar, 0, idxFIR);

	        //strToCell (setor, 4, linIni + cont);
	        
	        tetoStr = "";
	        if (tetoBaixo) {
	          tetoStr = " | TETO = "+arrayTeto[2]+"00FT |";
		  metar = spanRed(metar, " "+arrayTeto[3]+" ");
	        }
	        
	        var visStr = "";
	        if (VisibBaixa) {
	          visStr = " | VIS = " + parseInt(visibilidade)+"M |";
		  metar = spanRed(metar, " "+visibilidade+" ");
	        }

		if (cortante)
		  metar = spanRed(metar, " WS ");
	          
		if (trovoada) {
		  metar = spanRed(metar, " TS ");
		  metar = spanRed(metar, " TSRA ");
		  metar = spanRed(metar, " TSGR ");
		  metar = spanRed(metar, " TSGRRA ");
		  metar = spanRed(metar, " TSRAGR ");

		  metar = spanRed(metar, " +TSRA ");
		  metar = spanRed(metar, " +TSGR ");
		  metar = spanRed(metar, " +TSGRRA ");
		  metar = spanRed(metar, " +TSRAGR ");

		  metar = spanRed(metar, " -TSRA ");
		  metar = spanRed(metar, " -TSGR ");
		  metar = spanRed(metar, " -TSGRRA ");
		  metar = spanRed(metar, " -TSRAGR ");
	        }
		if (ventoAlto)
		  metar = spanRed(metar, vento[2]);

		if (ventoRaj) {
		  metar = spanRed(metar, "G"+vento[1]+"KT");
		  metar = metar.replace(' <span style="color:red">G'+vento[1]+"KT", '<span style="color:red">G'+vento[1]+"KT");
		}

                // return metar.includes(" TS ") || metar.includes("TSRA ") || metar.includes("TSGR ");
		var strStatusMetar = visStr + tetoStr + ventoStr + ventoRajStr + cortanteStr + trovoadaStr;
		//updateArrayStatus (strStatusMetar);
	        strToCell ([metar, strStatusMetar], idxFIR, novo);
	        
	        
                cont = cont + 1;
	   }
	}
    }
    if (cont == 1) {	
      strToCell (["NENHUMA LOCALIDADE COM RESTRIÇÃO",""], idxFIR);
      cont = cont + 1;
    }
    
    return cont; //retorna o total de metares lidos +1
}

function spanRed(metar, palavra) {
  return metar.replace(palavra,' <span style="color:red">'+palavra+"</span> ")
}

function BtnMetarGERALClick (onLine) {
    var  contAZ, contAZBS, contAZBSRE;

        limpaMetares(); //excluir as linhas das tabelas
	TipoConsulta = "GERALCMA";
	getMetarFromFIR (0,"FIR AMAZÔNICA",onLine);
	getMetarFromFIR (1,"FIR BRASÍLIA",onLine);
	getMetarFromFIR (2,"FIR RECIFE",onLine);
	getMetarFromFIR (3,"FIR CURITIBA",onLine);
//	metaresFiltrados = []; //limpa as marcações para a proxima consulta

	//VerificaTimer();
}


function atualizaHora(Texto) {
  $("#relogio").text(Texto);
}

function fillZero(n) {
  return ( n<10 ? "0"+n: n)
}

function isMobile() {
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
return isMobile.any();
}

function getMetarFromFIR (firIdx, Legenda, onLine) {
    
    var  txtLoc; 
    txtLoc = localidadesFIR[firIdx];

    var  agora = new Date();
    TempoCorrido = 0;
    
    var h = fillZero(agora.getHours());
    var m = fillZero(agora.getMinutes());
    var s = fillZero(agora.getSeconds());
    
    if (onLine){
         atualizaHora("Hora da Última Consulta à REDEMET: "+h+":"+m+":"+s);
    }
    return  getMetar(txtLoc, Legenda,firIdx, onLine);
    
}


function limpaMetares () {
  for (var i=0;i<4;i++){
     $('#'+arrayTableFir[i] + ' > tbody').html("");
  }
}

function strToCell(arr, idxFIR, novo) {
    var table;
    var classe = 'class = "table-striped"';
    if (primeiraVez)
	novo = false;
    if (arr[0].includes("Erro") || novo)
       classe = 'class = "table-danger"';

    row = $('#'+arrayTableFir[idxFIR]+' tbody').append('<tr title=""'+classe+'><td><b>'+arr[0]+'</td>'+'<td>'+arr[1]+'</b></td></tr>');
//    row = $('#'+arrayTableFir[idxFIR]+' tbody').append('<tr class="'+classe+'"><td>'+arr[0]+'</td>'+'<td>'+arr[1]+'</td></tr>');

 //   row.addClass("table-primary");
    return; 
}
function SplitMetares(strMetar, dataHora) {
  if (strMetar)
    return strMetar.split(dataHora);
  else
    return "";
}

function arraySize (array) {
  return array.length;
}

function getDataHoraMetares (strMetares){
  if ((strMetares) && (strMetares.length > 13))
   return strMetares.substr(0,13); //'tb pega o hifen e os espaços
  else
    return "";
}

function getVento(metar) {
  var  campos = []; 
  var  ventoeRajada = [3];
  ventoeRajada[0] = "-1";
  ventoeRajada[1] = "-1";
  ventoeRajada[2] = "";
  
  
  posVento = getposVis(metar) - 1;
  
  campos = metar.split(" ");
  
  vento = campos [posVento];
  ventoeRajada[2] = vento;
  
  //00099G00KT
  if (vento.includes("G")) {
    ventoeRajada[1] = vento.substr (6,2); //'6 ate o final
    ventoeRajada[0] = vento.substr(3,2);
  }
  else { 
    ventoeRajada[1] = "-1";  //'6 ate o final
    ventoeRajada[0] = vento.substr(3,2);
  }
  
  return ventoeRajada;
}

function getposVis (metar) {
  var posVis = 4;
  
  if (metar.includes (" COR ")) {
    posVis = posVis + 1;
  }

  if (metar.includes (" AUTO ")) {
    posVis = posVis + 1;
  }
  
  return posVis;
}

function getVisibilidade(metar ) {

  var  campos = []; 
  var  posVis; 
  
  if (metar.includes(" CAVOK ") || metar.includes(" 9999 ")) {
    return  10000
  }
  
  posVis = getposVis(metar); 
  
  campos = metar.split(" ");
  
  if (posVis < arraySize(campos)) {
    visib = campos [posVis] + "";
  }
  else {
    return -1;
  }
  
  if (visib.length > 4) {
    if (visib.indexOf("V") > -1) { //vento variando
      posVis = posVis + 1;
      visib = campos [posVis];
      return  visib;
    }
    else  {
      return   -1
    }
  }
  else {
    return visib
  }
   
}

function atualizaSelectVis(){
    var $option = $("#selectVis").find('option:selected');
    //Added with the EDIT
    globalVisMax = parseInt($option.val());//to get content of "value" attrib
}

function atualizaSelectVento(){
    var $option = $("#selectVento").find('option:selected');
    //Added with the EDIT
    globalVentoMax = parseInt($option.val());//to get content of "value" attrib
}

function selectVisChange() {
    atualizaSelectVis();
    BtnMetarGERALClick(false);
}

function selectVentoChange() {
    atualizaSelectVento();
    BtnMetarGERALClick(false);
}


function getMinVis() {
  return globalVisMax;
//conceptName = $('#aioConceptName').find(":selected").text();
}

function getMaxVnt() {
  return globalVentoMax;
}



var arrayLocalidadeFIR = ["SBAZ", "SBBS", "SBRE", "SBCW"]
var gametsBrutos;
var gamets = []
var arrayGamets = []
var lastGamet = ""
var gametTimeout = false
var horaNextGamet = false
var gametsOK = false
let arrayGametsOK = []

function compareGametDates(date1, date2) {
  return (date1.getDate() == date2.getDate()) && (date1.getHours() == date2.getHours())

}
/*
function updateStatusGamet(time) {
  console.log("Atualizando Status Gamet")
  if (gametsOK)
    console.log("GAMETS ok!")
  else
    console.log("GAMETS AUSENTES!")

}
*/
function getGametsDateTime(gamets = false) {
  let validade
  let FIR
  let arrayG = []
  if (!gamets) {
    if (arrayGamets.length > 0 && arrayGamets[0].validade) {
      for (i in arrayGamets) {
        validade = arrayGamets[i].validade.split("/")
        FIR = arrayGamets[i].FIR
        arrayG.push({ validade: getFullDateValid(validade[0], validade[1]), FIR })
      }
    }
  } else {

    for (let i in gamets) {
      validade = gamets[i].split("VALID ")[1]
      validade = validade.split("/")
      FIR = gamets[i].split(" GAMET ")[0]
      arrayG.push({ validade: getFullDateValid(validade[0], validade[1]), FIR })
    }
  }
  return arrayG
}

function checkGamet(firstTime = false) { //inacabado
  if (!horaNextGamet) { // se primeira checagem
    horaNextGamet = getHoraNextGAMET()
    let timeGamet = getGametsDateTime()
    console.log(timeGamet)
    for (let i in timeGamet) {
      if (compareGametDates(timeGamet[i].validade[0], horaNextGamet.dataIni))  //mudou para um novo gamet
        arrayGametsOK.push(timeGamet[i].FIR)
    }
    gametsOK = arrayGametsOK.length == 4
  }
  updateStatusGamet(firstTime)
  if (firstTime)
    return
  let xHoraNextGamet = getHoraNextGAMET()
  let mudou = !compareGametDates(xHoraNextGamet.dataIni, horaNextGamet.dataIni)
  horaNextGamet = xHoraNextGamet
  if ((arrayGametsOK.length < 4) || mudou || !gametsOK) { // se está faltando algum gamet
    // a hora do próximo gamet mudou?
    //fazer nova consulta
    //assincrona. updateStatusGamet será chamada na resposta.
    if (mudou) {
      arrayGametsOK = []
      gametsOK = false
    }


    getGamet(false, xHoraNextGamet.dataIni)
  }

}

function getHoraNextGAMET() {
  let days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]
  let inicio = new Date(new Date(getUTCAgora().addHours(1).setMinutes(0)).setSeconds(0));
  let hora
  if (inicio.getHours() % 6 <= 3) {
    while ((inicio.getHours() % 6) !== 0)
      inicio = inicio.addHours(-1);
  } else {
    while ((inicio.getHours() % 6) !== 0)
      inicio = inicio.addHours(1);
  }

  hora = (inicio.getHours() < 10) ? "0" + inicio.getHours() : "" + inicio.getHours();

  return { dia: days[inicio.getDay()], hora: hora + "Z", dataIni: inicio }
}


function GetWebContentGamet(url, update) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    var erro = "ErroSM=";
    if (this.status > 0) {
      if ((this.readyState == 4 && this.status == 200) && (this.responseText !== "") && (!this.responseText.includes("Forbidden")) && (!this.responseText.includes("*#*"))) {
        //      if (this.readyState == 4 && this.status == 200) {
        //$("#imgLoad"+idxFIR).attr('src', 'pngs/green-button30.png');

        trataGametRedemet(this.responseText);
        if (update && smartPlot && smartPlot.isGametOn())
          smartPlot.plotaGamets()
        return this.responseText;
      } else if (this.readyState > 2 && this.status !== 200) {
        erro = erro + this.responseText;
        //$("#imgLoad"+idxFIR).attr('src', 'pngs/red-button30.png');
        return erro;
      }
    }
  };
  //$(".imgLoad").attr('src', 'gifs/loading30x30.gif');
  xhttp.open('GET', urlCache + url + proxy, true);
  xhttp.send();
}

function salvarGamets() {
  var gametsBrutos = $("#taGAMETS").val();
  trataGametRedemet(gametsBrutos);
}

function limpaGamets() {

  $(".table-warning").remove();
  $(".table-dark").remove();
  $(".cabecalho").remove();
}

function getValidadeGamet(gamet) {
  //VALID 201200/201800
  return gamet.split(" VALID ")[1].substr(0, 13);
}

function getIniGamet(hora) {
  //201200/201800
  return hora.substr(2, 2);
}

//L100 SECN I SFC WIND: 150/31KT N OF S06 160/32KT S OF S06 AND N OF S09

function getFimGamet(hora) {
  //201200/201800
  return hora.substr(9, 2);
}


function trataGametRedemet(texto) {
  let visible = $('#chkExibirGamets').prop("checked");
  //let visible = true
  lastGamet = texto + ""
  var classe = "table-warning tableGametContent";
  if (texto.includes("mens")) {
    texto = convertToRedemet(texto);
  }

  limpaGamets();
  texto = texto.replace(/[\n\r]+/g, ' ');
  texto = removeEspacosDuplos(texto);
  //texto = "2021010922 - SBAZ GAMET VALID 091800/092400 SBGL - SBAZ AMAZONICA FIR BLW FL100SECN ISFC VIS: 3000M RASIGWX: ISOL TSSIG CLD: ISOL CB 2500/ABV 10000FT AGL 19/20 ISOL TCU 2300/ABV 10000FT AGLSIGMET APPLICABLE: X,X,XSECN IIPSYS: NILWIND/T: 2000FT 060/20 KT PS225000FT 080/25 KT PS1810000FT 090/25 KT PS09CLD: SCT CUSC 2000/6000FT AGLSCT ACAS 9000/ABV 10000FT AGLMNM QNH: 1008HPASEA: T29HGT 1.5MVA: NIL= 2021010922 - SBBS GAMET VALID 091800/092400 SBGL - SBBS BRASILIA FIR BLW FL100SECN ISFC VIS: 5000M RASIGWX: ISOL TSSIG CLD: ISOL CB 3500/ABV 10000FT AGLISOL TCU 3000/ABV 10000FT AGLSECN IIPSYS: NILWIND/T: 2000FT 360/10 KT PS255000FT 030/10 KT PS2010000FT 080/15 KT PS10CLD: SCT CUSC 3000/7000FT AGLSCT ACAS 8000/ABV 10000FT AGLFZLVL: ABV 10000FT AMSLMNM QNH: 1008HPAVA: NIL= 2021010922 - SBRE GAMET VALID 091800/092400 SBGL - SBRE RECIFE FIR BLW FL100SECN ISFC VIS: 5000M RASIG CLD: S OF S06 ISOL CB 3000/ABV 10000FT AGLISOL TCU 2500/ABV 10000FT AGLSIGMET APPLICABLE: X,X,XSECN IIPSYS: NILWIND/T: 2000FT 080/30 KT PS235000FT 090/25 KT PS1810000FT 120/15 KT PS09CLD: SCT CUSC 2500/7000FT AGLMNM QNH: 1007HPASEA: T27HGT 1.7MVA: NIL= 2021010922 - SBCW GAMET VALID 091800/092400 SBGL- SBCW CURITIBA FIR BLW FL100SECN ISFC VIS: N OF S26 5000M RASIGWX: N OF S26 ISOL TSSIG CLD: N OF S26 ISOL CB 3500/ABV 10000FT AGLN OF S26 ISOL TCU 3000/ABV 10000FT AGLSECN IIPSYS: NILWIND/T: 2000FT 100/15 KT PS205000FT 130/15 KT PS1710000FT 290/25 KT PS05CLD: FEW CUSC 3000/7000FT AGLSCT ACAS 9000/ABV 10000FT AGLFZLVL: ABV 10000FT AMSLMNM QNH: 1007HPASEA: T24HGT 1.3MVA: NIL= "
  var agora = getUTCAgora();
  var horaAtual = agora.getHours()
  var erro = ""
  var part1 = [0, 0, 0, 0]
  var idx = 0;
  var posicaoGAMET = 1
  arrayGamets = []
  while (idx < arrayLocalidadeFIR.length) {
    var gamet = texto.split(arrayLocalidadeFIR[idx] + " GAMET");
    if (OPMET) { // em caso de emenda o banco OPMET returna o gamet mais recente depois
      posicaoGAMET = 0
      gamet = gamet.reverse()
    }

    if (gamet && gamet.length > 1) {
      //limpaArrayStatus(idx)

      gamet = gamet[posicaoGAMET].split("=")[0]

      var val = getValidadeGamet(gamet)
      var horaIniGamet = getIniGamet(val)
      var horaFimGamet = getFimGamet(val)

      vis = "</br>" + getVisibHtml(gamet, idx, val)
      teto = "</br>" + getNuvensHtml(gamet, idx, val)

      if ((horaAtual < horaIniGamet) || (horaAtual >= horaFimGamet)) {

        classe = "table-dark";
        erro = " **** Gamet fora da Validade! **** "
        erro = spanRed(erro, erro)
        if (!gametTimeout)
          gametTimeout = setTimeout("getGamet(1);", 5000)

      }
      let strStyle = ""
      if (!visible)
        strStyle = 'style="display:none"'

      str = erro + "GAMET VALID " + val + " " + arrayLocalidadeFIR[idx].toUpperCase() + " - " + vis + " - " + teto;
      $("#" + arrayTableFir[idx] + " thead").append('<tr class="' + classe + '" ' + strStyle + '><td id = "td' + arrayLocalidadeFIR[idx] + '" colspan = "5"><b>' + str + '</b></td></tr>');
      $("#" + arrayTableFir[idx] + " thead").append('<tr class="cabecalho"><td><b>Mensagem</b></td><td><b>Status AD WRNG</b></td><td><b>Status GAMET</b></td><td><b>Status AIRMET</b></td><td><b>CMA-1</b></td></tr>');

      if ((gamet.indexOf("VIS") == -1) && (part1[idx] == 0)) {
        part1[idx] = part1[idx] + 1;
        texto = texto.replace(arrayLocalidadeFIR[idx] + " GAMET", "") // se não tiver a parte 1, apaga a primeira ocorrência do gamet da fir
        idx = idx - 1;

      }
    }
    idx++;
  }
  if (!visible) {
    $('tableGametContent').hide();
  }
}


function getGamet(update, date = false) {
  gametTimeout = false

  let agora

  if (!date)
    agora = getUTCAgora();
  else
    agora = new Date(date)

  if (agora.getHours() < 6) {
    ini = "00"
    fim = "05"
  } else if (agora.getHours() < 12) {
    ini = "06"
    fim = "11"
  } else if (agora.getHours() < 18) {
    ini = "12"
    fim = "17"
  } else {
    ini = "18"
    fim = "23"
  }
  let dataIni
  let dataFim

  if (date) {
    ini = fillZero(parseInt(ini))

    dataIni = agora.getFullYear().toString() + fillZero(agora.getMonth() + 1) + fillZero(agora.getDate()) + ini;

    fim = parseInt(fim) + 1
    if (fim == 24) {
      fim = 1
      agora.addHours(24)

    }
    fim = fillZero(fim)
    dataFim = agora.getFullYear().toString() + fillZero(agora.getMonth() + 1) + fillZero(agora.getDate()) + fim;
  } else {
    dataIni = agora.getFullYear().toString() + fillZero(agora.getMonth() + 1) + fillZero(agora.getDate()) + ini;
    dataFim = agora.getFullYear().toString() + fillZero(agora.getMonth() + 1) + fillZero(agora.getDate()) + fim;
  }


  let url = ""
  if (redemetAntiga) {
    if (intraer)
      url = linkIntraer;
    else
      url = linkInternet;
    url = `${url}SBAZ,SBBS,SBRE,SBCW&msg=gamet&data_ini=${dataIni}&data_fim=${dataFim}`
  } else {
    url = `${linkAPINova}gamet/?api_key=${apiKey}&local=SBAZ,SBBS,SBRE,SBCW;`
  }
  if (!date)
    GetWebContentGamet(url, update == 1);
  else
    getNextGAMET(urlCache + url + proxy)
}
//http://localhost/WebServiceOPMET/getMetarOPMET.php?local=SBAZ,SBBS,SBRE,SBCW&msg=gamet&data_ini=2024031106&data_fim=2024031111
function getNextGAMET(url) {

  function getArrayGamets(gamets) {
    let patt = /SB[A-Z][A-Z] GAMET VALID \d{6}\/\d{6}/g

    return gamets.match(patt)
  }

  fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/txt"
    }
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      if (data == "")
        updateStatusGamet(false)
      else {
        arrayGametsOK = []
        gamets = getArrayGamets(data);

        let timeGamet = getGametsDateTime(gamets)
        for (let i in timeGamet) {
          if (compareGametDates(timeGamet[i].validade[0], horaNextGamet.dataIni))  //mudou para um novo gamet
            arrayGametsOK.push(timeGamet[i].FIR)
        }
        gametsOK = arrayGametsOK.length == 4
        updateStatusGamet(arrayGametsOK)
      }
    }
    )
}

function getGametAZ() {
  return $('#tdSBAZ').html()
}


function updateStatusGamet(firstTime) {
  if (smartPlot)
    panelStatusGAMET = smartPlot.$('#statusGAMET')
  else
    return

  let agora = getUTCAgora()

  let dh = getHoraNextGAMET()

  let ligarPulse = agora > dh.dataIni.addHours(-2) //dh é alterado na funcao addHours
  //let ignorarAusentes = agora < dh.dataIni.addHours(-1)

  let arrAusentes = arrayLocalidadeFIR.filter(x => !arrayGametsOK.includes(x))
  let strAusentes = ""
  if (arrAusentes.length > 0)
    strAusentes = arrAusentes.join(', ');

  qtdGAMETsProxHoraNaRede = arrayGametsOK.length

  if (qtdGAMETsProxHoraNaRede < 4) {
    panelStatusGAMET.removeClass("statusOK")
    panelStatusGAMET.removeClass("sombraClara")
    panelStatusGAMET.addClass("statusERRO")
    if (ligarPulse)
      panelStatusGAMET.addClass("errorPulse")
    panelStatusGAMET.html(`GAMET - ${dh.dia} ${dh.hora} - ${arrAusentes.length} AUSENTES`)
    panelStatusGAMET.attr("title", `GAMETs AUSENTES: ${strAusentes}`);
  } else {
    panelStatusGAMET.removeClass("errorPulse")
    panelStatusGAMET.removeClass("statusERRO")
    panelStatusGAMET.addClass("statusOK")
    panelStatusGAMET.addClass("sombraClara")
    panelStatusGAMET.html(`GAMET - ${dh.dia} ${dh.hora}  - OK`)
    panelStatusGAMET.attr("title", `${qtdGAMETsProxHoraNaRede} GAMETs ENCONTRADOS NA CONSULTA: ${arrayGametsOK.join(", ")}`);
  }
  panelStatusGAMET.show()
}
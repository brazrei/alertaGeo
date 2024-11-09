var hoursContainer = document.querySelector('.hours');
var minutesContainer = document.querySelector('.minutes');
var secondsContainer = $('#seconds');
var tickElements = Array.from(document.querySelectorAll('.tick'));
var segundos = 0;
var last = new Date(0);
var myIp;
var smartPlot = false;
var zoom2CookieTimer = false

last.setUTCHours(-1);

var tickState = true;

//Zoom control
px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
$(window).resize(function () { isZooming(); });
function isZooming() {
  var newPx_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
  if (newPx_ratio != px_ratio) {
    px_ratio = newPx_ratio;
    //console.log("zooming");
    if (zoom2CookieTimer)
      clearTimeout(zoom2CookieTimer)
    zoom2CookieTimer = setTimeout(saveZoom2Cookie, 5000, Math.round(px_ratio * 100));
    return true;
  } else {
    //console.log("just resizing");
    return false;
  }
}
//

function getIp() {
  $.get("https://ipinfo.io", function (response) {

    myIp = response.ip;

  }, "jsonp");
}

function updateMetarGamet() {
  BtnMetarGERALClick(false, 'SM');
  setTimeout("BtnMetarGERALClick(false,'SM');", 2000)
}

function updateTime() {
  var now = new Date();

  var lastHours = last.getHours().toString();
  var nowHours = now.getHours().toString();
  if (lastHours !== nowHours) {
    //   updateContainer(hoursContainer, nowHours);
  }

  var lastMinutes = last.getMinutes().toString();
  var nowMinutes = now.getMinutes().toString();
  if (lastMinutes !== nowMinutes) {
    BtnMetarGERALClick();
    //   updateContainer(minutesContainer, nowMinutes);
  }

  var lastSeconds = last.getSeconds().toString();
  var nowSeconds = now.getSeconds().toString();
  if (lastSeconds !== nowSeconds) {
    //tick()
    updateContainer(secondsContainer, nowSeconds);
  }

  last = now
}

function tick() {
  tickElements.forEach(t => t.classList.toggle('tick-hidden'))
}

function updateContainer(container, newTime) {
  var time = newTime.split('');

  if (time.length === 1) {
    time.unshift('0');
  }


  var first = $("#seg1");

  if (first.textContent !== time[0]) {
    updateNumber(first, time[0]);
  }

  var last = container.lastElementChild;
  if (last.lastElementChild.textContent !== time[1]) {
    updateNumber(last, time[1]);
  }
}

function updateNumber(element, number) {
  //element.lastElementChild.textContent = number
  var second = element.lastElementChild.cloneNode(true);
  second.textContent = number;

  element.appendChild(second)
  element.classList.add('move');

  setTimeout(function () {
    element.classList.remove('move');
  }, 990);
  setTimeout(function () {
    element.removeChild(element.firstElementChild)
  }, 990);
}

function atualizaCronometro() {
  segundos = segundos + 1;
  if (segundos > 59) {
    primeiraVez = false;


    BtnMetarGERALClick(true);
    segundos = 0;
  }

  $("#cronometro").text(":" + fillZero(59 - segundos));
}

function checkAZChange(viaCookie) {
  viaCookie = viaCookie == "sim";
  if (viaCookie)
    firVisible[0] = $('#chkFIRAZ').prop('checked');
  else
    firVisible[0] = this.checked;

  if (!viaCookie)
    $.cookie("firAZ", firVisible[0] ? "show" : "hide", { expires: 30 });
  if (firVisible[0])
    $("#firAZtable").show();
  else
    $("#firAZtable").hide();
}

function checkBSChange(viaCookie) {
  viaCookie = viaCookie == "sim";
  if (viaCookie)
    firVisible[1] = $('#chkFIRBS').prop('checked');
  else
    firVisible[1] = this.checked;

  if (!viaCookie)
    $.cookie("firBS", firVisible[1] ? "show" : "hide", { expires: 30 });
  if (firVisible[1])
    $("#firBStable").show();
  else
    $("#firBStable").hide();
}

function checkREChange(viaCookie) {
  viaCookie = viaCookie == "sim";
  if (viaCookie)
    firVisible[2] = $('#chkFIRRE').prop('checked');
  else
    firVisible[2] = this.checked;

  if (!viaCookie)
    $.cookie("firRE", firVisible[2] ? "show" : "hide", { expires: 30 });
  if (firVisible[2])
    $("#firREtable").show();
  else
    $("#firREtable").hide();
}

function checkCWChange(viaCookie) {
  viaCookie = viaCookie == "sim";
  if (viaCookie)
    firVisible[3] = $('#chkFIRCW').prop('checked');
  else
    firVisible[3] = this.checked;

  if (!viaCookie)
    $.cookie("firCW", firVisible[3] ? "show" : "hide", { expires: 30 });
  if (firVisible[3])
    $("#firCWtable").show();
  else
    $("#firCWtable").hide();
}

function inicializaChkAUTO() {
  $('#chkLocAuto').change(function () {
    escondeSpeciAUTO = $('#chkLocAuto').prop('checked');
    BtnMetarGERALClick(false);
  });

}

function inicializaChkAPI() {
  $('#chkFonteAPINova').change(function () {
    redemetAntiga = !$('#chkFonteAPINova').prop('checked');
    getGamet();
    BtnMetarGERALClick(true);
  });

}

function inicializaChkFir() {
  $('#chkFIRAZ').change(checkAZChange);
  $('#chkFIRBS').change(checkBSChange);
  $('#chkFIRRE').change(checkREChange);
  $('#chkFIRCW').change(checkCWChange);
}

function inicializaGamets() {
  $("#getGamet").click(function () {
    getGamet();
  });
  $("#salvarGamets").click(function () {
    salvarGamets();
    if (smartPlot)
      smartPlot.plotaGamets()
  });
  $("#showWindowGamet").click(function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    //setTimeout(getGamet, 1);
  });
}

function setGrupos() {
  $("#spanCMIAZ").text(removeEspacos(localidadesFIR[0]).replace(/,/g, ", "));
  $("#spanCMIBS").text(removeEspacos(localidadesFIR[1]).replace(/,/g, ", "));
  $("#spanCMIRE").text(removeEspacos(localidadesFIR[2]).replace(/,/g, ", "));
  $("#spanCMICW").text(removeEspacos(localidadesFIR[3]).replace(/,/g, ", "));
}

function openSmartPlot() {
  if (!smartPlot || smartPlot.closed) {
    smartPlotOnline = true
    smartPlot = window.open("../spago2021/index.html", 'SMART PLOT', '')
    // smartPlot = window.open("../../smartplot8/index.html", 'SMART PLOT', 'menubar=no,status=no')
  }
  else
    smartPlot.focus()
}

function openSmartMetar() {
  window.focus()
  alert("Seja bem vindo!")
}

function checkNavigator() {
  if (!navigator.userAgent.toUpperCase().includes('FIREFOX'))
    alert('O SMARTPLOT PODE NÃO FUNCIONAR CORRETAMENTE NO NAVEGADOR CHROME! \n \nFAVOR UTILIZAR PREFERENCIALMENTE O FIREFOX!')

}

$(document).ready(function () {
  //BtnMetarGERALClick ();
  var scale = 'scale(0.99)';
  //  smartPlot = window.open("https://smartmetar.000webhostapp.com/sp4/index.html")
  //openSmartPlot()

  document.body.style.webkitTransform = scale;    // Chrome, Opera, Safari
  document.body.style.msTransform = scale;       // IE 9
  document.body.style.transform = scale;     // General

  //getIp();
  checkNavigator()

  inicializaChkFir();
  inicializaChkAUTO();
  inicializaChkAPI();

  inicializaCookies();

  atualizaSelectVis();
  atualizaSelectVento();

  inicializaGamets();

  getAeroportos();

  setTimeout(getAdWRNG, 1000);
  setInterval(getAdWRNG, 60000);

  getGamet();

  
  setTimeout(checkGamet, 5000,true)
  setInterval(checkGamet, 60000)

  setInterval(atualizaCronometro, 1000);

  setGrupos();


  //   BtnMetarGERALClick(true); vai ser chamado de dentro da leitura do xml dos aeroportos.

});




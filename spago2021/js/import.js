var myIp
var arrayMetares = []

function getIp() {
  return " "
  $.get("https://ipinfo.io", function (response) {

    myIp = response.ip;

    getMetaresFromPage();

    setInterval("getMetaresFromPage()", 30000)


  }, "jsonp");
}


function extractMetar(metares) {
  metares = metares.split('<tr title=')
  let tipo = false;
  for (let i in metares) {
    let met = metares[i]
    if (met.includes('METAR'))
      tipo = "METAR"
    if (met.includes('SPECI'))
      tipo = "SPECI"
    if (tipo) {
      met = met.split(tipo)[1]

      arrayMetares.push(tipo + " " + met.split("</td>")[0])
    }
  }

}

function getMetaresFromPage() {
  arrayMetares = []
  for (let i = 0; i < 4; i++) {
    let data = window.opener.$("#" + window.opener.arrayTableFir[i]).html()
    extractMetar(data);
  }
  arrayMetares.reverse();

  plotaAeroportos()
}

function getMetaresFromFile() {
  arrayMetares = []
  for (let i in arrayLocalidadeFIR) {
    let fileName = "../../dez2020/php/website-contents-" + myIp + "FIR" + i + ".json"
    $.get(fileName, {}, function (data) {
      extractMetar(data);
    }, "text")
  }

} 
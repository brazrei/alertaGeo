var arrGametsPlot = []
var arrayGametsTooltip = []
function getGametArea(s) {
  function makeGametCoord(s, patt) {
    //patt = 
    a = s.match(patt)
    r = false
    if (a)
      r = a[0].split(' ')[2] + "00"


    return r
  }

  sof = 'N0740'
  eof = 'W07400'
  wof = 'W00950'
  nof = 'S3550'

  box = 'N0740 W07400 - N0740 W00950 - S3550 W00950 - S3550 W07400- N0740 W07400'
  box2 = 'lat1 lon1 - lat1 lon2 - lat2 lon2 - lat2 lon1 - lat1 lon1'

  pattLat1 = /S OF [SN]\d{2}/g
  pattLat2 = /N OF [SN]\d{2}/g
  pattLon1 = /E OF [W]\d{3}/g
  pattLon2 = /W OF [W]\d{3}/g

  lat1 = makeGametCoord(s, pattLat1)
  lat1 = lat1 ? lat1 : sof

  lat2 = makeGametCoord(s, pattLat2)
  lat2 = lat2 ? lat2 : nof

  lon1 = makeGametCoord(s, pattLon1)
  lon1 = lon1 ? lon1 : eof

  lon2 = makeGametCoord(s, pattLon2)
  lon2 = lon2 ? lon2 : wof

  box2 = box2.replaceAll('lat1', lat1)
  box2 = box2.replaceAll('lat2', lat2)
  box2 = box2.replaceAll('lon1', lon1)
  box2 = box2.replaceAll('lon2', lon2)
  return box2
}

function clearLayersGamets() {
  if (arrGametsPlot)
    for (var i in arrGametsPlot)
      map.removeLayer(arrGametsPlot[i])

  //removePopupsVencidos()
  arrGametsPlot = []//.length = 0
  arrayGametsTooltip = []
  //arrIdxSigmetsPlot.length = 0
}

function getColorGamet(tipo) {
  if (tipo == "VIS") {
    return "green"
  } else
    return "#f933ff"

}

function cutFIRGamet(coordG, tPolyFir, descricao, opt) {
  //    let tPolyFir = [getCoordDegAirmet(coordFIR)]
  // let tPolyFir = coordFIR


  let polyFir = turf.polygon(tPolyFir)

  let polyEdit = turf.polygon([getCoordDegAirmet(coordG)]);

  let plotFirCut = turf.intersect(polyFir, polyEdit);

  if (plotFirCut) {

    let iCoord = getCutCoordinates(plotFirCut);
    if (iCoord.length == 1) //quando soh ha um poligono por fir a coordenada vem em formato diferente.
      iCoord = [iCoord]
    let coord = []
    for (let i in iCoord) {
      iPoly = iCoord[i][0]
      coord.push(invertLatLong(iPoly))
    }
    return coord
  }
  return false
}


function plotaGamet(FIR, validadeG, tipo, area, valor, validade) {
  function getGametDescription(FIR, color, area, valor, validade) {
    let circle = `<div id="circle" style = "background: ${color}; width: 20px;  height: 20px; border-radius: 50%; float:left; padding: 10px;"></div>`
    validade = validade.replaceAll("<br>", "").replaceAll(" ", "")
    validade = validade == '' ? '' : 'VALIDADE: <b>' + validade + 'Z</b><br>'
    return `${circle} <div style="width: 300px"><span style="padding-left: 5px; font-weight: bold;">GAMET ${FIR} </span><br><br>${validade} ÁREA: ${area}<br><b>${valor}</b></div>`
  }

  let areaCoord = getGametArea(area)
  var poly = invertLatLong(getCoordDegSigmet(areaCoord))

  if (FIR == 'SBAZ')
    plotFir = firAZCoords
  else if (FIR == 'SBRE')
    plotFir = firRECoords
  else if (FIR == 'SBBS')
    plotFir = firBSCoords
  else if (FIR == 'SBCW')
    plotFir = firCWCoords



  //console.log("poly ==>", poly)
  let color = getColorGamet(tipo)
  let opt = {
    className: "",
    color: color,
    fillColor: color
  }
  //let cut = cutFIRGamet(areaCoord, [(getCoordDegAirmet((plotFir)))], "", opt)

  //if (isCloseToValidOff(a.codigo))
  //  opt.className = "pulse";

  let arrCut = cutFIRGamet(areaCoord, [(getCoordDegAirmet((plotFir)))], "", opt)

  arrCut.forEach(coord => {
    let cut = L.polygon(coord, opt)
    let p;
    if (!cut)
      p = L.polygon(poly, opt).addTo(map)
    else
      p = cut.addTo(map)


    p.bringToBack();
    arrGametsPlot.push(p)

    let gametDesc = getGametDescription(FIR + " - " + validadeG, color, area, valor, validade)
    arrayGametsTooltip[p._leaflet_id] = gametDesc
    p.bindTooltip(gametDesc, { closeButton: false, sticky: true });

    p.on('mouseover', function (e) {
      // Set highlight
      setStyleMouseOver(this)
      setMenuMapaOff();
    });
    p.on('mouseout', function (e) {
      setStyleMouseOut(this)
      setMenuMapaOn();
    });

    p.on('contextmenu', function (event) {
      selectedSigmet = event.target
      //selectedAirmet = false
      openContextMenuGamet(event, event.target);
    }, this);


  })

}

function setStyleMouseOver(layer) {
  layer.setStyle({
    opacity: 0.1,
    fillOpacity: 0.6
  });
}

function setStyleMouseOut(layer) {
  layer.setStyle({
    opacity: 1,
    fillOpacity: 0.2
  });
}

function isGametOn() {
  return $('#chkGAMET').prop("checked")
}

function isGametVisOn() {
  return $('#chkGametVis').prop("checked")
}

function isGametTetoOn() {
  return $('#chkGametTeto').prop("checked")
}

function mostraGamet() {
  if ($('#chkGAMET').prop("checked")) {
    $('#divGametType').show()
    plotaGamets()
  }
  else {
    $('#divGametType').hide()
    clearLayersGamets()
  }
}


function mostraGametVis() {
  plotaGamets()
}

function mostraGametTeto() {
  plotaGamets()
}


function plotaGamets() {
  clearLayersGamets()
  //arrGametsPlot = []

  opener.arrayGamets.forEach(gamet => {
    if (isGametVisOn()) {
      gamet.arrVisib.forEach(vis => {
        plotaGamet(gamet.FIR, gamet.validade, 'VIS', vis.area, vis.valor, vis.validade)
        //console.log(gamet.FIR + ' // ' + vis.area + ' // ' + vis.valor)

      })
    }
    if (isGametTetoOn()) {
      gamet.arrTeto.forEach(teto => {
        plotaGamet(gamet.FIR, gamet.validade, 'TETO', teto.area, teto.nome + " " + teto.valor, teto.validade)
        //console.log(gamet.FIR + ' // ' + teto.area + ' // ' + teto.valor)

      })
    }
  })
}

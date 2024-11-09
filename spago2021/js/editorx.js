var velocity1, velocity2, velocity3,
  activeLayerWind = false

class Velocity {
  layer = false;
  horaPrevisao = false;
  dataPrevisao = false;
  level

  createLayer() {
    return
  }
  getLevel() {
    return this.level
  }

  setLevel(l) {
    this.level = l
  }

  update(data, rodada, offset, level, tipo, color, callback) {
    $.getJSON(`php/getdjango.php?data=${data}&rodada=${rodada}&offset=${offset}&level=${level}&tipo=wind`, function (data) {
      //console.log(data)
      this.layer = false
      let erroGrib2 = false
      if (Array.isArray(data) && data.length > 0 && data[0].data) {
        if (typeof data[0].data == 'string' && data[0].data.toUpperCase() == "ERRO!") {
          console.log("Erro no dado Grib2!")
          erroGrib2 = true
        }
        else {
          this.layer = L.velocityLayer({
            displayValues: true,
            displayOptions: {
              velocityType: "Global Wind",
              position: "bottomleft",
              emptyString: "No Wind data",
              angleConvention: "meteo",
              directionString: "Direção",
              colorScale: color,
              speedUnit: 'kt'
              //particleMultiplier: 1/10000
            },
            data: data,
            maxVelocity: 300 // a partir de que valor a partícula fica vermelha

          });
        }
      }
      callback(this.layer, erroGrib2)
    });


  }
}

//sempre que for editados os poligonos gravar o cookie
//editableLayers._layers[23892]._tooltip._content.split('<br>')[0]


var editableLayers = false
var sharedLayers = []
var layersEditados = []
var selectedLayer
var latLngClicked
var disableCtrl = false
var timerCopiaCoords = null
var decMagnetica = 20
var teste
var timerMovemap = false
var arrayLevelWindLabels = []
const arrayLevelsWind = { 0: "Superfície", 50: "500hPa", 100: "300hPa" }
const arrayLabelBottom = { 0: 348, 50: 437, 100: 527 }

function updateLabelSliderWind() {
  let val = $("#sliderWind").val()
  $("#labelWind0").css("opacity", 0.3)
  $("#labelWind50").css("opacity", 0.3)
  $("#labelWind100").css("opacity", 0.3)

  $("#labelWind" + val).css("opacity", 1)
  //$("#labelWind" + val).text(arrayLevelsWind[val])
  $("#labelWind2").text(arrayLevelWindLabels[arrayLevelsWind[val].toUpperCase()])

}

function removeVelocityLayer(velocity) {
  if (velocity && velocity.layer) {
    try { velocity.layer.removeFrom(map) }
    catch { console.log("Erro ao tentar remover o Layer!")}

  }
}

function addVelocityLayer(velocity) {
  if (velocity && velocity.layer) {
    try { velocity.layer.addTo(map) }
    catch { console.log("Erro ao tentar adicionar o Layer ao mapa!")}

  }
}

function animaWind(sender) {
  if (sender.checked) {
    $('.windy').css('background-color', '#009299')
    $('.sliderWind').trigger('input')
  } else {
    $('.windy').css('background-color', '#bed2d3')
    removeVelocityLayer(velocity1)
    removeVelocityLayer(velocity2)
    removeVelocityLayer(velocity3)
  }

}

function turnOnCheckWindy() {
  $('#chkWindPart').prop('checked', true)

}

function isCheckWindyOn() {
  return $('#chkWindPart').prop('checked')
}

$(document).ready(() => {
  $('.windy').css('background-color', '#009299')
  $("#sliderWind").val(0);

  $("#labelWind2").on('click', () => {
    $("#chkWindPart").trigger('click')
    //turnOnCheckWindy()
    //$("#sliderWind").trigger('input');
  })

  $("#labelWind0").on('click', () => {
    if (!$('#chkWindPart').prop('checked'))
      $("#chkWindPart").trigger('click')

    turnOnCheckWindy()
    $("#sliderWind").val(0);
    $("#sliderWind").trigger('input');
  })

  $("#labelWind50").on('click', () => {
    if (!$('#chkWindPart').prop('checked'))
      $("#chkWindPart").trigger('click')

    turnOnCheckWindy()
    $("#sliderWind").val(50);
    $("#sliderWind").trigger('input');
  })

  $("#labelWind100").on('click', () => {
    if (!$('#chkWindPart').prop('checked'))
      $("#chkWindPart").trigger('click')

    turnOnCheckWindy()
    $("#sliderWind").val(100);
    $("#sliderWind").trigger('input');
  })

  $('.sliderWind').on('input', (e) => {
    let val = parseInt(e.target.value)
    updateLabelSliderWind()
    setWindLevel(val)

  })
})

function setWindLevel(level) {
  switch (level) {
    case 0:
      addVelocityLayer(velocity1)
      removeVelocityLayer(velocity2)
      removeVelocityLayer(velocity3)
      activeLayerWind = velocity1.getLevel();
      break

    case 50:
      addVelocityLayer(velocity2)
      removeVelocityLayer(velocity1)
      removeVelocityLayer(velocity3)
      activeLayerWind = velocity2.getLevel();
      break

    case 100:
      addVelocityLayer(velocity3)
      removeVelocityLayer(velocity1)
      removeVelocityLayer(velocity2)
      activeLayerWind = velocity3.getLevel();
      break

  }

}

function updateSmartMetar() {
  window.opener.BtnMetarGERALClick(false, 'SP');
  setTimeout("window.opener.BtnMetarGERALClick(false,'');", 2000) //força a atualizacao dos gamets com a nova lista de metares
}

function fillZero(num) {
  //num = parseInt(num)
  if (Math.abs(num) < 10) {
    /*  if (num < 0)
        num = "0" + Math.abs(num)
      else*/
    num = "0" + Math.abs(num)
  }
  return num + ""
}

function deg_to_dms(deg) {
  let neg = ""
  if (deg < 0)
    neg = "-"
  deg = Math.abs(deg)
  var d = Math.trunc(deg);
  var minfloat = (deg - d) * 60;
  var m = Math.round(minfloat); //como nao ha definicao de segundos, podemos arredondar
  var secfloat = (minfloat - m) * 60;
  var s = Math.round(secfloat);
  // After rounding, the seconds might become 60. These two
  // if-tests are not necessary if no rounding is done.
  if (s == 60) {
    m++;
    s = 0;
  }
  if (m == 60) {
    d++;
    m = 0;
  }
  return neg + fillZero(d) + fillZero(m).replace("-", "");
}


function convertLat(lat) {
  lat = lat + ""
  if (lat.includes("-")) {
    lat = lat.replace(/-/g, "")
    lat = "S" + lat
  } else
    lat = "N" + lat
  return lat
}

function convertLng(lng) {
  lng = lng + ""
  if (lng.includes("-")) {
    lng = lng.replace(/-/g, "")
    lng = "W0" + lng
  } else
    lng = "E0" + lng
  return lng
}

function extractDMS(texto) {

  let coord = texto.split("[[[")[1]
  coord = coord.split("]]]")[0]
  coord = coord.split("],[")
  let newCoord = []
  //coord = coord.split(",")
  //console.log("coord", coord)
  //return coord

  for (let i in coord) {
    let latlng = coord[i].split(",")
    let lng = latlng[0]
    let lat = latlng[1]
    //console.log(lat)
    //console.log(lng)
    lat = deg_to_dms(lat)
    let newLat = convertLat(lat)
    lng = deg_to_dms(lng)
    let newLng = convertLng(lng)
    newCoord.push(newLat + " " + newLng)
  }
  return newCoord.join(" - ")
}

function copiaAutomatica() {
  return $("#chkCopiaAuto").prop("checked")
  //return false
}

function copyFromTextArea() {
  copiaCoordenadas($("#taCoordenadas").val(), true)

}

/*function pastToTextArea() {

  navigator.clipboard.readText()
    .then(text => {
      $("#taCoordenadas").val(text)
      $("#taCoordenadas").select()
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
}*/

function copiaCoordenadas(coord, copiaForcada = false) {

  if (copiaAutomatica() || copiaForcada) {
    var $tempElement = $("<input>");
    $("body").append($tempElement);
    $tempElement.val(coord).select();
    document.execCommand("Copy");
    $tempElement.remove();
  }
  $("#taCoordenadas").val(coord)
  $("#taCoordenadas").select()
  document.getElementById('taCoordenadas').dispatchEvent(new Event('input'))

  return coord
  //alert(coord);
}

function openLayerPopup(layer) {
  layer.openPopup();
}

function atualizaLayersEditados() {
  let l = editableLayers.getLayers()
  for (let i in l) {
    formataLayerEdit(l[i])
  }
}

function translateDrawBar() {
  L.drawLocal = {
    draw: {
      toolbar: {
        // #TODO: this should be reorganized where actions are nested in actions
        // ex: actions.undo  or actions.cancel
        actions: {
          title: 'Cancelar',
          text: 'Cancelar'
        },
        finish: {
          title: 'Salvar',
          text: 'Salvar'
        },
        undo: {
          title: 'Desfazer',
          text: 'Desfazer'
        },
        buttons: {
          polyline: 'Traçar uma Rota',
          polygon: 'Traçar um Polígono',
          rectangle: 'Traçar um Retângulo',
          circle: '- your text-',
          marker: '- your text-',
          circlemarker: '- your text-'
        }
      },
      handlers: {
        circle: {
          tooltip: {
            start: '- your text-'
          },
          radius: '- your text-'
        },
        circlemarker: {
          tooltip: {
            start: '- your text-.'
          }
        },
        marker: {
          tooltip: {
            start: '- your text-.'
          }
        },
        polygon: {
          tooltip: {
            start: 'Clique para Iniciar a Traçar seu Polígono.',
            cont: 'Clique para Continuar a Traçar seu Polígono.',
            end: 'Clique no Ponto Verde para Terminar.... ou Pressione <strong>"esc"</strong> para Cancelar.'
          }
        },
        polyline: {
          error: '<strong>Erro:</strong> Linhas não Podem se Cruzar!',
          tooltip: {
            start: 'Clique para Iniciar a Traçar sua Rota.',
            cont: 'Clique para Continuar a Traçar sua Rota.',
            end: 'Clique em Cancelar, ou Pressione <strong>"esc"</strong> para Terminar.'
          }
        },
        rectangle: {
          tooltip: {
            start: 'Clique para Iniciar a Traçar seu Retângulo.',
          }
        },
        simpleshape: {
          tooltip: {
            end: 'Release mouse to finish drawing.'
          }
        }
      }
    },
    edit: {
      toolbar: {
        actions: {
          save: {
            title: 'Salvar Alterações',
            text: 'Salvar'
          },
          cancel: {
            title: 'Cancelar edição, descartar todas as Alterações!',
            text: 'Cancelar'
          },
          clearAll: {
            title: 'Apagar todos os Polígonos!',
            text: 'Apagar tudo!'
          }
        },
        buttons: {
          edit: 'Editar Polígonos',
          editDisabled: 'Não há Polígonos para Editar',
          remove: 'Apagar Polígonos!',
          removeDisabled: 'Não Há Polígonos para Apagar!'
        }
      },
      handlers: {
        edit: {
          tooltip: {
            text: 'Drag handles or markers to edit features.',
            subtext: 'Click cancel to undo changes.'
          }
        },
        remove: {
          tooltip: {
            text: 'Clique em um Polígono para Apagá-lo!'
          }
        }
      }
    }
  };
}

function isEqualArr(arr1, arr2) { // compara dois arrays {lat lng}
  let igual = true
  if (arr1.length == arr2.length) {
    for (let i in arr1) {
      igual = igual && (arr1[i].lat == arr2[i].lat)
      igual = igual && (arr1[i].lng == arr2[i].lng)
    }
  } else
    return false
  return igual
}

function updateEditableLayers(layer) { // apaga se existir algum layer com as mesmas coordenadas do layer em questao
  edtLayers = editableLayers.getLayers()

  for (let i in edtLayers) {
    if (isEqualArr(edtLayers[i].getLatLngs()[0], layer.getLatLngs()[0])) {
      editableLayers.removeLayer(edtLayers[i])
    }
  }
  editableLayers.addLayer(layer);
}

function removeLayerEdit(layer, limpaCoord = false) {
  let isCutted = arrCutted.indexOf(layer)
  if (isCutted > -1) {
    arrCutted.pop(isCutted);
  }

  map.removeLayer(layer);
  editableLayers.removeLayer(layer);
  if (limpaCoord)
    $("#taCoordenadas").val("");

}

function setLayerStyleByVertices(layer) {
  let layerCoords = extractDMS(JSON.stringify(layer.toGeoJSON()))
  let color = '#333'
  let ret = true
  let xStripes
  if (!checaVertices(layerCoords.split('-'))) {
    ret = false
    color = 'red'
    xStripes = stripes
  }
  layer.setStyle({
    fillColor: "#111",
    color: color,
    fillPattern: xStripes,
    dashArray: '20, 20', dashOffset: '10'

  });

  return ret
}

function removeSharedLayers(layers) {
  let newSharedLayers = []
  layers.forEach(layer => {
    Object.values(sharedLayers).forEach(l => {
      if (!l._tooltip._content.includes(layer.coordenadas))
        newSharedLayers.push(l)
    })
  })
  sharedLayers = newSharedLayers.splice(0)
}

//Se for passado um layer como parâmetro, envia apenas ele, se não, envia todos os editáveis.
function saveLayersOnServer(layer = false) {
  function buscaLayer(sharedLayers, layer) {
    let achou = false
    Object.values(sharedLayers).forEach(l => {
      if (layer._leaflet_id == l._leaflet_id)
        achou = true
    })
    return achou
  }

  //editableLayers._layers[23892]._tooltip._content.split('<br>')[0]
  //let layers
  if (!buscaLayer(sharedLayers, layer))
    sharedLayers.push(layer)

  /*if (layer) { 
    keys = [layer]
    layers = [layer]
  }
  else {
    layers = editableLayers._layers //ajustar para exportar todos

    let keys = Object.keys(layers)

    if (keys.length == 0)
      return false*/

  let txt = '"areas": ['
  let sep = ''
  sharedLayers.forEach((l) => {
    txt += sep + '{"coordenadas": "' + l._tooltip._content.split('<br>')[0] + '", "descricao": "' + getDescricaoLayer(l) + '", "ip": "***@@IP@@***"}'
    sep = ','

  })


  $.ajax({
    url: '../ago2021/php/saveLayers.php',
    data: { 'layers': txt + "]", 'usuario': opener.usuario },

    type: 'POST'
  });

}

function getDescricaoLayer(layer) {
  return arrayDescricaoLayer[layer._leaflet_id + 'L']
}

function formataLayerEdit(layer, keepStyle = false) {

  var menuEdits = [{
    text: 'Excluir',
    callback: function () {
      console.log("excluir");
    }
  }]
  let layerCoords = extractDMS(JSON.stringify(layer.toGeoJSON()))

  let showMsgSAGITARIO = false
  if (!keepStyle) {
    showMsgSAGITARIO = !setLayerStyleByVertices(layer)
  }

  layer.setStyle({
    //    contextmenu: true,
    //    contextmenuItems: menuEdits
  });

  layer.on('contextmenu', function (event) {
    selectedLayer = event.target
    openContextMenuPoly(event, event.target);
  }, this);

  layer.on('click', function (event) {
    timerCopiaCoords = setTimeout(copiaCoordenadas, 800, layerCoords)
    //copiaCoordenadas()
    layer.openPopup();
  }, this);

  layer.on('dblclick', function (event) {
    clearInterval(timerCopiaCoords);
    removeLayerEdit(event.target, true)
    setMenuMapaOn();


  }, this);

  layer.on('edit', function (event) {
    if (layersEditados.indexOf(event.target) < 0)
      layersEditados.push(event.target)
  }, this);

  layer.on('mouseover', function (e) {
    this.setStyle({
      opacity: 1,
      fillOpacity: 0.7
    })
    map.doubleClickZoom.disable();
    setMenuMapaOff();

  });

  layer.on('mouseout', function (e) {
    this.setStyle({
      opacity: 1,
      fillOpacity: 0.2
    });
    map.doubleClickZoom.enable();
    setMenuMapaOn();

  });

  let locs = getAeroportosOnEdit(layer)
  if (locs == "")
    locs = " Nenhum"

  let coord = extractDMS(JSON.stringify(layer.toGeoJSON()))
  copiaCoordenadas(coord)
  coord = insereQuebraHTML("-", coord)
  let strHelp = "<br><br>Clique uma Vez para Copiar as Coordenadas desta Área!<br>" +
    "Duplo-Clique para Excluir esta Área!"
  let msgSAG = showMsgSAGITARIO ? "<br><br>" + spanBold(spanRed(msgErroSAGITARIO)) : ""
  let strPoints = spanBold("<br>Vértices: " + (layerCoords.split("-").length - 1))
  let strDescricao = getDescricaoLayer(layer)
  strDescricao = strDescricao ? spanBold("<br>Descrição: " + strDescricao) : ""
  let desc = coord + "<br><br><b>Aeródromos na área plotada:<br>" + insereQuebraHTML(",", locs, 10) + "</b>" + spanRed(strHelp) + msgSAG + strPoints + strDescricao

  //layer.bindPopup(desc).openPopup();

  layer.bindTooltip(desc, { closeButton: false, sticky: true });

  updateEditableLayers(layer);

  //saveLayersOnServer()

  $(".drawercontainer .drawercontent").html(
    JSON.stringify(editableLayers.toGeoJSON())
  );

  return layer
}

function createVelocity(options = { data: false, rodada: false, offset: false, ativo: false, tipo: false, level: false, oldVelocity: false, rodadaAnterior: false }) {
  function getFullDate(data) {
    dia = ("0" + data.getUTCDate()).slice(-2)
    mes = ("0" + (data.getUTCMonth() + 1)).slice(-2)
    ano = data.getUTCFullYear()
    return ano + mes + dia
  }
  function removeVelocity(velocity) {
    if (velocity && velocity.layer) {
      velocity.layer.removeFrom(map)
      layerControl.removeLayer(velocity.layer)
      velocity = null
    }
  }
  if (!options.data)
    options.data = getUTCAgora()

  let data = getFullDate(options.data)

  let hora
  hora = options.data.getHours()
  let rodada = options.rodada
  if (options.rodadaAnterior) {
    hora -= 6
    if (hora < 0)
      hora = 24 + hora
  }
  if (!rodada) {
    if (hora > 21)
      rodada = 18
    else if (hora > 15)
      rodada = 12
    else if (hora > 9)
      rodada = 6
    else if (hora > 3)
      rodada = 0
    else
      rodada = 18

  }

  rodada = ("0" + rodada).slice(-2)

  let offset = options.offset
  if (!offset) {
    if (hora < rodada)
      hora += 24
    offset = hora - rodada
  }
  //offset+=3
  offset = ("00" + offset).slice(-3)


  let velocity = new Velocity()
  let level = options.level.toLowerCase()
  velocity.setLevel(options.level)
  let tipo = options.tipo
  if (tipo == "wind" && !level.includes("hpa")) {
    level = level.replace("m", "")
    level = parseInt(level)
    if (level < 100)
      level = "Superfície"
  }
  let horaP = (parseInt(rodada) + parseInt(offset)) % 24
  velocity.horaPrevisao = horaP
  velocity.dataPrevisao = data
  horaP = ("0" + horaP).slice(-2)

  let dataRodada = options.data
  addHours(dataRodada, parseInt(offset) * -1)
  dataRodada = getFullDate(dataRodada)
  //rodada = "18"
  removeVelocity(options.oldVelocity)
  velocity.update(dataRodada, rodada, offset, options.level, options.tipo, ["red"], function (velocityLayer, erroGrib) {
    /*
    if (erroGrib && !options.rodadaAnterior) {
      let now = getUTCAgora()
      if (now.getUTCMinutes() > 30)
        addHours(now, 1)
      velocity1 = createVelocity({ offset: false, ativo: true, tipo: "wind", level: "10m", data: now, oldVelocity: velocity1, rodadaAnterior: true })
    }
    */
    if (velocityLayer) {
      //oVelocity1 = layerControl.addOverlay(velocityLayer, `Vento Modelo GFS - ${horaP}Z - ${level}`);
      arrayLevelWindLabels[level.toUpperCase()] = `Vento (GFS) - ${horaP}Z`
      updateLabelSliderWind()
      velocity.layer = velocityLayer

      if ((options.ativo || options.level == activeLayerWind) && isCheckWindyOn()) {
        if (options.ativo)
          activeLayerWind = options.level

        map.addLayer(velocityLayer)
        activeLayerWind = options.level
      }
      //$('.sliderWind').trigger('input');

    }
  })
  return velocity
}


function makeMap() {
  //  Init Overlays
  var overlays = {};
  var aeroIntern = "SBBG* SBBE SBCF SBBV SBBR SBKP SBCG SBCR SBCZ SBCY SBCT SBFL SBFZ SBFI SBJP SBMQ SBEG SBNF SBPK SBPP SBPA SBPV SBRF SBRP* SBRB* SBGL SBSV SBSN SBSG SBSJ SBSP* SBVT* SBSL SBGR SBTT SBPB SBPL* SBPS* SBCB*	SBMO* SBMG*"

  //
  //Init BaseMaps
  basemaps = {
    "OpenStreetMaps": L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        minZoom: 2,
        maxZoom: 19,
        id: "osm.streets"
      }
    ),
    "GoogleMap": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
      {
        minZoom: 2,
        maxZoom: 19,
        id: "google.street"
      }
    ),
    "GoogleSatellite": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      {
        minZoom: 2,
        maxZoom: 19,
        id: "google.satellite"
      }
    ),
    "GoogleHybrid": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      {
        minZoom: 2,
        maxZoom: 19,
        id: "google.hybrid"
      }
    ),
    "Windy": L.tileLayer(
      "https://tiles.windy.com/tiles/v9.0/darkmap/{z}/{x}/{y}.png",
      {
        minZoom: 2,
        maxZoom: 19,
        id: "osm.windy"
      }
    ),
    "Esry": L.tileLayer(
      "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        minZoom: 2,
        maxZoom: 19,
        id: "Esry",
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
          "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      }
    ),
    "Dark": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }
    ),
    "Dark - Sem Legendas": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }
    )
  };

  //Map Options
  var mapOptions = {
    zoomControl: false,
    attributionControl: false,
    center: [-21.0529434318608, -48.01910972595218],
    zoom: 5,
    layers: [basemaps.Esry]
  };

  //Render Main Map

  map = L.map("map", mapOptions);

  //cria o stripPattern global
  stripes = new L.StripePattern();
  stripes.addTo(map);


  //Render Zoom Control
  L.control
    .zoom({
      position: "topleft"
    })
    .addTo(map);

  var sidebar = L.control
    .sidebar({
      autopan: true,
      container: "sidebar",
      position: "right"
    })
    .addTo(map);

  //Render Layer Control & Move to Sidebar
  layerControl = L.control
    .layers(basemaps, overlays, {
      position: "bottomleft",
      collapsed: true
    })
    .addTo(map);


  var oldLayerControl = layerControl.getContainer();
  var newLayerControl = $("#layercontrol");
  $("#sidebar").hide();
  // newLayerControl.append(oldLayerControl);
  $(".leaflet-control-layers-list").prepend("<strong class='title'>Mapas Base</strong><br>");
  $(".leaflet-control-layers-separator").after("<br><strong class='title'>Camadas</strong>");

  //######## Leaflet Draw
  editableLayers = new L.FeatureGroup();
  layerControl.addOverlay(editableLayers, "Cosmetic Layer");
  map.addLayer(editableLayers);

  /* Efeito de trazer o mapa pra frente:
  var topPane = map.createPane('leaflet-top-pane', map.getPanes().mapPane);
  topPane.appendChild(basemaps.Windy.getContainer());
  basemaps.Windy.setZIndex(5);
  */

  // efeito windy velocity

  /*
  $.getJSON("json/output.json", function(data) {
    var velocityLayer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: "Vento",
        position: "bottomleft",
        emptyString: "Sem Dados de Vento",
        directionString: "Direção",
        speedString: "Velocidade"
      },
      data: data,
      maxVelocity: 15
  
    });
  
    layerControl.addOverlay(velocityLayer, "Dados Silds 2016");
  });
*/
  try {
    let now = getUTCAgora()
    if (now.getUTCMinutes() > 30)
      addHours(now, 1)
    velocity1 = createVelocity({ offset: false, ativo: true, tipo: "wind", level: "10m", data: new Date(now) })
    velocity2 = createVelocity({ offset: false, ativo: false, tipo: "wind", level: "500hPa", data: new Date(now) })
    velocity3 = createVelocity({ offset: false, ativo: false, tipo: "wind", level: "300hPa", data: new Date(now) })

    intervalVelocity = setInterval(function () {
      let now = getUTCAgora()
      addHours(now, 1)
      if (velocity1 && now.getUTCMinutes() > 30 && velocity1.horaPrevisao !== now.getUTCHours()) {
        velocity1 = createVelocity({ offset: false, ativo: false, tipo: "wind", level: "10m", data: new Date(now), oldVelocity: velocity1, rodadaAnterior: false })
        velocity2 = createVelocity({ offset: false, ativo: false, tipo: "wind", level: "500hPa", data: new Date(now), oldVelocity: velocity2, rodadaAnterior: false })
        velocity3 = createVelocity({ offset: false, ativo: false, tipo: "wind", level: "300hPa", data: new Date(now), oldVelocity: velocity3, rodadaAnterior: false })
      }

    }, 60000)
    /*velocity4 = createVelocity({offset: 11})
    velocity4 = createVelocity({offset: 12})*/
  } catch (e) {
    console.log("Erro ao criar animação de vento! ")
    console.log(e)
  }

  /*
  $.getJSON(`http://localhost:8000/getjson/?data=${data}&rodada=${rodada}&offset=${offset}`, function (data) {
    velocityLayer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: "Global Wind",
        position: "bottomleft",
        emptyString: "No Wind data",
        angleConvention: "meteo",
        directionString: "Direção"
        //particleMultiplier: 1/10000
      },
      data: data,
      maxVelocity: 300 // a partir de que valor a partícula fica vermelha

    });

  });
  */
  //
  translateDrawBar()
  var drawOptions = {
    position: "topleft",
    draw: {
      polyline: {
        metric: false,
        feet: false,
        nautic: true
      },
      polygon: {
        allowIntersection: false,
        showArea: true
      },
      poly: {
        allowIntersection: false,
      },
      circle: false, // Turns off this drawing tool
      circlemarker: false, // Turns off this drawing tool
      rectangle: true,
      marker: false
    },
    edit: {
      featureGroup: editableLayers, //REQUIRED!!
      remove: true,
      allowIntersection: false

    }
  };


  var drawControl = new L.Control.Draw(drawOptions);

  polygonDrawer = new L.Draw.Polygon(map, drawControl.options.polygon);
  polylineDrawer = new L.Draw.Polyline(map, drawControl.options.polyline);
  rectangleDrawer = new L.Draw.Rectangle(map);



  map.addControl(drawControl);

  map.whenReady(capturaBotaoPlotagem);
  map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
      layer = e.layer;
    layer = formataLayerEdit(layer)
    //window.setTimeout(openLayerPopup,300,layer);
  });

  map.on('contextmenu', function (e) {
    if (menuMapa)
      openContextMenuMapa(e);

  });

  map.on(L.Draw.Event.EDITSTOP, function (e) {
    $(".drawercontainer .drawercontent").html(
      JSON.stringify(editableLayers.toGeoJSON())
    );
    atualizaLayersEditados();
  });

  map.on('draw:drawvertex',
    function (e) {
      function getLatLngFromLayer(arr) {
        let idx = arr.length - 1
        return { lat: arr[idx][1], lng: arr[idx][0] }
      }
      $(".leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.leaflet-zoom-animated.leaflet-interactive:first").css({ 'background-color': 'green' });
      $(".infoCoordinates").show();
      // if (globalLatlng)
      let coords = e.layers.toMultiPoint().geometry.coordinates
      latLngClicked = getLatLngFromLayer(coords)
      coords.push(" - INICIAL")
      !checaVertices(coords)

      disableCtrl = true
    });

  /*  map.on('draw:drawstart',
      function (e) {
      });
  */
  map.on('draw:drawstop',
    function (e) {
      $(".infoCoordinates").hide();
      disableCtrl = false
      globalLatlng = false
    });

  map.on(L.Draw.Event.DELETED, function (e) {
    editableLayers.eachLayer((layer) => {
      removeLayerEdit(layer);
    })
    $(".drawercontainer .drawercontent").html("");

  });
  map.on("dragstart",
    function (e) {
      if (polygonDrawer.enabled())
        polygonDrawer.deleteLastVertex()
    });
  //Edit Button Clicked
  $('#toggledraw').click(function (e) {
    layersEditados = []
    $(".leaflet-draw").fadeToggle("fast", "linear");

    $(".leaflet-draw-toolbar").fadeToggle("fast", "linear");
    this.blur();
    return false;
  });

  //Handle Map click to Display Lat/Lng
  function mouseOverMap(e) {
    function getAngle(orig, dest) {
      var point1 = turf.point(orig);
      var point2 = turf.point(dest);

      var bearing = turf.bearing(point1, point2);
      return (bearing + decMagnetica) % 360
    }
    globalLatlng = e.latlng
    $("#h5latlng").show();

    $("#h5latlng").html(convertLat(deg_to_dms(e.latlng.lat)) + " - " + convertLng(deg_to_dms(e.latlng.lng)));
    if (latLngClicked) {
      let angulo = getAngle([latLngClicked.lng, latLngClicked.lat], [e.latlng.lng, e.latlng.lat])
      if (angulo < 0)
        angulo = 180 + (180 + parseInt(angulo))
      if (angulo == 0)
        angulo = 360

      let distancia = getDistancia([latLngClicked.lng, latLngClicked.lat], [e.latlng.lng, e.latlng.lat])

      $("#h5angulo").html("Radial: " + Math.round(angulo) + "°");
      $("#h5distancia").html("Distância do Último Ponto: " + Math.round(distancia) + " Milhas");
    }
    clearTimeout(timerMovemap);
    timerMovemap = setTimeout(checkMouseGamets, 50, e.latlng)
  }



  map.on('keydown', function (e) {
    //    if (e.originalEvent.ctrlKey && !polygonDrawer.enabled() && !disableCtrl)
    //      iniciarPlotagem(e)

    if (e.originalEvent.keyCode == 27)
      hideAll();

  });

  map.on('mouseout', function (e) {
    $("#h5latlng").hide();
  });

  map.on('mousemove', function (e) {
    mouseOverMap(e)
    //    if (e.originalEvent.ctrlKey && !polygonDrawer.enabled() && !disableCtrl)
    //      iniciarPlotagem(e)
  });

  map.on('mousedown', function (e) {
    //   if (!polygonDrawer.enabled() && menuMapa)
    //     iniciarPlotagem(e)
    hideAll();


  });

  map.on('zoomend', function (e) {
    //   if (!polygonDrawer.enabled() && menuMapa)
    //     iniciarPlotagem(e)
    if (groupMarkersHide) {
      if (map.getZoom() <= 5) {
        map.removeLayer(groupMarkersHide);
      }
      else {
        map.addLayer(groupMarkersHide);
      }
    }
  });

  //Handle Copy Lat/Lng to clipboard
  $('#latlng').click(function (e) {
    var $tempElement = $("<input>");
    $("body").append($tempElement);
    $tempElement.val($("#latlng").text()).select();
    document.execCommand("Copy");
    $tempElement.remove();
    alert("Copied: " + $("#latlng").text());
    $("#latlng").hide();
  });

  bringMapToFront(basemaps)

  map.panTo(new L.LatLng(-15, -35))

  return map;
}

function checkMouseGamets(point) {
  let arrTmp = []
  let tooltip = ""
  if (arrGametsPlot) {
    let sep = ''
    arrGametsPlot.forEach(gamet => {
      if (checaPontoEdit([point.lat, point.lng], gamet)) {
        arrTmp.push(gamet)

        if (!tooltip.includes(arrayGametsTooltip[gamet._leaflet_id])) {
          tooltip += sep + arrayGametsTooltip[gamet._leaflet_id]
          sep = '<hr>'
          //gamet.fire('mouseover')
          setStyleMouseOver(gamet)
        }
      } else {
        gamet.setTooltipContent(arrayGametsTooltip[gamet._leaflet_id])
        //gamet.fire('mouseout')
        setStyleMouseOut(gamet)
      }
    })

    arrTmp.forEach(gamet => {
      gamet.setTooltipContent(tooltip)
    })

  }
}

function bringMapToFront(basemaps) {

  /*var topPane = map.createPane('leaflet-top-pane', map.getPanes().mapPane);
  topPane.appendChild(basemaps.Windy.getContainer());
  basemaps.Windy.setZIndex(5);  

  /*
  var layers = [];
  map.eachLayer( function(layer) {
      if( layer instanceof L.TileLayer ) {
          layer.bringToFront();
      }
  } );  */
}
function getDistancia(p1, p2) {
  var point1 = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": p1
    }
  };
  var point2 = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": p2
    }
  };
  var units = "miles";

  /*var points = {
    "type": "FeatureCollection",
    "features": [point1, point2]
  };*/

  return turf.distance(point1, point2, { units });
}




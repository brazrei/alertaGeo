var intervalAirep = false
var arrayMetaresGeral = []
const _TURB = "Turbulência"
const _ICE = "Gelo"

function mostraAirep() {
    if ($('#chkAirep').prop('checked')) {
        getAirep();
        clearInterval(intervalAirep)
        intervalAirep = setInterval("getAirep()", 120000); //muitos dados
    } else {
        clearInterval(intervalAirep)
        clearLayersAireps()
        iniciaAirepGlobalVars();
    }
}

function iniciaAirepGlobalVars() {
    regAirep = { codigo: "", FIR: 0, tipo: "", base: 0, visibilidade: 0, valIni: 0, valFin: 0, area: 0, cancelado: false, texto: "", coord: "", locs: "" }
    arrAirepGeral = []
    arrIdxAirepGeral = []
    arrAirepsPlot = []
    arrIdxAirepsPlot = []

    arrayLocalidadeFIRAirep = ['SBAO', 'SBAZ', 'SBBS', 'SBRE', 'SBCW']

    airepsBrutos = "";
    aireps = []
    lastAirep = ""
}

//** */funcoes de data
/*function makeDataHoraAgora() {
    let agora = new Date();

    return fillZero(agora.getUTCDate()) + "" + fillZero(agora.getUTCHours()) + "" + fillZero(agora.getUTCMinutes());

}*/

function isValidAirep(ini, fim) {
    return isValidAirmet(ini, fim)
}

function getIniAirep(airep) {
    return ""
}

function getFimAirep(airep) {
    return ""
}

function airepPertoDoFim(airep) {
    let val = getValidadeAirep(airep);
    let ini = val.split("/")[0]
    let fim = val.split("/")[1]

    return isCloseToValidOff(ini, fim)
}

function getValidadeAirep(airep) {
    //'ARS TAM3015 VUDEM 1747 F350 MS42 254/39 TURB LEV='
    let validPatt = / \d{6} /g
    let valid = airep.match(validPatt)
    if (valid && (valid.length > 1))
        return removeEspacos(valid[0])
}

function checaValidadeAirep(airep) {

    let val = getValidadeAirep(airep);

    let ini = val.split("/")[0]
    let fim = val.split("/")[1]
    if ((ini !== "") && (fim !== ""))
        return isValidAirep(ini, fim)
    else
        return false
}


/*Integrar ao SmartMetar*/
$("document").ready(function () {
    iniciaAirepGlobalVars();
})
//*********************** */

function getTxtAirep(texto) {
    texto = removeEspacosDuplos(texto);
    if (texto.indexOf(" TURB MOD") > -1)
        return "TURB MOD"
    else if (texto.indexOf(" TURB SEV") > -1)
        return "TURB SEV";
    else if (texto.indexOf(" ICE MOD") > -1)
        return "ICE MOD";
    else if (texto.indexOf(" ICE SEV") > -1)
        return "ICE SEV";
    return "NIL"
}

function addMarker(m, loc, restricao, pulse = false) {
    map.addLayer(m);
    return m
}

function plotaMarca(lat, lng, airep) {
    if (!isNaN(lat) && !isNaN(lng)) {


        var IceIcon = new L.Icon({
            //            iconUrl: 'png/marker-icon-green.png',
            iconUrl: 'png/condicao_verde.png',
            //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [8, 8],
            //iconAnchor: [0, 0],
            popupAnchor: [1, -12],
            shadowSize: [6, 6],
            alt: 0
        });

        var turbIcon = new L.Icon({
            iconUrl: 'png/condicao_amarelo.png',
            //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [12, 12],
            iconAnchor: [0, 0],
            popupAnchor: [1, -12],
            shadowSize: [6, 6],
            alt: 500
        });

        var cssIconIce = new L.divIcon({
            // Specify a class name we can refer to in CSS.
            className: 'css-icon',
            html: '<div class="gps_ringBlue"></div>'
            // Set marker width and height
            , iconSize: [24, 24]
            , iconAnchor: [6, 6]
        });

        var cssIconTurb = new L.divIcon({
            // Specify a class name we can refer to in CSS.
            className: 'css-icon',
            html: '<div class="gps_ringYellow"></div>'
            // Set marker width and height
            , iconSize: [24, 24]
            , iconAnchor: [6, 6]
        });

        if (airep.tipo == TURB)
            icon = yellowIcon
        else
            icon = blueIcon


        var m = addMarkerAirep(L.marker([lat, lng], { icon: icon }), loc)



        m.on('contextmenu', function (event) {
            let d
            d = removeEspacos(event.target.getTooltip()._content)
            selectedMarker = d.replace("METARCOR", "").replace("SPECICOR", "").replace("METAR", "").replace("SPECI", "").substr(0, 4)
            openContextMenuMarker(event, event.target);
        }, this);
        desc = removeInfo(desc)
        m.bindTooltip(desc, { closeButton: false, offset: L.point(0, -20) })
        //console.log(m)
    } //else
    //console.log("Erro na plotagem de ", loc);
}

function startAirep() {
    getAirep(true);

    intervalAirep = setInterval("getAirep()", 60000);
}

function destacaFimValidade(texto) {
    texto = texto.split("</").join("<$")
    texto = texto.split("/")
    texto = texto[0] + "/" + spanBold(texto[1].split(" ")[0])
    return texto.split("<$").join("</")
}

function getAirepDescription(airep, simples = false) {
    var fir = arrayLocalidadeFIR[airep.FIR]
    var cod = airep.codigo.substr(2).replace("-", " - VALID ")

    if (!simples) {
        cod = destacaNumeroAirep(cod)
        cod = destacaFimValidade(cod)
    }
    var tipo = ""
    var cancelado = ""
    var texto = airep.texto
    if (airep.cancelado) {
        cancelado = "*** CANCELADO ***"
        if (!simples)
            cancelado = spanRed(cancelado)
        cancelado = cancelado + " - "
    }
    if (airep.tipo == TURB)
        tipo = "Turbulência"
    else if (airep.tipo == ICE)
        tipo = "Gelo"
    else
        tipo = "NÃO IDENTIFICADO"

    if (!simples) {
        texto = "</br>" + spanRed(tipo + texto)
    }
    else
        texto = "&#10;" + tipo + texto

    return "ARS " + cancelado + fir + " - N. " + cod + " - " + texto
}

function clearLayersAireps() {
    if (arrAirepsPlot)
        for (var i in arrAirepsPlot)
            map.removeLayer(arrAirepsPlot[i])

    arrAirepsPlot.length = 0
    arrIdxAirepsPlot.length = 0
}

function plotaAireps(arr, primeiraVez) {

    //var groupPolygon;
    for (var i in arr) {
        let airepI = arr[i]
        if (airepI.tipo !== "C") {//o airep de cancelamento nao eh plotado
            if (airepI.cancelado)
                continue;
            var coordAirep = invertLatLong(airepI.coordDeg)

            let opt = {
                className: "",
                color: "black",
                fillColor: "black"
                //fillPattern: bigStripes

            }
            if (isCloseToValidOff(airepI.codigo))
                opt.className = "pulse";


            var airepM = L.Marker(coordAirep, opt).addTo(map)

            airepM.bindTooltip(getAirepDescription(airepI), { closeButton: false, sticky: true });

            if (airepI.cancelado)
                airepM.setStyle({
                    color: 'red',
                    fillOpacity: 0,
                    dashArray: '5, 5', dashOffset: '5'

                });
            airepM.on('click', function (e) {
                //copiaCoordenadas(latLngToArray(layer.getLatLngs()[0]))
                //copiaCoordenadas(extractDMS(JSON.stringify(this.toGeoJSON())))
            })


            p.on('mouseover', function (e) {
                // Set highlight
                this.setStyle({
                    opacity: 0.5,
                })
                setMenuMapaOff();
            });

            p.on('mouseout', function (e) {
                // Set highlight
                this.setStyle({
                    opacity: 1,
                });
                setMenuMapaOn();
            });


            arrAirepsPlot.push(airepM);
            arrIdxAirepsPlot.push(airepI.codigo)
            arr[i].plotagem = airepM;
        }

    }
}

function getIdxAirep(codigo) {
    return arrIdxAirepGeral.indexOf(codigo)
}

function escondeLoading(txt = "") {
    $(".loading" + txt).fadeOut();
}

function mostraLoading(txt = "") {
    $(".loading" + txt).fadeIn();
}

function atualizaHora(id = false) {
    if (!id)
        id = "#clockAirep"
    var date = new Date();
    var hora = adicionaZero(date.getUTCHours()) + ":" + adicionaZero(date.getUTCMinutes()) + ":" + adicionaZero(date.getUTCSeconds());
    $(id).html(hora + " UTC");

}

function GetWebContentAirep(url, primeiraVez) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        var erro = "ErroSM=";
        if (this.status > 0) {
            if ((this.readyState == 4 && this.status == 200) && (this.responseText !== "")) {


                var resposta = this.responseText;

                clearLayersAireps()
                iniciaAirepGlobalVars();

                trataAirepRedemet(resposta);
                plotaAireps(arrAirepGeral, primeiraVez);

                let erroConexao = false

                escondeLoading("Airep");

                atualizaHora();
                return resposta;
            } else if (this.readyState > 2 && this.status !== 200) {
                erro = erro + this.responseText;
                return erro;
            }

        }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
}

function salvarAireps() {//inserido manualmente
    //var airepsBrutos  = $("#taGAMETS").val();
    //trataAirepRedemet(airepsBrutos);
}

function limpaAireps() {
    $(".table-airep").remove();
}

function getAirep(primeiraVez = false) {
    mostraLoading("Airep");
    var interval = opener.getInterval(1)

    var locs = arrayLocalidadeFIRAirep.join(",")
    
    const urlCache = "../ago2021/php/consulta_msg.php?url=";    

    var url = `https://www.redemet.aer.mil.br/api/consulta_automatica/index.php?local=${locs}&msg=airep${interval}`;
    GetWebContentAirep(urlCache + url + opener.getProxy(), primeiraVez);
}

function makeIdxAirep(airep) {
    var aux = removeEspacos(airep)//
    var num = aux.split("VALID")[0]

    var val = getValidadeAirep(airep)
    return num + "-" + val
}

function getAirepCNL(airep) {
    let arrCnl = ["CNL AIREP", "CANCEL AIREP"]
    for (let i in arrCnl) {
        if (airep.includes(arrCnl[i])) {
            var aux = airep.split(arrCnl[i])[1]
            aux = aux.replace(" ", "-")
            return aux
        }
    }
    return ""
}

function trataAirepsCNL() {
    for (var i in arrAirepGeral) {
        var airep = arrAirepGeral[i]
        if (airep.tipo == "C") { //airep de cancelamento
            if (airep.texto.includes(" "))
                airep.texto = airep.texto.split(" ")[0]
            var cancelado = removeEspacos(airep.FIR + airep.texto)
            var idxCNL = arrIdxAirepGeral.indexOf(cancelado)
            if (idxCNL > -1)
                arrAirepGeral[idxCNL].cancelado = true
        }
    }
}

function getCoordAirep(airep) {
    return formataCoordsExternas(airep)
}

function getCoordDegAirep(coord) {
    coord = removeEspacos(coord)
    coord = coord.split("-")
    for (var i in coord) {
        coord[i] = latLngToDegree(coord[i])
    }
    return coord
}

function getTipoAirep(airep) {
    if (airep.includes(" TURB "))
        return TURB
    else if (airep.includes(" ICE "))
        return ICE
    else
        return "NIL"
}

function trataAirepRedemet(texto) {
    lastAirep = texto + "" //var global
    var classe = "table-warning table-airep";
    //limpaAireps();
    texto = removeEspacosDuplos(texto);
    var agora = new Date();
    var horaAtual = agora.getHours()
    var erro = ""

    //var part1 = [0,0,0,0]
    var idx = 0;
    var airep = texto.split(arrayLocalidadeFIR[idx] + "- ARS");
    airep = airep.slice(1)
    for (var i in airep) {//varre os aireps da fir
        airep[i] = airep[i].split("=")[0] // retira o que não pertence ao airep

        //pega o codigo
        var idxAirep = idx + "-" + makeIdxAirep(airep[i])
        let vencido = !checaValidadeAirep(airep[i]);

        if (vencido)
            continue;
        //pega o tipo e os dados do tipo
        //var cancelado = false
        var base = ""
        var vis = ""
        var tipo = ""
        var textoAirep = ""
        var coord = ""
        var cnl = getAirepCNL(airep[i])
        var coordDeg = []
        if (cnl.length > 0) {
            tipo = "C" // c de cancelamento // deve marcar o cancelado apenas apos varrer o array
            textoAirep = cnl.split(" ")
            textoAirep = textoAirep[0] + "-" + textoAirep[1]
        } else {
            tipo = getTipoAirep(airep[i])
            coord = getCoordAirep(airep[i])

            coordDeg = getCoordDegAirep(coord)

            if (tipo == "N") {
                textoAirep = getCldAirep(airep[i])
                base = getBaseNuvemAirep(textoAirep)
            } else if (tipo == "V") {
                vis = getVisAirep(airep[i])
                textoAirep = getTxtVisAirep(airep[i])
            } else {
                textoAirep = getTxtAirepGenerico(airep[i])
            }

        }

        arrAirepGeral.push({ codigo: idxAirep, FIR: idx, tipo: tipo, base: base, visibilidade: vis, texto: textoAirep, cancelado: false, coord: coord, coordDeg: coordDeg, locs: "" })
        arrIdxAirepGeral.push(idxAirep)
    }
    trataAirepsCNL()

}



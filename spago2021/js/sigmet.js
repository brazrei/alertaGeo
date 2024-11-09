var intervalSigmet = false
var urlCache = "../ago2021/php/consulta_msg.php?url="
var arrPopupsLines = []
var arrPopups = []
var separadorToolTip = "</br><div style='border-top:1px solid black; width:100%; height: 2px' ></div>"

function iniciaSigmetGlobalVars() {
    regSigmet = { codigo: "", FIR: 0, tipo: "", base: 0, visibilidade: 0, valIni: 0, valFin: 0, area: 0, cancelado: false, texto: "", coord: "", locs: "" }
    arrSigmetGeral = []
    arrIdxSigmetGeral = []
    arrSigmetsPlot = []
    arrIdxSigmetsPlot = []
    selectedSigmet = false

    arrayLocalidadeFIRSigmet = ['SBAZ', 'SBBS', 'SBRE', 'SBCW', 'SBAO']


    sigmetsBrutos = "";
    sigmets = []
    lastSigmet = ""
}

function checaValidadeSigmet(sigmet, data = getUTCAgora()) {
    return checaValidadeAirmet(sigmet, data)
}

/*function getTxtVisSigmet(texto) {
    texto = removeEspacosDuplos(texto);
    if (texto.indexOf("SFC VIS") == -1)
        return "NIL"
    var strEnd = ""

    if (texto.indexOf("OBS") > -1) {
        strEnd = "OBS";
    } else if (texto.indexOf("FCST") > -1) {
        strEnd = "FCST";
    } else
        strEnd = "WI"

    vis = texto.split("SFC VIS")[1].split(strEnd)[0];
    return vis
}
*/
function getTxtFimSigmet(texto, coord) {
    let txt;
    try {
        txt = texto.split("W0")
        txt = txt[txt.length - 1]
        txt = txt.split(" ").splice(1).join(" ")

    } catch {
        console.log("Erro ao tentar obter texto final do Sigmet: " + texto);
    }
    return txt;
}

function getTxtSigmet(texto, tipo = "") {
    txt = removeEspacosDuplos(texto);
    txts = removeEspacos(texto);
    let strEnd = null
    let sufixo = ""
    if (txts.indexOf("FIRTC") > -1) {
        strEnd = "TOP FL"
    } else if (texto.indexOf("OBS") > -1) {
        strEnd = "OBS";
        sufixo = "OBS";
    } else if (texto.indexOf("FCST") > -1) {
        strEnd = "FCST";
        sufixo = "FCST";
    } else
        strEnd = "WI"
    if (tipo == "TC")
        txt = texto.split(" FIR ")[1]
    else
        txt = texto.split(" FIR ")[1].split(strEnd)[0];

    return `${txt} ${sufixo}`

    /*let fim = ""
    if (texto.includes("TOP"))
        fim = " TOP"
    else
        fim = " FL"
    fim = fim + texto.split(fim)[1] 
    return txt + " - " + fim */
}

function getBaseNuvemSigmet(nuvem) {
    //arrNuvens.length = 0
    nuvem = removeEspacos(nuvem)
    var base = 0
    var topo = 0
    //    nuvPattTopo =  /\d{4}FT/g; //PEGA O TOPO
    if (!nuvem.includes("FT"))
        nuvem = nuvem + "FT"
    if (nuvem.includes("/")) {
        base = nuvem.split("/")[0]

    } else {
        base = nuvem.split("FT")[0]
    }
    return base
}


function getCldSigmet(texto) {
    texto = removeEspacosDuplos(texto);
    if (texto.indexOf("CLD") == -1)
        return "NIL"
    //  texto = insereM(texto)
    //  texto = extractSigVis(texto)
    var strEnd = ""

    if (texto.indexOf("OBS") > -1) {
        strEnd = "OBS";
    } else if (texto.indexOf("FCST") > -1) {
        strEnd = "FCST";
    } else
        strEnd = "WI"

    vis = texto.split("CLD")[1].split(strEnd)[0];
    return removeEspacos(vis).split("FT").join("FT ");
}

function mergeTooltipsSigmet(arrToolTips) { //junta as descrições de sigmets que estejam na mesma área

    function mergeArraysTTs(txt1, txt2, sep) {
        let ret = []
        txt1 = txt1.split(sep);
        txt2 = txt2.split(sep);
        if (Array.isArray(txt1)) {
            txt1.forEach(function (item) {
                if (ret.indexOf(item) < 0)
                    ret.push(item)

            })
        }
        if (Array.isArray(txt2)) {
            txt2.forEach(function (item) {
                if (ret.indexOf(item) < 0)
                    ret.push(item)
            })
        }
        if (ret.length == 0)
            return txt1
        else
            return ret.join(sep)
    }

    
    for (var i in arrSigmetsPlot) { // varre o array de poligonos
        for (var j = parseInt(i) + 1; j <= arrSigmetsPlot.length - 1; j++) {
            var bi = arrSigmetsPlot[i].getBounds();
            var bj = arrSigmetsPlot[j].getBounds();
            biCbj = bi.contains(bj);
            bjCbi = bj.contains(bi);
            if (biCbj && bjCbi) { //os dois sao iguais
                arrToolTips[i] = mergeArraysTTs(arrToolTips[i], arrToolTips[j], separadorToolTip)
                arrToolTips[j] = arrToolTips[i]
                arrSigmetsPlot[i].setStyle({ //deixar o de trás sempre claro pra mostrar o hover do de cima
                    opacity: 0
                });
            } else if (bjCbi) { //bi dentro de bj // apaga e insere no mapa para ficar por cima
                map.removeLayer(arrSigmetsPlot[i]);
                arrSigmetsPlot[i].addTo(map);
            }
        }
    }
}

function destacaNumeroSigmet(texto) {
    return destacaNumeroAirmet(texto)
}

function getSigmetDescription(sigmet) {
    var fir = arrayLocalidadeFIRSigmet[sigmet.FIR]
    var cod = sigmet.codigo.substr(2).replace("-", " - VALID ")
    cod = destacaNumeroSigmet(cod)
    cod = destacaFimValidade(cod)
    var tipo = ""
    var cancelado = ""
    var texto = sigmet.texto
    if (sigmet.cancelado)
        cancelado = spanRed("*** CANCELADO ***") + " - "
    /*    if (sigmet.tipo == "N")
            tipo = " TROVOADA: "
        else if (sigmet.tipo == "I")
            tipo = " GELO: "
        else if (sigmet.tipo == "T") {
            tipo = " TURBULÊNCIA: "
        }
    */
    return "SIGMET " + cancelado + fir + " - N. " + cod + " - </br>" + spanRed(spanBold(texto)) + " - " + spanBold(sigmet.textoFinal);
}

function clearPopups() {
    if (arrPopups)
        for (var i in arrPopups)
            map.removeLayer(arrPopups[i].popup)

    arrPopups = []
}

function removePopupsVencidos() {
    let arrAux = []
    try {
        for (let i in arrPopups) {
            if (!checaValidadeSigmet(arrPopups[1].sigmet))
                map.removeLayer(arrPopups[i].popup)
            else
                arrAux.push(arrPopups[i])
        }
        arrPopups = arrAux.slice(0)
    } catch (e) {

    }

}

function clearLayersSigmets() {
    if (arrSigmetsPlot)
        for (var i in arrSigmetsPlot)
            map.removeLayer(arrSigmetsPlot[i])

    removePopupsVencidos()
    arrSigmetsPlot.length = 0
    arrIdxSigmetsPlot.length = 0
}

function getColorSigmet(tipo) {
    if (tipo == "N") {
        return "red"
    } else if (tipo == "I") {
        return "#00BFFF"
        //return "#00FFFF"
    } else if (tipo == "T") {
        return "yellow"
    } else if (tipo == "TC") {
        return "#FFA600"
    }
}

function makeDraggable(popup, color) {
    var pos = map.latLngToLayerPoint(popup.getLatLng());
    L.DomUtil.setPosition(popup._wrapper.parentNode, pos);
    var draggable = new L.Draggable(popup._container, popup._wrapper);
    draggable.enable();

    draggable.on('dragend', function () {
        var pos = map.layerPointToLatLng(this._newPos);
        popup.setLatLng(pos);
        let inicio = map.layerPointToLatLng(this._startPos)
        let id = this._leaflet_id
        if (!arrPopupsLines[id]) {
            arrPopupsLines[id] = {}
            arrPopupsLines[id].inicio = inicio
        } else { //se já existe a linha, apaga a linha e pega o inicio da linha apagada
            inicio = arrPopupsLines[id].inicio
            arrPopupsLines[id].obj.removeFrom(map)
        }
        let linePop = [inicio, map.layerPointToLatLng(this._newPos)]
        arrPopupsLines[id].obj = L.polyline(linePop).setStyle({ color: color, opacity: 0.8, dashArray: '3, 5', dashOffset: '10' }).addTo(map);
        popup.on('remove', function () {
            //Your code here
            arrPopupsLines[id].obj.removeFrom(map)
        });
    });
}

function removePopup(codigo) {
    for (let i in arrPopups) {
        if (arrPopups[i].sigmet == codigo)
            map.removeLayer(arrPopups[i].popup)
    }

}

function plotaSigmets(arr, primeiraVez) {

    //var groupPolygon;
    for (var i in arr) {
        let a = arr[i]
        if ((a.tipo !== "C") && (!a.cancelado)) {//o sigmet de cancelamento nao eh plotado
            if (a.tipo == "N" && !getSigmetTSStatus())
                continue
            if (a.tipo == "I" && !getSigmetICEStatus())
                continue
            if (a.tipo == "T" && !getSigmetTurbStatus())
                continue
            var poly = invertLatLong(a.coordDeg)
            //console.log("poly ==>", poly)
            let color = getColorSigmet(a.tipo)
            let raio = a.raio * 1000
            let opt = {
                className: "",
                color: color,
                fillColor: color,
                radius: raio
            }
            let optTC = {
                className: "",
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                fillPattern: stripes,
                radius: raio
            }
            if (isCloseToValidOff(a.codigo))
                opt.className = "pulse";

            let p, p1;
            if (a.tipo == "TC") {
                arrIdxSigmetsPlot.push(a.codigo)
                if (poly && poly.length > 0) {
                    if (poly.length > 1) {
                        p1 = L.circle(L.latLng(poly[1]), optTC).addTo(map)
                        arrSigmetsPlot.push(p1);  //ponto futuro
                    }
                    //
                    p = L.circle(L.latLng(poly[0]), opt).addTo(map);
                }
            }
            else {
                p = L.polygon(poly, opt).addTo(map);
                p.bringToBack();
            }
            let sigDesc = getSigmetDescription(a)
            p.bindTooltip(sigDesc.replace("FCST", "<br>FCST"), { closeButton: false, sticky: true });
            //p.bindPopup(getSigmetDescription(a).replace("FCST","<br>FCST"), {closeOnClick: false, closeButton: true, autoClose: false, closePopupOnClick :false })


            if (p1) {
                p1.bindTooltip(sigDesc.replace("FCST", "<br>FCST") + "<br><br>" + spanBold(spanRed("*** PREVISÃO ***")), { closeButton: false, sticky: true });
            }
            if (a.cancelado)
                p.setStyle({
                    color: 'red',
                    fillOpacity: 0
                });
            p.on('click', function (e) {
                //copiaCoordenadas(latLngToArray(layer.getLatLngs()[0]))
                copiaCoordenadas(extractDMS(JSON.stringify(this.toGeoJSON())))

                removePopup(a.codigo);
                let popup = L.popup({ closeOnClick: false, closeButton: true, autoClose: false, closePopupOnClick: false })
                    .setLatLng(e.latlng)
                    .setContent(sigDesc.replace("FCST", "<br>FCST"))
                    .openOn(map);

                makeDraggable(popup, color);
                arrPopups.push({ popup: popup, sigmet: a.codigo })
            })

            p.on('mouseover', function (e) {
                // Set highlight
                this.setStyle({
                    opacity: 0.5,
                    fillOpacity: 0.8
                })
                setMenuMapaOff();
            });
            p.on('contextmenu', function (event) {
                selectedSigmet = event.target
                //selectedAirmet = false
                openContextMenuSigmet(event, event.target);
            }, this);

            p.on('mouseout', function (e) {
                this.setStyle({
                    opacity: 1,
                    fillOpacity: 0.2
                });
                setMenuMapaOn();
            });

            arrSigmetsPlot.push(p);
            arrIdxSigmetsPlot.push(a.codigo)
        }
    }

}

function getIdxSigmet(codigo) {
    return arrIdxSigmetGeral.indexOf(codigo)
}

function getSigmeTypeStatus(id) {
    return $(id).prop('checked')
}

function getSigmetTurbStatus() {
    return getSigmeTypeStatus("#chkSigmetTURB")
}

function getSigmetTSStatus() {
    return getSigmeTypeStatus("#chkSigmetTS")
}

function getSigmetICEStatus() {
    return getSigmeTypeStatus("#chkSigmetICE")
}

function setSpans(){
    function setSpan(id, on){
        on ? $(id).removeClass('pulse'): $(id).addClass('pulse')
    }
    setSpan('#spanTS', getSigmetTSStatus());
    setSpan('#spanTURB', getSigmetTurbStatus());
    setSpan('#spanICE', getSigmetICEStatus());
}

function mostraSigmet(sender = false) {
    //if (sender && sender.className.includes(''))

    if ($('#chkSigmet').prop('checked')) {
        setSpans();
        getSigmet();
        $('#divSigmetType').show()
        if (!intervalSigmet)
            intervalSigmet = setInterval("getSigmet()", 60000);
    } else {
        $('#divSigmetType').hide()

        clearInterval(intervalSigmet)
        intervalSigmet = false
        clearLayersSigmets()
        iniciaSigmetGlobalVars();
        clearPopups()
    }
}
function GetWebContentSigmet(url, primeiraVez) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        var erro = "ErroSM=";
        if (this.status > 0) {
            if ((this.readyState == 4 && this.status == 200) && (!this.responseText.toUpperCase().includes("ERRO")) && (!this.responseText.includes("Forbidden")) && (this.responseText !== "")) {

                let resposta = opener.removeCacheMessage(this.responseText);

                clearLayersSigmets()
                iniciaSigmetGlobalVars();
                trataSigmetRedemet(resposta);
                verificaAreaPlotada(arrSigmetGeral,'SIGMET')
                plotaSigmets(arrSigmetGeral, primeiraVez);
                firBrasil.bringToBack();

                //AtualizaSigmetsAeroportos();
                bringEditableToFront();
                bringCuttedToFront();
                escondeLoading("Sigmet");
                atualizaHora("#clockSigmet");
                return resposta;
            } else if (this.readyState > 2 && this.status !== 200) {
                erro = erro + this.responseText;
                return erro;
            }

        }
    };

    const params = {
        url: url,
    }

    xhttp.open('GET', urlCache + params.url + opener.getProxy(), true);
    xhttp.setRequestHeader('Content-type', 'application/json');

    xhttp.send();
}

function getSigmet(primeiraVez = false) {
    mostraLoading("Sigmet");
    /*    dini = "2020101800"
        dfim = "2020101815"
        var interval = ""
        var interval = `&data_ini=${dini}&data_fim=${dfim}`*/
    //var url = "https://www.redemet.intraer/api/consulta_automatica/index.php?local=SBAZ,SBBS,SBRE,SBAO,SBCW&msg=sigmet" + interval;
    let url = ""
    let interval = opener.getInterval(6)

    if (opener.redemetAntiga) {
        if (opener.intraer)
            url = opener.linkIntraer;
        else
            url = opener.linkInternet;
        url = `${url}SBAZ,SBBS,SBRE,SBCW,SBAO&msg=sigmet${interval}`
    } else
        url = `${opener.linkAPINova}sigmet/?api_key=${opener.apiKey}`


    GetWebContentSigmet(url, primeiraVez);
}

function getValidadeSigmet(text) {
    return getValidadeAirmet(text)
}


function makeIdxSigmet(sigmet) {
    var aux = removeEspacos(sigmet)
    var num = aux.split("VALID")[0]
    try {
        num = parseInt(num) //elimina os zeros a esquerda
    } catch (e) {
        console.log('Erro ao tentar criar índice do sigmet ' + sigmet)
    }

    var val = getValidadeSigmet(sigmet)
    return num + "-" + val
}

function getSigmetCNL(sigmet) {
    let arrCnl = ["CNL SIGMET", "CANCEL SIGMET"]
    for (let i in arrCnl) {
        if (sigmet.includes(arrCnl[i])) {
            var aux = sigmet.split(arrCnl[i])[1]
            aux = aux.replace(/ /g, "-")
            let val = getValidadeSigmet(aux)
            aux = aux.split(val)[0] + val
            return aux
        }
    }
    return ""
}

function trataSigmetsCNL(xArray, xArrayIdx) {
    trataCNL(xArray, xArrayIdx) //funcao no arquivo airmet.js
}

function getCoordSigmet(sigmet) {
    return formataCoordsExternas(sigmet)
}

function getCoordDegSigmet(coord) {
    return getCoordDegAirmet(coord)
}

function getRaioTC(sigmet) {
    let raio = 0
    if (sigmet.includes("KM OF TC"))
        raio = getNum((sigmet.split("KM OF TC")[0]).split("WI")[1])
    else if (sigmet.includes("NM OF TC"))
        raio = getNum((sigmet.split("NM OF TC")[0]).split("WI")[1]) * 1.852


    return raio
}
function getTipoSigmet(sigmet) {
    if (sigmet.includes(" TS "))
        return "N"
    else if (sigmet.includes(" ICE "))
        return "I"
    else if (sigmet.includes(" TURB "))
        return "T"
    else if (sigmet.includes(" TC "))
        return "TC"
    else
        return ""

}


function trataSigmetRedemet(texto) {

    if (texto.includes("mens"))
        texto = opener.convertToRedemet(texto, "SIGMET")
    lastSigmet = texto + "" //var global
    //var classe = "table-warning table-sigmet";

    texto = removeEspacosDuplos(texto);
    var agora = getUTCAgora();
    var horaAtual = agora.getHours()
    var erro = ""

    //var part1 = [0,0,0,0]
    var idx = 0;
    //var arrayLocalidadeFIRSigMet = arrayLocalidadeFIR
    //arrayLocalidadeFIRSigMet.push("SBAO")
    let dhIni = getUTCAgora()
    if (ocultarSigmetsVencendo)
        dhIni = addMinutes(dhIni,30)
    while (idx < arrayLocalidadeFIRSigmet.length) {

        var sigmet = texto.split(arrayLocalidadeFIRSigmet[idx] + " SIGMET");
        sigmet = sigmet.slice(1)
        for (var i in sigmet) {//varre os sigmets da fir
            sigmet[i] = sigmet[i].split("=")[0] // retira o que não pertence ao sigmet

            //pega o codigo
            var idxSigmet = idx + "-" + makeIdxSigmet(sigmet[i])

            let vencido = !checaValidadeSigmet(sigmet[i], dhIni);

            if (vencido)
                continue;
            //pega o tipo e os dados do tipo
            //var cancelado = false
            var base = ""
            var vis = ""
            var tipo = ""
            var textoSigmet = ""
            var textoFimSigmet = ""
            var coord = ""
            var cnl = getSigmetCNL(sigmet[i])
            var coordDeg = []
            let raio = 0
            if (cnl.length > 0) {
                tipo = "C" // c de cancelamento // deve marcar o cancelado apenas apos varrer o array
                textoSigmet = cnl
            } else {

                try {
                    tipo = getTipoSigmet(sigmet[i])
                    if (tipo == "TC") {
                        textoSigmet = getTxtSigmet(sigmet[i], 'TC')
                        raio = getRaioTC(sigmet[i])
                    }
                    else
                        textoSigmet = getTxtSigmet(sigmet[i])

                    coord = getCoordSigmet(sigmet[i])

                    coordDeg = getCoordDegSigmet(coord)
                    textoFimSigmet = getTxtFimSigmet(sigmet[i], coord);
                } catch (e) {
                    console.log(e)
                }

            }

            if (!arrIdxSigmetGeral.includes(idxSigmet)) {
                arrSigmetGeral.push({ codigo: idxSigmet, FIR: idx, tipo: tipo, raio: raio, base: base, visibilidade: vis, texto: textoSigmet, textoFinal: textoFimSigmet, cancelado: false, coord: coord, coordDeg: coordDeg, locs: "" })
                arrIdxSigmetGeral.push(idxSigmet)
            }
        }
        idx++;
    }
    trataSigmetsCNL(arrSigmetGeral, arrIdxSigmetGeral)

}

function sigmetToGeoJSON(sigmets) {
    return airmetToGeoJSON(sigmets)
}

// Plotando STSC
var heat = [];
var idxSTSC = -1
var horaSTSCAnterior = ""
var layerHeatAnterior = false
//var stscAneis = [];
var intervalSTSC = false;
var intervalAnimaSTSC = false
var raioAvisoSTSC = 35 //milhas
var centroAvisoSTSCTMASP = [["-23.50", "-046.63"], // SBMT
["-23.62", "-046.65"], //SBSP
["-23.43", "-046.47"],//SBGR
["-23.00", "-047.13"] //SBKP
]

/*
optImgSat = {
    opacity: 1,
    minOpacity: 1,
    blur: 2,
    maxZoom: 8,
    gradient: {  // HeatMap todo em vermelho
        0.2: '	#FF0000',
        0.4: '	#FF0000',
        0.6: '	#FF0000',
        0.8: '	#FF0000',
        1: '	#FF0000'
    },
    radius: 2
}
*/
optImgSat = optDefault = {
    radius: 5,
    blur: 2,
    maxZoom: 8,
    opacity: 1,
    minOpacity: 0.75,
    gradient: {
        0.0: '#ff0000',
        0.8: '#ff0000',
        0.9: '#33ffff',
        1.0: '#fcf932'
    }
}

/*
optImgSat = optDefault = {
    radius: 4,
    blur: 1,
    maxZoom: 8,
    opacity: 1,
    minOpacity: 0.6,
    /*gradient: {
        0.0: '#ff0000',
        0.5: '#ff0000',
        0.8: '#ff0000',
        1.0: '#ff0000'
    }
        0.0: '#00ff99',
        0.5: '#6600ff',
        0.8: '#33ffff',
        1.0: '#fcf932'
    
    gradient: {
        /*   
        0.0: '#ff0000',
           0.5: '#ff0000',
           0.8: '#ff6c6c',
           1.0: '#fff3f3'
           */
        /*
         0.0: '#00ff99',
         0.5: '#ff00ec',
         0.8: '#33ffff',
         1.0: '#fcf932'
         
         0.0: '#ff0000',
         0.5: '#ff0000',
         0.8: '#33ffff',
         1.0: '#fcf932'
  }
}
*/

var boolAlertaSTSCTMASP = boolAlertaSTSCTMABH = boolAlertaSTSCTMACT = boolAlertaSTSCTMARJ = false

var coordTMARJ = "S2238 W04338 - S2236 W04301 - S2303 W04238 - S2314 W04327 - S2238 W04338"
var coordTMABH = "S1917 W04422 - S1913 W04414 - S1909 W04356 - S1929 W04329 - S1953 W04331 - S2005 W04347 - S1958 W04418 - S1931 W04425 - S1917 W04422"
var coordTMASP = "S2245 W04711 - S2320 W04607 - S2352 W04630 - S2333 W04704 - S2300 W04724 - S2245 W04711"
var coordTMACT = "S2510 W04920 - S2523 W04855 - S2552 W04903 - S2541 W04934 - S2521 W04928 - S2510 W04920"
//var centroAvisoSTSC = ["-10.87","-061.84"] // SBji


var arrayteste = []

$(document).ready(function () {
    sliderSTSC = document.getElementById("rangeSTSC");
    sliderSTSC.oninput = function () {
        //if (isImgSatOn() && LayerImg_sat)
        //    LayerImg_sat.setOpacity(this.value / 100);
        idxSTSC = Math.round((sliderSTSC.value / 100) * heat.length) - 1
        if (idxSTSC < 0)
            idxSTSC = 0
        animaSTSC(true)

    }

    //$('.playSTSC').click(function () {
    //    $("#bg").attr('src', "img/picture1.jpg");
    //})
    //output = document.getElementById("demo");
    //output.innerHTML = slider.value; // Display the default slider value

    $('.play-pauseSTSC').click(function () {
        if (isSTSCOn()) {
            if (!$(this).hasClass('playSTSC')) {
                $(this).attr('src', 'png/pause.png');
                $(this).addClass('playSTSC')
                playSTSC();
                //$('.cycle-slideshow').cycle('pause');   
            } else {
                $(this).attr('src', 'png/play.png');
                $(this).removeClass('playSTSC')
                pauseSTSC();
                //$('.cycle-slideshow').cycle('resume');
            }
        }
    });
});

function playSTSC() {
    animaSTSC()
}

function pauseSTSC() {
    if (intervalAnimaSTSC)
        clearTimeout(intervalAnimaSTSC)
}
//var stscCenterMap=[];

function isSTSCOn() {
    return $("#chkSTSC").is(':checked')
}

function detectSTSC(coordEdit, lat, long) {
    // let coordEdit = $("#taCoordenadas").val()

    let poly = turf.polygon([getCoordDegAirmet(coordEdit)]);

    return (turf.booleanPointInPolygon([long, lat], poly))
    //for (let i in arrCutted)
    //    formataLayerEdit(arrCutted[i])
    /*stscAneis.forEach(anel => {
        if (turf.booleanPointInPolygon([anel[1], anel[0]], poly)) {
            cont++
        }
    });
    return cont*/
}

function inAreaAvisoSTSC(lat, long) {

    //TMA-SP
    if (!boolAlertaSTSCTMASP) {
        let distancia
        for (let i in centroAvisoSTSCTMASP) {
            distancia = getDistancia([long, lat], [centroAvisoSTSCTMASP[i][1], centroAvisoSTSCTMASP[i][0]])
            boolAlertaSTSCTMASP = (distancia <= raioAvisoSTSC)
            if (boolAlertaSTSCTMASP)
                return { ativo: true, TMA: "TMASP" }
        }
    }

    //OUTRAS TERMINAIS

    if (!boolAlertaSTSCTMABH) {
        boolAlertaSTSCTMABH = detectSTSC(coordTMABH, lat, long)
        if (boolAlertaSTSCTMABH)
            return { ativo: true, TMA: "TMABH" }
    }

    if (!boolAlertaSTSCTMACT) {
        boolAlertaSTSCTMACT = detectSTSC(coordTMACT, lat, long)
        if (boolAlertaSTSCTMACT)
            return { ativo: true, TMA: "TMACT" }
    }

    if (!boolAlertaSTSCTMARJ) {
        boolAlertaSTSCTMARJ = detectSTSC(coordTMARJ, lat, long)
        if (boolAlertaSTSCTMARJ)
            return { ativo: true, TMA: "TMARJ" }
    }

    //arrayteste.push(distancia)

    return { ativo: false, TMA: "" }
}

function setSlider(value) {
    //sliderSTSC.value = value;
    value += ""
    if (!value.includes('%'))
        value += "%"
    $('#rangeSTSC').css('width', value);
}

function animaSTSC(oneTime = false) {
    if (!heat || heat.length == 0)
        return;
    let intervalo = 50;
    let tam = heat.length

    if (idxSTSC > -1) {
        if (layerHeatAnterior)
            layerHeatAnterior.removeFrom(map);
    } else
        idxSTSC = 0
    if (idxSTSC > -1 && heat && heat[idxSTSC])
        heat[idxSTSC].layer.addTo(map);
    layerHeatAnterior = heat[idxSTSC].layer;
    setSTSCLabel(heat[idxSTSC].hora)

    if (idxSTSC == tam - 1) {//ultimo
        idxSTSC = 0
        intervalo = 1000
        if (sliderSTSC)
            setSlider(100)
    } else {
        idxSTSC++;
        setSlider(Math.round(idxSTSC / (tam - 1) * 100))
    }
    if (intervalAnimaSTSC)
        clearTimeout(intervalAnimaSTSC)
    if (!oneTime)
        intervalAnimaSTSC = setTimeout('animaSTSC()', intervalo);
}

function clearGridTMAs() {
    boolAlertaSTSCTMASP = boolAlertaSTSCTMABH = boolAlertaSTSCTMACT = boolAlertaSTSCTMARJ = false
    allTMAs = ["TMABH", "TMACT", "TMARJ", "TMASP"]
    for (let i in allTMAs) {
        $(".grid" + allTMAs[i]).removeClass("pulse")
        $(".grid" + allTMAs[i]).css("background-color", "green");
    }
}

function updateGridSTSC(TMAs) {
    for (let i in TMAs) {
        $(".grid" + TMAs[i]).addClass("pulse")
        $(".grid" + TMAs[i]).css("background-color", "red");
    }
}

function updateAlertaSTSC(on, TMAs) {
    if (on) {
        $("#labelAvisoSTSC").show();
        $("#labelAvisoSTSC").css("color", "red");
        $(".grid").show()
        updateGridSTSC(TMAs)
    } else {
        $("#labelAvisoSTSC").hide()
        $(".grid").hide()
    }

}

function setSTSCLabel(label) {
    if (label)
        $('#clockSTSC').text(label + ":00 UTC");
    else
        $('#clockSTSC').text("--:-- UTC");
}

function isHeatAnimationOn() {
    return $('#imgPlayPauseSTSC').hasClass('playSTSC');
}

function toggle_stsc(objSTSC) {
    if (isSTSCOn())
        if (intervalSTSC)
            animaSTSC() //se j[a carrecado só anima
        else
            plota_stsc(objSTSC)
    else
        removeSTSC();

}

function atualizaPHP_STSC() {
    //grava o array heat via PHP
}

function loadPHP_STSC() {
    //carrega os dados STSC heatmap e filtra, deixando apenas as informacoes recentes
}

function plota_stsc(obj_chk) {

    function clearOldSTSC() {
        let agora = new Date();
        let vencido = addHours(agora, -1);

        if (heat && heat.length > 0) {
            let i = 0
            while (i <= heat.length - 1) {
                if (heat[i] && (heat[i].dataHora < vencido)) {
                    map.removeLayer(heat[i].layer)
                    heat.splice(i, 1)
                }
                else
                    i++;
            }

        }

    }
    //if (!obj_chk || obj_chk.checked) {
    if (true) {
        mostraLoading("stsc");
        clearOldSTSC();
        let url;
        if (opener.intraer)
            url = `https://api-redemet.decea.mil.br/produtos/stsc?api_key=${opener.apiKey}`
        else
            url = `https://api-redemet.decea.mil.br/produtos/stsc?api_key=${opener.apiKey}`

        if (horaSTSCAnterior == "") { //primeira bisca pegar a animacao
            //url = 'https://api-redemet.decea.mil.br/produtos/stsc?api_key=U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei&anima=5'
            loadPHP_STSC()
        }
        //        else
        //        url = 'https://api-redemet.decea.gov.br/api/produtos/stsc?api_key=U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei';

        $.ajax({
            //url: urlCache + url + opener.getProxy(),
            url: url,
            contentType: 'application/json',
            crossDomain: true,
            cache: false,
            method: 'GET',
            dataType: 'json',
            success: function (data) {

                var i = 0;
                var hoje = getUTCAgora();
                var hoje_dia = hoje.getUTCDate();
                var hoje_mes = parseInt(hoje.getUTCMonth()) + 1;
                var hoje_ano = hoje.getUTCFullYear();
                if (hoje_dia < 10) {
                    hoje_dia = '0' + hoje_dia;
                }
                if (hoje_mes < 10) {
                    hoje_mes = '0' + hoje_mes;
                }


                let horaAnima = data.data.anima[data.data.anima.length - 1]

                if (horaSTSCAnterior !== "" && horaAnima == horaSTSCAnterior) //se não á a primeira vez e não mudou
                    return;
                horaSTSCAnterior = horaAnima

                let data_prod = false
                if (horaAnima)
                    data_prod = hoje_dia + '/' + hoje_mes + '/' + hoje_ano + ' ' + horaAnima

                setSTSCLabel(data_prod);
                data_prod = hoje_mes + " " + hoje_dia + ' ' + hoje_ano + ' ' + horaAnima
                data_prod = getUTCDate(new Date(data_prod))


                let dif = getUTCDate(new Date(hoje - data_prod))
                let diffDia = dif.getDate() - 1
                let diffHora = dif.getHours()
                let diffMin = dif.getMinutes()

                if (isLinux() || (dif.getFullYear() < 1970)) {
                    diffHora -= 21; //decrementa 1 hora, bug do linux
                }

                diffMin += (diffHora * 60)
                let erro = (diffMin > 20) //20 minutos

                formataErro('#clockSTSC', erro)
                formataErro('#labelSTSC', erro)
                let xheat = []
                for (let i in data.data.stsc) {
                    var pontos = data.data.stsc[i];
                    let stscAneis = []
                    alertaSTSC = false
                    TMAs = []
                    clearGridTMAs()
                    for (var key in pontos) {
                        stscAneis.push([pontos[key].la, pontos[key].lo, 1]);
                        if (i == data.data.stsc.length - 1) {//só busca na mais recente
                            let checkArea = inAreaAvisoSTSC(pontos[key].la, pontos[key].lo)
                            if (checkArea.TMA !== "" && !TMAs.includes(checkArea.TMA))
                                TMAs.push(checkArea.TMA)
                            alertaSTSC = alertaSTSC || checkArea.ativo
                        }
                        // i++;
                    }

                    if (i == data.data.stsc.length - 1) //só atualiza na mais recente
                        updateAlertaSTSC(alertaSTSC, TMAs)

                    //let heatColor = ['#ffffb2', '#fd8d3c', '#fd8d3c', '#f03b20', '#bd0026']
                    if (isImgSatOn())
                        xheat.push({ layer: L.heatLayer(stscAneis, optImgSat), hora: data.data.anima[i], dataHora: hoje });
                    else
                        xheat.push({ layer: L.heatLayer(stscAneis, optDefault), hora: data.data.anima[i], dataHora: hoje });
                }

                if (!heat) // dessabilita a animacao
                    heat = []
                else {
                    try {
                        if (heat.length > 0) {
                            for (let i in heat) {
                                heat[i].layer.removeFrom(map);
                            }
                            atualizaPHP_STSC();
                            //heat = []
                        }
                    } catch (e) {

                    }

                }

                heat = heat.concat(xheat)

                if (heat.length > 25)
                    heat = heat.slice(1)
                idxSTSC = -1;
                if (isHeatAnimationOn() && isSTSCOn())
                    animaSTSC();

                escondeLoading("stsc");


            },
            error: function (e) {
                formataErro('#clockSTSC', true)
                formataErro('#labelSTSC', true)
            }
        });
    }
}


function removeSTSC(onlyLast) {
    if (intervalAnimaSTSC)
        clearTimeout(intervalAnimaSTSC);

    //if (intervalSTSC)
    //   clearTimeout(intervalSTSC);
    if (heat) {
        for (i in heat)
            map.removeLayer(heat[i].layer);
        //heat = []
    }
    /*    for (var i in stscAneis) {
        if (stscAneis.hasOwnProperty(i)) {
            map.removeLayer(heat);
        }
    }*/

    //stscAneis = [];

    //stscCenterMap = [];
}

function canvasFadeIn(canvas) {

    function loop() {

        alpha += delta;
        if (alpha <= 0 || alpha >= 1) delta = -delta;

        /// clear canvas, set alpha and re-draw image
        ctx.clearRect(0, 0, demo.width, demo.height);
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, 0, 0);

        requestAnimationFrame(loop); // or use setTimeout(loop, 16) in older browsers
    }

    var alpha = 0,   /// current alpha value
        delta = 0.1; /// delta = speed

}


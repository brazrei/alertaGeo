let tafsGrupoConsulta
let strTAFsTraduzidos
let arrayTAFsTraduzidos = []
let arrayTAFsBrutos = []
let arrayTAFs = []
let arrayProximosTAFs = []
let arrTAFSCimaer = []
let arrTAFSCimaerSemFiltro = []

ready()

function ready(){
    document.addEventListener("DOMContentLoaded", function() {
        try { 
            inicializaVariaveisGlobais()
            iniciaArrayTAFSCimaer()
        } catch (e) {
            console.log("Erro na inicialização das Variãveis no Mõdulo SmartTAF!")
        }
                
    });
    
}

function inicializaVariaveisGlobais() {
    tafsGrupoConsulta = "SBPA,SBCT,SBFI,SBFL,SBNF,SBPK,SBCO,SBSM,SBBG,SBNM,SBJV,SBBI,SBYS,SBAF,SBSC,SBAN,SBMN,SBCH,SBUG,SBPF,SBJA,SBGW,SBCC,SBCX,SBGP,SBLJ,SBPG,SNCP,SBBH,SWKQ,SBUF,SNPD"
    strTAFsTraduzidos = ''

    arrTAFSCimaerSemFiltro.push({ indice: "24 HORAS, (00Z, 06Z, 12Z e 18Z) DIARIAMENTE", localidades: "SBPA, SBCT, SBFI, SBFL e SBNF" });
    arrTAFSCimaerSemFiltro.push({ indice: "24 HORAS, (06Z, 12Z e 18Z) DIARIAMENTE", localidades: "SBPK" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (00Z, 06Z, 12Z e 18Z), DIARIAMENTE", localidades: "SBCO, SBSM, SBBG, SBNM, SBJV, SBBI, SBYS, SBAF, SBSC, SBAN, SBMN e SBCH" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z, 12Z e 18Z), DIARIAMENTE", localidades: "SBUG, SBPF, SBJA, SBGW e SBCC" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z, 12Z) SEG, TER, QUA, QUI e SEX", localidades: "SBCX" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (00Z, 06Z) SAB", localidades: "SBCX" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (00Z, 06Z e 12Z) DOM", localidades: "SBCX" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z, 12Z e 18Z) SEG, TER, QUA, QUI e SEX", localidades: "SBGP" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z) SAB e DOM", localidades: "SBGP" });
    //arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z e 18Z) QUI, SEX e SAB", localidades: "SBLJ" });
    //arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z, 12Z e 18Z) DOM", localidades: "SBLJ" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z, 12Z) DIARIAMENTE", localidades: "SBPG" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z, 12Z  e 18Z) SEX", localidades: "SBPG" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (06Z e 18Z) DIARIAMENTE", localidades: "SNCP" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z) SEG, TER, QUI, SAB e DOM", localidades: "SWKQ" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z) SEG, TER, QUA, QUI, SEX e DOM", localidades: "SBUF" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z) SEG, QUA, SEX e DOM", localidades: "SNPD" });
    arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z) TER, QUI e SAB", localidades: "SNPD", inicioOperacao: "01/09/2024" });
    // arrTAFSCimaerSemFiltro.push({ indice: "12 HORAS, (12Z) TER", localidades: "SNPD" , inicio: "02/01/2024"});
    
}


function iniciaArrayTAFSCimaer() {
    function pushItem(item) {
        arrTAFSCimaer.push(item);

    }

    function converterStringParaData(dataString) {
        // Divide a string em partes usando o delimitador "-"
        let partes = dataString.split("/");
        
        // Extrai e converte as partes para números inteiros
        let dia = parseInt(partes[0], 10);      // Parte do dia
        let mes = parseInt(partes[1], 10) - 1;  // Parte do mês (subtrai 1 porque os meses são indexados a partir de 0)
        let ano = parseInt(partes[2], 10);      // Parte do ano
    
        // Cria um objeto Date usando os componentes extraídos
        return new Date(ano, mes, dia);
    }

    inicioProximoTAF = getHoraNextTAF()

    for (i in arrTAFSCimaerSemFiltro) { 
        item = arrTAFSCimaerSemFiltro[i]
        if (item.inicioOperacao && (inicioProximoTAF.dataIni < converterStringParaData(item.inicioOperacao)))
            continue
        pushItem(item)
    }


}

function getArrayLength(array) {
    let i = 0
    for (let c in array)
        i++
    return i

}

function isTAFCimaer(loc) {
    let achou = false;
    for (let i in arrTAFSCimaer) {
        achou = arrTAFSCimaer[i].localidades.includes(loc)
        if (achou)
            break;

    }
    return achou
}

function excluiTAFs(total, naRede) {
    let ausentes = []
    for (let i in total) {
        if (!naRede[total[i]])
            ausentes.push(total[i])
    }
    return ausentes;
}

function atualizaStatusConsultaTAF() {
    let qtdTAFsProxHoraNaRede = getArrayLength(arrayProximosTAFs) //tafs da proxima hora de envio obtidos da rede
    let tafsProxHora = getTAFsProximaHora();  // tafs que deveriam estar na proxima hora de envio
    let qtdTAFsProxHora = tafsProxHora.length;
    let agora = getUTCAgora()

    let dh = getHoraNextTAF()

    let ligarPulse = agora > dh.dataIni.addHours(-2) //dh é alterado na funcao addHours
    let ignorarAusentes = agora < dh.dataIni.addHours(-1)

    let arrAusentes = excluiTAFs(tafsProxHora, arrayProximosTAFs);
    let strAusentes = ""
    if (arrAusentes.length > 0)
        strAusentes = arrAusentes.join(', ');


    if (qtdTAFsProxHoraNaRede < qtdTAFsProxHora) {
        if (ignorarAusentes) {
            $(".statusTAF").hide()
            return false
        }
        $(".statusTAF").removeClass("statusOK")
        $(".statusTAF").removeClass("sombraClara")
        $(".statusTAF").addClass("statusERRO")
        if (ligarPulse)
            $(".statusTAF").addClass("errorPulse")
        $(".statusTAF").html(`TAF - ${dh.dia} ${dh.hora} - ${arrAusentes.length} AUSENTES`)
        $(".statusTAF").attr("title", `TAFs AUSENTES: ${strAusentes}`);
    } else {
        $(".statusTAF").removeClass("errorPulse")
        $(".statusTAF").removeClass("statusERRO")
        $(".statusTAF").addClass("statusOK")
        $(".statusTAF").addClass("sombraClara")
        $(".statusTAF").html(`TAF - ${dh.dia} ${dh.hora}  - OK`)
        $(".statusTAF").attr("title", `${qtdTAFsProxHoraNaRede} TAFs ENCONTRADOS NA CONSULTA: ${tafsProxHora.join(", ")}`);
    }
    $(".statusTAF").show()


}

function getHoraNextTAF() {
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

function getTAFsProximaHora() {
    let dh = getHoraNextTAF()
    return getArrayTAFsHora(dh.dia, dh.hora)
}

function atualizaTAFsBrutos() { // consulta os tafs mais recentes na rede
    function removeRepetidos(str) {
        return [...new Set(str.split(','))].join(',');
    }
    getTAFs(removeRepetidos(getAeroInternacional() + ',' + tafsGrupoConsulta), false, true/*brutos*/)
}

function atualizaTAFS() { // consulta os tafs mais recentes na rede
    function removeRepetidos(str) {
        return [...new Set(str.split(','))].join(',');
    }

    let locs = removeRepetidos(getAeroInternacional() + ',' + tafsGrupoConsulta, false, false)

    getTAFs(locs, false, false)
}

function destacaPalavrasTAF(taf) {
    function appPatt(taf, patt) {
        let arr = taf.match(patt)
        let s = ''

        if (!arr || arr.length == 0)
            return taf
        for (let i in arr) {
            taf = spanRed(taf, arr[i])
            s += arr[i]
        }
        return taf
    }
    let pattNuvem = / [B,O][A-Z][A-Z]00[0-9] /g
    let pattVis = / [0-4]\d{3} /g
    let pattTrov = /[+,-,\s]TS[A-Z][A-Z] /g
    let pattTrov2 = / TS /g
    let pattRaj = / \d{5}G\d{2}KT /g


    taf = appPatt(taf, pattNuvem)
    taf = appPatt(taf, pattVis)
    taf = appPatt(taf, pattTrov)
    taf = appPatt(taf, pattTrov2)
    taf = appPatt(taf, pattRaj)
    return taf
}

function verificaTAFS() { // a hora de inicio da pesquisa depende da hora atual em relacao a validade do TAF
    // as localidades dependem do grupo de pesquiza de cada dia/hora
    let dh = getHoraNextTAF()
    let locs = getTAFsProximaHora()

    getTAFs(locs, dh.dataIni, false)
}

function getArrayTAFsHora(diaSemana, hora) {
    function clearLocs(locs) {
        let patt = /[A-Z][A-Z][A-Z][A-Z]/g
        let arr = locs.match(patt)

        return [...new Set(arr)]; //remove repetidos
    }

    let locs = ""
    let separador = ""
    hora = hora.toUpperCase()
    diaSemana = diaSemana.toUpperCase()

    for (var i in arrTAFSCimaer) {
        let t = arrTAFSCimaer[i]
        indice = t.indice.toUpperCase()
        if (indice.includes(hora) && ((indice.includes("DIARIAMENTE") || indice.includes(diaSemana)))) {
            locs += separador + t.localidades
            separador = ","
        }

    }
    return clearLocs(locs)
}

function getAMDStatus(TAF) {
    let inicio = getBeginTAF(TAF)
    let fim = getEndTAF(TAF)
    let horaAtual = new Date()
    let dataZero = new Date(0)
    //let dif = horaAtual-inicio
    let horasValid = new Date(fim - inicio)

    if (isLinux()) {
        //addHours(new Date(dif), 3)
        addHours(dataZero, 3)
        addHours(horasValid, 3)
    }

    let prazoFinal = getUTCDate(new Date(inicio))
    addHours(prazoFinal, (((horasValid.getDate() - 1) * 24) + horasValid.getHours()) / 6)
    addMinutes(prazoFinal, -1) // -61 para deixar de mostrar no período de atraso
    // -1 para deixar de mostrar no período em que náo se pode mais incluir o AMD

    let h = prazoFinal
    h = ('0' + h.getHours()).slice(-2) + ":" + ('0' + h.getMinutes()).slice(-2) + 'Z'
    return { permiteAMD: horaAtual <= prazoFinal, prazoFinal: h }
}

function chkVisMetarTAF(loc) {
    function checkVisibilidadeTAF(visMETAR, visTAF) {
        visTAF = parseInt(visTAF)
        visMETAR = parseInt(visMETAR)

        if (visMETAR > 5000)
            return true

        let erro = false

        let deltaVis = Math.abs(visMETAR - visTAF)

        if (visMETAR < visTAF) {
            let tolerancia = 0
            if (visTAF <= 800)
                tolerancia = 200
            else
                tolerancia = visTAF * 0.3

            erro = (deltaVis > tolerancia)

        }
        return !erro
    }
    let msg = getMetarFromArrayMetaresGeral(loc)
    if (!msg || !msg.METAR)
        return { ok: true }
    if (msg.METAR.visibilidade && msg.METAR.visibilidade < 5000) {
        if (msg.TAF && msg.TAF.achou && msg.TAF.visibilidade)
            return { ok: checkVisibilidadeTAF(msg.METAR.visibilidade, msg.TAF.visibilidade), visTAF: msg.TAF.visibilidade }
    }

    return { ok: true }
}

function chkTetoMetarTAF(loc) {
    function checkTetoTAF(tetoMETAR, tetoTAF) {
        tetoTAF = parseInt(tetoTAF)
        tetoMETAR = parseInt(tetoMETAR)

        if (tetoMETAR > 1500)
            return true

        let erro = false

        let deltaTeto = Math.abs(tetoMETAR - tetoTAF)

        if (tetoMETAR < tetoTAF) {
            let tolerancia = 0
            if (tetoTAF <= 1000)
                tolerancia = 100
            else
                tolerancia = tetoTAF * 0.3

            erro = (deltaTeto > tolerancia)

        }
        return !erro
    }
    let msg = getMetarFromArrayMetaresGeral(loc)
    if (!msg || !msg.METAR)
        return { ok: true }
    if (msg.METAR.teto && Array.isArray(msg.METAR.teto) && (msg.METAR.teto[1] == "T") && (getNum(msg.METAR.teto[3]) * 100) < 1500) {
        if (msg.TAF && msg.TAF.achou && msg.TAF.teto && msg.TAF.teto.altura)
            //return parseInt(getNum(msg.METAR.teto[3]) * 100) >= parseInt(msg.TAF.teto.altura)
            return { ok: checkTetoTAF(getNum(msg.METAR.teto[3]) * 100, msg.TAF.teto.altura), tetoTAF: msg.TAF.teto.altura }
    }

    return { ok: true }
}

function getTAFFromLoc(loc, metar = false) {

    let dh = metar ? getMetarFullDateTime(metar) : getUTCDate(new Date());
    try {
        let statusAMD = getAMDStatus(arrayTAFs[loc].TAF)
        permiteAMD = statusAMD.permiteAMD
        prazoAMD = statusAMD.prazoFinal
        return { localidade: loc, TAF: arrayTAFs[loc].TAF, visibilidade: getVisPredHora(arrayTAFs[loc].TAF, dh), teto: getTetoHora(arrayTAFs[loc].TAF, dh), inicioValid: getBeginTAF(arrayTAFs[loc].TAF), fimValid: getEndTAF(arrayTAFs[loc].TAF), permiteAMD, prazoAMD }
    } catch {
    }
    return { localidade: loc, TAF: false, visibilidade: false, teto: false };
}
function getTAFFromMetar(metar) {
    let loc = opener.getLocalidade(metar)
    return getTAFFromLoc(loc, metar)
}

function updateArrayMetarTAF() {
    if (typeof opener.arraygetTeste !== "function")
        return false
}

function getMetarDataHora(metar) {
    var patt = /\d{6}Z/;
    var t1 = metar.match(patt);
    if (t1 && t1.length > 0)
        return t1[0]
    else
        return metar

}

function metarDH2FullDateTime(dh) {
    let hora = dh.substr(2, 2)
    let agora = getUTCDate(new Date())

    return getUTCDate(new Date(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), hora))
}

function getMetarFullDateTime(metar) {
    let dhMetar = getMetarDataHora(metar)

    return metarDH2FullDateTime(dhMetar)
}

function getBeginTAF(taf) {
    try {
        return getUTCDate(new Date(taf.TAF.validPeriod.TimePeriod.beginPosition))
    } catch {
        return false
    }

}

function getEndTAF(taf) {
    try {
        return getUTCDate(new Date(taf.TAF.validPeriod.TimePeriod.endPosition))
    } catch {
        return false
    }
}

function getInterval(taf) {

    return { inicio: getBeginTAF(taf), fim: getEndTAF(taf) }
}

function getBeginChange(tafMAF) {
    try {
        return getUTCDate(new Date(tafMAF.phenomenonTime.TimePeriod.beginPosition))
    } catch {
        return false
    }

}

function getEndChange(tafMAF) {
    try {
        return getUTCDate(new Date(tafMAF.phenomenonTime.TimePeriod.endPosition))
    } catch {
        return false
    }
}

function getIntervalChangeForecast(tafMAF) {
    try {
        return { inicio: getBeginChange(tafMAF), fim: getEndChange(tafMAF) }
    } catch {
        return false
    }

}

function getICAOIndicator(taf) {
    try {
        return taf.TAF.aerodrome.AirportHeliport.timeSlice.AirportHeliportTimeSlice.locationIndicatorICAO
    } catch {
        return false
    }
}

function getBaseForecast(taf) {
    try {
        return taf.TAF.baseForecast
    } catch {
        return false
    }
}

function getMinTemp(taf) {
    try {
        return {
            valor: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.temperature.AerodromeAirTemperatureForecast.minimumAirTemperature.content,
            hora: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.temperature.AerodromeAirTemperatureForecast.minimumAirTemperatureTime.TimeInstant.timePosition
        }
    } catch {
        return false
    }

}

function getMaxTemp(taf) {
    try {
        return {
            valor: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.temperature.AerodromeAirTemperatureForecast.maximumAirTemperature.content,
            hora: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.temperature.AerodromeAirTemperatureForecast.maximumAirTemperatureTime.TimeInstant.timePosition
        }
    } catch {
        return false
    }
}

function getCAVOK(tafMAF) { //MeteorologicalAerodromeForecast == MAF
    try {
        return tafMAF.cloudAndVisibilityOK
    } catch {
        return false
    }
}

function getMainCAVOK(taf) {
    try {
        return getCAVOK(taf.TAF.baseForecast.MeteorologicalAerodromeForecast)
    } catch {
        return false
    }

}

function getVisPred(taf) {
    try {

        if (taf.TAF.baseForecast.MeteorologicalAerodromeForecast.cloudAndVisibilityOK)
            return 9999
        else
            return taf.TAF.baseForecast.MeteorologicalAerodromeForecast.prevailingVisibility.content
    } catch {
        return 9999
    }
}

function getVisPredMudanca(tafMAF) {
    let vis
    try {
        vis = tafMAF.prevailingVisibility.content
    } catch (e) {
        vis = false
    }
    return vis
}

function getVnt(taf) {
    return {
        dir: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.surfaceWind.AerodromeSurfaceWindForecast.meanWindDirection.content,
        vel: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.surfaceWind.AerodromeSurfaceWindForecast.meanWindSpeed.content,
        variavel: taf.TAF.baseForecast.MeteorologicalAerodromeForecast.surfaceWind.AerodromeSurfaceWindForecast.variableWindDirection
    }
}

function getChangeCount(taf) {

    try {
        if (Array.isArray(taf.TAF.changeForecast))
            return taf.TAF.changeForecast.length
        else
            return 1
    } catch {
        return 0
    }
}

function getChangeForecastArray(taf) {
    try {
        if (Array.isArray(taf.TAF.changeForecast))
            return taf.TAF.changeForecast
        else
            return [taf.TAF.changeForecast]
    } catch {

    }

}

function getVisPredHora(taf, hora) {
    let interval = getInterval(taf)
    if (hora < interval.inicio || hora > interval.fim)
        return false
    let gruposMud = getChangeCount(taf)
    let vis = getVisPred(taf)
    let periodo, auxVis

    if (gruposMud > 0) {
        let arrChange = getChangeForecastArray(taf)
        for (let i in arrChange) {
            periodo = getIntervalChangeForecast(arrChange[i].MeteorologicalAerodromeForecast)
            if (hora >= periodo.inicio) { //considerando a ordem cronológica, pega a informacao mais recente
                if ((["BECOMING", "FROM"].includes(arrChange[i].MeteorologicalAerodromeForecast.changeIndicator)) ||
                    (hora >= periodo.inicio && hora <= periodo.fim)) { // se for mudanca temporaria

                    if (["BECOMING"].includes(arrChange[i].MeteorologicalAerodromeForecast.changeIndicator) && (hora > periodo.fim))
                        vis = getVisPredMudanca(arrChange[i].MeteorologicalAerodromeForecast) ? getVisPredMudanca(arrChange[i].MeteorologicalAerodromeForecast) : vis
                    else {
                        auxVis = getVisPredMudanca(arrChange[i].MeteorologicalAerodromeForecast) ? getVisPredMudanca(arrChange[i].MeteorologicalAerodromeForecast) : vis
                        // se for becoming, pega o valor mais baixo de vis
                        vis = arrChange[i].MeteorologicalAerodromeForecast.changeIndicator == "BECOMING" ? (vis < auxVis ? vis : auxVis) : auxVis
                    }
                    // se j[a passou a hora]
                }

            }
        }
    }
    return vis
}

function getTetoHora(taf, hora) {
    let interval = getInterval(taf)
    if (hora < interval.inicio || hora > interval.fim)
        return false
    let gruposMud = getChangeCount(taf)
    let teto = getTetoBase(taf)
    let periodo, auxTeto

    //    if (getICAOIndicator(taf) == "SBCH")
    //        console.log("")
    if (gruposMud > 0) {
        let arrChange = getChangeForecastArray(taf)
        for (let i in arrChange) {
            periodo = getIntervalChangeForecast(arrChange[i].MeteorologicalAerodromeForecast)
            if (hora >= periodo.inicio) { //considerando a ordem cronológica, pega a informacao mais recente.
                if ((["BECOMING", "FROM"].includes(arrChange[i].MeteorologicalAerodromeForecast.changeIndicator)) ||
                    (hora >= periodo.inicio && hora <= periodo.fim)) { // se for mudanca temporaria

                    if (["BECOMING"].includes(arrChange[i].MeteorologicalAerodromeForecast.changeIndicator) && (hora > periodo.fim))
                        teto = getTeto(arrChange[i].MeteorologicalAerodromeForecast) ? getTeto(arrChange[i].MeteorologicalAerodromeForecast) : teto
                    else {
                        auxTeto = getTeto(arrChange[i].MeteorologicalAerodromeForecast) ? getTeto(arrChange[i].MeteorologicalAerodromeForecast) : teto
                        // se for becoming, pega o valor mais baixo de vis

                        teto = arrChange[i].MeteorologicalAerodromeForecast.changeIndicator == "BECOMING" ? ((teto.altura <= auxTeto.altura && teto.qtd > 4 || (teto.qtd < 5 && teto.altura < auxTeto.altura)) ? teto : auxTeto) : auxTeto
                        /*
                                                if (arrChange[i].MeteorologicalAerodromeForecast.changeIndicator == "BECOMING") {
                                                    if ((teto.altura <= auxTeto.altura && teto.qtd > 4) || (teto.altura > auxTeto.altura && auxTeto.qtd < 5))
                                                        teto =  auxTeto
                                                } else
                                                    teto = auxTeto
                        */
                    }
                    // se j[a passou a hora]
                }

            }
        }
    }
    if (teto.qtd < 5)
        teto.altura = 1500
    return teto
}

function clearMsgIWXXM(txt) {
    let separator = "**,**"
    txt = txt + ""
    txt = txt.replace(/iwxxm:/g, "").replace(/gml:/g, "").replace(/aixm:/g, "").replace(/xlink:/g, "").replace(/{"TAF/g, separator + '{"TAF')
    //if (!txt.includes(separator))
    //    txt = [txt]

    return txt.split(separator).splice(1)
}


function getTetoBase(taf) {
    return getTeto(taf.TAF.baseForecast.MeteorologicalAerodromeForecast)
}

function getTeto(tafMAF) {
    function getTetoCamada(camada) {
        let arrTeto = ['FEW', 'SCT', 'BKN', 'OVC']
        let arrTetoN = [1, 3, 5, 8]
        let qtd = camada.CloudLayer.amount.href

        qtd = qtd.split('/')
        qtd = qtd[qtd.length - 1]

        return { qtd: arrTetoN[arrTeto.indexOf(qtd)], altura: camada.CloudLayer.base.content + 'FT' }
    }

    if (!tafMAF || !tafMAF.cloud || !tafMAF.cloud.AerodromeCloudForecast)
        return false;

    if (!Array.isArray(tafMAF.cloud.AerodromeCloudForecast.layer))
        camada = tafMAF.cloud.AerodromeCloudForecast.layer
    else {
        arrNuvens = tafMAF.cloud.AerodromeCloudForecast.layer
        camada = arrNuvens[0]
        let ultimaCamada = camada
        if (arrNuvens.length > 1 && getTetoCamada(camada).qtd < 5) {

            for (var i = 1; i < arrNuvens.length; i++) {
                if (getTetoCamada(arrNuvens[i]).qtd > getTetoCamada(ultimaCamada).qtd) {
                    ultimaCamada = arrNuvens[i]
                }
                if (getTetoCamada(arrNuvens[i]).qtd > 4)
                    break;
            }
        }
        camada = ultimaCamada
    }
    camada = getTetoCamada(camada)
    return { qtd: camada.qtd, altura: parseInt(camada.altura) }
}

function removeTraduzidos(locs, dh = false) {
    if (typeof locs === 'string')
        locs = locs.split(',')
    let locsOut = []
    let xdh = ''
    if (dh)
        xdh = dh
    for (let l in locs) {
        let traduzido = false
        for (let i in arrayTAFsTraduzidos) {
            if (i.includes(locs[l] + xdh) && arrayTAFsTraduzidos[i])
                traduzido = true

        }
        if (!traduzido)
            locsOut.push(locs[l])
    }
    if (locsOut.length == 0)
        return 'AAAA'
    else
        return locsOut.join(',')
}

function getTAFs(localidades = false, dataIni = false, dadosBrutos) {
    //mostraLoading("TAFs");
    let url = ""

    let interval
    if (!(opener.getIntervalTAF && opener.getInterval))
        return false
    if (!dataIni)
        interval = opener.getInterval(4)
    else
        interval = opener.getIntervalTAF(dataIni)
    if (dadosBrutos)
        url = opener.linkInternet;
    else {
        url = opener.linkInternetIWXXM;
        if (!dataIni)
            localidades = removeTraduzidos(localidades) //remove traduzidos apenas se for a consulta ampla
        else if (localidades)
            localidades = removeTraduzidos(localidades, fillZero(dataIni.getDate()) + fillZero(dataIni.getHours())) //remove traduzidos apenas se for a consulta ampla
    }

    localidades = !localidades ? tafsGrupoConsulta : localidades;
    url = `${url}${localidades}&msg=taf${interval}`;

    GetWebContentTAF(url, false);
}

function updateArrayStatus(localidade, status) { // retorna true se o status mudou
    /*   var i = globalArrayLocStatus.indexOf(localidade);
       if (i > -1) {
         globalArrayLocStatus
       } 
    */
}

function excluiTAFsAntigos(arr) {
    let arr2 = []
    for (let i in arr) {
        if (arr[i].inicio > getUTCAgora().addHours(1))
            //if (arr[i].inicio >= getUTCAgora().getHours())
            arr2[arr[i].localidade] = arr[i]
    }
    return arr2 //retorna o valor como referencia
}

function atualizaArrayTAFs(texto) {
    function clearTAFsCor() {
        let arrCorr = []
        for (let i in arrayTAFs)
            if (arrayTAFs[i].TAF.TAF.reportStatus.toUpperCase() == "CORRECTION")
                arrCorr.push(getICAOIndicator(arrayTAFs[i]))


    }

    let TAFs = clearMsgIWXXM(texto).reverse() //pegar as correções por ultimo
    let tafsProxHora = getTAFsProximaHora();  // tafs que deveriam estar na proxima hora de envio

    for (let i in TAFs) {
        TAFs[i] = JSON.parse(TAFs[i]);
        let loc = getICAOIndicator(TAFs[i])

        let dados = { TAF: TAFs[i], localidade: loc, inicio: getBeginTAF(TAFs[i]), getVisPredHora: getVisPredHora, getTetoHora: getTetoHora }

        if (getBeginTAF(TAFs[i]) > getUTCAgora().addHours(-3)) {

            if (tafsProxHora.indexOf(loc) > -1) {//retorna a ultima hora enquando  não chega em hProx-3h
                updateTAFsTraduzidos(dados, true)
                arrayProximosTAFs[loc] = dados
            }
            if (getBeginTAF(TAFs[i]) > getUTCAgora())
                continue;// se a validade do taf ainda não começou, ignora da lista de TAFs validos.
        }
        arrayTAFs[loc] = dados
        updateTAFsTraduzidos(dados, true)
    }
}

function getLocalidadesFromTAFsContent(texto) {
    let patt = /[A-Z][A-Z][A-Z][A-Z] \d{6}Z/g
    let s = texto.match(patt)
    let locs = ''
    let sep = ''
    for (let i in s) {
        locs += sep + s[i].split(' ')[0]
        sep = ','
    }
    return locs
}

function isIWXXM(texto) {
    return texto.toUpperCase().includes('IWXXM')
}

function getDataHoraTAFBruto(taf) {
    taf = taf.replace(/[^a-z0-9\/\-=]/gi, ' ') //troca  caracteres estranhos por espaços
    taf = taf.replace(/ +/g, ' ') //remove espacos duplos

    let patt = /[A-Z][A-Z][A-Z][A-Z] \d{6}Z \d{4}/g
    let s = taf.match(patt)
    if (!s || s.length == 0)

        return ""
    s = s[0].split(" ")

    return s[0] + s[2]

}

function fillZero(str) {
    return str.length == 1 ? "0" + str : str
}

function getDataHoraTAFTraduzido(taf) {
    if (typeof taf === 'string') {
        try {
            taf = JSON.parse(taf)
        } catch (e) {
            return
        }
    }

    return taf.localidade + fillZero(taf.inicio.getDate()) + fillZero(taf.inicio.getHours())
}

function updateTAFsTraduzidos(taf, trad = false) {
    let dh = getDataHoraTAFTraduzido(taf)

    //if (arrayTAFsTraduzidos[dh])
    arrayTAFsTraduzidos[dh] = trad

}

function updateTAFsBrutos(texto) {
    let TAFs = texto.split('=')
    //strTAFsNaoTraduzidos = ''
    if (TAFs.length == 0)
        return false
    for (let i in TAFs) {
        //let loc = getLocalidadesFromTAFsContent(TAFs[i])

        if (!arrayTAFsBrutos.includes(TAFs[i])) {
            let dh = getDataHoraTAFBruto(TAFs[i])

            arrayTAFsBrutos.push(TAFs[i])
            arrayTAFsTraduzidos[dh] = false
        }

    }
    //strTAFsNaoTraduzidos = getLocalidadesFromTAFsContent(TAFs.join(''))
}

function GetWebContentTAF(url, primeiraVez) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        var erro = "ErroSM=";
        if (this.status > 0) {
            if ((this.readyState == 4 && this.status == 200) && (this.responseText !== "") && (!this.responseText.includes("Forbidden"))) {


                //$("#imgLoad"+idxFIR).attr('src', 'pngs/green-button30.png');
                let resposta = opener.removeCacheMessage(this.responseText);

                if (isIWXXM(resposta)) {
                    atualizaArrayTAFs(resposta);
                    atualizaStatusConsultaTAF();

                } else
                    updateTAFsBrutos(resposta)

                let erroConexao = false
                if (erroConexao || !opener.smartPlotOnline) {
                    $("#h5Offline").show();
                    alert("Perda de conexão com o SMARTMETAR! Favor reabrir o SMARTPLOT através do link no site do SMARTMETAR!");
                } else
                    $("#h5Offline").hide();

                //                escondeLoading("TAF");
                //                atualizaHora();
                return resposta;
            } else if (this.readyState > 2 && this.status !== 200) {
                erro = erro + this.responseText;
                //$("#imgLoad"+idxFIR).attr('src', 'pngs/red-button30.png');


                return erro;
            }

        }
    };
    const params = {
        url: url,
    }
    const urlCache = "../ago2021/php/consulta_msg.php?url=" + params.url;
    xhttp.open('GET', urlCache + opener.getProxy(), true);
    xhttp.setRequestHeader('Content-type', 'application/json');

    xhttp.send();
}

function clearTAFsTraduzidos() { // limpa os tafs traduzidos de hora em hora
    let data = getUTCDate(new Date())
    if (data.getMinutes() == 0) {
        arrayTAFsTraduzidos = []
        arrayProximosTAFs = excluiTAFsAntigos(arrayProximosTAFs);
    }
}

function getTAFBruto(loc) {
    let taf = ""
    for (let i in arrayTAFsBrutos) {
        if (arrayTAFsBrutos[i].indexOf(loc) > -1)
            taf = arrayTAFsBrutos[i]
    }
    return taf
}

function formataTAFBruto(taf) {

    taf = taf.replace('TAF', '<b>TAF</b>')
    taf = taf.split(' ')
    tafOut = ''
    arrayTermos = ['BECMG', 'FM', 'PROB30', 'PROB40', 'RMK', 'TEMPO']
    for (let i in taf) {
        if (i < 2)
            continue
        let boldI = ''
        let boldF = ''
        if (arrayTermos.indexOf(taf[i]) > -1 && arrayTermos.indexOf(taf[i - 1]) < 0) {
            tafOut += ' <br>' // o espaco é importante para as buscas
            if (taf[i] !== 'RMK') {
                boldI = '<b>'
                boldF = '</b>'
            }
        }
        tafOut += ` ${boldI}${taf[i]}${boldF}`
    }
    return tafOut

}

function mostraTAF() {
    plotaAeroportos()
}

function getStatusAlertaTAF() {
    return $('#chkTAF').prop('checked')
}



//function getTetoMudanca

//t.TAF.baseForecast.MeteorologicalAerodromeForecast.cloud.AerodromeCloudForecast.layer.CloudLayer.qtd

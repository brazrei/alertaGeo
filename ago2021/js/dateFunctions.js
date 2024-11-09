addHours()
function getDataHoraMetar(metar) {
        var patt2 = /\d{10} - /;
        var t1 = metar.match(patt2)
        if (t1 && t1.length > 0)
            return t1[0]
        else
            return metar

}

function addHours(data, horas) {
    if (!Date.prototype.addHours)
        Date.prototype.addHours = function (h) {
            this.setHours(this.getHours() + h);
            return this;
        }
    if (data)
        return data.addHours(horas)

}

function addMinutes(data, minutos) {
    if (!Date.prototype.addMinutes)
        Date.prototype.addMinutes = function (minutos) {
            this.setTime(this.getTime() + (minutos * 60 * 1000));
            return this;
        }
    
    return data.addMinutes(minutos)
}

function calcDifData(ini, fim) {
    let dif = new Date(fim - ini)
    let chk = new Date(new Date() - new Date())
    if (chk < new Date(1970,0,1))
        addHours(dif,3)
    return dif
}

function isCloseToValidOff(ini, fim, timer = 10) {
    if (ini == "")
        return false

    if (!fim) {
        let valid = getValidadeAirmet(ini)
        ini = valid.split("/")[0]
        fim = valid.split("/")[1]
    }
    let agora = getUTCAgora()
    fim = getFullDateValid(ini, fim)[1]

    let restante = calcDifData(agora,fim)

    if (restante.getFullYear() < 1970) {
        addHours(restante, 3)
        //restante.addHours(3)
    }
    if (restante.getHours() == 0) { // não sei porque, mas estava começando da hora 01 no Linux
        if (restante.getMinutes() <= timer)
            return true
    }

    return false
}

function getFullDateValid(dataI, dataF) { // retorna data inteira de AIRMET e SIGMET 
    let diaI = dataI.substr(0, 2);
    let horaI = dataI.substr(2, 2);
    let minI = dataI.substr(4, 2);

    let diaF = dataF.substr(0, 2);
    let horaF = dataF.substr(2, 2);
    let minF = dataF.substr(4, 2);


    //  let diaA = 
    let agora = getUTCAgora()
    let diaAgora = agora.getUTCDate()
    let anoAgora = agora.getUTCFullYear()
    let mesAgora = agora.getUTCMonth()
    let decMonthI = 0
    let decMonthF = 0

    //Toda essa dificuldade porque o Metar não possui o mês da mensagem:
    if ((diaI > diaAgora) && diaAgora == 1)
        decMonthI = -1
    if ((diaF > diaAgora) && diaAgora == 1)
        decMonthF = -1
    if ((diaI == diaAgora) && (diaF < diaAgora) && (diaF  == 1)) //bug da virada do mês
        decMonthF = 1

    let dataInicial = new Date(anoAgora, mesAgora + decMonthI, diaI, horaI, minI)
    let dataFinal = new Date(anoAgora, mesAgora + decMonthF, diaF, horaF, minF)

    return [dataInicial, dataFinal]

}

function isValidMsg(ini, fim, data = getUTCAgora()) {
    let interval = getFullDateValid(ini, fim)
    let agora = data
    if ((agora >= interval[0]) && (agora <= interval[1])) {
        return true
    } else if (interval[0] > agora)
        return -1
    return false
}

/*function isValidAirmet(ini, fim) {
    let interval = getFullDateValid(ini, fim)
    let agora = getUTCAgora()
    if ((agora >= interval[0]) && (agora <= interval[1])) {
        return true
    } else if (interval[0] > agora)
        return -1
    return false
}*/

function getNum(str) {
    //return str.match(/\d+/) [0]
    return str.replace(/\D/g, '')
}

function getInterval(horas = 1) {
    let dini = getFormatedDate(addHours(new Date(), -horas));
    let dfim = getFormatedDate(addHours(new Date(), 1));
    return `&data_ini=${dini}&data_fim=${dfim}`
}

function getIntervalTAF(dataIni) {
    let dini = getFormatedDate(dataIni);
    let dfim = getFormatedDate(addHours(dataIni, 0));
    return `&data_ini=${dini}&data_fim=${dfim}`
}

function isLinux() {
    try {
        return navigator.platform.toUpperCase().indexOf('LINUX') > -1
    } catch (e) {
        console.log(e);
        return false
    }
}

function getValidadeMsg(text) {
    var t = text.replace(/ /g, "")
    //console.log("t => " + t )

    nuvPatt2 = /\d{6}\/\d{6}/g; //PEGA O intervalo de validade de str sem espaços
    var t1 = t.match(nuvPatt2)
    if (t1 && t1.length > 0)
        return t1[0]
    else
        return ""
}

function getUTCAgora() {
    let agora = new Date()
    return new Date(new Date().getTime() + new Date().getTimezoneOffset()*60000);
    //return new Date(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), agora.getUTCHours(), agora.getUTCMinutes())
}

/*function getFullDateValid(dataI, dataF) { // retorna data inteira de AIRMET e SIGMET 
    let diaI = dataI.substr(0, 2);
    let horaI = dataI.substr(2, 2);
    let minI = dataI.substr(4, 2);

    let diaF = dataF.substr(0, 2);
    let horaF = dataF.substr(2, 2);
    let minF = dataF.substr(4, 2);


    //  let diaA = 
    let agora = getUTCAgora()

    let dataInicial = new Date(agora.getUTCFullYear(), agora.getUTCMonth(), diaI, horaI, minI)
    let dataFinal = new Date(agora.getUTCFullYear(), agora.getUTCMonth(), diaF, horaF, minF)

    if (parseInt(diaF) < parseInt(diaI))
        dataFinal.setMonth(dataFinal.getMonth() + 1);
    //console.log(agora.toISOString())
    //console.log(dataInicial.toISOString())
    //console.log(dataFinal.toISOString())
    return [dataInicial, dataFinal]

}*/

function getUTCDate(date) {
    //let now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        // date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    let now_utc = new Date(date.getTime() + date.getTimezoneOffset()*60000)
    return now_utc;
}

function getIniDataHora(hora) {
    //201200/201800
    return hora.substr(2, 2); 
}

function getFimDataHora(hora) {
    //201200/201800
    return hora.substr(9, 2);
}

function getValidadeMsg(text) {
    var t = text.replace(/ /g, "")
    //console.log("t => " + t )

    nuvPatt2 = /\d{6}\/\d{6}/g; //PEGA O intervalo de validade de str sem espaços
    var t1 = t.match(nuvPatt2)
    if (t1 && t1.length > 0)
        return t1[0]
    else
        return ""
}

function msgPertoDoFim(text) {
    let val = getValidadeMsg(text);
    let ini = val.split("/")[0]
    let fim = val.split("/")[1]

    return isCloseToValidOff(ini, fim)
}

function checaValidadeMsg(texto, data = getUTCAgora()) {

    let val = getValidadeMsg(texto);

    let ini = val.split("/")[0]
    let fim = val.split("/")[1]
    if ((ini !== "") && (fim !== ""))
        return isValidMsg(ini, fim, data)
    else
        return false
}


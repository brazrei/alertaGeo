var arrAeroIndicativo = [];
var arrAeroLat = [];
var arrAeroLong = [];
var arrAeroDescricao = [];
var aeroportosOK = false;


function getAeroportos() {

    $.ajax({
        type: "GET",
        url: "files/aeroportos2.xml?v=202210281200",
        dataType: "xml",

        error: function (e) {
            alert("An error occurred while processing XML file");
            console.log("XML reading Failed: ", e);
        },

        success: function (response) {

            // make sure the ul is empty
            // before appending data inot it

	    arrAeroIndicativo.length = 0;
	    arrAeroLat.length = 0;
	    arrAeroLong.length = 0;
	    arrAeroDescricao.length = 0;

            $(response).find("m").each(function () {
                var tit = $(this).find('t').text().split(" - ");

                
                var indicativo = tit[0];

		var desc = tit[1] + " - " + $(this).find('l').text()
		let lat,lng
		try { 
                lat = Math.trunc($(this).find('lt').text() * 100) /100;
		} catch {
            lat = 0
		}
		try {
                lng = Math.trunc($(this).find('ln').text() * 100) /100;

		} catch {
			lng = 0
		}


		
		arrAeroIndicativo.push(indicativo);
		arrAeroLat.push(lat);
		arrAeroLong.push(lng);
		arrAeroDescricao.push(desc);
            });
	    aeroportosOK = true;
	    BtnMetarGERALClick(true); // era chamado de dentro de relogio.js // achar uma solução mais bonita
        }
    });
}

function getLat(indicativo) {
	return arrAeroLat[arrAeroIndicativo.indexOf(indicativo)];
}

function getLng(indicativo) {
	return arrAeroLong[arrAeroIndicativo.indexOf(indicativo)];
}

function getLatStr(indicativo) {
	lat = arrAeroLat[arrAeroIndicativo.indexOf(indicativo)];
 	if (lat<=0)
	  s = "S"
	else
  	  s = "N"
	return Math.abs(lat) + " °"  + s;
}

function getLngStr(indicativo) {
	return Math.abs(arrAeroLong[arrAeroIndicativo.indexOf(indicativo)])+ " °W";
}

function getDescricao(indicativo) {
	return arrAeroDescricao[arrAeroIndicativo.indexOf(indicativo)];
}



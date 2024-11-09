var intervalImgSat = false;

var LayerImg_sat = false
var TopLat = 12.90
var TopLon = -25.24
var ButtonLat = -50.00
var ButtonLon = -100

$(document).ready(function () {
    slider = document.getElementById("myRange");
    slider.oninput = function () {
        if (isImgSatOn() && LayerImg_sat)
            LayerImg_sat.setOpacity(this.value / 100);
    }
    //output = document.getElementById("demo");
    //output.innerHTML = slider.value; // Display the default slider value
});
// Update the current slider value (each time you drag the slider handle)



function isImgSatOn() {
    return $("#chkImgSat").is(':checked')
}

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    else {
        try {
            return new (ActiveXObject)("MSXML2.XMLHTTP.3.0");
        } catch (e) {
            return null;
        }
    }
}

function isOlderThan(ini, fim, timer = 10) {
    let restante = getUTCDate(new Date(fim - ini))

    if (isLinux()) {
        addHours(restante, 3)
    }

    if (((restante.getHours() * 60) + restante.getMinutes()) >= timer)
        return true

    return false

}

function carrega_img_sat(id, srcImage, TopLat, TopLon, ButtonLat, ButtonLon) {
    //srcImage = "sat/realcada_202011201330.png"
    //srcImage = "sat/S11635390_202011201520.jpg"

    $("#img_sat_progresso").attr("aria-valuenow", 0);
    $("#img_sat_progresso").css("width", "0%");
    var temp = $("#img_sat_carregar_info").html();

    xhr = getXMLHttpRequest();
    xhr.onprogress = function (evt) {
        if (evt.lengthComputable) {
            var percentComplete = Math.floor((evt.loaded / evt.total) * 100);
            $("#img_sat_progresso").attr("aria-valuenow", percentComplete);
            $("#img_sat_progresso").css("width", percentComplete + "%");
        }
    }
    xhr.onload = function () {
        if ((xhr.readyState == 4) && (xhr.status == 200)) {

            $("#img_sat_progresso").attr("aria-valuenow", "0");
            $("#img_sat_progresso").css("width", "0%");
            $("#img_sat_carregar_info").html("");
            // Setting the Overlay Image

            //map.createPane('imagebg');
            //map.getPane('imagebg').style.zIndex = 50;

            extent = [ButtonLon, ButtonLat, TopLon, TopLat];
            removeImgSat();
            LayerImg_sat = L.imageOverlay(srcImage, [
                [TopLat, TopLon],
                [ButtonLat, ButtonLon]
            ]);
            //img_sat.setOptions({pane:"imagebg"})
            if (isImgSatOn()) {
                map.addLayer(LayerImg_sat);
                if (isSTSCOn())
                	changeHeatColor(optImgSat)

            }
	    let opacity = slider?slider.value/100:0.5;
            LayerImg_sat.setOpacity(opacity);
            LayerImg_sat.bringToBack();

        }
    };
    xhr.open("GET", srcImage, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.send(null);
}

// Plotando ImgSat
//var ImgSatCenterMap=[];
function updateImgSatInterval() {
    if (intervalImgSat) {
        clearInterval(intervalImgSat);
        intervalImgSat = false
    }
    intervalImgSat = setInterval('plota_ImgSat(false)', 300000)

}
function plota_ImgSat(obj_chk) {
    //obj_chk = false
    updateImgSatInterval()
    if (isImgSatOn())
        $('#myRange').show()
    else
        $('#myRange').hide()

    //if (!obj_chk || obj_chk.checked) {
    if (true) {
        mostraLoading("ImgSat");
        //if (LayerImg_sat)
        //  map.addLayer(LayerImg_sat)
	let url = 'https://api-redemet.decea.mil.br/produtos/satelite/realcada?api_key=U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei'
	    
        $.ajax({
            url: url,
            //url: urlCache + url + opener.getProxy(),
            contentType: 'application/json',
            crossDomain: true,
            cache: false,
            method: 'GET',
            dataType: 'json',
            success: function (data) {

                //removeImgSat();
                var i = 0;
                var hoje = new getUTCAgora();
                var hoje_dia = hoje.getUTCDate();
                var hoje_mes = parseInt(hoje.getUTCMonth()) + 1;
                var hoje_ano = hoje.getUTCFullYear();
                if (hoje_dia < 10) {
                    hoje_dia = '0' + hoje_dia;
                }
                if (hoje_mes < 10) {
                    hoje_mes = '0' + hoje_mes;
                }

                let data_prod = hoje_dia + '/' + hoje_mes + '/' + hoje_ano + ' ' + data.data.anima[0]
                $('#clockImgSat').text(data_prod.split(" ")[1] + ":00 UTC");
                data_prod = hoje_mes + " " + hoje_dia + ' ' + hoje_ano + ' ' + data.data.anima[0]
                data_prod = getUTCDate(new Date(data_prod))

                let erro = isOlderThan(data_prod, hoje, 60)

                formataErro('#clockImgSat', erro)
                formataErro('#labelImgSat', erro)

                let id = data.data.lat_lon.id
                let srcImage = data.data.satelite[0].path
                let TopLat = data.data.lat_lon.lat_max
                let TopLon = data.data.lat_lon.lon_max
                let ButtonLat = data.data.lat_lon.lat_min
                let ButtonLon = data.data.lat_lon.lon_min

                let filename = srcImage.split("realcada/maps/")[1]

                saveImageToFile(srcImage, filename)


            },
            error: function (e) {
                console.log(e);
                formataErro('#clockImgSat', true)
                formataErro('#labelImgSat', true)
            }
        });
    } else {
        removeImgSat();
    }
}

function saveImageToFile(url, filename) {
    //jsonString = JSON.stringify(data);
    $.ajax({
        url: 'php/saveImgSat.php',
        data: { url: url, filename: filename },
        type: 'POST'
    }).done(function () {
        carrega_img_sat(0, "php/imgsat/" + filename, TopLat, TopLon, ButtonLat, ButtonLon, 5000);

        escondeLoading("ImgSat");
    });
}

function changeHeatColor(opt) {
	if (heat && (heat.length > 0)) 
		for (var i in heat) {
			if (heat[i].layer)
				try{
		    			heat[i].layer.setOptions(opt)				
		    		} catch (e) {
		    			
		    		}
		}
	
}

function removeImgSat() {
    if (map && LayerImg_sat)
        map.removeLayer(LayerImg_sat);

    if (isSTSCOn()) {
    	changeHeatColor(optDefault);
    }
}

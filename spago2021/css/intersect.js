//var firRECoords = "S1016 W04740 - S0851 W04639 - S0810 W04546 - S0616 W04446 - S0555 W04413 - S0430 W04314 - S0411 W04231 - N0057 W04047 - S0316 W03205 - S0406 W03148 - S0651 W03314 - S0824 W03349 - S1513 W03739 - S1643 W03802 - S1825 W03859 - S1852 W03739 - S2111 W03922 - S2044 W03948 - S2057 W04012 - S2053 W04031 - S2042 W04048 - S2025 W04058 - S2037 W04200 - S2027 W04236 - S1833 W04229 - S1702 W04143 - S1536 W04406 - S1318 W04535 - S1200 W04654 - S1016 W04740"
//var firBSCoords = "S1016 W04740 - S1200 W04654 - S1319 W04534 - S1538 W04405 - S1701 W04143 - S1834 W04230 - S2027 W04236 - S2013 W04321 - S2022 W04329 - S2031 W04348 - S2030 W04404 - S2247 W04545 - S2313 W04551 - S2324 W04623 - S2329 W04654 - S2313 W04725 - S2302 W04734 - S2241 W04734 - S2206 W04801 - S2132 W04937 - S2041 W05035 - S1934 W05133 - S1718 W05354 - S1642 W05306 - S1433 W05337 - S1257 W05329 - S1211 W05303 - S1031 W05105 - S1029 W04954 - S1013 W04902 - S1001 W04859 - S0951 W04852 - S0941 W04838 - S0937 W04822 - S0938 W04809 - S0942 W04800 - S0954 W04748 - S1009 W04741 - S1016 W04740"
arrCutted = []
//arrSobr = []

function getPolyByCoords(coords) {
    var features = [];

    let ret;
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polygon) {
            if (JSON.stringify(layer.toGeoJSON().geometry.coordinates) === JSON.stringify(coords)) {
                ret = layer;
            }
        }
    });
    return ret;
}

function joinPoly(layer1, layer2) {
    //    let tPolyFir = [getCoordDegAirmet(coordFIR)]
    // let tPolyFir = coordFIR

    let poly1 = turf.polygon(layer1);

    let poly2 = turf.polygon(layer2);

    let plotJoin = turf.union(poly1, poly2); // 

    if (turf.getGeom(plotJoin).type == "Polygon") {
        let iCoord = plotJoin.geometry.coordinates;
        if (iCoord.length == 1) {  //quando soh ha um poligono por fir a coordenada vem em formato diferente.
            iCoord = [iCoord]
            let iPoly = iCoord[0][0]
            let coord = invertLatLong(iPoly)


            let join = L.polygon(coord).addTo(map);

            /*            join.setStyle({
                            fillColor: "green",
                            color: "green",
                        });
            
            */
            formataLayerEdit(join)
            return join; // na diferenca considera apenas o primeiro
        }

    }
}

function joinPolys(poly) {
    /*
    for (let i in arrSobr)
        removeLayerEdit(arrSobr[i])
    */
    let layers = editableLayers.toGeoJSON().features;
    let selecionado

    if (!poly) {
        if (layers && (layers.length > 1))
            selecionado = layers[layers.length - 1] //o ativo eh o ultimo
    } else
        selecionado = poly

    for (let i = 0; i < layers.length; i++) {

        if (layers[i] !== selecionado.toGeoJSON()) {
            let res = joinPoly(selecionado.toGeoJSON().geometry.coordinates, layers[i].geometry.coordinates)
            if (res && (res.toGeoJSON().geometry.coordinates.length > 0)) {

                let polyByCoords = getPolyByCoords(layers[i].geometry.coordinates)
                removeLayerEdit(selecionado)
                removeLayerEdit(polyByCoords)
                selecionado = res
            }
        }
    }
}

function featuresToMultiPoly(feat) {
    let coords = []
    for (let i in feat) {
        coords.push(feat[i].geometry.coordinates)
    }
    let multiP = turf.multiPolygon(coords)
    return multiP
}

function selectBiggest(polys, isFeatureCol = false) {
    if (!isFeatureCol)
        polys = polys.geometry.coordinates;
    else {
        //polys = turf.combine(polys)
        polys = featuresToMultiPoly(polys.features).geometry.coordinates[0];
    }
    let bigArea = 0,
        bigPoly;

    polys.forEach((poly) => {
        let xPoly = turf.polygon(poly)
        let area = turf.area(xPoly)
        if (area > bigArea) {
            bigArea = area
            if (!isFeatureCol)
                bigPoly = xPoly
            else
                bigPoly = turf.polygon(xPoly)
        }
    })
    return bigPoly
}

function cutSobr(layer1, layer2) {
    //    let tPolyFir = [getCoordDegAirmet(coordFIR)]
    // let tPolyFir = coordFIR

    let poly1 = turf.polygon(layer1);

    let poly2 = turf.polygon(layer2);
    let plotSobCut = false
    try {
        plotSobCut = turf.difference(poly1, poly2); // 
    } catch (e) {
        console.log(e)
    }


    if (plotSobCut) {
        if (turf.getGeom(plotSobCut).type == "MultiPolygon")
            plotSobCut = selectBiggest(plotSobCut)

        let iCoord = plotSobCut.geometry.coordinates;
        if (iCoord.length == 1) //quando soh ha um poligono por fir a coordenada vem em formato diferente.
            iCoord = [iCoord]

        for (let i in iCoord) {
            let iPoly = iCoord[i][0]
            let coord = invertLatLong(iPoly)


            let sob = L.polygon(coord).addTo(map);
            //arrSobr.push(sob)

            /*sob.setStyle({
                fillColor: "green",
                color: "green",
            });*/


            formataLayerEdit(sob, false)

            return sob; // na diferenca considera apenas o primeiro
        }

    }
}

/*function filterIntersections(poly) {
    let polysResult = turf.unkinkPolygon(poly)
    return selectBiggest(polysResult, true)
}*/

function cutPlotSobr(poly) {
    /*
    for (let i in arrSobr)
        removeLayerEdit(arrSobr[i])
    */
    //arrSobr = []
    //let coordEdit = extractDMS(JSON.stringify(poly.toGeoJSON()))
    removeLayerEdit(poly)

    //poly = turf.polygon([getCoordDegAirmet(coordEdit)])


    let layers = editableLayers.toGeoJSON().features;
    let selecionado

    if (!poly) {
        if (layers && (layers.length > 1))
            selecionado = layers[layers.length - 1] //o ativo eh o ultimo
    } else
        selecionado = poly

/*    try {
        let sel = filterIntersections(selecionado.toGeoJSON());
        selecionado = sel;
    } catch(e) {
        console.log(e)
    }
*/
    for (let i = 0; i < layers.length; i++) {

        if (layers[i] !== selecionado.toGeoJSON()) {
            //let coordComp = turf.polygon(layers[i].geometry.coordinates)

            let res = cutSobr(selecionado.toGeoJSON().geometry.coordinates, layers[i].geometry.coordinates)
            if (res && (res.toGeoJSON().geometry.coordinates.length > 0)) {

                removeLayerEdit(selecionado)
                selecionado = res
            }
        }
    }
}


function cutPlotFIRs(poly) {
    let coordEdit
    if (!poly) {
        coordEdit = $("#taCoordenadas").val()
    } else {

        coordEdit = extractDMS(JSON.stringify(poly.toGeoJSON()))
        removeLayerEdit(poly)
    }

    //for (let i in arrCutted)
    //    formataLayerEdit(arrCutted[i])

    arrCutted = []
    cutPlotFIR(coordEdit, [(getCoordDegAirmet((firAZCoords)))])
    cutPlotFIR(coordEdit, [(getCoordDegAirmet((firAOCoords)))])
    cutPlotFIR(coordEdit, [(getCoordDegAirmet((firRECoords)))])
    cutPlotFIR(coordEdit, [(getCoordDegAirmet((firBSCoords)))])
    cutPlotFIR(coordEdit, [(getCoordDegAirmet((firCWCoords)))])

    //map.removeLayer()
    /*    cutPlotFIR(coordEdit, [firAOCoords])
        cutPlotFIR(coordEdit, [firRECoords])
        cutPlotFIR(coordEdit, [firBSCoords])
        cutPlotFIR(coordEdit, [firCWCoords])*/
}

function bringCuttedToFront() {
    for (let i in arrCutted)
        arrCutted[i].bringToFront()

}

function getCutCoordinates(layer) {
    let ret
    try {
        ret = layer.geometry.coordinates
        let teste = ret.length
        return ret
    }
    catch (e) {
        console.log(e)
    }

    try {
        let arr = layer.geometry.geometries
        arr.forEach((a) => {
            if (a.type == "Polygon") {
                ret = a.coordinates

            }
        })
        return ret
    }
    catch (e) {
        console.log(e)
    }

    return ret
}

function cutPlotFIR(coordEdit, tPolyFir) {
    //    let tPolyFir = [getCoordDegAirmet(coordFIR)]
    // let tPolyFir = coordFIR
    let polyFir = turf.polygon(tPolyFir)

    let polyEdit = turf.polygon([getCoordDegAirmet(coordEdit)]);

    let plotFirCut = turf.intersect(polyFir, polyEdit);

    if (plotFirCut) {

        let iCoord = getCutCoordinates(plotFirCut);
        if (iCoord.length == 1) //quando soh ha um poligono por fir a coordenada vem em formato diferente.
            iCoord = [iCoord]
        for (let i in iCoord) {
            iPoly = iCoord[i][0]
            let coord = invertLatLong(iPoly)
            let cut = L.polygon(coord).addTo(map);

            /*cut.setStyle({
                fillColor: "green",
                color: "green",
            });*/


            formataLayerEdit(cut, false)
            arrCutted.push(cut)
        }

    }
}

function paste(pasteText) {
    pasteText.focus();
    document.execCommand("paste");
    console.log(pasteText.textContent);
}

function isFromSkyVector(coords) {
    coords = removeEspacos(coords);
    let latLngPatt1 = /\d{6}[nNsS]\d{7}[W]/g
    let latLngPatt2 = /\d{4}[nNsS]\d{5}[W]/g
    let arrCoords = coords.match(latLngPatt1)

    if (arrCoords && (arrCoords.length > 2)) {
        return true
    } else {
        arrCoords = coords.match(latLngPatt2)
        if (arrCoords && (arrCoords.length > 2))
            return true
    }

    return false
}

function isFromRedemet(coords) {
    coords = removeEspacos(coords);
    let latLngPatt = /[nNsS]\d{4}[W]\d{5}/g
    let arrCoords = coords.match(latLngPatt)

    return arrCoords && (arrCoords.length > 2)
}

function skyVectorToRedemet(coords) {
    coords = removeEspacos(coords);
    //console.log(coords)
    let latLngPatt1 = /\d{6}[nNsS]\d{7}[W]/g
    let latLngPatt2 = /\d{4}[nNsS]\d{5}[W]/g

    let arrCoords = coords.match(latLngPatt1)

    if (!arrCoords || (arrCoords.length == 0)) {
        arrCoords = coords.match(latLngPatt2)
        if (!arrCoords || (arrCoords.length == 0))
            return ""
    }

    for (let i in arrCoords) {
        let icoord = arrCoords[i]
        let sepLat = "S"
        if (icoord.includes("N"))
            sepLat = "N"
        let ilat = icoord.split(sepLat)[0].substr([0, 4])
        let ilong = icoord.split(sepLat)[1].substr(0, 5)
        arrCoords[i] = sepLat + ilat + " W" + ilong

    }
    if (arrCoords[0] !== arrCoords[arrCoords.length - 1])
        arrCoords.push(arrCoords[0])
    return arrCoords.join(" - ")

}

function formataCoordsExternas(coords) {

    coords = removeEspacos(coords);
    //console.log(coords)
    let latLngPatt = /[nNsS]\d{4}[W]\d{5}/g
    let arrCoords = coords.match(latLngPatt)

    if (!arrCoords || arrCoords.length == 0)
        return ""
    if (arrCoords[0] !== arrCoords[arrCoords.length - 1])
        arrCoords.push(arrCoords[0])
    return arrCoords.join(" - ")

}

function windyToLatLong(coords) {
    let arrLatLong = []

    for (let i in coords) {
        icoord = coords[i]

        let coordj = icoord.split("\t")
        if (coordj.length > 1) {
            if (!isNaN(coordj[1]) && !isNaN(coordj[2])) {
                arrLatLong.push([parseFloat(coordj[1]), parseFloat(coordj[2])])
            }
        }

    }
    if (arrLatLong.length > 0)
        arrLatLong.push(arrLatLong[0])
    return arrLatLong

}

function plotagemDaArTransf() {
    /*   paste(document.querySelector("#taCoordenadas"));
   */
    let coorExt = $("#taCoordenadas").val()
    let windy = false
    let fromExt = []
    if (isFromSkyVector(coorExt))
        coorExt = skyVectorToRedemet(coorExt.split("\n").join(" "))
    else if (isFromRedemet(coorExt))
        coorExt = formataCoordsExternas(coorExt.split("\n").join(" "));
    else {
        windy = true
        coorExt = windyToLatLong(coorExt.split("\n"))
        fromExt = (coorExt)
    }

    if (!windy) {
        fromExt = invertLatLong(getCoordDegAirmet(coorExt))
    }

    if (fromExt.length > 0) {
        let layer = formataLayerEdit(L.polygon(fromExt).addTo(map))

        copiaCoordenadas(extractDMS(JSON.stringify(layer.toGeoJSON())))
        /*
                if (editableLayers) {
                    editableLayers.addLayer(layer);
                    $(".drawercontainer .drawercontent").html(
                        JSON.stringify(editableLayers.toGeoJSON())
                    );
        
                }
                */
    }


}


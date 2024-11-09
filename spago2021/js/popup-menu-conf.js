var ocultarSigmetsVencendo = false

var arrayDescricaoLayer = []

function setMenuMapaOff() {
    menuMapa = null

}

function setMenuMapaOn() {
    menuMapa = menuMapaBackup
}

function compartilharLayer(layer) {
    let send = prompt("Descrição da Plotagem: ")
    if (send)
        enviarPlotagem(layer, send);
}

function capturaBotaoPlotagem() {
    function removeEvents(elem) {
        var old_element = document.getElementsByClassName(elem)[0]
        var new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
    }

    let rect = 'leaflet-draw-draw-rectangle'
    let poly = 'leaflet-draw-draw-polygon'

    removeEvents(rect)
    removeEvents(poly)
    document.getElementsByClassName(rect)[0].onclick = function (evt) {
        rectangleDrawer.enable();
        console.log("inciou retangulo")
        return false;//Returning false prevents the event from continuing up the chain
    };

    document.getElementsByClassName(poly)[0].onclick = function (evt) {
        polygonDrawer.enable();
        console.log("inciou polygon")
        return false;//Returning false prevents the event from continuing up the chain
    };
}



function iniciarPlotagem(e, retangulo = false) {
    mapEvent = (e) => {
        var e = document.createEvent('Event');
        let tipo
        if (retangulo)
            tipo = 'leaflet-draw-draw-rectangle'
        else
            tipo = 'leaflet-draw-draw-polygon'

        e.initEvent('click', true, true);
        var cb = document.getElementsByClassName(tipo);
        return !cb[0].dispatchEvent(e);

    };

    mapEvent(e);

}

function makeCancelTextSigmet(sigmet) {
    let tip = sigmet.getTooltip().getContent();
    //   tip = msg
    tip = tip.replace(/<b>/g, "")
    tip = tip.replace(/<\/b>/g, "")
    tip = tip.replace(/ - N. /g, "")
    tip = tip.replace(/SBAZ/g, "")
    tip = tip.replace(/SBBS/g, "")
    tip = tip.replace(/SBCW/g, "")
    tip = tip.replace(/SBRE/g, "")
    tip = tip.replace(/SBAO/g, "")
    tip = tip.replace(/- VALID /g, "")
    tip = tip.split(" - ")[0]

    return "CNL " + tip
}

function createPopUpMenu() {

    menuPoly = new ContextMenu(
        {
            'theme': 'default',
            'items': [
                { 'icon': '', 'name': 'Separar Área por FIR', action: () => cutPlotFIRs(selectedLayer) },
                { 'icon': '', 'name': 'Remover Áreas Sobrepostas', action: () => cutPlotSobr(selectedLayer) },
                /*                { 'icon': '', 'name': 'Unir Áreas Adjacentes', action: () => joinPolys(selectedLayer) },
                                { 'separator' : ''},
                */
                /*{
                    'icon': '', 'name': 'Editar', action: () => {
                        $(".leaflet-draw-edit-edit").trigger('click');
                    }
                },*/
                {
                    'icon': '', 'name': 'Aviso de Aeródromo', action: () => {
                        createAdWrng(selectedLayer);
                    }
                },
                {
                    'icon': '', 'name': 'Excluir', action: () => {
                        removeLayerEdit(selectedLayer, true);
                    }
                },
                {
                    'icon': '', 'name': 'Adicionar Descrição', action: () =>
                        changeDescription(selectedLayer)
                },
                {
                    'icon': '', 'name': 'Compartilhar Área', action: () =>
                        sharePolygon(selectedLayer)
                }


            ]
        }
    );

    menuMarker = new ContextMenu(
        {
            'theme': 'default',
            'items': [
                { 'icon': '', 'name': 'Plotar Área Airmet', action: () => plotarAreaLocalidade(selectedMarker) }


            ]
        }
    );

    menuSigmet = new ContextMenu(
        {
            'theme': 'default',
            'items': [
                { 'icon': '', 'name': 'Criar Texto de Cancelamento', action: () => copiaCoordenadas(makeCancelTextSigmet(selectedSigmet)) },
                { 'icon': '', 'name': 'Enviar para Trás', action: () => selectedSigmet.bringToBack() }


            ]
        }
    );
    menuGamet = new ContextMenu(
        {
            'theme': 'default',
            'items': [

                { 'icon': '', 'name': 'Enviar para Trás', action: () => selectedSigmet.bringToBack() }


            ]
        }
    );
    /*
        menuAirmet = new ContextMenu(
            {
                'theme': 'default',
                'items': [
                    { 'icon': '', 'name': 'Criar Texto de Cancelamento', action: () => copiaCoordenadas(makeCancelTextSigmet(selectedSigmet)) },
                    { 'icon': '', 'name': 'Enviar para Trás', action: () => selectedSigmet.bringToBack() }
    
    
                ]
            }
        );
    */
    menuMapa = new ContextMenu(
        {
            'theme': 'default',
            'items': [
                {
                    'icon': '', 'name': 'Plotar Polígono Qualquer', action: (e) => {
                        iniciarPlotagem(e)
                    }
                },
                {
                    'icon': '', 'name': 'Plotar Retângulo', action: (e) => {
                        iniciarPlotagem(e, true)
                    }
                },
                {
                    'icon': '', 'name': 'Exibir FIR Brasil', action: (e) => {
                        selecionaFIR(firBrasil, firBrasilia)
                    }
                },
                {
                    'icon': '', 'name': 'Exibir FIR Briefing Brasília', action: (e) => {
                        selecionaFIR(firBrasilia, firBrasil)
                    }
                },
                {
                    'icon': '', 'name': "Ocultar MSG's a Vencer (30 min.)", action: (e) => {
                        ocultarSigmetsVencendo = !ocultarSigmetsVencendo
                        if (ocultarSigmetsVencendo)
                            $('#flash').html('Smartplot (+30 min.)')
                        else
                            $('#flash').html('Smartplot')

                        mostraSigmet()
                        mostraAirmet()
                    }
                },
                {
                    'icon': '', 'name': 'Importar Áreas de Outros Usuários', action: (e) => {
                        // selecionaFIR(firBrasilia, firBrasil)
                        loadLayers()
                    }
                },
                {
                    'icon': '', 'name': 'Cancelar Áreas Compartilhadas', action: (e) => {
                        // selecionaFIR(firBrasilia, firBrasil)
                        loadLayersCancel()
                    }
                }
            ]
        }
    );
    menuMapaBackup = menuMapa

}

function selecionaFIR(entra, sai) {
    if (sai && map) {
        try {
            map.removeLayer(sai)
        } catch (e) {
        }

    }
    if (entra && map) {
        try {
            entra.addTo(map)
        } catch (e) {
        }

    }
}

function hideMenu(menu) {
    if (menu)
        menu.hide();
}

function hideAll() {
    hideMenu(menuPoly);
    hideMenu(menuSigmet);
    hideMenu(menuGamet);
    hideMenu(menuMarker);
    hideMenu(menuMapa);
    hideMenu(menuMapaBackup);
}

function openContextMenuPoly(evt) {
    //evt.preventDefault();
    const time = menuPoly.isOpen() ? 100 : 0;
    hideAll();

    setTimeout(() => { menuPoly.show(evt.containerPoint.x, evt.containerPoint.y) }, time);
    document.addEventListener('click', hideContextMenu, false);
}

function openContextMenuSigmet(evt) { //sigmet e airmet
    //evt.preventDefault();
    const time = menuSigmet.isOpen() ? 100 : 0;
    hideAll();

    setTimeout(() => { menuSigmet.show(evt.containerPoint.x, evt.containerPoint.y) }, time);
    document.addEventListener('click', hideContextMenu, false);
}

function openContextMenuGamet(evt) { //sigmet e airmet
    //evt.preventDefault();
    const time = menuGamet.isOpen() ? 100 : 0;
    hideAll();

    setTimeout(() => { menuGamet.show(evt.containerPoint.x, evt.containerPoint.y) }, time);
    document.addEventListener('click', hideContextMenu, false);
}


function hideContextMenu(evt) {
    hideAll();
    document.removeEventListener('click', hideContextMenu);
}

function openContextMenuMarker(evt) {
    //evt.preventDefault();
    const time = menuMarker.isOpen() ? 100 : 0;

    hideAll();
    setTimeout(() => { menuMarker.show(evt.containerPoint.x, evt.containerPoint.y) }, time);
    document.addEventListener('click', hideContextMenu, false);
}


/*function hideContextMenuMarker(evt) {
    menuMarker.hide();
    document.removeEventListener('click', hideContextMenu);
}*/

function openContextMenuMapa(evt) {
    //evt.preventDefault();
    const time = menuMapa.isOpen() ? 100 : 0;

    hideAll();
    setTimeout(() => { menuMapa.show(evt.containerPoint.x, evt.containerPoint.y) }, time);
    menuMapaBackup = menuMapa

    document.addEventListener('click', hideContextMenu, false);
}

function saveDescricaoLayer(layer, descricao) {
    arrayDescricaoLayer[layer._leaflet_id + 'L'] = descricao.toUpperCase()
}

$(document).ready(function () {
    $('#modalAdWrng').on('shown.bs.modal', function () {
        $('#taModalAdWrng').focus();
    })
    $('#modalDescricaoLayer').on('shown.bs.modal', function () {
        $('#taModalDescricao').focus();
    })

    $('#checkSemAvisos').on('input', function () {
        createAdWrng(selectedLayer)
    })

    $('#btnImportaLayer').on('click', function () {
        //        let d = $('#taModalDescricao').val() + ""
        //saveDescricaoLayer(selectedLayer, $('#taModalDescricao').val())
        let a = getSelecterLayersFromModal()
        if (a.length == 0) {
            alert("Selecione pelo menos uma área!")
            return
        }
        $('#modalLoadLayer').modal('hide');
        plotaAreas(a)
        //atualizaLayersEditados()
        //saveLayersOnServer(selectedLayer)
    }
    );

    $('#btnDeleteLayer').on('click', function () {
        //        let d = $('#taModalDescricao').val() + ""
        //saveDescricaoLayer(selectedLayer, $('#taModalDescricao').val())

        let a = getSelecterLayersFromModal('#divModalCancelLayerGroup')
        if (a.length == 0) {
            alert("Selecione pelo menos uma área!")
            return
        }

        $('#modalCancelShare').modal('hide');
        deleteLayers(a)
        //atualizaLayersEditados()
        //saveLayersOnServer(selectedLayer)
    }
    );

    $('#btnShare').on('click', function () {
        //        let d = $('#taModalDescricao').val() + ""

        saveDescricaoLayer(selectedLayer, $('#taModalDescricao').val())

        $('#modalDescricaoLayer').modal('hide');
        atualizaLayersEditados()
        saveLayersOnServer(selectedLayer)
    }
    );

    $('#btnSaveDescription').on('click', function () {
        //        let d = $('#taModalDescricao').val() + ""

        saveDescricaoLayer(selectedLayer, $('#taModalDescricao').val())
        $('#btnShare').hide()
        $('#modalDescriptionTitle').html('Adicionar Descrição');
        $('#modalDescricaoLayer').modal('hide');
        // deleteLayers(getSelecterLayersFromModal('#divModalCancelLayerGroup'))
        atualizaLayersEditados()
    }
    );


})

function getSelecterLayersFromModal(div = '#divModalLoadLayerGroup') {
    let nodes = $(div)[0].childNodes
    let areas = []
    nodes.forEach(node => {
        if (node.className.includes('active'))
            areas.push(JSON.parse(node.value))

    })
    return areas
}

function sharePolygon(layer) {
    //$('#taCoordenadas').val(str);
    $('#btnShare').show();
    $('#btnSaveDescription').hide();
    $('#taModalDescricao').val(arrayDescricaoLayer[layer._leaflet_id + 'L']);
    $('#modalDescriptionTitle').html('Compartilhar');

    $('#modalDescricaoLayer').modal();
}

function changeDescription(layer) {
    //$('#taCoordenadas').val(str);
    $('#btnSaveDescription').show();
    $('#btnShare').hide();
    //$('#btnDeleteLayer').hide();
    $('#taModalDescricao').val(arrayDescricaoLayer[layer._leaflet_id + 'L']);
    $('#modalDescriptionTitle').html('Adicionar Descrição');

    $('#modalDescricaoLayer').modal();
}

function createAdWrng(layer) {
    function getActiveLocs() {
        let arr = opener.arrAdWRNGGeral
        let locs = ''
        for (let i in arr)
            if (checaValidadeMsg(arr[i].codigo))
                locs += arr[i].locs.join(',')
        return locs
    }

    let locs = getAeroportosOnEdit(layer)

    let patt = /[A-Z][A-Z][A-Z][A-Z]/g
    let arr = locs.match(patt)
    let arrCMA = []
    let newLine = "\t"
    let activeLocs = getActiveLocs()

    if (arr.length > 0) {
        let cont = 0

        for (let i in arr) {
            if ($('#checkSemAvisos').prop('checked') && activeLocs.includes(arr[i]) ) 
                continue
            cont++;
            cma = opener.getCMA(arr[i])

            cma = cma !== "" ? cma : "DESCONHECIDO"
            newLine = arrCMA[cma] ? ((arrCMA[cma].split("\t").length % 5 == 0) ? "\t\n" : "\t") : "\t"

            arrCMA[cma] = arrCMA[cma] ? arrCMA[cma] + newLine + arr[i] : arr[i];
            
        }
    }

    let str = ""
    for (let i in arrCMA) {
        arrCMA[i] = arrCMA[i].replaceAll("\t\n", "\n")
        str += `CMA (${i}):\n` + arrCMA[i] + "\n\n"
    }

    $('#taModalAdWrng').val(str);
    $('#taCoordenadas').val(str);
    $('#modalAdWrng').modal();

}

function selectGroupDivImportar(e) {
    console.log(e.target)
    if (!e.className.includes('active'))
        e.className = e.className + " active"
    else
        e.className = e.className.replace(" active", "")

}

function updateModal(usuarios, divId) {

    let html = ""
    usuarios.forEach(usuario => {
        usuario.areas.forEach(area => {
            area.usuario = usuario.usuario == "nil" ? `Usuário Desconhecido - ${area.ip}` : usuario.usuario
            let s = JSON.stringify(area)

            let desc = area.descricao
            desc = desc == "" ? "Área sem Descrição" : desc
            html += `<button type="button" class="list-group-item list-group-item-action" onclick="selectGroupDivImportar(this)" value = '${s}'>${desc} - ( ${area.usuario} )</button>`
        })
    })
    $(divId).html(html)


}

function deleteLayers(layers) {
    removeSharedLayers(layers)
    let txt = '{"areas": ' + JSON.stringify(layers) + '}'
    $.ajax({
        url: '../ago2021/php/deleteLayer.php',
        data: { 'layers': txt },

        type: 'POST'
    });

}

function loadLayers() {

    // return
    fetch('../ago2021/php/loadLayers.php')
        .then((response) => response.json())
        .then((json) => {
            console.log(json)
            updateModal(json.usuarios, "#divModalLoadLayerGroup")
            $('#modalLoadLayer').modal();
            //plotaAreas(json.areas, json.usuario)
        });
}

function loadLayersCancel() {

    // return
    fetch('../ago2021/php/loadLayers.php?cancel=TRUE')
        .then((response) => response.json())
        .then((json) => {
            console.log(json)
            updateModal(json.usuarios, '#divModalCancelLayerGroup')
            $('#modalCancelShare').modal();
            //plotaAreas(json.areas, json.usuario)
        });
}


function plotaAreas(areas) {
    function plotaPoligono(area, desc, usuario) {
        coord = formataCoordsExternas(area);
        coord = invertLatLong(getCoordDegAirmet(coord))
        let layer = formataLayerEdit(addLayerToMap(L.polygon(coord)))
        let u = usuario == "nil" ? "" : ` - ( ${usuario} )`
        saveDescricaoLayer(layer, desc + u)
        atualizaLayersEditados()
    }
    areas.forEach(a => {
        plotaPoligono(a.coordenadas, a.descricao, a.usuario)
    });
}


/*function hideContextMenuMapa(evt) {
    menuMapa.hide();
    document.removeEventListener('click', hideContextMenuMapa);
}*/


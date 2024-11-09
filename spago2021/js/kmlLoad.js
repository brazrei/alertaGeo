function loadFirBrasil() {
  let urlBrasil = 'kml/firBrasil.kml'
  let urlBrasilia = 'kml/setores_fir_destaque_brasilia.kml'
  map = makeMap();
  firBrasil = omnivore.kml(urlBrasil).on('ready', function() {
        // when this is fired, the layer
        // is done being initialized
      this.setStyle({fillOpacity:0, color:"grey",weight:2});

      start();
        
    }).addTo(map);
    
   firBrasil.options = {interactive: false};
   firBrasilia = omnivore.kml(urlBrasilia).on('ready', function() {
        // when this is fired, the layer
        // is done being initialized
      this.setStyle({fillOpacity:0, color:"grey",weight:2});

        
    });
    
    firBrasilia.options = {interactive: false};
/*
var track;

var kml = fetch(url)
  .then( res => res.text() )
  .then( kmltext => {
        parser = new DOMParser();
        kml = parser.parseFromString(kmltext,"text/xml");
        track = new L.KML(kml);
        track.setStyle({opacity: 0.9, fillOpacity: 0});
        map.addLayer(track);
        //const bounds = track.getBounds();
        map.fitBounds(bounds);
  });
*/
 
}

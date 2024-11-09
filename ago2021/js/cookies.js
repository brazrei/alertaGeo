function inicializaCookies(){
  $('#chkFIRAZ').prop('checked', $.cookie('firAZ')!='hide');
  checkAZChange("sim");
  $('#chkFIRBS').prop('checked', $.cookie('firBS')!='hide');
  checkBSChange("sim");
  $('#chkFIRRE').prop('checked', $.cookie('firRE')!='hide');
  checkREChange("sim");
  $('#chkFIRCW').prop('checked', $.cookie('firCW')!='hide');
  checkCWChange("sim");
  
  if ($.cookie('som')=='on')
    $("#imgSom").attr('src', "pngs/sound-on30.png");
  else
    $("#imgSom").attr('src', "pngs/sound-off30.png");
  
  //zoom control
  if ($.cookie('zoom')) 
  document.body.style.zoom = $.cookie('zoom') + "%"
}

function saveZoom2Cookie(zoom){
  zoom2CookieTimer = false
  $.cookie('zoom', zoom)
}



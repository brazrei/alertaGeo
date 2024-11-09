<?php
session_start();
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>SMART METAR</title>

  <link rel="icon" type="image/png" href="pngs/main2.png">

  <link href='https://fonts.googleapis.com/css?family=Orbitron' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/relogio.css">
  <link rel="stylesheet" href="css/switch.css">
  <link rel="stylesheet" href="css/mainpage.css">

  <script src="js/jquery.min.js"></script>
  <script src="js/jquery.cookie.js" type="text/javascript"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/trataMetarC.js" type="text/javascript"></script>
  <script src="js/relogio.js" type="text/javascript"></script>
  <script src="js/cookies.js" type="text/javascript"></script>
  <script src="js/aeroportos.js" type="text/javascript"></script>
  <script src="js/trataGametC.js" type="text/javascript"></script>
  <script src="js/trataGametBot.js" type="text/javascript"></script>
  <script src="js/adwrng.js" type="text/javascript"></script>
  <script src="js/dateFunctions.js" type="text/javascript"></script>
  <script src="js/share.js" type="text/javascript"></script>

  <!--Plugin para corrigir o Z-Indexc
  <script type="text/javascript">
    (function (global) {
      var MarkerMixin = {
        _updateZIndex: function (offset) {
          this._icon.style.zIndex = this.options.forceZIndex ? (this.options.forceZIndex + (this.options.zIndexOffset || 0)) : (this._zIndex + offset);
        },
        setForceZIndex: function (forceZIndex) {
          this.options.forceZIndex = forceZIndex ? forceZIndex : null;
        }
      };
      if (global) global.include(MarkerMixin);
    })(L.Marker);
  </script>
  -->

  <style type="text/css">
    .bs-example {
      margin: 20px;
    }

    .table-hover tbody tr:hover td,
    .table-hover tbody tr:hover th {
      background-color: #a9a2a2;
    }

    .step3 {
      margin: 6px -6px 6px -6px;
      border-radius: 0px;
      box-shadow: 0px -3px 5px #666;
      padding: 0px;
    }

    .gradientgrey {
      background-image: -ms-linear-gradient(top, #FFF 0%, #CFCFCF 100%);
      background-image: -moz-linear-gradient(top, #FFF 0%, #CFCFCF 100%);
      background-image: -o-linear-gradient(top, #FFF 0%, #CFCFCF 100%);
      background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FFF), color-stop(1, #CFCFCF));
      background-image: -webkit-linear-gradient(top, #FFF 0%, #CFCFCF 100%);
      background-image: linear-gradient(top, #FFF 0%, #CFCFCF 100%);
    }

    .errorPulse {
      -webkit-animation: pulsateM 0.5s ease-out;
      -webkit-animation-iteration-count: infinite;
    }

    @keyframes pulsateM {
      0% {
        opacity: 0.3;
      }

      50% {
        opacity: 1.0;
      }

      100% {
        opacity: 0.3;
      }
    }

    .pulseValid {
      animation: pulsateValid 1s ease-out;
      -webkit-animation: pulsateValid 1s ease-out;
      -webkit-animation-iteration-count: infinite;
      opacity: 0.0
    }

    @keyframes pulsateValid {
      0% {
        -webkit-transform: scale(1, 1);
        opacity: 0.0;
      }

      50% {
        opacity: 1.0;
      }

      100% {
        -webkit-transform: scale(1, 1);
        opacity: 0.0;
      }
    }

    .invisivel {
      display: none;
    }
  </style>
</head>

<body>

  <div class="topo step3 gradientgrey" ondblclick="openSmartPlot()">
    <div id="mensagemTopo">
      <!--<h1> SmartMetar </h1> -->

      <img src="pngs/SmartMetar.png" alt="" style="background: no-repeat center center;" />

      <input type="button" onclick="openSmartPlot()" style="float: right; margin-right: 15px;  margin-top: 10px;" value="SMART PLOT"></input>
      <?php
      if (!isset($_SESSION['id_usuario'])) {
        echo '<input type="button" onclick="window.location = ' . "'login.php'" . '" style="float: right; margin-right: 15px; margin-top: 10px;" value="LOGIN"></input>';
      } else {
        echo "<div style='float: right; margin-right: 15px; margin-top: 15px;'><h6>USUÁRIO: <b>" . $_SESSION['nome'] . "</b></h6></div>";
      }

      ?>
    </div>
    <div id="divCronometro" class="cronometro">
      <img id="imgSom" src="pngs/sound-off30.png" title="Ligar/Desligar Alerta Sonoro" alt="" border=1 height=100% onclick="alternaImagemSom()" />
      <span id="cronometro">:00</span>
    </div>
  </div>

  <!--	<button type="button" onclick="BtnMetarGERALClick()" style="width:25%; height:60px" >Atualizar</button>
<div style = "background-color: black;">

<div class="clock">
  <div class="tick">:</div>
  <div class="seconds" id = "seconds">
    <div class="first">
      <div class="number">5</div>
    </div>
    <div class="second infinite">
      <div class="number">9</div>
    </div>
  </div>
</div>

</div>
 -->

  <!--
<div style = "padding-top: 20px">
  <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal">
  Inserir os GAMET's Manualmente
  </button>
  <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" id="getGamet">
  Obter os GAMET's Automaticamente
  </button>
</div>
-->
  <!-- Modal -->
  <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" style="width: 90%; height: 70%">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="myModalLabel">Insira os GAMET's</h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
        <div class="modal-body" style="height: 500px">
          <span>Cole os GAMET's na área abaixo:</span>
          <textarea id="taGAMETS" style="width:99%; height: 90%; border-width: 2px;"></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal" id="salvarGamets">Salvar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="bs-example">
    <table class="table table-hover table-striped" id="firAZtable" style="table-layout: fixed;">
      <colgroup>
        <col style="width: 50%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 5%;">
      </colgroup>
      <thead>
        <tr>
          <th colspan="5" class="table-secondary"><img id="imgLoad0" class="imgLoad" src="gifs/loading30x30.gif" alt="" border=1 height=100%> FIR AMAZÔNICA</img> </th>
        </tr>

        <tr>
          <th colspan="5" class="table-warning"><img id="imgLoad0" class="imgLoad" src="" alt="" border=1 height=100%>
            GAMET </img> </th>
        </tr>

        <tr class="cabecalho">
          <th>Mensagem</th>
          <th>Status AD WRNG</th>
          <th>Status GAMET</th>
          <th>Status AIRMET</th>
          <th>CMA-1</th>
        </tr>
      </thead>

      <tbody>
        <tr class="table-primary">
          <td>METAR SBXX xxxxxZ XXXXXKT XXXVXXX XXXX FEWXXX BKNXXX XX/XX QXXXX xxxxxxxxxxxxxxx</td>
          <td>Indefinido</td>
        </tr>
      </tbody>
    </table>
  </div>


  <div class="bs-example">
    <table class="table table-hover table-striped" id="firBStable" style="table-layout: fixed;">
      <colgroup>
        <col style="width: 50%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 5%;">
      </colgroup>
      <thead>
        <tr>
          <th colspan="5" class="table-secondary"><img id="imgLoad1" class="imgLoad" src="gifs/loading30x30.gif" alt="" border=1 height=100%> FIR BRASÍLIA</th>
        </tr>
        <tr>
          <th colspan="5" class="table-warning"><img id="imgLoad0" class="imgLoad" src="" alt="" border=1 height=100%>
            GAMET </img> </th>
        </tr>

        <tr class="cabecalho">
          <th>Mensagem</th>
          <th>Status AD WRNG</th>
          <th>Status GAMET</th>
          <th>Status AIRMET</th>
          <th>CMA-1</th>
        </tr>
      </thead>

      <tbody>
        <tr class="table-primary">
          <td>METAR SBXX xxxxxZ XXXXXKT XXXVXXX XXXX FEWXXX BKNXXX XX/XX QXXXX xxxxxxxxxxxxxxx</td>
          <td>Indefinido</td>
        </tr>
      </tbody>
    </table>
  </div>


  <div class="bs-example">
    <table class="table table-hover table-striped" id="firREtable" style="table-layout: fixed;">
      <colgroup>
        <col style="width: 50%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 5%;">
      </colgroup>

      <thead>
        <tr>
          <th colspan="5" class="table-secondary"><img id="imgLoad2" class="imgLoad" src="gifs/loading30x30.gif" alt="" border=1 height=100%> FIR RECIFE</th>
        </tr>

        <tr>
          <th colspan="5" class="table-warning"><img id="imgLoad0" class="imgLoad" src="" alt="" border=1 height=100%>
            GAMET </img> </th>
        </tr>

        <tr class="cabecalho">
          <th>Mensagem</th>
          <th>Status AD WRNG</th>
          <th>Status GAMET</th>
          <th>Status AIRMET</th>
          <th>CMA-1</th>
        </tr>
      </thead>

      <tbody>
        <tr class="table-primary">
          <td>METAR SBXX xxxxxZ XXXXXKT XXXVXXX XXXX FEWXXX BKNXXX XX/XX QXXXX xxxxxxxxxxxxxxx</td>
          <td>Indefinido</td>
          <td>xxx</td>
        </tr>
      </tbody>
    </table>
  </div>


  <div class="bs-example">
    <table class="table table-hover table-striped" id="firCWtable" style="table-layout: fixed;">
      <colgroup>
        <col style="width: 50%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 15%;">
        <col style="width: 5%;">
      </colgroup>
      <thead>
        <tr>
          <th colspan="5" class="table-secondary"><img id="imgLoad3" class="imgLoad" src="gifs/loading30x30.gif" alt="" border=1 height=100%> FIR CURITIBA</th>
        </tr>

        <tr>
          <th colspan="5" class="table-warning"><img id="imgLoad0" class="imgLoad" src="" alt="" border=1 height=100%>
            GAMET </img> </th>
        </tr>
        <tr class="cabecalho">
          <th>Mensagem</th>
          <th>Status AD WRNG</th>
          <th>Status GAMET</th>
          <th>Status AIRMET</th>
          <th>CMA-1</th>
        </tr>
      </thead>

      <tbody id="firCWlines">
        <tr class="table-primary">
          <td>METAR SBXX xxxxxZ XXXXXKT XXXVXXX XXXX FEWXXX BKNXXX XX/XX QXXXX xxxxxxxxxxxxxxx</td>
          <td>Indefinido</td>
        </tr>
      </tbody>
    </table>
  </div>

  <script type="text/javascript">
    var isadmin = '<?php echo $_SESSION['ad']; ?>' === '1';
    var usuario = '<?php echo $_SESSION['nome']; ?>';
  </script>
</body>

<footer>
  <!--
</br>
<h5>Desenvolvido por Reinaldo Braz - email: brazrab@fab.mil.br</h5>
-->
  </br>
  <h5 style="color: red" id="relogio"> Hora da última consulta à REDEMET: </h5>
  </br>
  <h5>Parâmetros de Filtragem:</h5>
  <label class="switch">
    <input type="checkbox" id="chkTeto" onclick="updateMetarGamet()" checked>
    <span class="slider round"></span>
  </label>
  <label>Teto Abaixo de: 1000FT</label>
  </br>

  <label class="switch">
    <input type="checkbox" id="chkVis" onclick="updateMetarGamet()" checked>
    <span class="slider round"></span>
  </label>
  <label>Visibilidade Abaixo de: </label>
  <select id="selectVis" onchange="selectVisChange()">
    <option value="10000">10000m</option>
    <option value="9000">9000m</option>
    <option value="8000">8000m</option>
    <option value="7000">7000m</option>
    <option value="6000">6000m</option>
    <option value="5000" selected>5000m</option>
    <option value="4000">4000m</option>
    <option value="3000">3000m</option>
    <option value="2000">2000m</option>
    <option value="1000">1000m</option>
  </select>
  </br>

  <label class="switch">
    <input type="checkbox" id="chkVento" onclick="updateMetarGamet()" checked>
    <span class="slider round"></span>
  </label>
  <label>Vento Acima de: </label>
  <select id="selectVento" onchange="selectVentoChange()">
    <option value="10">10KT</option>
    <option value="12">12KT</option>
    <option value="14" selected>14KT</option>
    <option value="16">16KT</option>
    <option value="18">18KT</option>
    <option value="20">20KT</option>
    <option value="50">50KT</option>
  </select>
  <br>
  <label class="switch">
    <input type="checkbox" id="chkTrovoada" onclick="updateMetarGamet()" checked>
    <span class="slider round"></span>
  </label>
  <label>Trovoada</label>
  </br></br>

  <h5>Exibir/Ocultar:</h5>
  <label class="switch">
    <input type="checkbox" id="chkFIRAZ" checked>
    <span class="slider round"></span>
  </label><span> FIR AMAZÔNICA</span><br>

  <label class="switch">
    <input type="checkbox" id="chkFIRBS" checked>
    <span class="slider round"></span>
  </label><span> FIR BRASÍLIA</span><br>

  <label class="switch">
    <input type="checkbox" id="chkFIRRE" checked>
    <span class="slider round"></span>
  </label><span> FIR RECIFE</span><br>

  <label class="switch">
    <input type="checkbox" id="chkFIRCW" checked>
    <span class="slider round"></span>
  </label><span> FIR CURITIBA</span><br>
  <br>

  <br>
  <label class="switch">
    <input type="checkbox" id="chkOcultarCobertos" onchange="updateMetarGamet()">
    <span class="slider round"></span>
  </label>
  <span> Exibir apenas Localidades com Parâmetros Descobertos </span><br>
  </br>

  <label class="switch">
    <input type="checkbox" id="chkExibirGamets" onchange="updateMetarGamet()" checked>
    <span class="slider round"></span>
  </label>
  <span> Exibir os GAMET's </span><br>
  </br>



  <h5>Localidades Automáticas:</h5>
  <label class="switch">
    <input type="checkbox" id="chkLocAuto" checked>
    <span class="slider round"></span>
  </label><span> Exibir apenas o último SPECI das Localidades Automáticas </span><br>

  <!-- 
  <h5>Fonte de Dados API:</h5>
  <label class="switch">
    <input type="checkbox" id="chkFonteAPINova">
    <span class="slider round"></span>
  </label><span> Obter os Dados Meteorológicos API Nova  </span><br>
  </br>
  
  -->
  <div style="padding-top: 20px">
    <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" id="getGamet">
      Atualizar os GAMET's Agora
    </button>
    <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal" id="showWindowGamet">
      Inserir os GAMET's Manualmente
    </button>
    <button type="button" class="btn btn-primary btn-lg" id="ocultarGamet" onclick="$('.tableGametContent').fadeToggle();">
      Exibir/Ocultar os GAMET's
    </button>
  </div>

  </br>
  <h5>Dados dos Grupos de Consulta Colhidos no Site da REDEMET em 09/02/2021)</h5>
  <h5>FIR AMAZÔNICA - GRUPO CMI-AZ: </h5><span id="spanCMIAZ"></span></br></br>
  <h5>FIR BRASÍLIA - GRUPO CMI-BSV: </h5><span id="spanCMIBS"></span></br></br>
  <h5>FIR RECIFE - GRUPO CMI-RE: </h5><span id="spanCMIRE"></span></br></br>
  <h5>FIR CURITIBA - GRUPO CMI-CWV: </h5><span id="spanCMICW"></span></br></br>


  <h3 style="color: red"> ATENÇÃO! APLICATIVO EM TESTE! VERSÃO BETA!</h3>
  <img src="gifs/loading30x30.gif" alt="" border=1 height=100% style="display:none" />

  <div onclick="new Audio('mp3/double-beep.wav').play()" id="divDoubleBeep"></div>
</footer>

</html>
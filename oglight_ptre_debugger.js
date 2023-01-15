// ==UserScript==
// @name         OGLightPTREDebugger
// @namespace    https://openuserjs.org/users/GeGe_GM
// @version      0.1.0
// @description  Script to debug OGLight-PTRE interactions
// @author       GeGe_GM
// @license      MIT
// @copyright    2022, GeGe_GM
// @match        https://*.ogame.gameforge.com/game/*
// @updateURL    https://openuserjs.org/meta/GeGe_GM/OGLightPTREDebugger.meta.js
// @downloadURL  https://openuserjs.org/install/GeGe_GM/OGLightPTREDebugger.user.js
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==


var serveur = document.getElementsByName('ogame-universe')[0].content;
var splitted = serveur.split('-');
var universe = splitted[0].slice(1);
var splitted2 = splitted[1].split('.');
var country = splitted2[0];
var oglPTREGalaxyValue = "ogl-ptre-debugger-" + country + "-" + universe + "-Galaxy";
var oglPTRESystemValue = "ogl-ptre-debugger-" + country + "-" + universe + "-System";
var autoResfreshPeriod = 1 * 1000;

// *** *** ***
// MAIN EXEC
// *** *** ***

displayOGLDebugger();
refreshOGLStatus();


// *** *** ***
// Add PTRE styles
// Ugly style... yes!
// *** *** ***
GM_addStyle(`
.status_positif {
    color:#508d0e;
    font-weight:bold;
}
.status_negatif {
    color: #bb2e15;
    font-weight:bold;
}
.status_warning {
    color:#bb6715;
    font-weight:bold;
}
#debuggerDiv {
    padding:10px;
    z-index: 1000;
    position: fixed;
    bottom: 30px;
    left: 10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.8);
}
#boxPTREMessage {
    padding:10px;
    z-index: 1000;
    position: fixed;
    bottom: 30px;
    left: 10px;
    border: solid black 2px;
    background:rgba(0,26,52,0.8);"
}
#btnSaveOptPTRE {
    cursor:pointer;
}
#ptreSpanGalaxyMessageD {
    color:green;
    font-weight:bold;"
}
.ptre_maintitle {
    color: #299f9b;
    font-weight:bold;
    text-decoration: underline;
}
.ptre_title {
    color: #299f9b;
    font-weight:bold;
}
.td_cell {
    padding: 3px;
}
`);

// *** *** ***
// NOTIFICATIONS FUNCTIONS
// *** *** ***

// Displays PTRE responses messages
// Responses from server
function displayPTREMessage(message) {
    var divDebugMessage = '<div id="boxPTREMessage">PTRE: <span id="ptreMessage">' + message + '</span></div>';

    var boxPTREMessage = document.createElement("div");
    boxPTREMessage.innerHTML = divDebugMessage;
    boxPTREMessage.id = 'boxPTREMessage';

    if (document.getElementById('links')) {
        document.getElementById('links').appendChild(boxPTREMessage);
        setTimeout(function() {document.getElementById('boxPTREMessage').remove();}, ptreMessageDisplayTime * 1000);
    }
}



// *** *** ***
// MINI FUNCTIONS
// *** *** ***



// *** *** ***
// IMPROVE MAIN VIEWS
// *** *** ***

// Displays Debug DIV
function displayOGLDebugger() {

    if (document.getElementById('divDebugContainer')) {
        document.getElementById('divDebugContainer').parentNode.removeChild(document.getElementById('divDebugContainer'));
    }

    var divDebug = '<div id="debuggerDiv"><table border="1">';
    divDebug += '<tr><td class="td_cell"><span class="ptre_maintitle">OGLight / PTRE Debugger</span></td></tr>';
    divDebug += '<tr><td class="td_cell"><input id="btnRefreshDebugger" type="button" value="REFRESH ALL" /> <input id="btnUpdateGalaxy" type="button" value="UPDATE SYSTEM" /> <input id="btnCloseDiv" type="button" value="CLOSE" /></td></tr>';
    divDebug += '<tr><td class="td_cell"><input id="debuggerGalaxyValue" type="text" value="' + GM_getValue(oglPTREGalaxyValue, '1') + '" size="1" /> ';
    divDebug += '<input id="leftSystem" type="button" value="<<<" /> ';
    divDebug += '<input id="debuggerSystemValue" type="text" value="' + GM_getValue(oglPTRESystemValue, '1') + '" size="1" /> ';
    divDebug += '<input id="rightSystem" type="button" value=">>>" /></td></tr>';
    divDebug += '<tr><td class="td_cell"><div id="oglStatus"></div></td></tr>';
    divDebug += '<tr><td class="td_cell"><hr></td></tr>';
    divDebug += '<tr><td class="td_cell"><div id="debuggerGalaxyContent"/></td>';
    divDebug += '</table></div>';

    var eletementSetPTRE = document.createElement("div");
    eletementSetPTRE.innerHTML = divDebug;
    eletementSetPTRE.id = 'divDebugContainer';
    if (document.getElementById('links')) {
        document.getElementById('links').appendChild(eletementSetPTRE);
    }

    document.getElementById('debuggerGalaxyContent').innerHTML = "...";

    // Action Refresh
    document.getElementById('btnRefreshDebugger').addEventListener("click", function (event)
    {
        document.getElementById('divDebugContainer').parentNode.removeChild(document.getElementById('divDebugContainer'));
        setTimeout(function() {displayOGLDebugger();}, 200);
    });
    // Action: Close
    document.getElementById('btnCloseDiv').addEventListener("click", function (event)
    {
        document.getElementById('divDebugContainer').parentNode.removeChild(document.getElementById('divDebugContainer'));
    });
    // Action Get System
    document.getElementById('btnUpdateGalaxy').addEventListener("click", function() {updatePosition();});
    // Action Get Left System
    document.getElementById('leftSystem').addEventListener("click", function() {updateLesftSystem();});
    // Action Get Right System
    document.getElementById('rightSystem').addEventListener("click", function() {updateRightSystem();});

    updatePosition();
}

function updateLesftSystem() {
    var system = document.getElementById("debuggerSystemValue").value;
    system--;
    document.getElementById("debuggerSystemValue").value = system;
    updatePosition();
}

function updateRightSystem() {
    var system = document.getElementById("debuggerSystemValue").value;
    system++;
    document.getElementById("debuggerSystemValue").value = system;
    updatePosition();
}

function updatePosition() {
    document.getElementById('debuggerGalaxyContent').innerHTML = "Loading...";
    console.log("Fetching position...");

    // Save position
    var galaxy = document.getElementById("debuggerGalaxyValue").value;
    var system = document.getElementById("debuggerSystemValue").value;
    GM_setValue(oglPTREGalaxyValue, galaxy);
    GM_setValue(oglPTRESystemValue, system);
    
    
    if(ogl && ogl.db && ogl.db.positions) {
        var output = '';

        for (let pos = 1; pos <= 15; pos++) {
            var id = "not found";
            var temp = "not found";

            output += '[' + galaxy + ':' + system + ':' + pos + '] ';

            idArray = ogl.find(ogl.db.positions, 'coords', galaxy + ':' + system + ':' + pos);

            if (idArray.length == 0) {
                output += 'No entry';
            } else if (idArray.length == 1) {
                var positionObject = ogl.db.positions[idArray];

                var dateFormat = new Date(positionObject.lastUpdate);
                
                output += 'Entry #' + idArray + ' => ';
                output += 'playerID : ' + positionObject.playerID + ' | ';
                output += 'id : ' + positionObject.id + ' | ';
                output += 'moonID : ' + positionObject.moonID + ' | ';
                output += 'lastUpdate : ' + dateFormat + ' | ';
                output += 'activity : ' + positionObject.activity + ' | ';
                output += 'moonActivity : ' + positionObject.moonActivity + ' | ';
                output += 'coords : ' + positionObject.coords;

            } else {
                output += 'ERR: ' + idArray.length + ' elements';
            }
            output += '<br>';
        }


        document.getElementById('debuggerGalaxyContent').innerHTML = output;
    } else {
        document.getElementById('debuggerGalaxyContent').innerHTML = '<span class="status_negatif">OGL is NOT defined. Refresh page</span>';
    }
}


function refreshOGLStatus() {
    if (document.getElementById('oglStatus')) {
        document.getElementById('oglStatus').innerHTML = "...";

        var oglStatusText = '';

        if(ogl) {
            oglStatusText = 'OGL status: <span class="status_positif">OGL is defined</span>';
        } else {
            oglStatusText = 'OGL status: <span class="status_negatif">OGL is NOT defined. Refresh page</span>';
        }

        document.getElementById('oglStatus').innerHTML = oglStatusText;
    }

    setTimeout(function() {refreshOGLStatus();}, autoResfreshPeriod);
}
/* MultiServiceMap.
   Copyright (C) 2022 DISIT Lab http://www.disit.org - University of Florence

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, either version 3 of the
   License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. */



//By Ala  
function mostraElencoAgenzie_api(orgUrl) {
    //if(mode!="query" && mode!="embed"){
    $.ajax({
        url: orgUrl + "tpl/agencies/",
        type: "GET",
        async: true,
        dataType: 'json',
        success: function (msg) {

            //$("#elencoagenzie").html(msg);
            var html;
            html = "<option value=''> - Select an Agency -</option>";

            for (i = 0; i < msg.Agencies.length; i++) {
                html += "<option value='" + msg.Agencies[i].agency + "'>" + msg.Agencies[i].name + "</option>";
            }
            $("#elencoagenzie").html(html);
        }
    });
}

// FUNZIONE CARICAMENTO CONTENUTO MENU LINEE ATAF
function mostraElencoLinee(selectOption) {

    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";
    }


    if (value == 'null') {
        alert("Please, select an organization!");
        document.getElementById("org_selector").style.backgroundColor = "pink";
    } else {

        if (value == superServiceMapApiUrl) {
            selectedorgUrl = value;
        } else {
            seperator = value.indexOf("|");
            selectedorgUrl = value.substring(0, seperator);
        }
        //if(mode!="query" && mode!="embed"){
        $.ajax({
            // url: ctx + "/ajax/json/get-lines.jsp",
            url: selectedorgUrl + ctx + "tpl/bus-lines/",
            type: "GET",
            async: true,
            headers: {'Authorization':'Bearer '+msm_access_token},
            dataType: 'json',
            data: {
                agency: selectOption.options[selectOption.options.selectedIndex].value
                // accessToken: msm_access_token
            },
            success: function (msg) {
                var html;
                html = "<option value=''> - Select a Line -</option>";
                html += "<option value='all'> - Show all Lines -</option>";

                for (i = 0; i < msg.BusLines.length; i++) {
                    var value;
                    if (msg.BusLines[i].shortName != "") {
                        value = msg.BusLines[i].shortName;
                        if (msg.BusLines[i].longName != "")
                            value += " - " + msg.BusLines[i].longName;
                    }
                    else
                        value = msg.BusLines[i].longName;

                    html += "<option value='" + msg.BusLines[i].uri + "'>" + value + "</option>";
                }

                $("#elencolinee").html(html);
            }
        });
    }
}

// MOSTRA ELENCO FERMATE DI UNA LINEA NELLA SELECT
function mostraElencoPercorsi(selectOption, route) {
    // var value = document.getElementById("org_selector").value;
    // if (value == "null") {
    //     // value = superServiceMapApiUrl;
    //     document.getElementById("org_selector").style.backgroundColor = "red";
    //     alert('Please, select an organization!');
    // } else {
    //     document.getElementById("org_selector").style.backgroundColor = "white";
    // }
    // if (value == superServiceMapApiUrl) {
    //     selectedorgUrl = value;
    // } else {
    //     seperator = value.indexOf("|");
    //     selectedorgUrl = value.substring(0, seperator);
    // }
    nascondiRisultati();
    if ($("#elencolinee").val() != null) {
        //if (selectOption.options.selectedIndex != 0){	
        $('#elencoprovince')[0].options.selectedIndex = 0;
        $('#elencocomuni').html('<option value=""> - Seleziona un Comune - </option>');
        $('#loading').show();

        agency = $('#elencoagenzie option:selected').attr('value');
        var line = selectOption.options[selectOption.options.selectedIndex].value;
        var data = {};

        if (line == 'all') {
            data = {
                agency: $('#elencoagenzie option:selected').attr('value'),
                // accessToken: msm_access_token
            }
        } else {
            data = {
                line: selectOption.options[selectOption.options.selectedIndex].value,
                agency: $('#elencoagenzie option:selected').attr('value'),
                // accessToken: msm_access_token
            }
        }

        $.ajax({
            url: selectedorgUrl + ctx + "tpl/bus-routes/",
            type: "GET",
            async: true,
            // headers: {'Authorization':'Bearer '+msm_access_token},
            dataType: 'json',
            data: data,
            success: function (msg) {
                if (mode == "embed")
                    $("#elencopercorsi").val(route);
                else {

                    if (selectOption.options[selectOption.options.selectedIndex].value == "all") {

                        for (i = 0; i < msg.BusRoutes.length; i++) {
                            var codRoute = msg.BusRoutes[i].route;
                            var nomeAgenzia = $("#elencoagenzie option:selected").text();
                            var nomeLinea = nomeAgenzia + " - Line: " + msg.BusRoutes[i].line;
                            var direction = msg.BusRoutes[i].firstBusStop + " &#10132; " + msg.BusRoutes[i].lastBusStop;
                            showLinea('', codRoute, direction, nomeLinea, 'transverse', undefined, i);
                        }

                    }
                    else {
                        var html;
                        html = "<option value=''> - Select a Routed -</option>";
                        for (i = 0; i < msg.BusRoutes.length; i++) {
                            var value;
                            value = msg.BusRoutes[i].firstBusStop + " &#10132; " + msg.BusRoutes[i].lastBusStop;
                            html += "<option value='" + msg.BusRoutes[i].route + "'>" + value + "</option>";
                        }
                        $('#elencopercorsi').html(html);
                    }
                }
                $('#loading').hide();
            },
                error: function (e) {
                    console.log(e);
                }
            //   timeout:5000
        });
    }
    // }
}


// MOSTRA ELENCO FERMATE DI UNA LINEA NELLA SELECT
function mostraElencoFermate(selectOption, stop) {
    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        // value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
    }
    var selectedRouteUrl = selectOption.options[selectOption.options.selectedIndex].value;
    nascondiRisultati();
    if ($("#elencopercorsi").val() != null) {
        //if (selectOption.options.selectedIndex != 0){	
        $('#elencoprovince')[0].options.selectedIndex = 0;
        $('#elencocomuni').html('<option value=""> - Seleziona un Comune - </option>');
        $('#loading').show();
        $.ajax({
            url: selectedorgUrl + ctx + "/tpl/bus-stops/",
            type: "GET",
            async: true,
            // headers: {'Authorization':'Bearer '+msm_access_token},
            dataType: 'json',
            data: {
                // serviceUri: selectOption.options[selectOption.options.selectedIndex].value,
                route: selectOption.options[selectOption.options.selectedIndex].value,
                // maxResults:'0',
                // lang:'it',
                geometry: 'true',
                // accessToken: msm_access_token
                // format:'json',
                // realtime:'true'
            },
            success: function (msg) {
                if (mode == "embed")
                    $("#elencofermate").val(stop);
                else {
                    var html;
                    html = "<option value=''> - Select a Bus Stop -</option>";
                    html += "<option value='all'>Show entire Route</option>";

                    for (i = 0; i < msg.BusStops.features.length; i++) {
                        var value;
                        value = msg.BusStops.features[i].properties.name;
                        html += "<option value='" + msg.BusStops.features[i].properties.serviceUri + "'>" + value + "</option>";
                    }
                    $('#elencofermate').html(html);
                }

                $('#loading').hide();
            }
            //   timeout:5000
        });
    }
    }
}

// MOSTRA ELENCO FERMATE DI UNA LINEA SULLA MAPPA
function mostraFermate(selectOption) {
    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        // value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";
  

    var sample_coord_lat = "";
    var sample_coord_lon = "";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
        sample_coord_lat = '48.3708';
        sample_coord_lon = '10.4589';
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
        center = value.substring(seperator + 1, value.length);
        sample_coord_lat = center.substring(0, center.indexOf(","));
        sample_coord_lon = center.substring(center.indexOf(",") + 1, center.length);
    }

    //$('#info-aggiuntive .content').html(''); //forse da disattivare per mostrare le previsioni del tempo
    nascondiRisultati();
    if (selectOption.options.selectedIndex != 0) {

        GPSControl._isActive = false;
        //svuotaLayers();
        $('#loading').show();
        if (selectOption.options[selectOption.options.selectedIndex].value == 'all') {
            $('#raggioricerca').prop('disabled', true);
            $('#nResultsServizi').prop('disabled', true);
            $('#nResultsSensori').prop('disabled', true);
            $('#nResultsBus').prop('disabled', true);
            if (pins.lenght > 0)
                pins = "";
            /* TEMPORANEAMENTE DISABILITATO
             if ($('#elencolinee')[0].options[$('#elencolinee')[0].options.selectedIndex].value == 'LINE17'){
             // SE E' LA LINEA 17 FACCIO VEDERE LE ROUTESECTION
             
             $.ajax({
             url : "${pageContext.request.contextPath}/ajax/json/get-bus-route.jsp",
             type : "GET",
             async: true,
             dataType: 'json',
             data : {
             numeroRoute: '438394'
             },
             success : function(msg) {
             var busRouteLayer = L.geoJson(msg).addTo(map);
             
             }
             });	  
             
             }
             */
            //var numBusstop = 0;
            var position = ($("#elencopercorsi option:selected").text()).indexOf("-");
            if ($("#elencolinee").val() == "all") {
                var pos_space = ($("#elencopercorsi option:selected").text()).indexOf(" ");
                var linea = ($("#elencopercorsi option:selected").text()).substring(0, pos_space);
            } else {
                var linea = $("#elencolinee").val();
            }

            var direction = ($("#elencopercorsi option:selected").text());
            var codRoute = $("#elencopercorsi").val();
            //var nomeLinea = ($("#elencopercorsi option:selected").text()).substring(0, position - 1);
            var nomeAgenzia = $("#elencoagenzie option:selected").text();
            var nomeLinea = nomeAgenzia + " - Line: " + $("#elencolinee option:selected").text();

            showLinea(linea, codRoute, direction, nomeLinea, undefined, undefined, codRoute.replace("http://www.disit.org/km4city/resource/", ""));
            $('#loading').hide();
            //query = saveQueryBusStopLine(nomeLinea);
        }
        else {

            if (pins.length > 0)
                pins = "";
            $('#raggioricerca').prop('disabled', false);
            $('#nResultsServizi').prop('disabled', false);
            $('#nResultsSensori').prop('disabled', false);
            $('#nResultsBus').prop('disabled', false);
            $.ajax({
                //url: ctx + "/ajax/json/get-bus-stop.jsp",
                // url: ctx + "/api/service.jsp",
                url: selectedorgUrl + ctx + "/",

                type: "GET",
                async: true,
                headers: {'Authorization':'Bearer '+msm_access_token},
                dataType: 'json',
                data: {
                    serviceUri: selectOption.options[selectOption.options.selectedIndex].value
                    // accessToken: msm_access_token
                },
                success: function (msg) {
                    // var sample_coord_lat=msg.BusStop.features[0].geometry.coordinates[1];
                    // var sample_coord_lon=msg.BusStop.features[0].geometry.coordinates[0];

                    //faccio partire il firing delle previsioni del tempo di Firenze
                    $.ajax({
                        // url: "ajax/get-weather.jsp",
                        url: selectedorgUrl + ctx + "location/",
                        type: "GET",
                        async: true,
                        headers: {'Authorization':'Bearer '+msm_access_token},
                        //dataType: 'json',
                        data: {
                            position: sample_coord_lat + ';' + sample_coord_lon
                            // accessToken: msm_access_token
                            // nomeComune: "FIRENZE"
                        },
                        success: function (msg) {
                            municipalityUri = msg.municipalityUri;
                            getWeatherInfo(selectedorgUrl + ctx, municipalityUri);
                            // $('#info-aggiuntive .content').html(msg);
                        }
                    });
                    //    var i=0;
                    selezione = 'Bus Stop: ' + selectOption.options[selectOption.options.selectedIndex].value;
                    $('#selezione').html(selezione);
                    var longBusStop = msg.BusStop.features[0].geometry.coordinates[0];
                    var latBusStop = msg.BusStop.features[0].geometry.coordinates[1];
                    coordinateSelezione = latBusStop + ";" + longBusStop;
                    busStopsLayer = L.geoJson(msg.BusStop, {
                        pointToLayer: function (feature, latlng) {
                            marker = showmarker(feature, latlng);
                            return marker;
                        },
                        onEachFeature: function (feature, layer) {
                            var popupContent = "";
                            if (feature.properties.tipo == undefined)
                                feature.properties.tipo = 'fermata';

                            var divId = feature.id + "-" + feature.properties.tipo;
                            /*var divLinee = divId + "-linee";
                             var popupContent = "<h3>FERMATA : " + feature.properties.popupContent + "</h3>";
                             popupContent += "<a href='" + logEndPoint + feature.properties.serviceUri + "' title='Linked Open Graph' target='_blank'>LINKED OPEN GRAPH</a><br />";
                             popupContent += "<div id=\"" + divLinee + "\" ></div>";
                             popupContent += "<div id=\"" + divId + "\" ></div>";
                             var divSavePin = "savePin-" + feature.id;
                             var name = feature.properties.popupContent;
                             name = escape(name);
                             popupContent = popupContent + "<div id=\"" + divSavePin + "\" class=\"savePin\" onclick=save_handler('" + feature.properties.tipo + "','" + feature.properties.serviceUri + "','" + name + "')></div>";*/
                            popupContent = popupContent + "<div id=\"" + divId + "\" ></div>";
                            layer.bindPopup(popupContent);
                            layer.on({
                                //mouseover: aggiornaAVM
                            });
                        }

                    }).addTo(map);
                    var markerJson = JSON.stringify(msg.BusStop.features);
                    pins = markerJson;
                    map.setView(new L.LatLng(latBusStop, longBusStop), 16);
                    $('#loading').hide();
                }
                // timeout:5000
            });
        }
    }
}
}

//FUNZIONE VISUALIZZAZIONE LINEA BUS DA POPUP
function showLinea(numLinea, codRoute, direction, nomeLinea, typeSer, polyline, lid) {
    //$('#loading').show();
    //
    //$(".leaflet-marker-icon.leaflet-zoom-animated.leaflet-clickable").not(".selected").remove();
    //$(".route_ATAF.leaflet-clickable").hide();


    $('#elencolinee')[0].options.selectedIndex = 0;
    $('#elencopercorsi').html('<option value=""> - Select a Route - </option>');
    $('#elencofermate').html('<option value=""> - Select a Bus Stop - </option>');
    //var line = createLinestring(numLinea, codRoute);
    //PROVA DISEGNO PERCORSO
    //line = line.substr(13, line.length - 15);
    if (polyline != null) {
        var line = polyline.substr(11, polyline.length - 12);
    } else {
        var line = createLinestring(codRoute);
        line = line.substr(11, line.length - 12);
        // line = line.substring(11, line.length - 12);
    }
    //alert(line);
    var vet_point = line.split(",");
    var Point_pol = new Array();

    //var className = "route_ATAF_" + codRoute.substr(38);
    var className = "route_" + codRoute.substr(38);
    Point_pol = [];
    for (var j = 0; j < vet_point.length; j++) {
        var point = vet_point[j].trim().split(" ");
        Point_pol[j] = [parseFloat(point[1]), parseFloat(point[0])];
    }

    var drawnLine = L.polyline(Point_pol, { color: "#085EE8", weight: 3, className: className, opacity: 0.9 }).addTo(servicesLayer);
    servicesLayer.addTo(map);
    drawnLine.on('mouseover', function (e) {
        var layer = e.target;
        var mouseX = e.originalEvent.pageX;
        var mouseY = e.originalEvent.pageY;
        layer.bringToFront();
        layer.setStyle({
            color: 'yellow',
            opacity: 0.9,
            weight: 4,
            title: nomeLinea
        });
        var popup = $("<div></div>", {
            id: "popup-" + className,
            css: {
                position: "absolute",
                top: (mouseY + 5) + "px",
                left: (mouseX + 15) + "px",
                zIndex: 1002,
                backgroundColor: "white",
                padding: "1px",
                border: "1px solid #ccc"
            }
        });
        // Insert a headline into that popup
        /*
        var head = $("<div></div>", {
            text: "Linea: " + nomeLinea + " - " + direction,
            css: {fontSize: "13px", marginBottom: "1px"}
        }).appendTo(popup);*/
        var head = $("<div></div>", {
            html: nomeLinea + " - " + direction,
            css: { fontSize: "13px", marginBottom: "1px" }
        }).appendTo(popup);
        popup.appendTo("#map");
    });
    drawnLine.on('mouseout', function (e) {
        var layer = e.target;
        $("#popup-" + className).remove();
        layer.setStyle({
            color: '#085EE8',
            opacity: 0.9,
            weight: 3,
            title: nomeLinea
        });
    });

    if (typeSer != "transverse") {
        map.fitBounds(drawnLine.getBounds());
    }

    var numBusstop = 0;
    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        // value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";
   


    var sample_coord_lat = "";
    var sample_coord_lon = "";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
        sample_coord_lat = '48.3708';
        sample_coord_lon = '10.4589';
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
        center = value.substring(seperator + 1, value.length);
        sample_coord_lat = center.substring(0, center.indexOf(","));
        sample_coord_lon = center.substring(center.indexOf(",") + 1, center.length);
    }

    $.ajax({
        // url: ctx + "/ajax/json/get-bus-stops-of-line.jsp",
        url: selectedorgUrl + ctx + "/tpl/bus-stops/",
        type: "GET",
        async: true,
        headers: {'Authorization':'Bearer '+msm_access_token},
        dataType: 'json',
        data: {
            nomeLinea: numLinea,
            // codRoute: codRoute
            route: codRoute
            // accessToken: msm_access_token
        },
        success: function (msg) {

            if (typeSer != "transverse") {
                $.ajax({
                    // url: ctx + "/ajax/get-weather.jsp",
                    url: selectedorgUrl + ctx + "location/",
                    type: "GET",
                    async: false,
                    headers: {'Authorization':'Bearer '+msm_access_token},
                    //dataType: 'json',
                    data: {
                        position: sample_coord_lat + ';' + sample_coord_lon
                        // accessToken: msm_access_token
                        // nomeComune: "FIRENZE"
                    },
                    success: function (msg) {
                        municipalityUri = msg.municipalityUri;
                        getWeatherInfo(selectedorgUrl + ctx, municipalityUri);
                    }
                });
                selezione = 'Bus Line: ' + nomeLinea + " - " + direction;
                $('#selezione').html(selezione);
                coordinateSelezione = "";
            }

            if (typeSer == "transverse") {
                var f = msg.BusStops.features;
                msg.BusStops.features = [f[0], f[f.length - 1]];
            }
            if (lid != undefined) {
                for (var x in msg.BusStops.features)
                    msg.BusStops.features[x].id = lid + "-" + msg.BusStops.features[x].id;
            }

            busStopsLayer = L.geoJson(msg.BusStops, {
                pointToLayer: function (feature, latlng) {
                    marker = showmarker(feature, latlng);
                    return marker;
                },
                onEachFeature: function (feature, layer) {
                    var popupContent = "";
                    if (feature.properties.tipo == undefined)
                        feature.properties.tipo = 'fermata';
                    var divId = feature.id + "-" + feature.properties.tipo;
                    popupContent = popupContent + "<div id=\"" + divId + "\" ></div>";
                    layer.bindPopup(popupContent);
                    numBusstop++;
                    layer.on({
                    });
                }

            }).addTo(map);
            var markerJson = JSON.stringify(msg.BusStops.features);
            pins = markerJson;
            var confiniMappa = busStopsLayer.getBounds();
            if (typeSer != "transverse") {
                //map.fitBounds(confiniMappa, {padding: [50, 50]}); michela TODO
                //$('#loading').hide();
                var numeroBus = (numBusstop + " -  Bus Line: " + nomeLinea);
                risultatiRicerca(0, numeroBus, 0, 1, direction, 0, 0, 0);
            }

        },
        error: function (request, status, error) {
            $('#loading').hide();
        }

    });
}
}

//Ala
function getWeatherInfo(url, municipalityUri) {

    $.ajax({
        // url: url + "/",
        url: url,
        type: "GET",
        async: true,
        // headers: {'Authorization':'Bearer '+msm_access_token},
        //dataType: 'json',
        data: {
            serviceUri: municipalityUri
            // accessToken: msm_access_token
        },
        success: function (msg) {
            municipality = msg.head.location;
            var infoAggiuntive_div_html = '<div class=\"meteo\" id=\"" + nomeComune + "\"><div id=\"meteo_title\"><span name=\"lbl\" caption=\"weather_mun\">Weather Forecast for Mucipality of </span>: <b>' + municipality + '</b></div>';

            // wPred = bindingSet.getValue("wPred").stringValue(); 

            // String valueOfDescrizione = bindingSet.getValue("descrizione").stringValue();

            for (dayOfWeek = 0; dayOfWeek < msg.results.bindings.length; dayOfWeek++) {
                if (msg.results.bindings[dayOfWeek].day.value == "Lunedi") {
                    valueOfGiorno = "Monday";
                }
                if (msg.results.bindings[dayOfWeek].day.value == "Martedi") {
                    valueOfGiorno = "Tuesday";
                }
                if (msg.results.bindings[dayOfWeek].day.value == "Mercoledi") {
                    valueOfGiorno = "Wednesday";
                }
                if (msg.results.bindings[dayOfWeek].day.value == "Giovedi") {
                    valueOfGiorno = "Thursday";
                }
                if (msg.results.bindings[dayOfWeek].day.value == "Venerdi") {
                    valueOfGiorno = "Friday";
                }
                if (msg.results.bindings[dayOfWeek].day.value == "Sabato") {
                    valueOfGiorno = "Saturday";
                }
                if (msg.results.bindings[dayOfWeek].day.value == "Domenica") {
                    valueOfGiorno = "Sunday";
                }

                var valueOfMinTemp = "";
                if (msg.results.bindings[dayOfWeek].minTemp.value != null) {
                    valueOfMinTemp = msg.results.bindings[dayOfWeek].minTemp.value + "&deg;C";
                }

                valueOfMaxTemp = "";
                if (msg.results.bindings[dayOfWeek].maxTemp.value != null) {
                    valueOfMaxTemp = msg.results.bindings[dayOfWeek].maxTemp.value + "&deg;C";
                }

                infoAggiuntive_div_html += "<div class=\"previsione-giorno\">";
                infoAggiuntive_div_html += "<span class=\"giorno\" id=\"day" + dayOfWeek + "\">" + valueOfGiorno + "</span>";
                infoAggiuntive_div_html += "<br />";

                var nomeImmagine = "";
                if (msg.results.bindings[dayOfWeek].description.value == 'sereno') {
                    nomeImmagine = "sereno.png";
                    valueOfDescrizione = "cloudless";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "poco nuvoloso") {
                    nomeImmagine = "poco-nuvoloso.png";
                    valueOfDescrizione = "bit cloudy";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "velato") {
                    nomeImmagine = "poco-nuvoloso.png";
                    valueOfDescrizione = "bleary";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "pioggia debole e schiarite") {
                    nomeImmagine = "pioggia-sole.png";
                    valueOfDescrizione = "light rain and sunny intervals";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "nuvoloso") {
                    nomeImmagine = "nuvoloso.png";
                    valueOfDescrizione = "cloudy";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "pioggia debole") {
                    nomeImmagine = "pioggia.png";
                    valueOfDescrizione = "light rain";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "coperto") {
                    nomeImmagine = "coperto.png";
                    valueOfDescrizione = "overcast";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "pioggia e schiarite") {
                    nomeImmagine = "pioggia-sole.png";
                    valueOfDescrizione = "rain and sunny intervals";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "pioggia moderata-forte") {
                    nomeImmagine = "temporale.png";
                    valueOfDescrizione = "moderate rain";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "foschia") {
                    nomeImmagine = "foschia.png";
                    valueOfDescrizione = "mist";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "temporale") {
                    nomeImmagine = "temporale.png";
                    valueOfDescrizione = "rainstorm";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "neve debole e schiarite") {
                    nomeImmagine = "neve-sole.png";
                    valueOfDescrizione = "light snow and sunny intervals";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "temporale e schiarite") {
                    nomeImmagine = "temporale-schiarite.png";
                    valueOfDescrizione = "rainstorm and sunny intervals";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "neve moderata-forte") {
                    nomeImmagine = "neve.png";
                    valueOfDescrizione = "moderate snow";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "neve e schiarite") {
                    nomeImmagine = "neve-sole.png";
                    valueOfDescrizione = "snow and sunny intervals";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "neve debole") {
                    nomeImmagine = "pioggia-neve.png";
                    valueOfDescrizione = "light snow";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "pioggia neve") {
                    nomeImmagine = "pioggia-neve.png";
                    valueOfDescrizione = "light rain";
                }
                else if (msg.results.bindings[dayOfWeek].description.value == "nebbia") {
                    nomeImmagine = "fog.png";
                    valueOfDescrizione = "fog";
                }

                infoAggiuntive_div_html += "<img class=\"immagine-meteo\" src=\"img/" + nomeImmagine + "\" width=\"48\" />";
                infoAggiuntive_div_html += "<br />";
                infoAggiuntive_div_html += "<span class=\"descrizione-meteo\" id=\"desc" + i + "\">" + valueOfDescrizione + "</span>";
                infoAggiuntive_div_html += "<br />";
                infoAggiuntive_div_html += "<span class=\"temperature\"><span class=\"min\">" + valueOfMinTemp + "</span> / <span class=\"max\">" + valueOfMaxTemp + "</span></span>";
                infoAggiuntive_div_html += "</div>";

            }

            var href_opengraph = "http://log.disit.org/service/?sparql=http://servicemap.disit.org/WebAppGrafo/sparql&uri=" + municipalityUri;
            var date = new Date();

            infoAggiuntive_div_html += "<div class=\"clearer\"></div>";
            infoAggiuntive_div_html += "<div class=\"aggiornamento\"><span name=\"lbl\" caption=\"last_update\">Latest Update</span>: " + toISOLocal(date) + "</div>";
            infoAggiuntive_div_html +="<div>";
            infoAggiuntive_div_html += "<div style=\"float: left;\"><a href='" + href_opengraph + "' title='Linked Open Graph' target='_blank'>" + municipalityUri + "</a></div>";
            divSavePin = "savePin-weather-" + municipality;
            // infoAggiuntive_div_html += "<div id=\"" + divSavePin + "\" class=\"savePin\" onclick=save_handler('weather','" + municipalityUri + "','meteo" + municipality + "')></div>";

            
            infoAggiuntive_div_html +="<div style=\"float: right;\">";
            infoAggiuntive_div_html+="<input id=\"" + divSavePin + "\" class='save_disk' type=\"image\" src=\"img/save_enable.png\" alt=\"Salva la query\" width=\"28\" style=\"cursor: pointer;\" onclick=save_handler('weather','" + municipalityUri + "','meteo" + municipality + "') >";
            infoAggiuntive_div_html +="</div>";
            infoAggiuntive_div_html +="</div>";
            infoAggiuntive_div_html += "</div>";

            $('#info-aggiuntive .content').html(infoAggiuntive_div_html);
        },
        error: function (request, status, error) {

        }
    });
}

function toISOLocal(d) {
    var z = n => ('0' + n).slice(-2);
    var zz = n => ('00' + n).slice(-3);
    var off = d.getTimezoneOffset();
    var sign = off > 0 ? '-' : '+';
    off = Math.abs(off);

    return d.getFullYear() + '-'
        + z(d.getMonth() + 1) + '-' +
        z(d.getDate()) + 'T' +
        z(d.getHours()) + ':' +
        z(d.getMinutes()) + ':' +
        z(d.getSeconds()) + '.' +
        zz(d.getMilliseconds()) +
        sign + z(off / 60 | 0) + ':' + z(off % 60);
}

function showRoute(agency, numLinea, busStop, divRoute) {

    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        // value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
    }


    $.ajax({
        // url: ctx + "/ajax/json/get-bus-route.jsp",
        url: selectedorgUrl + ctx + "/tpl/bus-routes/",
        type: "GET",
        async: true,
        headers: {'Authorization':'Bearer '+msm_access_token},
        dataType: 'json',
        data: {
            agency: agency,
            line: numLinea,
            busStopName: busStop
            // accessToken: msm_access_token
        },
        success: function (msg) {
            var htmloutput = "";
            if (msg.BusRoutes.length) {

                htmloutput += "<div class='Route'><b>Paths:</b>";
                if (msg.BusRoutes.length > 3)
                    htmloutput += "<div style=\"overflow-y: scroll; max-height: 100px; border=1px; 	border-style: solid; border-width: 1px;\" >";
                else
                    htmloutput += "<div>";
                htmloutput += "<table ><tr><td><b>Line</b></td><td><b>Route</b></td></tr>";

                for (i = 0; i < msg.BusRoutes.length; i++) {

                    var line = msg.BusRoutes[i].line;
                    var first_stop = msg.BusRoutes[i].firstBusStop;
                    var last_stop = msg.BusRoutes[i].lastBusStop;
                    htmloutput += "<tr><td>" + line + "</td><td class='percorso' onclick='showLinea(\"\",\"" + msg.BusRoutes[i].route + "\",\"" + first_stop + "&#10132;" + last_stop + "\",\"\" )'>" + first_stop + "&#10132;" + last_stop + "</td></tr>";
                }
                htmloutput += "</table></div></div>";
            }
            else
                htmloutput += "No available routes";

            $('#' + divRoute).html(htmloutput);

            popup_fixpos(divRoute);
            //$('#info-aggiuntive .content').html(msg);
        }
    });
}
}

//FUNZIONE VISUALIZAZIONE PATH
function Estract_features(Str_location, id, serType) {
    //Determinazione tipologia area
    var n = Str_location.search(/POLYGON/i);
    if ($('#' + id).attr('visible') == 'false' || id == null) {
        $('#' + id).attr('visible', 'true');
        if ($('#lang').attr('value') == 'ENG') {
            $('#' + id + ' span').text("Remove from map");
        } else {
            $('#' + id + ' span').text("Rimuovi dalla mappa");
        }
        if (n != -1) {
            //var descr_area="Area:  ";
            Str_location = Str_location.substr(11, Str_location.length - 14);
            var Vet_str = Str_location.split(")), (("); //verifichiamo se sono singole aree o aree separate
            var Point_pol = new Array();
            for (var i = 0; i < Vet_str.length; i++) {
                //vengono visualizzate le singole aree
                var vet_point = Vet_str[i].split(",");
                Point_pol = [];
                for (var j = 0; j < vet_point.length; j++) {
                    var point = vet_point[j].trim().split(" ");
                    Point_pol[j] = [parseFloat(point[1]), parseFloat(point[0])];
                }
                if (JSON.stringify(serType).indexOf('Controlled_parking_zone') != -1)
                    var polygon3 = L.polygon(Point_pol, { color: '#FF00FF', weight: 2, className: id, opacity: 0.6, fillOpacity: 0.2 }).addTo(servicesLayer);
                else {
                    var polygon3 = L.polygon(Point_pol, { color: 'green', weight: 3, className: id, opacity: 0.9, fillOpacity: 0.7 }).addTo(servicesLayer);
                }
                servicesLayer.addTo(map);
                map.fitBounds(polygon3.getBounds());
                /*if(desc!=""){
                 polygon3.bindPopup(descr_area +   desc);
                 }*/
            }
        } else {
            n = Str_location.search(/LINESTRING/i);
            if (n != -1) {
                Str_location = Str_location.substr(13, Str_location.length - 15);
                var vet_point = Str_location.split(",");
                var numberMarker;
                var Point_pol = new Array();
                Point_pol = [];
                for (var j = 0; j < vet_point.length; j++) {
                    var point = vet_point[j].trim().split(" ");
                    Point_pol[j] = [parseFloat(point[1]), parseFloat(point[0])];
                    if (((JSON.stringify(serType).indexOf('Tourist_trail') != -1) && (j != 0) && (j != (vet_point.length - 1)))) {
                        numberMarker = L.marker([parseFloat(point[1]), parseFloat(point[0])], {
                            icon: new L.DivIcon({
                                className: "number-icon",
                                iconSize: [20, 20],
                                html: j
                            })
                        });
                        numberMarker.addTo(map);
                        $(numberMarker._icon).addClass(id);
                    }
                }
                var Line = L.polyline(Point_pol, { color: "#BD021E", weight: 5, className: id, opacity: 0.9 }).addTo(servicesLayer);
                servicesLayer.addTo(map);
                map.fitBounds(Line.getBounds());
                var last_point = vet_point[(vet_point.length - 1)].split(" ");
                if (JSON.stringify(serType).indexOf('Tramline') != -1) {

                    $.ajax({
                        url: ctx + "/ajax/json/get-services.jsp",
                        type: "GET",
                        async: true,
                        dataType: 'json',
                        data: {
                            categorie: 'tram_stops',
                            raggioServizi: 5,
                            centroRicerca: '43.76247809670398;11.206483840942383',
                            numeroRisultatiServizi: 30
                        },
                        success: function (msg) {
                            if (mode == "JSON") {
                                $("#body").html(JSON.stringify(msg));
                            }
                            else {
                                if (msg.features.length > 0) {
                                    busStopsLayer = L.geoJson(msg, {
                                        pointToLayer: function (feature, latlng) {
                                            var marker = showmarker(feature, latlng);
                                            return marker;
                                        },
                                        onEachFeature: function (feature, layer) {
                                            var contenutoPopup = "";
                                            if (feature.properties.tipo == undefined)
                                                feature.properties.tipo = 'fermata';
                                            var divId = feature.id + "-" + feature.properties.tipo;
                                            contenutoPopup = contenutoPopup + "<div id=\"" + divId + "\" ></div>";
                                            layer.bindPopup(contenutoPopup);
                                        }
                                    });

                                    busStopsLayer.addTo(map);
                                }
                            }
                        }

                    });
                }


                //Disegno il marker finish

                var finishIcon = L.icon({
                    iconUrl: ctx + 'img/mapicons/finish.png',
                    iconRetinaUrl: ctx + 'img/mapicons/finish.png',
                    iconSize: [26, 29],
                    iconAnchor: [13, 29]
                });
                var finishMarker = L.marker([parseFloat(last_point[1]), parseFloat(last_point[0])]);
                finishMarker.setIcon(finishIcon);
                finishMarker.addTo(map);
                $(finishMarker._icon).addClass("finish" + id);
                /*if(desc!=""){
                 Line.bindPopup(descr_linea + ": "+ desc);
                 }*/

            }
        }
    } else {

        $('#' + id).attr('visible', 'false');
        if ($('#lang').attr('value') == 'ENG') {
            $('#' + id + ' span').text("Show on map");
        } else {
            $('#' + id + ' span').text("Visualizza sulla mappa");
        }
        //rimuove il percorso o l'area dalla mappa
        $("." + id + ".leaflet-clickable").remove();
        // rimuove le fermate del tram se presenti
        if (JSON.stringify(serType).indexOf('tramline') != -1) {
            busStopsLayer.clearLayers();
        }
        // rimuove il finishmarker dalla mappa
        $('.leaflet-marker-icon.leaflet-zoom-animated.leaflet-clickable.finish' + id).remove();
    }

}

function createLinestring(route) {
    var linestring;

    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        // value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
    }

    $.ajax({
        data: {
            route: route
            // accessToken: msm_access_token
        },
        // url: ctx + "/ajax/json/get-xml-route.jsp",
        url: selectedorgUrl + ctx + "/tpl/bus-stops/",
        type: "GET",
        async: false,
        headers: {'Authorization':'Bearer '+msm_access_token},
        dataType: 'json',
        success: function (data) {
            if (data.Route.wktGeometry.length > 0) {
                linestring = data.Route.wktGeometry;
            }
        }
    });
    return linestring;
}
}

//FUNZIONE CHE CARICA NEL POPUP LE INFORMAZIONI DELLA SCHEDA DI UN SERVIZIO
function loadServiceInfo(uri, div, id, coord) {

    var value = document.getElementById("org_selector").value;
    if (value == "null") {
        // value = superServiceMapApiUrl;
        document.getElementById("org_selector").style.backgroundColor = "red";
        alert('Please, select an organization!');
    } else {
        document.getElementById("org_selector").style.backgroundColor = "white";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
    }
    if (uri.indexOf("Event") != -1) {
        //skip events
    } else {
        if (uri.indexOf("busCode") == -1) {
            $("#" + div).html("Loading... <img src=\"" + ctx + "img/ajax-loader.gif\" width=\"16\" />");
            $.ajax({
                data: {
                    serviceUri: uri
                    // accessToken: msm_access_token
                },
                url: selectedorgUrl,
                headers: {'Authorization':'Bearer '+msm_access_token},
                type: "GET",
                async: true,
                dataType: 'json',
                success: function (data) {
                    if ("Service" in data) {
                        var realtime = data.realtime;
                        data = data.Service;
                    } else if ("Sensor" in data) {
                        var realtime = data.realtime;
                        data = data.Sensor;
                    }

                    var tipo;

                    if (data.BusStop !== undefined) {
                        data.features = data.BusStop.features;
                        tipo = 'fermata';
                    } else {

                        tipo = data.features[0].properties.tipo;
                        if (tipo == undefined)
                            tipo = data.features[0].properties.typeLabel;
                    }

                    if (data.features.length > 0) {

                        //selezione = 'Servizio: ' + data.features[0].properties.nome;
                        if (tipo == 'fermata') {
                            selezione = 'Bus Stop: ' + data.features[0].properties.name;
                        } else {
                            selezione = 'Service: ' + data.features[0].properties.name;
                        }
                        $('#selezione').html(selezione);
                        var divInfo = div + "-info";
                        var divTimetable = div + "-timetable";
                        var contenutoPopup = createContenutoPopup(data.features[0], div, id);
                        $("#" + div).html(contenutoPopup);
                        if (data.features[0].multimedia != null)
                            $(".leaflet-popup-content-wrapper").css("width", "300px");
                        popup_fixpos(div);
                        var name = data.features[0].properties.name;
                        var serviceUri = data.features[0].properties.serviceUri;
                        if (tipo == 'Parcheggio_auto' || tipo == "Parcheggio_Coperto" || tipo == "Parcheggi_all'aperto" || tipo == "Car_park@en") {
                            mostraParcheggioAJAX(name, divInfo);
                        } else if (tipo == 'sensore') {
                            mostraSensoreAJAX(name, divInfo);
                        } else if (tipo == 'fermata') {
                            var divLinee = div + "-linee";
                            var divRoute = div + "-route";
                            //mostraAVMAJAX(name, divInfo);
                            mostraLineeBusAJAX(serviceUri, divLinee, divRoute);
                            mostraOrariAJAX(serviceUri, divTimetable);
                        } else if (realtime != undefined) {
                            mostraRealTimeData(divInfo, realtime, uri);
                            popup_fixpos(div);
                        }
                    } else {
                        contenutoPopup = "No info related to Service" + uri;
                        $("#" + div).html(contenutoPopup);
                        popup_fixpos(div);
                    }
                },
                error: function (data) {

                    console.log(data);
                    $("#" + div).html("Error");
                    popup_fixpos(div);
                }
            });
        }
        else {
            var latitude = coord[1];
            var longitude = coord[0];
            var numeroBus = uri.replace("busCode", "");
            selezione = 'Bus Number: ' + numeroBus;
            $('#selezione').html(selezione);
            $.ajax({
                url: ctx + "/ajax/get-address.jsp",
                type: "GET",
                async: true,
                //dataType: 'json',
                data: {
                    lat: latitude,
                    lng: longitude
                },
                success: function (msg) {
                    $('#approximativeAddress').html(msg);
                    ricercaInCorso = false;
                },
                error: function (e) {
                    console.log(e);
                    $('#approximativeAddress').html("Address: ERROR");
                    ricercaInCorso = false;
                }
            });
        }
    }
}
}
function createContenutoPopup(feature, div, id) {

    var contenutoPopup = "";
    var divMM = id + "-multimedia";
    var multimediaResource = feature.properties.multimedia;
    var htmlDiv;
    var multimedia = "";
    if (multimediaResource != null) {
        var format = multimediaResource.substring(multimediaResource.length - 4);
        if (format == ".mp3") {
            htmlDiv = "<div id=\"" + divMM + "\"class=\"multimedia\"><audio controls class=\"audio-controls\"><source src=\"" + multimediaResource + "\" type=\"audio/mpeg\"></audio></div>";
        } else {
            if ((format == ".wav") || (format == ".ogg")) {
                htmlDiv = "<div id=\"" + divMM + "\"class=\"multimedia\"><audio controls class=\"audio-controls\"><source src=\"" + multimediaResource + "\" type=\"audio/" + format + "\"></audio></div>";
            } else if (format == ".pdf") {
                htmlDiv = "<div id=\"" + divMM + "\"class=\"multimedia\"><a target=\"blank\" href=\"" + multimediaResource + "\"><img src=\"" + ctx + "img/mapicons/pdf-icon.png\" width=\"80\" height=\"80\"></a></div>";
            } else {
                //htmlDiv = "<div id=\"" + divMM + "\"class=\"multimedia\"><img src=\"" + multimediaResource + "\" width=\"80\" height=\"80\"></div>";
                multimedia = multimediaResource;
            }
        }
    }
    //CODICE PHOTO GALLERY
    var divPhotos = id + "-photo";
    var htmlPhotos;
    if (feature.properties.photos != null || multimedia != null) {
        var photos = [];
        if (feature.properties.photos.length < 4) {
            htmlPhotos = "<div id=\"" + divPhotos + "\">";
        } else {
            htmlPhotos = "<div id=\"" + divPhotos + "\" style=\"max-width:250px; overflow-x: scroll;\">";
        }
        if (feature.properties.photos != null) {
            for (var k = 0; k < feature.properties.photos.length; k++) {
                //photos[k] = feature.properties.photos[k].replace("localhost:8080/ServiceMap", "servicemap.disit.org/WebAppGrafo"); 
                photos[k] = feature.properties.photos[k].replace("localhost:8080/ServiceMap", "disit.org/ServiceMap");
                htmlPhotos = htmlPhotos + "<a class=\"" + divPhotos + "\" rel=\"group\" href=\"" + photos[k] + "\"><img class=\"img_photo\" src=\"" + photos[k] + "\" width=\"80\" height=\"80\" style=\"margin-left:2px\"/></a>";
            }
        }
        if (multimedia != "") {
            // http://servicemap.km4city.org/WebAppGrafo/api/v1/imgcache?size=thumb&imageUrl=http://www.florenceheritage.it/mobileApp/immagini/aebOltrarno/90.jpg
            var cache_multimedia = "http://servicemap.km4city.org/WebAppGrafo/api/v1/imgcache?size=thumb&imageUrl=" + multimedia;
            htmlPhotos = htmlPhotos + "<a class=\"" + divPhotos + "\" rel=\"group\" href=\"" + cache_multimedia + "\"><img class=\"img_photo\" src=\"" + cache_multimedia + "\" width=\"80\" height=\"80\" style=\"margin-left:2px\"/></a>";
        }
        htmlPhotos = htmlPhotos + "</div>";
    }

    $(document).ready(function () {
        document.getElementById('content').style.display ='block';
        $("." + divPhotos).fancybox({
            openEffect: 'none',
            closeEffect: 'none'
        });
        var show_number_of_thumbnails = 10;
        $("." + divPhotos + ':gt(' + (show_number_of_thumbnails - 1) + ')').hide();
    });

    var divInfo = div + "-info";
    var divInfoPlus = div + "-infoplus";
    var linkDBpedia = "";
    if (feature.properties.typeLabel != "BusStop") {
        // if (feature.properties.tipo != "fermata" && typeof(feature.properties.tipo) != 'undefined') {
        if (feature.properties.tipo != "Road") {
            contenutoPopup = "<div class=\"description\"><h3>" + feature.properties.name + "</h3></div>";
        }
        var name = feature.properties.serviceUri.substring("http://www.disit.org/km4city/resource/".length);
        var logEndPoint = "http://log.disit.org/service/?sparql=http://servicemap.disit.org/WebAppGrafo/sparql&uri=";
        contenutoPopup += "<b>Serviceuri:</b> <a href='" + logEndPoint + feature.properties.serviceUri + "' title='Linked Open Graph' target='_blank'>" + feature.properties.serviceUri + "</a><br />";
        contenutoPopup += "<b><span name=\"lbl\" caption=\"name\">Name</span>:</b> " + name + "<br />";
        var tipologia = feature.properties.tipologia;
        var serviceType = feature.properties.serviceType;
        if (tipologia === undefined)
            tipologia = serviceType.replace("_", " - ");
        var nature = serviceType.substr(0, serviceType.indexOf('_'));
        var subnature = serviceType.substr(serviceType.indexOf('_') + 1);
        //contenutoPopup = contenutoPopup + "<b><span name=\"lbl\" caption=\"tipology\">Tipology</span>:</b> " + tipologia + "<br />";
        contenutoPopup += "<b><span name=\"lbl\" caption=\"nature\">Nature</span>:</b> " + nature + "<br />";
        contenutoPopup += "<b><span name=\"lbl\" caption=\"subnature\">Subnature</span>:</b> " + subnature + "<br />";
        if (feature.properties.digitalLocation != "" && feature.properties.digitalLocation)
            contenutoPopup = contenutoPopup + "<span style='border:1px solid #E87530; padding:2px;'><b>Digital Location</b></span><br />";
        if (feature.properties.email != "" && feature.properties.email)
            contenutoPopup = contenutoPopup + "<b>Email:</b><a href=\"mailto:" + feature.properties.email + "?Subject=information request\" target=\"_top\"> " + feature.properties.email + "</a><br />";
        if (feature.properties.website != "" && feature.properties.website)
            if (((JSON.stringify(feature.properties.website)).indexOf("http\://")) != -1) {
                contenutoPopup = contenutoPopup + "<b>Website:</b><a href=\"" + feature.properties.website + "\" target=\"_blank\" title=\"" + feature.properties.name + " - website\"> " + feature.properties.website + "</a><br />";
            } else {
                contenutoPopup = contenutoPopup + "<b>Website:</b><a href=\"http\://" + feature.properties.website + "\" target=\"_blank\" title=\"" + feature.properties.name + " - website\"> " + feature.properties.website + "</a><br />";
            }
        if (feature.properties.phone != "" && feature.properties.phone)
            contenutoPopup = contenutoPopup + "<b><span name=\"lbl\" caption=\"phone\">Phone</span>:</b> " + feature.properties.phone + "<br />";
        if (feature.properties.fax != "" && feature.properties.fax)
            contenutoPopup = contenutoPopup + "<b>Fax:</b> " + feature.properties.fax + "<br />";
        if (feature.properties.address != "" && feature.properties.address)
            contenutoPopup = contenutoPopup + "<b><span name=\"lbl\" caption=\"address\">Address:</span></b> " + feature.properties.address;
        if (feature.properties.civic != "" && feature.properties.civic)
            contenutoPopup = contenutoPopup + ", " + feature.properties.civic + "<br />";
        else
            contenutoPopup = contenutoPopup + "<br />";
        if (feature.properties.linkDBpedia != "" && feature.properties.linkDBpedia) {
            for (var i = 0; i < feature.properties.linkDBpedia.length; i++) {
                linkDBpedia = (JSON.stringify(feature.properties.linkDBpedia[i])).replace("http://it.dbpedia.org/resource/", "");
                contenutoPopup = contenutoPopup + "<b>DBpedia:</b> " + "<a href='" + feature.properties.linkDBpedia[i] + "' title='Linked DBpedia' target='_blank'>" + linkDBpedia + "</a><br />";
            }
        }
        if (feature.properties.cap != "" && feature.properties.cap)
            contenutoPopup = contenutoPopup + "<b>Cap:</b> " + feature.properties.cap + "<br />";
        if (feature.properties.city != "" && feature.properties.city)
            contenutoPopup = contenutoPopup + "<b><span name=\"lbl\" caption=\"city\">City</span>:</b> " + feature.properties.city + "<br />";
        if (feature.properties.province != "" && feature.properties.province)
            contenutoPopup = contenutoPopup + "<b>Prov.:</b> " + feature.properties.province + "<br />";
        if (feature.properties.multimedia != "" && feature.properties.multimedia && multimedia == "") {
            contenutoPopup = contenutoPopup + "<b><span name=\"lbl\" caption=\"multimedia\">Multimedia Content</span>:</b></br>" + htmlDiv;
        }

        if (feature.properties.startDate != "" && feature.properties.startDate)
            contenutoPopup = contenutoPopup + "<b>Da: </b>" + feature.properties.startDate + "<br />";
        if (feature.properties.endDate != "" && feature.properties.endDate)
            contenutoPopup = contenutoPopup + "<b>A: </b>" + feature.properties.endDate + "<br />";

        if ((feature.properties.photos != "" && feature.properties.photos) || multimedia != "") {
            contenutoPopup = contenutoPopup + "<b><span name=\"lbl\" caption=\"photos\">Photos</span>:</b></br>" + htmlPhotos;

        }
        if (feature.properties.description != "" && feature.properties.description) {
            if (include(feature.properties.description, "@it"))
                feature.properties.description = feature.properties.description.replace("@it", "");
            contenutoPopup = contenutoPopup + "<div class=\"description\"><b><span name=\"lbl\" caption=\"description\">Description:</b> " + feature.properties.description + "</div><br />";
        }
        if (feature.properties.note != "" && feature.properties.note)
            contenutoPopup = contenutoPopup + "<b><div class=\"description\">Note:</b> " + feature.properties.note + "</div><br />";
        if (feature.properties.cordList != "" && feature.properties.cordList) {
            if ($("." + divInfoPlus + ".leaflet-clickable").html() == null) {
                contenutoPopup = contenutoPopup + "<div class='pulsante' id=\"" + divInfoPlus + "\" visible='false' onclick='Estract_features(\"" + feature.properties.cordList + "\",\"" + divInfoPlus + "\",\"" + feature.properties.serviceType + "\")'><b><span name=\"lbl\" caption=\"show_on_map\">Show on map</span></b></div><br />";
            } else {
                contenutoPopup = contenutoPopup + "<div class='pulsante' id=\"" + divInfoPlus + "\" visible='true' onclick='Estract_features(\"" + feature.properties.cordList + "\",\"" + divInfoPlus + "\",\"" + feature.properties.serviceType + "\")'><b><span name=\"lbl\" caption=\"remove_from_map\">Remove from map</span></b></div><br />";
            }
        }
        contenutoPopup = contenutoPopup + "<div id=\"" + divInfo + "\" ></div>";
        var name = feature.properties.name;
        nameEscaped = escape(name);
        var divSavePin = "savePin-" + id;
        contenutoPopup = contenutoPopup + "<div id=\"" + divSavePin + "\" class=\"savePin\" onclick=save_handler('" + feature.properties.tipo + "','" + feature.properties.serviceUri + "','" + nameEscaped + "')></div>";
        //layer.addTo(map).bindPopup(contenutoPopup).openPopup();
        // CREAZIONE DIV INFO LINKED SERVICE
        if (feature.properties.linkserUri != "" && feature.properties.linkserUri && (JSON.stringify(id).indexOf('LS') == -1)) {
            var divLS = div + "-LinkedService";
            var idLS = id + "-LS";
            contenutoPopup = contenutoPopup + "<div class='link-serv-container'><b>LinkedService:</b><span>" + feature.properties.linkedService + "</span><span class='toggle-linked-service' id='toggle-" + divLS + "' title='Mostra servizio collegato' onclick=openLinkServInfo('" + feature.properties.linkserUri + "','" + divLS + "','" + idLS + "')>+</span><br/><div id=\"" + divLS + "\"></div></div>";
        }
    } else {
        var logEndPoint = "http://log.disit.org/service/?sparql=http://servicemap.disit.org/WebAppGrafo/sparql&uri=";
        var divLinee = div + "-linee";
        var divRoute = div + "-route";
        var divTimetable = div + "-timetable";
        var contenutoPopup = "<h3>TPL STOP : " + feature.properties.name + "</h3>";
        contenutoPopup += "<h2>" + feature.properties.agency + "</h2>";
        contenutoPopup = contenutoPopup + "<b>Serviceuri:</b> <a href='" + logEndPoint + feature.properties.serviceUri + "' title='Linked Open Graph' target='_blank'>" + feature.properties.serviceUri + " GRAPH</a><br />";
        contenutoPopup = contenutoPopup + "<div id=\"" + divLinee + "\" ></div>";
        contenutoPopup = contenutoPopup + "<div id=\"" + divRoute + "\" ></div>";
        contenutoPopup = contenutoPopup + "<div id=\"" + divTimetable + "\" ></div>";
        contenutoPopup = contenutoPopup + "<div id=\"" + divInfo + "\" ></div>";
        var divSavePin = "savePin-" + id;
        var name = feature.properties.name;
        nameEscaped = escape(name);
        contenutoPopup = contenutoPopup + "<div id=\"" + divSavePin + "\" class=\"savePin\" onclick=save_handler('" + feature.properties.tipo + "','" + feature.properties.serviceUri + "','" + nameEscaped + "')></div>";
    }
    return contenutoPopup;
}

$(document).ready(function () {
    
    //FUNZIONE PER MOSTRARE/NASCONDERE I MENU
    $(".header").click(function () {
        $header = $(this);
        //getting the next element
        $content = $header.next();
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $content.slideToggle(200, function () {
            //execute this after slideToggle is done
            //change text of header based on visibility of content div
            //$header.text(function () {
            if ($("#lang").val() == 'ENG') {
                $header.html(function () {
                    //change text based on condition
                    //return $content.is(":visible") ? "- Hide Menu" : "+ Show Menu";
                    return $content.is(":visible") ? '<span name="lbl" caption="Hide_Menu_sx"> - Hide Menu</span>' : '<span name="lbl" caption="Show_Menu_sx"> + Show Menu</span>';
                });
            }
            else {
                $header.html(function () {
                    //change text based on condition
                    //return $content.is(":visible") ? "- Hide Menu" : "+ Show Menu";
                    return $content.is(":visible") ? '<span name="lbl" caption="Hide_Menu_sx"> - Nascondi Menu</span>' : '<span name="lbl" caption="Show_Menu_sx"> + Apri Menu</span>';
                });
            }
        });
    });
    $(".header-container").click(function () {
        $header = $(this);
        //getting the next element
        $content = $header.next();
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $content.slideToggle(200, function () {
            //execute this after slideToggle is done
            //change text of header based on visibility of content div
            //$header.text(function () {
            if ($("#lang").val() == 'ENG') {
                $header.html(function () {
                    //change text based on condition
                    //return $content.is(":visible") ? "- Hide Menu" : "+ Show Menu";
                    return $content.is(":visible") ? '<div class="header"><span name="lbl" caption="Hide_Menu_sx"> - Hide Menu</span></div>' :
                        '<div class="header"><span name="lbl" caption="Show_Menu_sx"> + Show Menu</span></div>';
                });
            }
            else {
                $header.html(function () {
                    //change text based on condition
                    //return $content.is(":visible") ? "- Hide Menu" : "+ Show Menu";
                    return $content.is(":visible") ? '<div class="header"><span name="lbl" caption="Hide_Menu_sx"> - Nascondi Menu</span></div>' :
                        '<div class="header"><span name="lbl" caption="Show_Menu_sx"> + Apri Menu</span></div>';
                });
            }
        });
    });

    //   //FUNZIONE PER MOSTRARE/NASCONDERE LE SUB CATEGORY
    $(".toggle-subcategory").click(function () {

        $tsc = $(this);
        //getting the next element
        $content = $tsc.next();
        if (!$content.is(":visible")) {
            $('.subcategory-content').hide();
            $('.toggle-subcategory').html('+');
        }
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $content.slideToggle(200, function () {
            //execute this after slideToggle is done
            //change text of header based on visibility of content div
            $tsc.text(function () {
                //change text based on condition
                return $content.is(":visible") ? "-" : "+";
            });
        });
    });


    //FUNZIONE PER MOSTRARE/NASCONDERE LE SUB CATEGORY
    $(".toggle-transversal-subcategory").click(function () {
        $tsc = $(this);
        //getting the next element
        $content = $tsc.next();
        if (!$content.is(":visible")) {
            $('.subcategory-transversal-content').hide();
            $('.toggle-transversal-subcategory').html('+');
        }
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $content.slideToggle(200, function () {
            //execute this after slideToggle is done
            //change text of header based on visibility of content div
            $tsc.text(function () {
                //change text based on condition
                return $content.is(":visible") ? "-" : "+";
            });
        });
    });

    //CHECKBOX SELECT/DESELECT ALL
    $('#macro-select-all').change(function () {
        if ($('#macro-select-all').prop('checked')) {
            $('#categorie .macrocategory').prop('checked', 'checked');
            $("#categorie .macrocategory").trigger("change");
        }
        else {
            $('#categorie .macrocategory').prop('checked', false);
            $("#categorie .macrocategory").trigger("change");
        }
    });
    //CHECKBOX SELECT/DESELECT ALL TRANSVERSAL
    $('#macro-select-all_t').change(function () {
        if ($('#macro-select-all_t').prop('checked')) {
            $('#categorie_t .macrocategory').not('#PublicTransportLine').prop('checked', 'checked');
            $("#categorie_t .macrocategory").not('#PublicTransportLine').trigger("change");
            if (!($('#PublicTransportLine').prop('disabled'))) {
                $('#PublicTransportLine').prop('checked', 'checked');
                $('#PublicTransportLine').trigger("change");
            }
        }
        else {
            $('#categorie_t .macrocategory').prop('checked', false);
            $("#categorie_t .macrocategory").trigger("change");
        }
    });
    // DESELEZIONE SELECT_ALL REGULAR
    $('#categorie .macrocategory').change(function () {
        if (($('#categorie .macrocategory:checked').length) == 0) {
            $('#macro-select-all').prop('checked', false);
        }
    });
    // DESELEZIONE SELECT_ALL TRANSVERSAL
    $('#categorie_t .macrocategory').change(function () {
        if (($('#categorie_t .macrocategory:checked').length) == 0) {
            $('#macro-select-all_t').prop('checked', false);
        }
    });


    //   // SELEZIONA/DESELEZIONA TUTTE LE CATEGORIE - SOTTOCATEGORIE
    //   $('.macrocategory').change(function () {
    //       $cat = $(this).next().next().attr('class');
    //       $cat = $cat.replace(" macrocategory-label", "");

    //       if ($(this).prop('checked')) {
    //           $('.sub_' + $cat).prop('checked', 'checked');
    //       }
    //       else {
    //           $('.sub_' + $cat).prop('checked', false);
    //       }
    //   });
    // //   // SELEZIONE/DESELEZIONE MACROCATEGORIA DA SOTTOCATEGORIA
    //   $('.subcategory').change(function () {
    //       $subcat = $(this).next().next().attr('class');
    //       $cat = $subcat.replace(" subcategory-label", "");
    //       if ($(this).prop('checked')) {
    //           $('.' + $cat + '.macrocategory-label').prev().prev().prop('checked', 'checked');
    //       }
    //       else {
    //           if (($('input.sub_' + $cat + '.subcategory:checked').length) == 0) {
    //               $('.' + $cat + '.macrocategory-label').prev().prev().prop('checked', false);
    //           }

    //       }
    //   });
    document.getElementById('content').style.display ='block';
});

//FUNZIONE PER MOSTRARE/NASCONDERE LS SCHEDA DEL LINKED SERVICE
function openLinkServInfo(uri, divID, id) {
    var content = $("#" + divID).html();
    if (($("#" + divID).html()) == '') {
        loadServiceInfo(uri, divID, id);
        $("#toggle-" + divID).html('-');
    } else {
        if (($("#toggle-" + divID).html()) == '-') {
            $("#" + divID).hide();
            $("#toggle-" + divID).html('+');
            popup_fixpos(divID);
        } else {
            $("#" + divID).show();
            $("#toggle-" + divID).html('-');
            popup_fixpos(divID);
        }
    }
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

// RESET DI TUTTI I LAYERS SULLA MAPPA
function svuotaLayers() {
    //clickLayer.clearLayers();
    busStopsLayer.clearLayers();
    servicesLayer.clearLayers();
    eventLayer.clearLayers();
    GPSLayer.clearLayers();
    oms.clearMarkers();

    if ($("div.leaflet-marker-pane").html() != null) {
        $("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-clickable").hide();
        $("div.leaflet-marker-icon.leaflet-zoom-animated.leaflet-clickable").hide();
    }
    if ($("div.leaflet-popup-pane").html() != null) {
        $("div.leaflet-popup.leaflet-zoom-animated").hide();
    }
    $(".circle.leaflet-clickable").remove();
    $("#eventList").html('');
    $("#event").hide();
    $("#listTPL").html('');
    $("#resultTPL").hide();
    $(':radio').prop('checked', false);
}

// CANCELLAZIONE DEL CONTENUTO DEL BOX INFO AGGIUNTIVE
function svuotaInfoAggiuntive() {
    $('#info-aggiuntive .content').html('');
}

function cancellaSelezione() {
    $('#selezione').html('No selection');
    selezione = null;
    coordinateSelezione = null;
}

// FUNZIONE DI RESET GENERALE
function resetTotale() {
    /*  if(markerArray.lenght>0)
     markerArray=[]; */
    if (pins.lenth > 0)
        pins = "";
    svuotaInfoAggiuntive();
    svuotaLayers();
    cancellaSelezione();
    nascondiRisultati();
    $('#macro-select-all').prop('checked', false);
    $('#macro-select-all_t').prop('checked', false);
    $('.macrocategory').prop('checked', false);
    $(".macrocategory").trigger("change");
    //$('#raggioricercaServizi')[0].options.selectedIndex = 0;
    //$('#raggioricercaServizi').prop('disabled', false);
    //$('#raggioricercaSensori')[0].options.selectedIndex = 0;
    //$('#raggioricercaSensori').prop('disabled', false);
    //$('#raggioricercaBus')[0].options.selectedIndex = 0;
    //$('#raggioricercaBus').prop('disabled', false);
    $('#raggioricerca')[0].options.selectedIndex = 0;
    $('#raggioricerca').prop('disabled', false);
    $('#nResultsServizi')[0].options.selectedIndex = 0;
    $('#nResultsServizi').prop('disabled', false);
    $('#raggioricerca_t')[0].options.selectedIndex = 0;
    $('#raggioricerca_t').prop('disabled', false);
    $('#nResultsServizi_t')[0].options.selectedIndex = 0;
    $('#nResultsServizi_t').prop('disabled', false);
    //$('#nResultsSensor')[0].options.selectedIndex = 0;
    //$('#nResultsSensor').prop('disabled', false);
    //$('#nResultsBus')[0].options.selectedIndex = 0;
    //$('#nResultsBus').prop('disabled', false);
    $('#elencolinee')[0].options.selectedIndex = 0;
    $('#elencoprovince')[0].options.selectedIndex = 0;
    $('#elencofermate').html('<option value=""> - Select a Bus Stop - </option>');
    $('#elencocomuni').html('<option value=""> - Select a Municipality - </option>');
    $('#PublicTransportLine').prop('disabled', false);
    $('#info').removeClass("active");
    $("#queryBox").remove();
    $("#serviceTextFilter").val("");
    $("#serviceTextFilter_t").val("");
    $("#approximativeAddress").html('');
    $("path.leaflet-clickable").hide();
    $("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-clickable").hide();
    $("div.leaflet-marker-icon.leaflet-zoom-animated.leaflet-clickable").hide();
    selezioneAttiva = false;

    resetPath();
}

function getRequest(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

// funzione per la visualizzazione dei marker con le icone appropriate
function showmarker(feature, latlng, mType) {
    
    var serviceType = feature.properties.serviceType;
    var serviceIcon = serviceType;
    var serviceIcon_gif = serviceType;
    if (serviceType == "")
        serviceIcon = "generic";
    var marker;

    if (serviceType == "TransferServiceAndRenting_BusStop") {
        if (feature.properties.agency) {
            serviceIcon = serviceIcon + "_" + feature.properties.agency.toLowerCase().replace(/\./g, "").replace(/&/g, "").replace(/ù/g, "u").replace(/à/g, "a").replace(/ /g, "").replace(/\//g, "");
        } else
            serviceIcon = serviceIcon + "_ataflinea";
    }
    else if (serviceType == "TransferServiceAndRenting_Tram_stops") {
        if (feature.properties.agency) {
            serviceIcon = serviceIcon + "_" + feature.properties.agency.toLowerCase().replace(/\./g, "").replace(/&/g, "").replace(/ù/g, "u").replace(/à/g, "a").replace(/ /g, "").replace(/\//g, "");
        }
    }
    else if (serviceType == "TransferServiceAndRenting_Train_station") {
        if (feature.properties.agency) {
            serviceIcon = serviceIcon + "_" + feature.properties.agency.toLowerCase().replace(/\./g, "").replace(/&/g, "").replace(/ù/g, "u").replace(/à/g, "a").replace(/ /g, "").replace(/\//g, "");
        }
    }
    else if (serviceType == "TransferServiceAndRenting_Ferry_stop") {
        if (feature.properties.agency) {
            serviceIcon = serviceIcon + "_" + feature.properties.agency.toLowerCase().replace(/\./g, "").replace(/&/g, "").replace(/ù/g, "u").replace(/à/g, "a").replace(/ /g, "").replace(/\//g, "");
        }
    }

    if(checkedFiles.has(serviceIcon)==false){

        if(serviceIcon=="Environment_Smart_street_light"){
            serviceIcon='Environment_Street_light';
        }
        
        var png_fileExists=checkFileExist(ctx + 'img/mapicons/' + serviceIcon + '.png');
        // var gif_fileExists=checkFileExist(ctx + 'img/mapicons/' + serviceIcon + '.gif');

        if(png_fileExists){
            checkedFiles.set(serviceIcon,'true');
        }else{
            checkedFiles.set(serviceIcon,'false');
            serviceIcon = serviceType;
        }

        // if(gif_fileExists){
        //     checkedFiles.set(serviceIcon,'true');
        // }else{
        //     checkedFiles.set(serviceIcon,'false');
        //     serviceIcon = serviceType;
        // }

    }else if(checkedFiles.get(serviceIcon)=='false'){
        serviceIcon = serviceType;
    }

    // if (checkFileExist(ctx + 'img/mapicons/' + serviceIcon + '.gif') == false) {
    //     serviceIcon_gif = serviceType;
    // }

    if (serviceType != "bus_real_time") {

        var icon = L.icon({
            // iconUrl: ctx + '../web/img/mapicons/' + serviceIcon + '.png',
            // iconRetinaUrl: ctx + '../web/img/mapicons/' + serviceIcon + '.png',
            iconUrl: ctx + 'img/mapicons/' + serviceIcon + '.png',
            iconRetinaUrl: ctx + 'img/mapicons/' + serviceIcon + '.png',
            iconSize: [26, 29],
            iconAnchor: [13, 29],
            className: mType,
            popupAnchor: [0, -27],
        });
        marker = L.marker(latlng, { icon: icon, title: serviceType + " - " + feature.properties.name, riseOnHover: true });
        marker.on('mouseover', function (e) {
            if ($(e.target._icon).hasClass('selected')) {
            } else {
                var overIcon = L.icon({
                    // iconUrl: ctx + '../web/img/mapicons/over/' + serviceIcon + '_over.png',
                    // iconRetinaUrl: ctx + '../web/img/mapicons/over/' + serviceIcon + '_over.png',
                    iconUrl: ctx + 'img/mapicons/over/' + serviceIcon + '_over.png',
                    iconRetinaUrl: ctx + 'img/mapicons/over/' + serviceIcon + '_over.png',
                    iconSize: [26, 29],
                    iconAnchor: [13, 29],
                    popupAnchor: [0, -27],
                });
                e.target.setIcon(overIcon)
            }
        });
        marker.on('mouseout', function (e) {
            if ($(e.target._icon).hasClass('selected')) {
            } else {
                var defIcon = L.icon({
                    // iconUrl: ctx + '../web/img/mapicons/' + serviceIcon + '.png',
                    // iconRetinaUrl: ctx + '../web/img/mapicons/' + serviceIcon + '.png',
                    iconUrl: ctx + 'img/mapicons/' + serviceIcon + '.png',
                    iconRetinaUrl: ctx + 'img/mapicons/' + serviceIcon + '.png',
                    iconSize: [26, 29],
                    iconAnchor: [13, 29],
                    popupAnchor: [0, -27],
                });
                e.target.setIcon(defIcon)
            }
        });
        oms.addMarker(marker);
    }
    else {
        var icon = L.icon({
            // iconUrl: ctx + '../web/img/mapicons/' + serviceIcon + '.gif',
            // iconRetinaUrl: ctx + '../web/img/mapicons/' + serviceIcon + '.gif',
            iconUrl: ctx + 'img/mapicons/' + serviceIcon_gif + '.gif',
            iconRetinaUrl: ctx + 'img/mapicons/' + serviceIcon_gif + '.gif',
            iconSize: [15, 15],
            iconAnchor: [7, 15],
            popupAnchor: [0, -7],
            className: "busRT",
        });
        marker = L.marker(latlng, { icon: icon, title: serviceType + " - " + feature.properties.vehicleNum + " - " + feature.properties.line, riseOnHover: true });
    }
    return marker;
}

function checkFileExist(urlToFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();

    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}



//Function per mantenere fissa la posizione del popup anche al variare del suo contenuto
function popup_fixpos(divId) {
    var $leaflet = $('#' + divId).closest('div.leaflet-popup.leaflet-zoom-animated');
    var width = $leaflet.width();
    $leaflet.css({ left: "-" + (width / 2) + "px" });
}

//Function che aggiorna il box di visualizzazione con il numero dei risultati di servizi-fermate-sensori
function risultatiRicerca(numServizi, numBus, numSensori, msg, dir, numTotServizi, numTotBus, numTotSensori) {
    var circle = $('path.leaflet-clickable');
    if (msg != 0) {
        $("#msg").hide();
        if (numServizi != 0) {
            if (msg == 1) {
                if (numTotServizi != 0) {
                    $("#serviceRes .value").text(numServizi + " of " + numTotServizi + " available");
                }
                else {
                    $("#serviceRes .value").text(numServizi);
                }
                /*
                 * MICHELA TODO
                var html_tpl;
                if( ($('#Tram:checked').val() == 'Tram_stops' ) || ($('#Train:checked').val() == 'Train_station' ) 
                        || ($('#Ferry:checked').val() == 'Ferry_stop') ){
                    if( $('#Tram:checked').val() == 'Tram_stops'  ){
                        html_tpl += "<img src='/img/mapicons/TransferServiceAndRenting_Tram_stops.png' height='21' width='18' align='top'>";
                        html_tpl += "<span class='label'>Tram</span>";
                        html_tpl += "</img>";
                        
                        //$("#serviceRes span.label").text("Tram");
                        //$("#serviceRes img").attr("src", ctx + '/img/mapicons/TransferServiceAndRenting_Tram_stops.png');
                    }
                    else if($('#Train:checked').val() == 'Train_station'){
                         $("#serviceRes span.label").text("Train");
                         $("#serviceRes img").attr("src", ctx + '/img/mapicons/TransferServiceAndRenting_Train_station.png');
                    }
                    else{
                         $("#serviceRes span.label").text("Ferry");
                         $("#serviceRes img").attr("src", ctx + '/img/mapicons/TransferServiceAndRenting_Ferry_stop.png');
                    } 
                }
                else{
                    $("#serviceRes span.label").text("Services");
                    $("#serviceRes img").attr("src", ctx + '/img/mapicons/TourismService.png');
                }*/
                $("#serviceRes span.label").text("Services");
                $("#serviceRes img").attr("src", ctx + 'img/mapicons/TourismService.png');
                $("#serviceRes").show();
            } else {
                // Utilizzato in precedenza quando nella tab dei servizi trasversali c'era solo la voce DigitalLocation
                $("#serviceRes .value").text(numServizi);
                $("#serviceRes span.label").text("DigitalLocation");
                $("#serviceRes span.label").css("color", "#ad0a61");
                // $("#serviceRes img").attr('src', ctx + '../web/img/mapiconsOLD/digitalLocation.png');
                $("#serviceRes img").attr('src', ctx + 'img/mapiconsOLD/digitalLocation.png');

                $("#serviceRes").show();
            }
        } else {
            $("#serviceRes").hide();
        }
        if (numBus != 0) {
            if (numTotBus != 0) {
                $("#busstopRes .value").text(numBus + " of " + numTotBus + " available");
            }
            else {
                $("#busstopRes .value").text(numBus);
            }
            $("#busstopRes").show();
            if (dir != null) {
                $("#busDirection .value").text(dir);
                $("#busDirection").show();
            } else {
                $("#busDirection").hide();
            }
        } else {
            $("#busstopRes").hide();
            $("#busDirection").hide();
        }
        if (numSensori != 0) {
            if (numTotSensori != 0) {
                $("#sensorRes .value").text(numSensori + " of " + numTotSensori + " available");
            }
            else {
                $("#sensorRes .value").text(numSensori);
            }
            $("#sensorRes").show();
        } else {
            $("#sensorRes").hide();
        }
        if (dir == null) {
            $(".circle.leaflet-clickable").css({ stroke: "#0c0", fill: "#0c0" });
        }
    } else {
        if (dir == null) {
            $(".circle.leaflet-clickable").css({ stroke: "#f03", fill: "#f03" });
        }
        $("#serviceRes").hide();
        $("#busstopRes").hide();
        $("#busDirection").hide();
        $("#sensorRes").hide();
        $("#msg").text("Search has not results.");
        $("#msg").show();
    }
    $("#searchOutput").show();
}

//Function che nasconde i risltati della ricerca
function nascondiRisultati() {
    $(".result .value").html("");
    $(".result").hide();
    $("#searchOutput").hide();
    $("#resultTPL").hide();
}

var circle = $('.leaflet-overlay-pane').children('path');
//Function che mostra gli autobur RT
var currentBusRT = null;
var callingBusRT = false;


function showVehiclePosition(zoom, agency, line){
    showPosition=true;
    showVehiclePositionButtonPressed=true;
    mostraAutobusRT(zoom, agency, line);
    showVehiclePositionButtonPressed=false;
}

function mostraAutobusRT(zoom, agency, line) {

    // if (($('.leaflet-marker-icon.busRT.leaflet-zoom-animated.leaflet-clickable.selected').length) == 0) {
    //     $('#selezione').html("No selection");
    //     $('#approximativeAddress').html("");
    // }
    //$('.popup_autobusRT').closest('.leaflet-popup.leaflet-zoom-animated').hide();
    if (agency == undefined)
        agency = $('#elencoagenzie option:selected').attr('value');
    if (line == undefined)
        line = $('#elencolinee option:selected').attr('value');

    if (!agency) {
        if (!mode) {
            alert("Please, first select an agency!");
            return;
        }
        agency = "";
    }

    if (agency==""){
        alert("Please, first select an agency!");
        return; 
    }

    document.getElementById('savePositionBus').removeAttribute('disabled','disabled');
    document.getElementById('savePositionBus').src="img/save_enable.png";
    document.getElementById('savePositionBus').style.cursor="pointer";  

    if (currentBusRT != null)
        clearTimeout(currentBusRT);
    if (!callingBusRT) {
        callingBusRT = true;

        $.ajax({
            //   url: ctx + "/ajax/json/get-autobusRT.jsp",
            url: selectedorgUrl + ctx + "tpl/bus-position/",

            type: "GET",
            async: false,
            // headers: {'Authorization':'Bearer '+msm_access_token},
            dataType: 'json',
            data: {
                agency: agency,
                line: line
                // accessToken: MultiServiceMap.keycloak.token
            },
            success: function (msg) {
                callingBusRT = false;
                $('#loading').hide();
                //if(zoom!=undefined)
                $('.leaflet-marker-icon.busRT').remove();
                //else
                //  $('.leaflet-marker-icon.busRT').not(".selected").remove();
                if(showVehiclePositionButtonPressed==true || showPosition==true){
                if (msg.features.length > 0) {
                    
                    currentPositionLayer = L.geoJson(msg, {
                        pointToLayer: function (feature, latlng) {
                            marker = showmarker(feature, latlng);
                            return marker;
                        },
                        onEachFeature: function (feature, layer) {
                            var contenutoPopup = "";
                            contenutoPopup = contenutoPopup + "<div class=\"popup_autobusRT\" >";
                            contenutoPopup = contenutoPopup + "<h3> TPL REAL TIME </h3>";
                            if (feature.properties.vehicleNum != "" && feature.properties.vehicleNum)
                                contenutoPopup = contenutoPopup + "<b>Vehicle Number: </b> " + feature.properties.vehicleNum + "<br />";
                            if (feature.properties.line != "" && feature.properties.line)
                                contenutoPopup = contenutoPopup + "<b>Line: </b> " + feature.properties.line + "<br />";
                            if (feature.properties.direction != "" && feature.properties.direction)
                                contenutoPopup = contenutoPopup + "<b>Direction: </b> " + feature.properties.direction + "<br />";
                            if (feature.properties.agency != "" && feature.properties.agency)
                                contenutoPopup = contenutoPopup + "<b>Agency: </b> " + feature.properties.agency + "<br />";
                            if (feature.properties.detectionTime != "" && feature.properties.detectionTime)
                                contenutoPopup = contenutoPopup + "<b>Info: </b> position acquired " + feature.properties.detectionTime + "min. ago.<br />";
                            layer.bindPopup(contenutoPopup);
                        },
                        filter: function (feature, layer) {
                            var coords = feature.geometry.coordinates;
                            return (coords[0] != -1 || coords[1] != -1);
                        }
                    });
                    currentPositionLayer.addTo(map);
                    if (zoom != undefined) {
                        var confiniMappa = currentPositionLayer.getBounds();
                        map.fitBounds(confiniMappa, { padding: [25, 25] });
                    }
                }
            }
            },
            error: function (e) {
                callingBusRT = false;
                console.log(e);
            }
        });
    
    }
    if(showPosition==true)
        currentBusRT = setTimeout(function () { mostraAutobusRT(undefined, agency, line) }, !line ? 6000 : 5000);
    }

function stopShowPositions(){
    currentPositionLayer.clearLayers();
    showPosition=false;
}

function searchEvent(param, raggioRic, centroRic, numEv, text) {
    //$('#selection').hide();
    //$('.leaflet-marker-icon.event.leaflet-zoom-animated.leaflet-clickable').remove();
    //$('#loading').html(msg).show('fast');//show('slow');

    //events
    eventRange=param;
    eventRaggioRic=raggioRic;
    eventcentroRic=raggioRic;
    eventNumEv= numEv;
    eventText=text;

    document.getElementById('saveEventSearch').removeAttribute('disabled','disabled');
    document.getElementById('saveEventSearch').src="img/save_enable.png";
    document.getElementById('saveEventSearch').style.cursor="pointer";    

    if (eventLayer != null) {
        map.removeLayer(eventLayer);
    }
    //michela
    //Quello sotto è il metodo per scrivere nella variabile globale query... 
    //si scrive solo nel caso in cui la ricerca provenga dal tab degli eventi
    //da capire se sovrascrivere altri valori con il default o meno, in caso di save in modalità embed...
    if ($("#event_choice_d").is(':checked') || $("#event_choice_w").is(':checked') || $("#event_choice_m").is(':checked'))
        query_event = saveQueryEvent(param);
    /*
    if(param != "transverse"){
     $('#searchOutput').hide();
     }*/

    var eventNum = 0;
    var value = document.getElementById("org_selector").value;
    var sample_coord_lat = "";
    var sample_coord_lon = "";

    if (value == superServiceMapApiUrl) {
        selectedorgUrl = value;
        sample_coord_lat = '48.3708';
        sample_coord_lon = '10.4589';
    } else {
        seperator = value.indexOf("|");
        selectedorgUrl = value.substring(0, seperator);
        center = value.substring(seperator + 1, value.length);
        sample_coord_lat = center.substring(0, center.indexOf(","));
        sample_coord_lon = center.substring(center.indexOf(",") + 1, center.length);
    }

    var data = {};

    if (param != null || param != undefined)
        data['range'] = param;

    if (centroRic != null || centroRic != undefined)
        data['maxDists'] = raggioRic;

    if (centroRic != null || centroRic != undefined)
        data['selection'] = centroRic;

    if (numEv != null || numEv != undefined)
        data['maxResults'] = numEv;

    if (text != null || text != undefined)
        data['textFilter'] = text;

    // data['accessToken'] = msm_access_token;    


    // var data= {
    //     range: param,
    //     maxDists: raggioRic,
    //     selection: centroRic,
    //     maxResults: numEv,
    //     textFilter: text
    // }

    // for (k in data){
    //     if(data[k]=="" || data[k]==undefined) delete data[k];
    // }  

    $.ajax({
        // url: ctx + "/ajax/json/get-event-list.jsp",
        url: selectedorgUrl + ctx + "events/",
        type: "GET",
        async: false,
        dataType: 'json',
        data: data,
        headers: {'Authorization':'Bearer '+msm_access_token},
        success: function (msg) {

            //metto attive le previsioni del tempo, so che gli eventi allo stato attuale (gennaio 2017 sono solo su Firenze)
            $.ajax({
                // url: "ajax/get-weather.jsp",
                url: selectedorgUrl + ctx + "location/",
                type: "GET",
                async: true,
                headers: {'Authorization':'Bearer '+msm_access_token},
                //dataType: 'json',
                data: {
                    position: sample_coord_lat + ';' + sample_coord_lon
                    // accessToken: msm_access_token
                    // nomeComune: "FIRENZE"
                },
                success: function (msg) {
                    municipalityUri = msg.municipalityUri;
                    getWeatherInfo(selectedorgUrl + ctx, municipalityUri);
                    //$('#loading').hide();
                    // $('#info-aggiuntive .content').html(msg);
                }
            });

            if (param != "free_text") {
                $('#loading').hide();
            }

            var i = 0;
            if (msg.Event.features.length > 0) {
                $('#event').show();
                // Funzione per definire nuova posizione a due marker sovrapposti
                var array = new Array();
                for (var r = 0; r < msg.Event.features.length; r++) {
                    array[r] = new Array();
                    for (var c = 0; c < 2; c++) {
                        array[r][c] = 0;
                    }
                }

                for (i = 0; i < msg.Event.features.length; i++) {
                    if (msg.Event.features[i].properties.freeEvent == "YES") {
                        msg.Event.features[i].properties.evFree = ctx + 'img/mapicons/no_euro.png';
                    } else {
                        msg.Event.features[i].properties.evFree = ctx + 'img/mapicons/euro.png';
                    }

                    if (i == 0) {
                        array[0][0] = msg.Event.features[i].geometry.coordinates[0];
                        array[0][1] = msg.Event.features[i].geometry.coordinates[1];
                    } else {
                        for (var k = 0; k < i; k++) {
                            if ((msg.Event.features[i].geometry.coordinates[0] == array[k][0]) && (msg.Event.features[i].geometry.coordinates[1] == array[k][1])) {
                                array[i][0] = msg.Event.features[i].geometry.coordinates[0] + (Math.random() - .8) / 1500;
                                array[i][1] = msg.Event.features[i].geometry.coordinates[1] + (Math.random() - .8) / 1500;
                                msg.Event.features[i].geometry.coordinates[0] = array[i][0];
                                msg.Event.features[i].geometry.coordinates[1] = array[i][1];
                            } else {
                                array[i][0] = msg.Event.features[i].geometry.coordinates[0];
                                array[i][1] = msg.Event.features[i].geometry.coordinates[1];
                            }

                        }

                    }

                }
                // Fine riposizionamento marker

                eventNum = i;
                if (eventNum > 0) {
                    $('#eventNum').html(eventNum + " events found.");
                } else {
                    $('#eventNum').html("No events planned.");
                }
                $('#eventNum').show();
                var template = "{{#features}}" +
                    "<div class=\"eventItem\" id=\"event_{{id}}\" style=\"margin-top:5px; border:1px solid #000; padding:6px; overflow:auto;\" onclick=\"selectEvent({{id}})\">\n\
                            <div class=\"eventName\"><b style=\"color:#751a6a;\">{{properties.name}}</b></div>" +
                    "<div class=\"eventInfo\" style=\"float:left; margin-top:7px; display:block; width:85%;\"><b>Place:</b> {{properties.place}}<br>" +
                    "<b>Date:</b> da {{properties.startDate}} {{#properties.endDate}}a {{properties.endDate}}{{/properties.endDate}}<br>" +
                    "{{#properties.startTime}}<b>Time:</b> {{properties.startTime}}{{/properties.startTime}}<br></div>" +
                    "<div class=\"eventFree\" style=\"float:right; margin-top:10px; display:block; width:15%;\"><img src=\"{{properties.evFree}}\"></img></div></div>" +
                    "{{/features}}";
                var output = Mustache.render(template, msg.Event);
                document.getElementById('eventList').innerHTML = output;
                var markerType = "event";
                eventLayer = L.geoJson(msg.Event, {
                    pointToLayer: function (feature, latlng) {
                        if (latlng[0] != -1 && latlng[1] != -1) {
                            marker = showmarker(feature, latlng, markerType);
                            return marker;
                        }
                    },
                    onEachFeature: function (feature, layer) {
                        var contenutoPopup = "";
                        contenutoPopup = contenutoPopup + "<div id=\"" + feature.id + "-" + feature.properties.tipo + "\" >";
                        contenutoPopup = contenutoPopup + "<div class=\"description\"><h3> " + feature.properties.name + "</h3></div>";
                        contenutoPopup = contenutoPopup + "<b>Serviceuri:</b> <a href='" + logEndPoint + feature.properties.serviceUri + "' title='Linked Open Graph' target='_blank'>" + feature.properties.serviceUri + "</a><br />";
                        if (feature.properties.categoryIT != "" && feature.properties.categoryIT)
                            contenutoPopup = contenutoPopup + "<b>Event Type:</b> " + feature.properties.categoryIT + "<br />";
                        if (feature.properties.place != "" && feature.properties.place) {
                            contenutoPopup = contenutoPopup + "<b>Place: </b> " + feature.properties.place + "<br />";
                        }
                        if (feature.properties.address != "" && feature.properties.address)
                            contenutoPopup = contenutoPopup + "<b>Address:</b> " + feature.properties.address;
                        if (feature.properties.civic != "" && feature.properties.civic)
                            contenutoPopup = contenutoPopup + ", " + feature.properties.civic + "<br />";
                        else
                            contenutoPopup = contenutoPopup + "<br />";
                        if (feature.properties.startDate != "" && feature.properties.startDate)
                            contenutoPopup = contenutoPopup + "<b>Date:</b> da " + feature.properties.startDate;
                        if (feature.properties.endDate != "" && feature.properties.endDate)
                            contenutoPopup = contenutoPopup + " a " + feature.properties.endDate + "<br />";
                        else
                            contenutoPopup = contenutoPopup + "<br />";
                        if (feature.properties.startTime != "" && feature.properties.startTime)
                            contenutoPopup = contenutoPopup + "<b>Time:</b> " + feature.properties.startTime + "<br />";
                        if (feature.properties.freeEvent != "" && feature.properties.freeEvent) {
                            if (feature.properties.freeEvent == "YES") {
                                contenutoPopup = contenutoPopup + "<b>Price:</b> Ingresso libero<br />";
                            } else {
                                if (feature.properties.price != "" && feature.properties.price) {
                                    contenutoPopup = contenutoPopup + "<b>Price:</b> " + feature.properties.price + "<br />";
                                }
                            }
                        }
                        if (feature.properties.website != "" && feature.properties.website)
                            if (((JSON.stringify(feature.properties.website)).indexOf("http\://")) != -1) {
                                contenutoPopup = contenutoPopup + "<b>Website:</b><a href=\"" + feature.properties.website + "\" target=\"_blank\" title=\"" + feature.properties.name + " - website\"> " + feature.properties.website + "</a><br />";
                            } else {
                                contenutoPopup = contenutoPopup + "<b>Website:</b><a href=\"http\://" + feature.properties.website + "\" target=\"_blank\" title=\"" + feature.properties.name + " - website\"> " + feature.properties.website + "</a><br />";
                            }

                        if (feature.properties.phone != "" && feature.properties.phone)
                            contenutoPopup = contenutoPopup + "<b>Phone:</b> " + feature.properties.phone + "<br />";
                        if (feature.properties.descriptionIT != "" && feature.properties.descriptionIT)
                            contenutoPopup = contenutoPopup + "<div class=\"description\"><b>Description:</b> " + feature.properties.descriptionIT + "</div><br />";
                        var name = feature.properties.name;
                        nameEscaped = escape(name);
                        var divSavePin = "savePin-" + feature.id;
                        contenutoPopup = contenutoPopup + "<div id=\"" + divSavePin + "\" class=\"savePin\" onclick=save_handler('" + feature.properties.tipo + "','" + feature.properties.serviceUri + "','" + nameEscaped + "')></div>";
                        layer.bindPopup(contenutoPopup);
                    }

                });
                eventLayer.addTo(map);
                var confiniMappa = eventLayer.getBounds();
                if (param != "free_text" && param != "transverse") {
                    map.fitBounds(confiniMappa, { padding: [50, 50] });
                }
            } else {
                $('#event').show();
                $('#eventNum').html("No events planned.");
                $('#eventNum').show();
            }
            //$('#loading').html(msg).show('fast').hide('fast');//show('slow');//michela
        }
    });
    return (eventNum);
}

function selectEvent(arg) {
    map.eachLayer(function (marker) {
        if (marker.feature != null && marker.feature.id != null) {
            var id = marker.feature.properties.tipo + marker.feature.id;
            if (id === ("event" + arg)) {
                marker.openPopup();
            }
        }
    });
}

function selectRoute(code) {
    map.eachLayer(function (e) {
        if (e._path != null) {

            var route_id = e._path.attributes.class.nodeValue;
            /*
            if (route_id === ("route_ATAF_" + code + " leaflet-clickable")) {
                e.bringToFront();
                e._path.attributes.stroke.value = "yellow";
            }*/
            if (route_id === ("route_" + code + " leaflet-clickable")) {
                e.bringToFront();
                e._path.attributes.stroke.value = "yellow";
            }
        }
        /*if (path.feature != null && marker.feature.id != null ) {
         var id = marker.feature.properties.tipo+marker.feature.id;
         if (id === ("event"+arg)) {
         marker.openPopup();
         
         }
         }*/
    });
}

function deselectRoute(code) {
    map.eachLayer(function (e) {
        if (e._path != null) {

            var route_id = e._path.attributes.class.nodeValue;
            if (route_id === ("route_" + code + " leaflet-clickable")) {
                e._path.attributes.stroke.value = "#085ee8";
            }
            /*
            if (route_id === ("route_ATAF_" + code + " leaflet-clickable")) {
                e._path.attributes.stroke.value = "#085ee8";
            }*/
        }
        /*if (path.feature != null && marker.feature.id != null ) {
         var id = marker.feature.properties.tipo+marker.feature.id;
         if (id === ("event"+arg)) {
         marker.openPopup();
         
         }
         }*/
    });
}

function getLanguageResources(lang) {
    /*var it = new Array(); 
     var en = new Array();
     
     it['tabs1'] = "Bus Firenze"; en['tabs1'] = "Florence Bus";
     it['tabs2'] = "Comuni Toscana"; en['tabs2'] = "Tuscan Municipality";
     it['tabs3'] = "Ricerca testuale"; en['tabs3'] = "Text Search";
     it['tabs4'] = "Eventi"; en['tabs4'] = "Events";
     
     var resources = new Array();
     resources['it'] = it;
     resources['en'] = en;*/
    var resource = new Array();
    $.ajax({
        //url: "label_" + lang + ".json",
        url: "js/label_" + lang + ".json",
        type: "GET",
        async: false,
        dataType: 'json',
        success: function (msg) {

            resource['Bus_Search'] = msg.Bus_Search;
            resource['Municipality_Search'] = msg.Municipality_Search;
            resource['Text_Search'] = msg.Text_Search;
            resource['Event_Search'] = msg.Event_Search;
            resource['Select_Line'] = msg.Select_Line;
            resource['Select_Route'] = msg.Select_Route;
            resource['Select_BusStop'] = msg.Select_BusStop;
            resource['Position_Bus'] = msg.Position_Bus;
            resource['Stop_Show_Position'] = msg.Stop_Show_Position;
            resource['Hide_Menu_dx'] = msg.Hide_Menu;
            resource['Hide_Menu_sx'] = msg.Hide_Menu;
            resource['Show_Menu_sx'] = msg.Show_Menu;
            resource['Hide_Menu_meteo'] = msg.Hide_Menu;
            resource['Actual_Selection'] = msg.Actual_Selection;
            //resource['Selection'] = msg.Selection;
            resource['Select_Province'] = msg.Select_Province;
            resource['Select_Municipality'] = msg.Select_Municipality;
            resource['Select_Text_sx'] = msg.Select_Text_sx;
            resource['Num_Results_sx'] = msg.Num_Results_sx;
            resource['Select_Time'] = msg.Select_Time;
            resource['Day'] = msg.Day;
            resource['Week'] = msg.Week;
            resource['Month'] = msg.Month;
            resource['Event_Florence'] = msg.Event_Florence;
            resource['Search_Regular_Services'] = msg.Search_Regular_Services;
            resource['Search_Transversal_Services'] = msg.Search_Transversal_Services;
            resource['Services_Categories_R'] = msg.Services_Categories_R;
            resource['Select_All_R'] = msg.Select_All_R;
            resource['Num_Results_dx_R'] = msg.Num_Results_dx_R;
            resource['Search_Range_R'] = msg.Search_Range_R;
            resource['Search_Area_R'] = msg.Search_Area_R;
            resource['Services_Categories_T'] = msg.Services_Categories_T;
            resource['Select_All_T'] = msg.Select_All_T;
            resource['Num_Results_dx_T'] = msg.Num_Results_dx_T;
            resource['Filter_Results_dx_R'] = msg.Filter_Results_dx_R;
            resource['Filter_Results_dx_T'] = msg.Filter_Results_dx_T;
            resource['Search_Range_T'] = msg.Search_Range_T;
            resource['Search_Area_T'] = msg.Search_Area_T;
            resource['Search_Results'] = msg.Search_Results;
            resource['Results_BusLines'] = msg.Results_BusLines;
            resource['weather_mun'] = msg.weather_mun;
            resource['last_update'] = msg.last_update;
            resource['Loading_Message'] = msg.Loading_Message;
            resource['tipology'] = msg.tipology;
            resource['city'] = msg.city;
            resource['multimedia'] = msg.multimedia;
            resource['address'] = msg.address;
            resource['phone'] = msg.phone;
            resource['description'] = msg.description;
            resource['sensor_data'] = msg.sensor_data;
            resource['msg_real_time'] = msg.msg_real_time;
            resource['msg_timetable'] = msg.msg_timetable;
            resource['next_transits'] = msg.next_transits;
            resource['parking_data'] = msg.parking_data;
            resource['park_close'] = msg.park_close;
            resource['park_open'] = msg.park_open;
            resource['show_on_map'] = msg.show_on_map;
            resource['remove_from_map'] = msg.remove_from_map;
            resource['timetable_showing'] = msg.timetable_showing;
            resource['timetable_display'] = msg.timetable_display;
            resource['timetable_records'] = msg.timetable_records;
            resource['timetable_of'] = msg.timetable_of;
            resource['timetable_search'] = msg.timetable_search;
            resource['timetable_time'] = msg.timetable_time;
            resource['timetable_line'] = msg.timetable_line;
            resource['timetable_direction'] = msg.timetable_direction;
        }
    });
    //var resources = new Array();
    //resources['it'] = it;
    return resource;
}

function changeLanguage(lang) {
    var langResources = getLanguageResources(lang);
    if (lang == 'ENG') {
        //$("#icon_lang").attr('src', ctx + "/img/icon_ITA.png");
        $("#icon_lang").attr('src', ctx + "img/icon_ITA.png");

        $("#icon_lang").attr('onclick', "changeLanguage('ITA')");
        $("#lang").attr('value', 'ENG');
    } else {
        document.getElementById("content_div").style.width="516px";
        $("#icon_lang").attr('src', ctx + "img/icon_ENG.png");
        //$("#icon_lang").attr('src', ctx + "/img/icon_ENG.png");
        $("#icon_lang").attr('onclick', "changeLanguage('ENG')");
        $("#lang").attr('value', 'ITA');
    }

    $("span[name='lbl']").each(function (i, elt) {
        $(elt).text(langResources[$(elt).attr("caption")]);
    });
    $("span[class='giorno']").each(function (i, elt) {
        var id_day = $(elt).attr('id');
        if ($('#' + id_day).text() != null) {
            setWeekDay(id_day, $('#' + id_day).text());
        }
    });
    $("span[class='descrizione-meteo']").each(function (i, elt) {
        var id_meteo = $(elt).attr('id');
        if ($('#' + id_meteo).text() != null) {
            setWeatherPred(id_meteo, $('#' + id_meteo).text());
        }
    });
    /*if($("#day0").text() != null){
     setWeekDay('day0', $("#day0").text());
     }
     if($("#day1").text() != null){
     setWeekDay('day1', $("#day1").text());
     }
     if($("#day2").text() != null){
     setWeekDay('day2', $("#day2").text());
     }
     if($("#day3").text() != null){
     setWeekDay('day3', $("#day3").text());
     }
     if($("#day4").text() != null){
     setWeekDay('day4', $("#day4").text());
     }*/

}

function setWeekDay(div, day) {
    switch (day) {
        case "Lunedi":
            $('#' + div).text('Monday');
            break;
        case "Martedi":
            $('#' + div).text('Tuesday');
            break;
        case "Mercoledi":
            $('#' + div).text('Wednesday');
            break;
        case "Giovedi":
            $('#' + div).text('Thursday');
            break;
        case "Venerdi":
            $('#' + div).text('Friday');
            break;
        case "Sabato":
            $('#' + div).text('Saturday');
            break;
        case "Domenica":
            $('#' + div).text('Sunday');
            break;
        case "Monday":
            $('#' + div).text('Lunedi');
            break;
        case "Tuesday":
            $('#' + div).text('Martedi');
            break;
        case "Wednesday":
            $('#' + div).text('Mercoledi');
            break;
        case "Thursday":
            $('#' + div).text('Giovedi');
            break;
        case "Friday":
            $('#' + div).text('Venerdi');
            break;
        case "Saturday":
            $('#' + div).text('Sabato');
            break;
        case "Sunday":
            $('#' + div).text('Domenica');
            break;
    }
}

function setWeatherPred(div, desc) {
    switch (desc) {
        case "sereno":
            $('#' + div).text('cloudless');
            break;
        case "poco nuvoloso":
            $('#' + div).text('bit cloudy');
            break;
        case "velato":
            $('#' + div).text('bleary');
            break;
        case "pioggia debole e schiarite":
            $('#' + div).text('light rain and sunny intervals');
            break;
        case "nuvoloso":
            $('#' + div).text('cloudy');
            break;
        case "pioggia debole":
            $('#' + div).text('light rain');
            break;
        case "coperto":
            $('#' + div).text('overcast');
            break;
        case "pioggia e schiarite":
            $('#' + div).text('rain and sunny intervals');
            break;
        case "pioggia moderata-forte":
            $('#' + div).text('moderate rainfall');
            break;
        case "foschia":
            $('#' + div).text('mist');
            break;
        case "temporale":
            $('#' + div).text('rainstorm');
            break;
        case "neve debole e schiarite":
            $('#' + div).text('light snow and sunny intervals');
            break;
        case "temporale e schiarite":
            $('#' + div).text('rainstorm and sunny intervals');
            break;
        case "neve moderata-forte":
            $('#' + div).text('moderate snowfall');
            break;
        case "neve e schiarite":
            $('#' + div).text('snow and sunny intervals');
            break;
        case "neve debole":
            $('#' + div).text('light snow');
            break;
        case "pioggia debole":
            $('#' + div).text('light rain');
            break;
        case "cloudless":
            $('#' + div).text('sereno');
            break;
        case "bit cloudy":
            $('#' + div).text('poco nuvoloso');
            break;
        case "bleary":
            $('#' + div).text('velato');
            break;
        case "light rain and sunny intervals":
            $('#' + div).text('pioggia debole e schiarite');
            break;
        case "cloudy":
            $('#' + div).text('nuvoloso');
            break;
        case "light rain":
            $('#' + div).text('pioggia debole');
            break;
        case "overcast":
            $('#' + div).text('coperto');
            break;
        case "rain and sunny intervals":
            $('#' + div).text('pioggia e schiarite');
            break;
        case "moderate rainfall":
            $('#' + div).text('pioggia moderata-forte');
            break;
        case "mist":
            $('#' + div).text('foschia');
            break;
        case "rainstorm":
            $('#' + div).text('temporale');
            break;
        case "light snow and sunny intervals":
            $('#' + div).text('neve debole e schiarite');
            break;
        case "rainstorm and sunny intervals":
            $('#' + div).text('temporale e schiarite');
            break;
        case "moderate snowfall":
            $('#' + div).text('neve moderata-forte');
            break;
        case "snow and sunny intervals":
            $('#' + div).text('neve e schiarite');
            break;
        case "light snow":
            $('#' + div).text('neve debole');
            break;
        case "light rain":
            $('#' + div).text('pioggia debole');
            break;
        case "fog":
            $('#' + div).text('nebbia');
            break;
    }
}

function showChart(selezione, raggioRicerca, coordinateSelezione) {

    var numberOfChecked = $('input.subcategory:checkbox:checked').length;
    var stringaCategorie = getCategorie('categorie').join(";")
    var limitRes = $("#nResultsServizi").val();
    var textFilter = $("#serviceTextFilter").val();
    var total = 0;
    var larg = 326;

    if (((selezione != undefined) && (selezione.indexOf('Bus Line') == -1)) || raggioRicerca == "area" || raggioRicerca == "geo") {
        if (stringaCategorie == "") {
            alert("Select at least one category from top-right menu");
        } else {
            $('#loading').show();
            var catArray2 = new Array();
            var catArray = new Array();
            catArray2[0] = { 'name': 'Accommodation', 'y': 0, 'dataLabels': 0, 'color': '#330000', 'id': null };
            catArray2[1] = { 'name': 'Advertising', 'y': 0, 'dataLabels': 0, 'color': '#660000', 'id': null };
            catArray2[2] = { 'name': 'AgricultureAndLivestock', 'y': 0, 'dataLabels': 0, 'color': '#990000', 'id': null };
            catArray2[3] = { 'name': 'CivilAndEdilEngineering', 'y': 0, 'dataLabels': 0, 'color': '#CC0000', 'id': null };
            catArray2[4] = { 'name': 'CulturalActivity', 'y': 0, 'dataLabels': 0, 'color': '#FF0000', 'id': null };
            catArray2[5] = { 'name': 'EducationAndResearch', 'y': 0, 'dataLabels': 0, 'color': '#FF6600', 'id': null };
            catArray2[6] = { 'name': 'Emergency', 'y': 0, 'dataLabels': 0, 'color': '#FF9900', 'id': null };
            catArray2[7] = { 'name': 'Entertainment', 'y': 0, 'dataLabels': 0, 'color': '#FFCC00', 'id': null };
            catArray2[8] = { 'name': 'Environment', 'y': 0, 'dataLabels': 0, 'color': '#38C767', 'id': null };
            catArray2[9] = { 'name': 'FinancialService', 'y': 0, 'dataLabels': 0, 'color': '#33CC33', 'id': null };
            catArray2[10] = { 'name': 'GovernmentOffice', 'y': 0, 'dataLabels': 0, 'color': '#339933', 'id': null };
            catArray2[11] = { 'name': 'HealthCare', 'y': 0, 'dataLabels': 0, 'color': '#336633', 'id': null };
            catArray2[12] = { 'name': 'IndustryAndManufacturing', 'y': 0, 'dataLabels': 0, 'color': '#0000FF', 'id': null };
            catArray2[13] = { 'name': 'MiningAndQuarrying', 'y': 0, 'dataLabels': 0, 'color': '#0066FF', 'id': null };
            catArray2[14] = { 'name': 'ShoppingAndService', 'y': 0, 'dataLabels': 0, 'color': '#0099FF', 'id': null };
            catArray2[15] = { 'name': 'TourismService', 'y': 0, 'dataLabels': 0, 'color': '#00CCFF', 'id': null };
            catArray2[16] = { 'name': 'TransferServiceAndRenting', 'y': 0, 'dataLabels': 0, 'color': '#FF00FF', 'id': null };
            catArray2[17] = { 'name': 'UtilitiesAndSupply', 'y': 0, 'dataLabels': 0, 'color': '#CC00FF', 'id': null };
            catArray2[18] = { 'name': 'Wholesale', 'y': 0, 'dataLabels': 0, 'color': '#9900FF', 'id': null };
            catArray2[19] = { 'name': 'WineAndFood', 'y': 0, 'dataLabels': 0, 'color': '#6600FF', 'id': null };

            /*if ((selezione.indexOf("Bus Line:") == -1)) {
             svuotaLayers();
             }*/
            var centroRicerca;
            if (((selezione == undefined || (selezione != null && selezione.indexOf("COMUNE di") == -1)) && (raggioRicerca == "area" || raggioRicerca == "geo")) || (coordinateSelezione != "" && undefined != coordinateSelezione && coordinateSelezione != "null" && coordinateSelezione != null)) {
                if (raggioRicerca == "area") {
                    var bnds = map.getBounds()
                    centroRicerca = bnds.getSouth() + ";" + bnds.getWest() + ";" + bnds.getNorth() + ";" + bnds.getEast();
                }
                else if (raggioRicerca == "geo") {
                    centroRicerca = "geo:" + $("#geosearch").val();
                }
                else if (coordinateSelezione == "Posizione Attuale") {
                    // SE HO RICHIESTO LA POSIZIONE ATTUALE ESTRAGGO LE COORDINATE
                    centroRicerca = GPSControl._currentLocation.lat + ";" + GPSControl._currentLocation.lng;
                }
                else if ((selezione.indexOf("Fermata Bus:") != -1) || (selezione.indexOf("Bus Stop:") != -1)) {
                    centroRicerca = coordinateSelezione;
                }
                else if (selezione.indexOf("Coord:") != -1 || selezione.indexOf("Numero Bus:") != -1) {
                    centroRicerca = coordinateSelezione;
                }
                else if ((selezione.indexOf("Servizio:") != -1) || (selezione.indexOf("Service:") != -1)) {
                    centroRicerca = coordinateSelezione;
                }
                else if (selezione.indexOf("point") != -1) {
                    centroRicerca = coordinateSelezione;
                }

                setTimeout(function () {
                    $.ajax({
                        url: ctx + "/ajax/json/count-services.jsp",
                        type: "GET",
                        async: false,
                        dataType: 'json',
                        data: {
                            centroRicerca: centroRicerca,
                            raggioServizi: raggioRicerca,
                            categorie: stringaCategorie,
                            textFilter: textFilter,
                            numeroRisultatiServizi: limitRes,
                            //cat_servizi: tipo_categoria,

                        },
                        success: function (msg) {
                            /*if (mode == "JSON") {
                             $("#body").html(JSON.stringify(msg));
                             }
                             else {*/
                            var i = 0;
                            var j = 0;
                            var k = 0;
                            total = msg.total;
                            //$('#loading').hide();
                            if (msg != null && msg.categories.length > 0) {
                                for (i = 0; i < msg.categories.length; i++) {
                                    for (j = 0; j < catArray2.length; j++) {
                                        if (catArray2[j].name == msg.categories[i].category) {
                                            catArray2[j].y = msg.categories[i].numItem;
                                            catArray2[j].id = msg.categories[i].subCategories;
                                            catArray2[j].dataLabels = (msg.categories[i].numItem / total * 100);

                                            if (catArray2[j].y != 0) {
                                                catArray[k] = catArray2[j];
                                                k = k + 1;
                                            }
                                        }
                                    }

                                }
                                larg = larg + (24 * catArray.length);
                            }

                            //}
                        },
                        error: function (request, status, error) {
                            $('#loading').hide();
                            //console.log(error);
                            //risultatiRicerca(0, 0, 0, 1);
                        },
                        complete: function () {
                            $('#loading').hide();
                            if (total > 0) {
                                $('#chart_dialog').dialog({
                                    'width': larg,
                                    //'minWidth': "500",
                                    //'maxWidth': '800',
                                    'autoResize': false,
                                    'closeOnEscape': true,
                                    'resizable': false,
                                    'draggable': true,
                                    'buttons': [{
                                        'text': 'Show All',
                                        'click': function () {
                                            //$('#chart_dialog').dialog('close');
                                            $('#overMap').hide();
                                            ricercaServizi('categorie', null, null);
                                        }
                                    }],

                                    close: function () {
                                        $('#overMap').hide();
                                    }
                                }).dialogExtend({
                                    "collapsable": true,
                                });
                                $('#overMap').show();
                                // Create the chart
                                $('#chart_container').highcharts({
                                    chart: {
                                        type: 'column',
                                        options3d: {
                                            enabled: true,
                                            alpha: 10,
                                            beta: 21,
                                            depth: 50,
                                            viewDistance: 25
                                        }
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    title: {
                                        text: 'Total number of results: ' + total
                                    },
                                    xAxis: {
                                        type: 'category'
                                    },
                                    yAxis: {
                                        title: {
                                            text: 'Item number for each category'
                                        }
                                    },
                                    legend: {
                                        enabled: false
                                    },
                                    plotOptions: {
                                        column: {
                                            depth: 25
                                        },
                                        series: {
                                            borderWidth: 0,
                                            dataLabels: {
                                                enabled: true,
                                                format: '{y}'
                                            },
                                            cursor: 'pointer',
                                            //pointWidth: 25,
                                            point: {
                                                events: {
                                                    click: function () {
                                                        //$('#chart_dialog').dialog('close');
                                                        $('#overMap').hide();
                                                        var limit = this.y;
                                                        if (limit > 1000)
                                                            limit = 0;
                                                        ricercaServizi('categorie', this.id, limit);
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    tooltip: {
                                        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.dataLabels:.2f}%</b> of total<br/>'
                                    },
                                    series: [{
                                        name: "Class",
                                        colorByPoint: true,
                                        data: catArray

                                    }],
                                });
                            } else {
                                //svuotaLayers();
                                //risultatiRicerca(0, 0, 0, 0);
                                alert('No results found in this area');
                                //ricercaServizi('categorie', null, null);
                            }
                        }
                    });
                }, 0);
            }
            else {
                /* -------------------- CODICE PER RICERCA ISTOGRAMMA PER COMUNE */
                //var nomeComune = $("#elencocomuni").val();
                if (selezione == "" || (selezione != null && selezione.indexOf("COMUNE di") != -1)) {
                    var provincia = $("#elencoprovince").val();
                    var nomeComune = $("#elencocomuni").val();
                    var numeroServizi = 0;

                    setTimeout(function () {
                        $.ajax({
                            url: ctx + "/ajax/json/count-services-in-municipality.jsp",
                            type: "GET",
                            async: true,
                            dataType: 'json',
                            data: {
                                nomeProvincia: provincia,
                                nomeComune: nomeComune,
                                categorie: stringaCategorie,
                                textFilter: textFilter,
                                numeroRisultatiServizi: limitRes,
                                //cat_servizi: tipo_categoria
                            },
                            success: function (msg) {
                                /*if (mode == "JSON") {
                                 $("#body").html(JSON.stringify(msg));
                                 }
                                 else {*/
                                var i = 0;
                                var j = 0;
                                var k = 0;
                                total = msg.total;
                                //$('#loading').hide();
                                if (msg != null && msg.categories.length > 0) {
                                    for (i = 0; i < msg.categories.length; i++) {
                                        for (j = 0; j < catArray2.length; j++) {
                                            if (catArray2[j].name == msg.categories[i].category) {
                                                catArray2[j].y = msg.categories[i].numItem;
                                                catArray2[j].id = msg.categories[i].subCategories;
                                                catArray2[j].dataLabels = (msg.categories[i].numItem / total * 100);

                                                if (catArray2[j].y != 0) {
                                                    catArray[k] = catArray2[j];
                                                    k = k + 1;
                                                }
                                            }
                                        }

                                    }
                                    larg = larg + (24 * catArray.length);
                                }

                                //}
                            },
                            error: function (request, status, error) {
                                $('#loading').hide();
                                //console.log(error);
                                //risultatiRicerca(0, 0, 0, 1);
                            },
                            complete: function () {
                                $('#loading').hide();
                                if (total > 0) {
                                    $('#chart_dialog').dialog({
                                        'width': larg,
                                        //'minWidth': "500",
                                        //'maxWidth': '800',
                                        'autoResize': true,
                                        'closeOnEscape': true,
                                        'resizable': false,
                                        'draggable': true,
                                        //'modal': true,
                                        'buttons': [{
                                            'text': 'Show All',
                                            'click': function () {
                                                $('#chart_dialog').dialog('close');
                                                $('#overMap').hide();
                                                ricercaServizi('categorie', null, null);
                                            }
                                        }],
                                        close: function () {
                                            $('#overMap').hide();
                                        }
                                    }).dialogExtend({
                                        "collapsable": true,
                                    });

                                    $('#overMap').show();
                                    // Create the chart
                                    $('#chart_container').highcharts({
                                        chart: {
                                            type: 'column',
                                            options3d: {
                                                enabled: true,
                                                alpha: 10,
                                                beta: 21,
                                                depth: 50,
                                                viewDistance: 25
                                            }
                                        },
                                        credits: {
                                            enabled: false
                                        },
                                        title: {
                                            text: 'Total number of results: ' + total
                                        },
                                        xAxis: {
                                            type: 'category'
                                        },
                                        yAxis: {
                                            title: {
                                                text: 'Item number for each category'
                                            }
                                        },
                                        legend: {
                                            enabled: false
                                        },
                                        plotOptions: {
                                            column: {
                                                depth: 25
                                            },
                                            series: {
                                                borderWidth: 0,
                                                dataLabels: {
                                                    enabled: true,
                                                    format: '{y}'
                                                },
                                                cursor: 'pointer',
                                                point: {
                                                    events: {
                                                        click: function () {
                                                            //$('#chart_dialog').dialog('close');
                                                            $('#overMap').hide();
                                                            ricercaServizi('categorie', this.id, this.y);
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        tooltip: {
                                            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.dataLabels:.2f}%</b> of total<br/>'
                                        },
                                        series: [{
                                            name: "Class",
                                            colorByPoint: true,
                                            data: catArray

                                        }],
                                    });
                                } else {
                                    //svuotaLayers();
                                    //risultatiRicerca(0, 0, 0, 0);
                                    alert('No results found in this area');
                                    //ricercaServizi('categorie', null, null);
                                }
                            }
                        });
                    }, 0);
                }
                else {
                    $('#loading').hide();
                }
            }
        }
    } else {
        alert("Attention, you did not select any resources base for research");
    }
}

function mostraRealTimeData(divInfo, realtime, serviceUri) {
    var html = "";
    var time = "";
    var toTime = "";
    var fromTime = "";
    var k = "";
    if (!("results" in realtime)) {
        $("#" + divInfo).html("<b>No realtime data</b>");
        return;
    }
    html = "<div class=\"sensori\"><table>";
    if (realtime.results.bindings.length == 1) {
        html += "<tr><td><b>Property/Value Type</b></td><td><b>Value</b></td></tr>";
        $.each(realtime.results.bindings[0], function (key, v) {
            if (key == "measuredTime" || key == "instantTime")
                time = v.value;
        });
        toTime = time.substr(0, 19); //remove time zone
        try {
            var t = new Date(time);
            t.setDate(t.getDate() - 30);
            fromTime = "&fromTime=" + encodeURIComponent(t.toISOString().substr(0, 19));
        } catch (e) {
            console.log(e);
        }
        $.each(realtime.results.bindings[0], function (key, v) {
            if (key != "measuredTime" && key != "instantTime") {
                var value = v.value;
                if (typeof value === 'object')
                    value = JSON.stringify(value);
                if (window.configurationData.enableSensorValidation == "true")
                    k = "<a href='" + window.configurationData.sensorValidationUrl + "?serviceUri=" + encodeURIComponent(serviceUri) + "&metric=" + encodeURIComponent(key) + fromTime + "&toTime=" + encodeURIComponent(toTime) + "' target='_blank'>" + key + "</a>";
                else
                    k = key;
                html += "<tr><td>" + k + "</td><td>" + value + (v.valueDate ? " <small>@" + v.valueDate + "</small>" : "") + "</td></tr>";
            }
        });
    } else {
        html += "<tr>";
        for (var v in realtime.head.vars) {
            if (realtime.head.vars[v] != "measuredTime" && realtime.head.vars[v] != "instantTime" && typeof realtime.head.vars[v] == "string")
                html += "<td><b>" + realtime.head.vars[v] + "</b></td>";
        }
        html += "</tr>";
        for (var b in realtime.results.bindings) {
            html += "<tr>";
            $.each(realtime.results.bindings[b], function (key, v) {
                if (key == "measuredTime" || key == "instantTime")
                    time = v.value;
                else {
                    html += "<td>" + v.value + (v.valueDate ? " <small>@" + v.valueDate + "</small>" : "") + "</td>";
                }
            });
            html += "</tr>";
        }
    }
    html += "</table></div><div class=\"aggiornamento\"><span name=\"lbl\" caption=\"last_update\" >Latest Update</span>: " + time + "</div>";
    $("#" + divInfo).html(html);
}

//By Ala
function mapLatLngClick_api(latLngPunto, fndGeo, zoom) {

    $('#approximativeAddress').html("");

    listOfPopUpOpen = [];
    if (ricercaInCorso == false) {
        $('#raggioricerca').prop('disabled', false);
        $('#raggioricerca_t').prop('disabled', false);
        $('#PublicTransportLine').prop('disabled', false);
        $('#nResultsServizi').prop('disabled', false);
        $('#nResultsSensori').prop('disabled', false);
        $('#nResultsBus').prop('disabled', false);
        ricercaInCorso = true;
        // $('#approximativeAddress').html("<img id=\"ajax_loader\" src=\""+ctx+"/img/ajax-loader.gif\" width=\"16\" />");

        approximativeAddress_div = document.getElementById('approximativeAddress');
        var small_tag = document.createElement("SMALL");
        var t = document.createTextNode("Address: ");
        small_tag.appendChild(t);
        approximativeAddress_div.appendChild(small_tag);

        // $('#approximativeAddress').html("<img id=\"ajax_loader\" src=\""+ctx+"img/ajax-loader.gif\" width=\"16\" />");
        var ajax_loader = document.createElement('img');
        ajax_loader.src = ctx + "img/ajax-loader.gif";
        ajax_loader.id = "ajax_loader";
        ajax_loader.width = "16";
        approximativeAddress_div.appendChild(ajax_loader);

        clickLayer.clearLayers();
        clickLayer = L.layerGroup([new L.marker(latLngPunto)]).addTo(map);
        // if (zoom)
        //     map.setView(latLngPunto, zoom);
        coordinateSelezione = latLngPunto.lat + ";" + latLngPunto.lng;
        // var latPunto = new String(latLngPunto.lat);
        // var lngPunto = new String(latLngPunto.lng);
        var latPunto = latLngPunto.lat;
        var lngPunto = latLngPunto.lng;
        // fndGeo = fndGeo ? "true" : "false";
        // alert(fndGeo);
        selezione = 'Coord: ' +latPunto + "," + lngPunto;
        $('#selezione').html(selezione);

        var value = document.getElementById("org_selector").value;
        if (value == "null") {
            // value = superServiceMapApiUrl;
            document.getElementById("org_selector").style.backgroundColor = "red";
            alert('Please, select an organization!');
        } else {
            document.getElementById("org_selector").style.backgroundColor = "white";

        if (value == superServiceMapApiUrl) {
            selectedorgUrl = value;
        } else {
            seperator = value.indexOf("|");
            selectedorgUrl = value.substring(0, seperator);
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", selectedorgUrl + "location/?position=" + latLngPunto.lat + ";" + latLngPunto.lng + "&intersectGeom=true", true);

        // When response is ready
        xhr.onload = function () {
            if (this.status === 200) {
                obj = JSON.parse(this.responseText);
                var address = `${obj.address}`;
                var number = `${obj.number}`;
                var province = `${obj.province}`;
                var municipality=`${obj.municipality}`;
                var municipalityUri=`${obj.municipalityUri}`;
                var addressUri = `${obj.addressUri}`;

                if (address != 'undefined') {
                    address = address + (number != 'undefined' ? ", " + number : "");
                    address = address + (province != 'undefined' ? ", " + province : "");
                }
                else {
                    address = "";
                    addressUri = `${obj.municipalityUri}`;
                }

                if (address != '') {

                    approximativeAddress_div = document.getElementById('approximativeAddress');
                    var ajax_loader_gif = document.getElementById("ajax_loader");
                    
                    if(ajax_loader_gif!=undefined)
                        ajax_loader_gif.remove();

                    var sp_actualAddress = document.createElement("span");                 // Create a span node 
                    sp_actualAddress.id = "actualAddress";
                    approximativeAddress_div.appendChild(sp_actualAddress);

                    var a = document.createElement('a');
                    var linkText = document.createTextNode(address);
                    a.appendChild(linkText);
                    a.title = address + ", " + number + ", " + province;
                    a.href = "http://log.disit.org/service/?sparql=http://servicemap.disit.org/WebAppGrafo/sparql&uri=" + addressUri;
                    a.target = "_blank";
                    sp_actualAddress.appendChild(a);

                    var br = document.createElement('br');                                 // Add br
                    approximativeAddress_div.appendChild(br);

                    var pfh_btn = document.createElement("BUTTON");                         // Create a <button> element
                    pfh_btn.innerHTML = "Path from here";                                   // Insert text
                    pfh_btn.id = "startpathsearch";                                         // Insert text
                    pfh_btn.style.margin = "10px 10px 10px 0px";
                    pfh_btn.onclick = function () { setStartSearchPath(latLngPunto.lat, latLngPunto.lng) };                   // Insert text
                    approximativeAddress_div.appendChild(pfh_btn);                          // Append <button> to <body>

                    var pth_btn = document.createElement("BUTTON");                         // Create a <button> element
                    pth_btn.innerHTML = "Path to here";                                     // Insert text
                    pth_btn.id = "endpathsearch";                                           // Insert text
                    pth_btn.style.margin = "10px 10px 10px 0px";
                    pth_btn.onclick = function () { setEndSearchPath(latLngPunto.lat, latLngPunto.lng) };                   // Insert text
                    approximativeAddress_div.appendChild(pth_btn);                          // Append <button> to <body>

                    var sg_btn = document.createElement("BUTTON");                          // Create a <button> element
                    sg_btn.innerHTML = "Search Geometry";                                   // Insert text
                    sg_btn.style.backgroundColor = "#c3caf9";

                    sg_btn.onclick = function () { mapLatLngClick_api(L.latLng(latLngPunto.lat, latLngPunto.lng), true, zoom) };        // Insert text
                    approximativeAddress_div.appendChild(sg_btn);                           // Append <button> to <body>

                    var br1 = document.createElement('br');                                 //Add br
                    approximativeAddress_div.appendChild(br1);

                    var intersects = obj.intersect;

                    if (fndGeo & intersects != null) {

                        var intersect_div = document.createElement("BUTTON");                // Create a <button> element
                        intersect_div.id = "intersect";
                        intersect_div.style.maxHeight = "64px";
                        intersect_div.style.overflow = "auto";
                        approximativeAddress.appendChild(intersect_div);

                        for (var i = 0; i < intersects.length; i++) {
                            var intersect = intersects[i];
                            var name = intersect.name;
                            if (intersect.agency != null || intersect.agency != 'undefined') {
                                name += " - " + intersect.agency;
                            }
                            var logEndPoint = "http://log.disit.org/service/?sparql=http://servicemap.disit.orgsparql&uri=";
                            var distance = intersect.distance.toString();

                            if (intersect.agency == null || intersect.agency == 'undefined') {

                                var sm_elem = document.createElement("SMALL");                // Create a <small> element
                                var t = document.createTextNode(intersect.class.replace("http://www.disit.org/km4city/schema#", "").replace("http://vocab.gtfs.org/terms#", "") + ":");
                                sm_elem.appendChild(t);
                                intersect_div.appendChild(sm_elem);

                                var a_elem = document.createElement("a");                // Create an a element
                                a_elem.innerHTML = '<a target="_blank" href="' + logEndPoint + intersect.uri + '">' + intersect.name + '</a>';
                                intersect_div.appendChild(a_elem);

                                var dot_index = distance.indexOf('.');
                                intersect_div.innerHTML += " (dist:" + distance.slice(0, dot_index + 5) + ")";

                                var br1 = document.createElement('br');                                 //Add br
                                intersect_div.appendChild(br1);

                            } else {

                                var sm_elem = document.createElement("SMALL");                // Create a <small> element
                                var t = document.createTextNode(intersect.class.replace("http://www.disit.org/km4city/schema#", "").replace("http://vocab.gtfs.org/terms#", ""));
                                sm_elem.appendChild(t);
                                sm_elem.style.position = 'relative';
                                sm_elem.style.left = '-34px';
                                intersect_div.appendChild(sm_elem);

                                var a_elem = document.createElement("a");                // Create an a element
                                a_elem.innerHTML = '<a href="#" onclick="showLinea("",' + intersect["uri"] + "','" + intersect.direction + "','" + intersect.name + ')\>' + intersect.name + '</a>';
                                a_elem.style.position = 'relative';
                                a_elem.style.left = '-32px';
                                intersect_div.appendChild(a_elem);

                                var dot_index = distance.indexOf('.');
                                intersect_div.innerHTML += " (dist:" + distance.slice(0, dot_index + 5) + ")";

                                var br1 = document.createElement('br');                                 //Add br
                                intersect_div.appendChild(br1);
                            }
                        }
                    }
                    
                } else {
                    if(province != 'undefined'){
                    $('#approximativeAddress').html("Address: "+province+", "+municipality);
                    }else{
                     $('#approximativeAddress').html("Address not found!");
                    }
                    ricercaInCorso = false;
                }
            } else {
                $('#approximativeAddress').html("Address: ERROR");
                ricercaInCorso = false;
            }
        }
        xhr.send();
    }
    }
    ricercaInCorso = false;
}

function isLat(lat) {
    return isFinite(lat) && Math.abs(lat) <= 90;
  }
  
  function isLong(lng) {
    return isFinite(lng) && Math.abs(lng) <= 180;
  }

function quickSearchCheck(request, response) {

    var position = $("#quick-search-position").val();

    if(position==""){
        quickSearch(position,request, response);
    }else{

        let semiColIndex = position.indexOf(";");

        if(semiColIndex==-1){
            alert("Please, enter a valid position!");
        }else{

        var lat = position.substring(0, semiColIndex);
        var lon = position.substring(semiColIndex+1, position.length);

        var isLatitude=isLat(lat);
        var isLongitude=isLong(lon);

        if(isLatitude && isLongitude){
            quickSearch(position,request, response);
        }else{
            alert("Please, enter a valid position!");
        }
    }
    }
}

function quickSearch(position,request, response){

    document.getElementById('saveAddressSearch').removeAttribute('disabled','disabled');
    document.getElementById('saveAddressSearch').src="img/save_enable.png";
    document.getElementById('saveAddressSearch').style.cursor="pointer";  

    var excludePOI = $("#quick-search-poi").is(':checked');
    var searchMode = $("#quick-search-and").is(':checked') ? "AND" : "";
    var categories = $("#quick-search-categories").val();
    var sortByDist = $("#quick-search-sortdist").is(':checked');
    var maxDists = $("#quick-search-maxdists").val();

    var myData = {};

    adressSearchText=request.term;
    myData['search'] =  request.term;
    myData['maxResults'] = 20;
    myData['excludePOI'] = excludePOI;
    myData['searchMode'] = searchMode;
    myData['categories'] = categories;
    myData['sortByDistance'] = sortByDist;

    if(maxDists!="")
        myData['maxDists'] = maxDists;

    if(position!="")
        myData['position'] = position;
        
    $.ajax({
        // , "accessToken": msm_access_token
        // url: ctx+"/ajax/json/search-location.jsp",
        url: selectedorgUrl + ctx + "location/",
        type: "GET",
        // data: { "search": request.term, "maxResults": 20, "excludePOI": excludePOI, "searchMode": searchMode, "categories": categories, "position": position, "sortByDistance": sortByDist, "maxDists": maxDists },
        data:myData,
        async: true,
        // headers: {'Authorization':'Bearer '+msm_access_token},
        dataType: 'json',
        success: function (data) {
            var r = data.features;
            for (var i = 0; i < r.length; i++)
                if (r[i].properties.serviceType == "StreetNumber")
                    r[i].label = r[i].properties.address + ", " + r[i].properties.civic + ", " + r[i].properties.city;
                else if (r[i].properties.serviceType == "Municipality")
                    r[i].label = r[i].properties.city;
                else
                    r[i].label = r[i].properties.name + " - " + r[i].properties.city;

            response(r);
        },
        error: function () {
            response(['error']);
        }
    });
}

function quickSearchSelect(event, ui) {
    console.log("quickSearch select: " + ui.item.properties.serviceUri);
    var latlng = new L.LatLng(ui.item.geometry.coordinates[1], ui.item.geometry.coordinates[0]);
    mapLatLngClick_api(latlng, true, 17);
}
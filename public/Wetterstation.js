var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com or http://localhost:3001
var Temperatur, Luftfeuchtigkeit, Luftdruck;

// initialise server-sent events
function initSSE() {
    if (typeof (EventSource) !== "undefined") {
        var url = rootUrl + "/api/events";
        var source = new EventSource(url);
        source.onmessage = (event) => {
            updateVariables(JSON.parse(event.data));
        };
    } else {
        alert("Your browser does not support server-sent events.");
    }
}
initSSE();

function updateVariables(data) {
    
    if (data.eventName === "Temperatur") {
        document.getElementById("temperatur").innerHTML = Math.round(data.eventData*100)/100;
        Temperatur = Number(data.eventData);
        addData(Temperatur);
        addData2(Temperatur);
    }
    if (data.eventName === "Luftfeuchtigkeit") {
        document.getElementById("feuchtigkeit").innerHTML = Math.round(data.eventData*100)/100;
        Luftfeuchtigkeit = Number(data.eventData);
        addData3(Luftfeuchtigkeit);
    }
    if (data.eventName === "Luftdruck") {
        document.getElementById("luftdruck").innerHTML = Math.round(data.eventData*100)/100;
        Luftdruck = Number(data.eventData);
        addData4(Luftdruck);
    }
    if (data.eventName === "KissenRein") {
        document.getElementById("KissenRein").innerHTML = data.eventData;
    }
    if (data.eventName === "WetterVeraenderung") {
        document.getElementById("WetterVeraenderung").innerHTML = data.eventData;
    }
    if (data.eventName === "WetterWarnung") {
        document.getElementById("WetterWarnung").innerHTML = data.eventData;
    }
    if (data.eventName === "PflanzenGiessen") {
        document.getElementById("PflanzenGiessen").innerHTML = data.eventData;
    }
}

var chartData, chartOptions, chart;
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    // Daten mit dem Dummy-Wert ["", 0] initialisieren. (Dieser Dummy-Wert ist n??tig, damit wir das Chart schon anzeigen k??nnen, bevor wir Daten erhalten. Es k??nnen keine Charts ohne Daten gezeichnet werden.)
    chartData = google.visualization.arrayToDataTable([['Time', 'Temperatur'], ["", 0]]);
    // Chart Options festlegen
    chartOptions = {
        title: 'Verlauf der Temperatur',
        hAxis: { title: 'Time' },
        vAxis: { title: 'Temperatur' },
        boxStyle: {
            // Color of the box outline.
            stroke: '#ADD8E6'},
        animation: {
            duration: 300, // Dauer der Animation in Millisekunden
            easing: 'out',
        },
        curveType: 'function', // Werte als Kurve darstellen (statt mit Strichen verbundene Punkte)
        legend: 'none',
        vAxis: {
            // Range der vertikalen Achse
            viewWindow: {
                min: -30,
                max: 70,
            },
        }
    };
    // LineChart initialisieren
    chart = new google.visualization.LineChart(document.getElementById('wetterdaten'));
    chartData.removeRow(0); // Workaround: ersten (Dummy-)Wert l??schen, bevor das Chart zum ersten mal gezeichnet wird.
    chart.draw(chartData, chartOptions); // Chart zeichnen
}

function addData(Temperatur) {
    
    var date = new Date();
    var localTime = date.toLocaleTimeString();
    chartData.addRow([localTime, Temperatur]);
    chart.draw(chartData, chartOptions);
}

function addData2(Temperatur){

    TemperatureData.setValue(0,1,Math.round(Temperatur));
    TemperatureChart.draw(TemperatureData, optionsTemperature);
}

function addData3(Luftfeuchtigkeit){

    FeuchtigkeitsData.setValue(0,1,Math.round(Luftfeuchtigkeit));
    FeuchtigkeitsChart.draw(FeuchtigkeitsData, optionsFeuchtigkeit);
}

function addData4(Luftdruck){

    hpaData.setValue(0,1,Math.round(Luftdruck));
    hpaChart.draw(hpaData, optionshpa);
}

var TemperatureData, TemperatureChart, optionsTemperature;
google.charts.load('current', {'packages':['gauge']});
google.charts.setOnLoadCallback(drawTemperatureChart);

function drawTemperatureChart() {

    TemperatureData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Temperatur', 0],
      ]);

    optionsTemperature = {
      width: 450, height: 135,
      redFrom: 30, redTo: 60,
      yellowFrom:20, yellowTo: 30,
      minorTicks: 5,
      max: 60, min: -20
    };

    TemperatureChart = new google.visualization.Gauge(document.getElementById('tempAnzeige'));
    TemperatureChart.draw(TemperatureData, optionsTemperature);
  }

  var FeuchtigkeitsData, FeuchtigkeitsChart, optionsFeuchtigkeit;
  google.charts.load('current', {'packages':['gauge']});
  google.charts.setOnLoadCallback(drawFeuchtigkeitsChart);

  function drawFeuchtigkeitsChart() {

    FeuchtigkeitsData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Feuchtigkeit', 0],
      ]);

    optionsFeuchtigkeit = {
      width: 450, height: 135,
      greenFrom: 30, greenTo: 100,
      redFrom: 0, redTo: 30,
      minorTicks: 5,
      max: 100, min: 0
    };

    FeuchtigkeitsChart = new google.visualization.Gauge(document.getElementById('feuchtigkeitsAnzeige'));
    FeuchtigkeitsChart.draw(FeuchtigkeitsData, optionsFeuchtigkeit);
  }


  var hpaData, hpaChart, optionshpa;
  google.charts.load('current', {'packages':['gauge']});
  google.charts.setOnLoadCallback(drawhpaChart);

  function drawhpaChart() {

    hpaData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['hpa', 950],
      ]);

    optionshpa = {
      width: 450, height: 135,
      greenFrom: 950, greenTo: 1000,
      minorTicks: 5,
      max: 1000, min: 900
    };

    hpaChart = new google.visualization.Gauge(document.getElementById('hpaAnzeige'));
    hpaChart.draw(hpaData, optionshpa);
  }


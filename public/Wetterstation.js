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
        document.getElementById("temperatur").innerHTML = data.eventData;
        Temperatur = Number(data.eventData);
        addData(Temperatur);
        addData2(Temperatur);
    }
    if (data.eventName === "Luftfeuchtigkeit") {
        document.getElementById("feuchtigkeit").innerHTML = data.eventData;
        Luftfeuchtigkeit = Number(data.eventData);
    }
    if (data.eventName === "Luftdruck") {
        document.getElementById("luftdruck").innerHTML = data.eventData;
        Luftdruck = Number(data.eventData);
    }
}

var chartData, chartOptions, chart;
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    // Daten mit dem Dummy-Wert ["", 0] initialisieren. (Dieser Dummy-Wert ist nötig, damit wir das Chart schon anzeigen können, bevor wir Daten erhalten. Es können keine Charts ohne Daten gezeichnet werden.)
    chartData = google.visualization.arrayToDataTable([['Time', 'Temperatur'], ["", 0]]);
    // Chart Options festlegen
    chartOptions = {
        title: 'Verlauf der Temperatur',
        hAxis: { title: 'Time' },
        vAxis: { title: 'Temperatur' },
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
    chartData.removeRow(0); // Workaround: ersten (Dummy-)Wert löschen, bevor das Chart zum ersten mal gezeichnet wird.
    chart.draw(chartData, chartOptions); // Chart zeichnen
}

// Eine neuen Wert ins Chart 1 hinzufügen
function addData(Temperatur) {
    
    var date = new Date();
    var localTime = date.toLocaleTimeString();
    chartData.addRow([localTime, Temperatur]);
    chart.draw(chartData, chartOptions);
}

function addData2(Temperatur){

    TemperatureData = google.visualization.arrayToDataTable([['Temperatur', Temperatur]]);
    chart.draw(TemperatureData, optionsTemperature);

}

var TemperatureData, optionsTemperature;
google.charts.load('current', {'packages':['gauge']});
google.charts.setOnLoadCallback(drawTemperatureChart);

function drawTemperatureChart() {

    TemperatureData = google.visualization.arrayToDataTable([
      ['Label', 'Value'],
      ['Temperatur', 0],
    ]);

    optionsTemperature = {
      width: 400, height: 120,
      redFrom: 30, redTo: 60,
      yellowFrom:20, yellowTo: 30,
      minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('examplechart'));
    chart.draw(TemperatureData, optionsTemperature);
  }
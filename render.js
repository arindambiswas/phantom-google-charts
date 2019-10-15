var system = require('system');
var page = require('webpage').create();
var WAIT_FOR_RENDER_INTERVAL = 5000;
var PROCESS_TIMEOUT = 8000;

page.onConsoleMessage = function (msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');

    if (msg === 'Google.chart.ready') {
        window.ischartready = true;
    }
};

var chartData;

page.open('http://adminv4dev.productious.com/phantom-google-charts/chartData.json', function () {

    var jsonSource = page.plainText;
    chartData = JSON.parse(jsonSource);
    console.log('json loaded', jsonSource);

//phantom.exit();

    page.open('chart.html', function() {

        page.evaluate(function (chartData) {

            console.log('Evaluate : ', chartData);
            function chartReadyCallback() {
                console.log('Google.chart.ready');
            }

            function drawRegionsMap() {
                var data = google.visualization.arrayToDataTable(chartData.data);
                var options = {
                    width: 400,
                    height: 200
                };
                var chart = new google.visualization
                    .GeoChart(document.getElementById('chart_div'));
                chart.draw(data, options);
                google.visualization.events.addListener(chart, 'ready', chartReadyCallback);
            };

            drawRegionsMap();
        }, chartData);
    
        timeoutTime = PROCESS_TIMEOUT;
        interval = window.setInterval(function () {
            console.log('waiting');
            if (window.ischartready) {
                clearTimeout(timer);
                clearInterval(interval);
                page.paperSize = { format: 'A4', orientation: 'landscape' };
                page.render(system.args[1]);
                phantom.exit();    
            }
        }, 50);
    
        // we have a timeoutTime second timeframe..
        timer = window.setTimeout(function () {
            clearInterval(interval);
            exitCallback('ERROR: While rendering, there\'s is a timeout reached');
            phantom.exit();
        }, timeoutTime);
    
    });

});



# Bandwidth Usage Tracker
This package helps you to track the bandwidth usage of the AJAX requests processed by your application.

It's a wrapper around [axios](https://www.npmjs.com/package/axios) which is a popular Promise based HTTP client for hadling AJAX request.

# Installing
Using npm:
```
npm install bandwidth-usage-tracker
npm install axios
```

# Example
```
import bandwidthMonitor from bandwidth-usage-tracker;
const axios = require('axios').default;


var bandwidthMonitorLog = [];
const updateBandwidthMonitorLog = function( log ) {
    bandwidthMonitorLog.push( log );
};

const form = document.getElementById("form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    let config = {
        url: '/',
        method: 'post',
        data: { title: 'Testing' },
        bandwidthMonitorOnFinish: updateBandwidthMonitorLog,
    };

    bandwidthMonitor( axios, config )
        .then(function( response ) {
            console.log( { response } );
        })
        .catch(function( error ) {
            console.log( { error } );
        })
        .finally(function() {
            console.log( 'bandwidthMonitorLog', { bandwidthMonitorLog } );
        });
});
```
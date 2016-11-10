'use strict'; // jshint node: true, browser: false, esnext: true
var express     = require('express');
var httpProxy   = require('http-proxy');
var btoa        = require('btoa');

// Create server & proxy
var app    = express();
var proxy  = httpProxy.createProxyServer({});


var apiUrl = process.env.API_URL || 'https://api.cbd.int:443';

var env={};
if(process.argv[2] === 'dev'){
    env.name ='dev',
    env.accounts='accounts.cbddev.xyz';
    env.base='cbddev.xyz';
    env.apiUrl='https://api.cbddev.xyz:443';
    apiUrl = process.env.API_URL || env.apiUrl;
} else if (!process.argv[2] || process.argv[2] === 'staging'){
    env.name ='staging'
    env.accounts='accounts.staging.cbd.int';
    env.base='staging.cbd.int';
    env.apiUrl='https://api.staging.cbd.int:443';
    apiUrl = env.apiUrl=process.env.API_URL || env.apiUrl;
}

// set localhost api with second param === localApi
if(process.argv[3]==='localApi')
  apiUrl = env.apiUrl  = process.env.API_URL || 'http://localhost:8000';


if(!process.env.API_URL && !apiUrl) {
    console.error("WARNING: evironment API_URL not set. USING default (https://api.cbd.int:443) ");
}
console.log("API url: ", apiUrl);
console.log("Accounts set to: ", env.accounts);
console.log("Base url set to: ", env.base);

// Configure options

app.use(require('morgan')('dev'));
app.use(function(req, res, next) {  if(req.url.indexOf(".geojson")>0) res.contentType('application/json'); next(); } ); // override contentType for geojson files

// Configure static files to serve

app.use('/favicon.png',   express.static(__dirname + '/app/images/favicon.png', { maxAge: 24*60*60*1000 }));
app.use('/app',           express.static(__dirname + '/app'/*,                    { maxAge: 5*60*1000 }*/));
app.all('/app/*',         function(req, res) { res.status(404).send(); } );

app.get('/doc/*', function(req, res) { proxy.web(req, res, { target: "https://www.cbd.int:443", secure: false } ); } );
app.all('/doc/*', function(req, res) { res.status(404).send(); } );

// Configure routes
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: apiUrl, secure: false, changeOrigin:true } ); } );

// Configure template(s)

app.get('/reports/map*', function(req, res) { res.cookie('VERSION', process.env.COMMIT||''); res.sendFile(__dirname + '/app/views/reports/template.html', { maxAge : 5*60*1000 }); });
app.get('/*',            function(req, res) { res.cookie('environment', btoa(JSON.stringify(env))); res.cookie('VERSION', process.env.COMMIT||''); res.sendFile(__dirname + '/app/template.html',               { maxAge : 5*60*1000 }); });
app.all('/*',            function(req, res) { res.status(404).send(); } );

// START HTTP SERVER

app.listen(process.env.PORT || 2000, '0.0.0.0', function(){
    console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});

process.on('SIGTERM', ()=>process.exit());
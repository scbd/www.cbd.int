'use strict'; // jshint node: true, browser: false, esnext: true
var express     = require('express');
var httpProxy   = require('http-proxy');

// Create server & proxy
var app    = express();
var proxy  = httpProxy.createProxyServer({});

if(!process.env.API_URL) {
    console.error("WARNING: evironment API_URL not set. USING default (https://api.cbd.int:443) ");
}

var apiUrl = process.env.API_URL || 'https://api.cbd.int:443';

console.log("API url: ", apiUrl);

// Configure options

app.use(require('morgan')('dev'));
app.use(function(req, res, next) {  if(req.url.indexOf(".geojson")>0) res.contentType('application/json'); next(); } ); // override contentType for geojson files

// Configure static files to serve

app.use('/app/images/p03qv92p.jpg', express.static(__dirname + '/app/images/p03qv92p.jpg',{ maxAge: 365*24*60*60*1000 }));

app.use('/favicon.png',   express.static(__dirname + '/app/images/favicon.png', { maxAge: 24*60*60*1000 }));
app.use('/app',           express.static(__dirname + '/app'/*,                    { maxAge: 5*60*1000 }*/));
app.all('/app/*',         function(req, res) { res.status(404).send(); } );

app.get('/doc/*', function(req, res) { proxy.web(req, res, { target: "https://www.cbd.int:443", secure: false } ); } );
app.all('/doc/*', function(req, res) { res.status(404).send(); } );

// Configure routes
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: apiUrl, secure: false, changeOrigin:true } ); } );

// Configure template(s)

app.get('/reports/map*', function(req, res) { res.cookie('VERSION', process.env.COMMIT||''); res.sendFile(__dirname + '/app/views/reports/template.html', { maxAge : 5*60*1000 }); });
app.get('/*',            function(req, res) { res.cookie('VERSION', process.env.COMMIT||''); res.sendFile(__dirname + '/app/template.html',               { maxAge : 5*60*1000 }); });
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

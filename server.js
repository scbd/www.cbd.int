/* jshint node: true, browser: false */
'use strict';

var express     = require('express');
var httpProxy   = require('http-proxy');

// Create server & proxy
var app    = express();
var proxy  = httpProxy.createProxyServer({});

// Configure options

var trustedProxies = [ "52.6.60.249", "54.84.233.250", "52.74.118.238", "52.28.21.144", "52.7.14.126" ];

if(trustedProxies) {
    console.log('trusted proxies:', trustedProxies);
    app.set('trust proxy', trustedProxies.join(', '));
}

app.use(require('morgan')('dev'));
app.use(function(req, res, next) {  if(req.url.indexOf(".geojson")>0) res.contentType('application/json'); next(); } ); // override contentType for geojson files

// Configure static files to serve

app.use('/favicon.png',   express.static(__dirname + '/app/images/favicon.png', { maxAge: 24*60*60*1000 }));
app.use('/app',           express.static(__dirname + '/app',                    { maxAge: 5*60*1000 }));
app.all('/app/*',         function(req, res) { res.status(404).send(); } );

app.get('/doc/*', function(req, res) { proxy.web(req, res, { target: "https://www.cbd.int:443", secure: false } ); } );
app.all('/doc/*', function(req, res) { res.status(404).send(); } );

// Configure routes

app.all('/api/*', function(req, res) { proxy.web(req, res, { target: "https://api.cbd.int:443", secure: false } ); } );

// Configure template(s)

app.get('/reports/map*', function(req, res) { res.sendFile(__dirname + '/app/views/reports/template.html', { maxAge : 5*60*1000 }); });
app.get('/insession/*',  function(req, res) { res.sendFile(__dirname + '/app/template.html',               { maxAge : 5*60*1000 }); });
app.get('/decisions/x',  function(req, res) { res.sendFile(__dirname + '/app/template.html',               { maxAge : 5*60*1000 }); });
app.all('/*',            function(req, res) { proxy.web(req, res, { target: 'https://www.cbd.int:443', secure: false } ); } );

// START HTTP SERVER

app.listen(process.env.PORT || 2000, '0.0.0.0', function(){
    console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (e) {
    console.error('proxy error:', e);
});

// //============================================================
// //
// //
// //============================================================
// function getRestrictedFile(req, res) {
//
//     var filePath = path.join(process.env.HOME, 'doc', req.path.substr("/doc/no-cache/".length));
//
//     return FS.exists(filePath).then(function(exists){
//
//         if(!exists)
//             throw { code: 404 };
//
//         return superAgentq.get(apiBaseUrl+'/api/v2014/meetings/cop-12/securities/canDownloadRestricted').
//                            set('X-Forwarded-For', req.ip).
//                            set("badge", req.get("badge")||"").
//                            end();
//
//     }).then(function(result){
//
//         if(result.statusCode!=200)
//             throw { code: 500, data : res.body };
//
//         return result.body;
//
//     }).then(function(authorization) {
//
//         console.log(authorization);
//
//         if(!authorization || !authorization.allow)
//             throw { code : 403 };
//
//         res.sendFile(filePath);
//
//     }).catch(function(error){
//
//         console.error(error);
//
//         if(error && error.code) res.sendStatus(error.code);
//         else                    res.sendStatus(500);
//
//     });
// }

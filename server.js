/* jshint node: true, browser: false */
'use strict';
// LOG UNHANDLED EXCEPTION AND EXIT
process.on('uncaughtException', function (err) {
  console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//var FS          = require("q-io/fs");
var path        = require('path');
var http        = require('http');
var express     = require('express');
var httpProxy   = require('http-proxy');
//var superAgentq = require('superagent-promise');

var config      = {
    "public_url": "http://54.211.181.151",
    "trustedProxies" : ["loopback", "69.90.183.226"]
};

var apiBaseUrl  = (config.api||{}).baseUrl || 'https://api.cbd.int:443';

console.log("API BaseUrl", apiBaseUrl);

// Create server & proxy

var app    = express();
var server = http.createServer(app);
var proxy  = httpProxy.createProxyServer({});

// Configure options

if(config.trustedProxies) {
    console.log('trusted proxies:', config.trustedProxies);
    app.set('trust proxy', config.trustedProxies.join(', '));
}

app.use(require('morgan')('dev'));
app.use(require('compression')({ threshold: 512 }));
app.use(function(req, res, next) {

    if(req.url.indexOf(".geojson")>0)
        res.contentType('application/json');
    next();

});
// Configure static files to serve

app.use('/favicon.png',   express.static(__dirname + '/app/images/favicon.png', { maxAge: 86400000 }));
//app.use('/app',           express.static(__dirname + '/app-built', { maxAge: 300000 })); //5 minutes
app.use('/app',           express.static(__dirname + '/app',       { maxAge: 300000 })); //5 minutes

// app.get('/doc/no-cache/cop12/insession/restricted.json',  getRestrictedFile);
// app.get('/doc/no-cache/npmop1/insession/restricted.json', getRestrictedFile);
// app.use('/doc/no-cache/', express.static(path.join(process.env.HOME, 'doc')));
app.get('/doc/*',         function(req, res) { res.sendStatus(404); } );

// Configure routes

app.get('/app/*', function(req, res) { res.sendStatus(404); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: apiBaseUrl, secure: false } ); } );

// Configure template

app.get('/printsmart*',  function(req, res) { res.sendFile(__dirname + '/app/views/print-smart/template.html', {maxAge:300000}); });
app.get('/reports/map*', function(req, res) { res.sendFile(__dirname + '/app/views/reports/template.html',     {maxAge:300000}); });
app.get('/*',            function(req, res) { res.sendFile(__dirname + '/app/template.html',                   {maxAge:300000}); });

// app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://www.cbd.int:443', secure: false } ); } );

// LOG PROXY ERROR & RETURN http:500

proxy.on('error', function (e, req, res) {
    console.error(new Date().toUTCString() + ' error proxying: '+req.url);
    console.error('proxy error:', e);
    res.send( { code: 500, source:'www.infra/proxy', message : 'proxy error', proxyError: e }, 500);
});

// START HTTP SERVER

server.listen(process.env.PORT || 8000, '0.0.0.0');
server.on('listening', function () {
	console.log('Server listening on %j', this.address());
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

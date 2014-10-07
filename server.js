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

var path        = require('path');
var http        = require('http');
var express     = require('express');
var httpProxy   = require('http-proxy');

// Create server & proxy

var app    = express();
var server = http.createServer(app);
var proxy  = httpProxy.createProxyServer({});

// Configure options

app.use(require('morgan')('dev'));
app.use(require('compression')({ threshold: 512 }));

// Configure static files to serve

app.use('/favicon.png',   express.static(__dirname + '/app/images/favicon.png', { maxAge: 86400000 }));
app.use('/app',           express.static(__dirname + '/app', { maxAge: 300000 })); //5 minutes
app.use('/doc/no-cache/', express.static(path.join(process.env.HOME, 'doc')));
app.get('/doc/*',         function(req, res) { res.send('404', 404); } );

// Configure routes

app.get('/app/*', function(req, res) { res.send('404', 404); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );

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

server.listen(process.env.PORT || 8001, '0.0.0.0');
server.on('listening', function () {
	console.log('Server listening on %j', this.address());
});

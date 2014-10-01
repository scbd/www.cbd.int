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

var path      = require('path');
var http      = require('http');
var express   = require('express');
var httpProxy = require('http-proxy');


// Create server & proxy

var app = express(),
  server = http.createServer(app),
  proxy  = httpProxy.createProxyServer({});

// Configure options

app.use(express.logger('dev'));
app.use(express.compress());

app.configure('development', function() {
//  app.use(require('connect-livereload')());
});
// Configure static files to serve

app.use('/favicon.png', express.static(__dirname + '/app/images/favicon.png', { maxAge: 86400000 }));
app.use('/app', express.static(__dirname + '/app'));
app.use(  '/doc/no-cache/', express.static(path.join(process.env.HOME, 'doc')));
app.use('/~/doc/no-cache/', express.static(path.join(process.env.HOME, 'doc')));

// Configure routes

app.get('/app/*', function(req, res) { res.send('404', 404); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.all('/doc/*', function(req, res) { proxy.web(req, res, { target: 'http://www.cbd.int',    secure: false } ); } );

// Configure template

app.get('/printsmart*',  function sendTemplate(req, res) { res.sendfile(__dirname + '/app/views/print-smart/template.html'); });
app.get('/reports/map*', function sendTemplate(req, res) { res.sendfile(__dirname + '/app/views/reports/template.html'); });
app.get('/*', sendTemplate);

// Configure proxy to legacy website
// app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://us1.lb.infra.cbd.int:443', secure: false } ); } );

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

function sendTemplate(req, res) {
  res.sendfile(__dirname + '/app/template.html');
}

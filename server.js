/* jshint node: true, browser: false */
'use strict';

var fs = require('fs'),
  http = require('http'),
  express = require('express'),
  httpProxy = require('http-proxy');

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

// Configure routes

app.get('/app/*', function(req, res) { res.send('404', 404); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int', secure: false } ); } );

// Configure template

app.get('/internal/printsmart*', function sendTemplate(req, res) { res.sendfile(__dirname + '/app/views/print-smart/template.html'); });
app.get('/national-reports',     sendTemplate);

// Configure proxy to legacy website

app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://us1.lb.infra.cbd.int', secure: false } ); } );

// Start server

server.listen(process.env.PORT || 8001, '0.0.0.0');

server.on('listening', function () {
	console.log('Server listening on %j', this.address());
});

function sendTemplate(req, res) {
  res.sendfile(__dirname + '/app/template.html');
}
'use strict';

var fs = require('fs');
var http = require('http');
var express = require('express');
var httpProxy = require('http-proxy');

// Create server & proxy

var app    = express();
var server = http.createServer(app);
var proxy  = httpProxy.createProxyServer({});

app.configure(function() {

    app.use(express.logger('dev'));
    app.use(express.compress());

    app.use('/app', express.static(__dirname + '/app'));
    app.use('/favicon.png', express.static(__dirname + '/app/images/favicon.png', { maxAge: 86400000 }));
});

// Configure routes

app.get('/app/*', function(req, res) { res.send('404', 404); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int', secure: false } ); } );
app.all('/*', function(req, res) { proxy.web(req, res, { target: 'http://us1.lb.infra.cbd.int', secure: false } ); } );

// Configure template file

app.get('/*', function(req, res) {
	fs.readFile(__dirname + '/app/template.html', 'utf8', function (error, text) {
		res.send(text);
	});
});

// Start server

server.listen(2060, '127.0.0.1');

server.on('listening', function () {
	console.log('Server listening on %j', this.address());
});
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

// Configure template

app.get('/reports/test', sendTemplate);
app.get('/reports/test1', sendTemplate);
app.get('/reports/test2', sendTemplate);
app.get('/reports/test3', sendTemplate);

// Configure proxy to legacy website

app.all('/*', function(req, res) { proxy.web(req, res, { target: 'http://us1.lb.infra.cbd.int', secure: false } ); } );

// Start server

server.listen(process.env.PORT || 8000, '127.0.0.1');

server.on('listening', function () {
	console.log('Server listening on %j', this.address());
});

function sendTemplate (req, res) {
	fs.readFile(__dirname + '/app/template.html', 'utf8', function (error, text) {
		res.send(text);
	});
}
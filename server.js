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

var http = require('http'),
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
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );

// Configure template

app.get('/internal/printsmart*', function sendTemplate(req, res) { res.sendfile(__dirname + '/app/views/print-smart/template.html'); });
app.get('/reports/map*',         function sendTemplate(req, res) { res.sendfile(__dirname + '/app/views/reports/template.html'); });
//app.get('/*', sendTemplate);
app.get('/mop7/insession',  sendTemplate);
app.get('/cop12/insession', sendTemplate);
app.get('/mop1/insession',  sendTemplate);
app.get('/~', sendTemplate);
app.get('/cms/management/ps.shtml', sendTemplate);

// Configure proxy to legacy website

app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://us1.lb.infra.cbd.int:443', secure: false } ); } );

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

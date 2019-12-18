'use strict'; // jshint node: true, browser: false, esnext: true
const express     = require('express');
const httpProxy   = require('http-proxy');
// Create server & proxy
const app         = express();
const proxy       = httpProxy.createProxyServer({});
const robotsTxt   = require('./robots');

if(!process.env.API_URL) {
    console.warn('warning: evironment API_URL not set. USING default (https://api.cbd.int:443)');
}

var apiUrl = process.env.API_URL || 'https://api.cbddev.xyz';
var cdnUrl =(process.env.CDN_URL || 'https://cdn.cbd.int/').replace(/\/+$/, '')+'/';
var gitVersion = (process.env.COMMIT || 'UNKNOWN').substr(0, 7);

console.info(`info: www.cbd.int`);
console.info(`info: Git version: ${gitVersion}`);
console.info(`info: API address: ${apiUrl}`);
console.info(`info: CDN address: ${cdnUrl}`);
console.info(`info: IS DEV: ${process.env.IS_DEV}`);
// Configure options

app.set('views', `${__dirname}/app`);
app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(function(req, res, next) {  if(req.url.indexOf(".geojson")>0) res.contentType('application/json'); next(); } ); // override contentType for geojson files

// Configure static files to serve

app.use('/app/images/p03qv92p.jpg', express.static(__dirname + '/app/images/p03qv92p.jpg',{ maxAge: 365*24*60*60 }));

app.use('/favicon.png',   express.static(__dirname + '/app/images/favicon.png', { maxAge: 24*60*60 }));
app.use('/app',           express.static(__dirname + '/app',                    { setHeaders: setCustomCacheControl }));
app.use('/app/libs/vue',    express.static(__dirname + '/node_modules/vue/dist',      { setHeaders: setCustomCacheControl }));
app.use('/app/libs/ngVue',  express.static(__dirname + '/node_modules/ngVue/build',   { setHeaders: setCustomCacheControl }));
app.use('/app/libs/@scbd',  express.static(__dirname + '/node_modules/@scbd',         { setHeaders: setCustomCacheControl }));
app.all('/app/*',         function(req, res) { res.status(404).send(); } );

app.get('/doc/*', function(req, res) { proxy.web(req, res, { target: "https://www.cbd.int:443", secure: false } ); } );
app.all('/doc/*', function(req, res) { res.status(404).send(); } );

// Configure routes
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: apiUrl, secure: false, changeOrigin:true } ); } );

// Configure robots.txt

app.get('/robots.txt', async function (req, res) {

    const isValidHost = ['www.cbd.int'].includes(req.headers['host']);

    var text = isValidHost ? await getRobots() : 'Disallow: /';

    res.contentType('text/plain');
    res.end('User-agent: *\n' + text);
});

app.get('/reports/map*', function(req, res) { res.cookie('VERSION', process.env.COMMIT||''); res.sendFile(__dirname + '/app/views/reports/template.html', { maxAge : 5*60 }); });

app.get('/insession',    function(req, res) { res.redirect('/conferences/2016/cop-13/documents'); });
app.get('/insession/*',  function(req, res) { res.redirect('/conferences/2016/cop-13/documents'); });

app.get('/biobridge/*',     function(req, res) { res.render('template', { gitVersion: gitVersion, cdnUrl: cdnUrl }); });
app.get('/aichi-targets/*', function(req, res) { res.render('template', { gitVersion: gitVersion, cdnUrl: cdnUrl }); });

app.use(require('./libs/prerender')); // set env PRERENDER_SERVICE_URL

app.get('/*',            function(req, res) {
    res.setHeader('Cache-Control', 'public');
    res.render('template-phoenix', { gitVersion: gitVersion, cdnUrl: cdnUrl }); 
});
app.all('/*',            function(req, res) { res.status(404).send(); } );

// START HTTP SERVER

app.listen(process.env.PORT || 2000, '0.0.0.0', function(){
    console.info('info: Listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});

process.on('SIGTERM', ()=>process.exit());

//============================================================
//
//
//============================================================
function setCustomCacheControl(res, path) {

	if(res.req.query && res.req.query.v && res.req.query.v==gitVersion && gitVersion!='UNKNOWN')
        return res.setHeader('Cache-Control', 'public, max-age=86400'); // one day

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
}

function getRobots(){
  return axios.get('https://prod.drupal.www.infra.cbd.int/robots.txt').then(({ data }) => data)
}
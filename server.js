'use strict'; // jshint node: true, browser: false, esnext: true
require           = require("esm")(module)
const express     = require('express');
const httpProxy   = require('http-proxy');
// Create server & proxy
const app         = express();
const proxy       = httpProxy.createProxyServer({});
const robotsTxt   = require('./robots');
const { baseLibs, cdnUrl } = require('./app/boot');

const captchaV2key  = process.env.CAPTCHA_V2_KEY;
const captchaV3key  = process.env.CAPTCHA_V3_KEY;

const oneDay  = 60*60*24;
const oneYear = oneDay*365;

if(!process.env.API_URL) {
    console.warn('warning: environment API_URL not set. USING default (https://api.cbd.int:443)');
}

const apiUrl      =  process.env.API_URL      || 'https://api.cbd.int';
const accountsUrl =  process.env.ACCOUNTS_URL || 'https://accounts.cbd.int';
const gitVersion  = (process.env.COMMIT       || 'UNKNOWN').substr(0, 8);

console.info(`info: www.cbd.int`);
console.info(`info: Git version:      ${gitVersion}`);
console.info(`info: API address:      ${apiUrl}`);
console.info(`info: Accounts address: ${accountsUrl}`);
console.info(`info: CDN address:      ${cdnUrl}`);
console.info(`info: IS DEV:           ${process.env.IS_DEV}`);
// Configure options

app.set('views', `${__dirname}/app`);
app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(function(req, res, next) {  if(req.url.indexOf(".geojson")>0) res.contentType('application/json'); next(); } ); // override contentType for geojson files

// Configure static files to serve
app.use('/favicon.png',  express.static(__dirname + '/app/images/favicon.png',   { maxAge: oneDay }));
app.use('/app',          express.static(__dirname + '/dist',                     { setHeaders: setChunkCacheControl  }));
app.use('/app',          express.static(__dirname + '/app',                      { setHeaders: setCustomCacheControl }));
app.all('/app/*', send404);

app.get('/doc/*', function(req, res) { proxy.web(req, res, { target: "https://www.cbd.int:443", secure: false } ); } );
app.all('/doc/*', send404);

// Configure routes
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: apiUrl, secure: false, changeOrigin:true } ); } );

// Configure robots.txt
app.get('/robots.txt', (req, res) => {

    const isValidHost = ['www.cbd.int'].includes(req.headers['host']);
    const text        = isValidHost ? robotsTxt : 'User-agent: *\nDisallow: /';

    res.contentType('text/plain');
    res.end(text);
});

app.get('/insession',    function(req, res) { res.redirect('/conferences/2016/cop-13/documents'); });
app.get('/insession/*',  function(req, res) { res.redirect('/conferences/2016/cop-13/documents'); });

app.get('/idb/*',                  function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, accountsUrl }); });
app.get('/biobridge*',             function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, accountsUrl }); });
app.get('/aichi-targets*',         function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, accountsUrl }); });
app.get('/kronos/media-requests*', function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, accountsUrl }); });
app.get('/participation*',         function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, accountsUrl }); });

app.use(require('./libs/prerender')); // set env PRERENDER_SERVICE_URL

app.get('/*', function(req, res) {
    res.setHeader('Cache-Control', 'public');
    res.render('template', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, accountsUrl }); 
});
app.all('/*', send404);

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
// *-abcdef01.js|.css|.js.map |.css.map|.anything|.anything.map
const hashedFilename = /-[a-f0-9]{8}\.([a-z]+|[a-z]+\.map)$/;

function setChunkCacheControl(res, path) {
    const isChunk = hashedFilename.test(path); 
    
	if(isChunk)
        return res.setHeader('Cache-Control',  `public, max-age=${oneYear}`);

    setCustomCacheControl(res, path) //fallback
}

function setCustomCacheControl(res, path) {

	if(res.req.query && res.req.query.v && res.req.query.v==gitVersion && gitVersion!='UNKNOWN')
        return res.setHeader('Cache-Control', `public, max-age=${oneDay}`);

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
}

function send404(req, res) { 
  res.status(404).send(); 
}
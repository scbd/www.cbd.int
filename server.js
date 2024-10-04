'use strict'; // jshint node: true, browser: false, esnext: true
//import { normalizeDocumentSymbol } from './app/services/meetings.js';
import express  from 'express';
import morgan from 'morgan';
import httpProxy from 'http-proxy';
import meetingDocuments from './middlewares/meeting-documents.js';
import robotsTxt from './robots.js';
import { baseLibs, cdnUrl } from './app/boot.js';
import prerender from './libs/prerender.js'; // set env PRERENDER_SERVICE_URL
import onError from './middlewares/global-error-handler.js';
    
// Create server & proxy
const app         = express();
const proxy       = httpProxy.createProxyServer({});
const __dirname   = import.meta.dirname

const captchaV2key  = process.env.CAPTCHA_V2_KEY;
const captchaV3key  = process.env.CAPTCHA_V3_KEY;

const oneDay  = 60*60*24;
const oneYear = oneDay*365;

if(!process.env.API_URL) {
    console.warn('warning: environment API_URL not set. USING default (https://api.cbd.int:443)');
}
const accountsUrl=  process.env.ACCOUNTS_URL   || 'https://accounts.cbddev.xyz';
const apiUrl     =  process.env.API_URL || 'https://api.cbddev.xyz';
const wwwUrl     =  process.env.WWW_URL || 'https://www.cbd.int';
const gitVersion = (process.env.COMMIT  || 'UNKNOWN').substr(0, 8);
const siteAlert  =  process.env.SITE_ALERT || '';
const googleAnalyticsCode      =  process.env.GOOGLE_ANALYTICS_CODE || '';

console.info(`info: www.cbd.int`);
console.info(`info: Git version     : ${gitVersion}`);
console.info(`info: API address     : ${apiUrl}`);
console.info(`info: CDN address     : ${cdnUrl}`);
console.info(`info: Accounts address: ${accountsUrl}`);
console.info(`info: IS DEV          : ${process.env.IS_DEV}`);
// Configure options

app.set('views', `${__dirname}/app`);
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(whiteListIframeUrls);
app.use(function(req, res, next) {  if(req.url.indexOf(".geojson")>0) res.contentType('application/json'); next(); } ); // override contentType for geojson files

// Configure static files to serve
app.use('/favicon.png',  express.static(__dirname + '/app/images/favicon.png',   { maxAge: oneDay }));
app.use('/app',          express.static(__dirname + '/dist',                     { setHeaders: setChunkCacheControl  }));
app.use('/app',          express.static(__dirname + '/app',                      { setHeaders: setCustomCacheControl }));

app.all('/app/*', send404);

app.get('/doc/*', function(req, res) { proxy.web(req, res, { target: wwwUrl, secure: false } ); } );
app.all('/doc/*', send404);

app.use('/documents', meetingDocuments());

// Configure routes
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: apiUrl, secure: false, changeOrigin:true } ); } );

// Configure robots.txt
app.get('/robots.txt', (req, res) => {

    const isValidHost = ['www.cbd.int'].includes(req.headers['host']);
    const text        = isValidHost ? robotsTxt : 'User-agent: *\nDisallow: /';

    res.contentType('text/plain');
    res.end(text);
});

app.get('/idb/*',                  function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, googleAnalyticsCode }); });
app.get('/biobridge*',             function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, googleAnalyticsCode }); });
app.get('/aichi-targets*',         function(req, res) { res.render('template-2011', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, googleAnalyticsCode }); });
app.get('/language-switch',        cmsLanguageSwitch);


app.use(prerender); // set env PRERENDER_SERVICE_URL

app.get('/*', function(req, res) {
    res.setHeader('Cache-Control', 'public');
    res.render('template', { gitVersion, cdnUrl, baseLibs, captchaV2key, captchaV3key, siteAlert, googleAnalyticsCode, accountsUrl, apiUrl }); 
});
app.all('/*', send404);

// START HTTP SERVER
app.use(onError);

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

function whiteListIframeUrls(req, res, next){
    // white list
    const iframeAllowedUrls = [
        /^\/conferences\/(.*)\/schedules\?viewOnly.*/,
        /^\/conferences\/(.*)\/(.*)\/documents\?viewOnly.*/
    ]

    for (const urlRegEx of iframeAllowedUrls)
        if(urlRegEx.test(req.url))
            res.setHeader('X-Frame-Options', 'ALLOW')

    next();
}

function cmsLanguageSwitch(req, res) {
    const locale    = req.query?.lg;
    const returnUrl = req.query?.returnUrl;

    if(!/^[a-z]{2,3}$/.test(locale)) { return res.status(400).send({message:"Invalid locale"});}
    if(!returnUrl)                   { return res.status(400).send({message:"Invalid returnUrl"});}


    res.cookie("Preferences", `Locale=${locale}`, {path:'/', expires: new Date(Date.now() + (1000*3600*24*365))}); //expire in one year
    res.redirect(returnUrl);
}

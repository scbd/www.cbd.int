// rollup.config.js (building more than one bundle)
import util from 'util'
import path from 'path'
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import vue  from 'rollup-plugin-vue'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { string } from "rollup-plugin-string";
import glob from 'glob';

const asyncGlob = util.promisify(glob);

const isWatchOn = process.argv.includes('--watch');
const outputDir = 'dist';
let externals = [ 
  // TODO: Load Boot.js paths!
  'lodash',
  'Vue',
  'vue',
  'axios',
  'luxon',
  'jquery',
  'angular', 
  'moment',
  'authentication',
  'ngCookies',
  'angular-cache',
  'angular-vue',
  'moment-timezone', 
  'ngDialog',
  'ngRoute',
  'conferenceCal',
  'require',
  'authentication',
  'app',
]

export default async function(){
 
  const appFiles = (await asyncGlob('**/*.js', { cwd: path.join(process.cwd(), 'app')})).map(o=>o.replace(/\.js$/, ''));

  appFiles.forEach(m=>externals.push(m));

  return [
      bundle('entry-points/conferences.js'),
      bundle('entry-points/meetings.js'),
      bundle('entry-points/notifications.js'),

      //TMP  for transition transpile
      //bundle('routes.js'),

      bundle('filters/lstring'),
      bundle('filters/moment'),
      bundle('filters/term'),
      bundle('services/article-service'),
      bundle('services/conference-service'),
      
    ];
}


//Transpile and Expose Vue component to angularJS as AMD module
function bundle(relativePath, baseDir='app') {

  const ext = path.extname(relativePath);
  return {
    input : path.join(baseDir||'', relativePath),
    output: [{
      format   : 'amd',
      sourcemap: true,
      file : path.join(outputDir, changeExtension(relativePath, '.js')),
      name : relativePath.replace(/[^a-z0-9]/ig, "_"),
    }],
    external: externals,
    plugins : [
      alias({ entries : [{ find: /^~\/(.*)/, replacement:`${process.cwd()}/app/$1` }] }),
      injectCssToDom(),
      string({ include: "**/*.html" }),
      vue(),
      commonjs(),
      nodeResolve({ browser: true, mainFields: [ 'browser', 'module', 'main' ] }),
      getBabelOutputPlugin({
         presets: [['@babel/preset-env', { targets: "> 0.25%, IE 10, not dead"}]],
         allowAllFormats: true
       }),
      terser() // DISABLE IN DEV
    ],
  }
}

//Transpile and Expose Vue component to angularJS as AMD module
function exposeVueComponent(relativePath) {

    const vueSourceDir = 'components';

    return {
      input : path.join(vueSourceDir, relativePath+'.vue'),
      output: [{
        format   : 'umd',
        sourcemap: true,
        globals,
        file : path.join(outputDir, 'components', relativePath+'.js'),
        name : relativePath.replace(/[^a-z0-9]/ig, "_"),
      }],
      external: [ ...Object.keys(globals) ],
      plugins : [
        vue(),
        commonjs(),
        nodeResolve({ browser: true, mainFields: [ 'browser', 'module', 'main' ] }),
        getBabelOutputPlugin({
          presets: [['@babel/preset-env', { targets: "> 0.25%, IE 10, not dead"}]],
          allowAllFormats: true
        }),
        isWatchOn ? null : terser() // DISABLE IN DEV
      ],
    }
}

//Transpile and Expose as UMD non-umd library.
function exposeGlobal(source, name) {

  return {
    input: source,
    output: [{
      file: path.join(outputDir, 'libs/globals', `${name}.js`),
      format : 'umd',
      name: name,
      plugins : [
        getBabelOutputPlugin({
          presets: ['@babel/preset-env'],
          allowAllFormats: true
        }),
        isWatchOn ? null : terser() // DISABLE IN DEV
      ]
    }],
  }
}


function changeExtension(file, extension) {
  const basename = path.basename(file, path.extname(file))
  return path.join(path.dirname(file), basename + extension)
}



//////////////////
// Custom Plugin
//////////////////

function injectCssToDom(options = {}) {

  const injectable = ['a']
  const cssPluginTag = /^css!/; 

  return {
    name: 'injectCss',

    resolveId(importeeId, importer) {

      if(!cssPluginTag.test(importeeId)) return null;

      const updatedId = importeeId.replace(cssPluginTag, '');

      if(!isUrl(updatedId)) // link to URL => let RequireJS handle it for now
        return {id: importeeId, external: true};

      return this.resolve(updatedId, importer, { skipSelf: true }).then((resolved) => {
        if(!resolved)         return { id: updatedId }
        if(resolved.external) return null;
        
        injectable.push(resolved.id)

        return resolved;
      });      
    },

    transform(css, id) {
      if (!injectable.includes(id)) return null;

      try {
        const parsed = JSON.stringify(css);
        return {
          code: generateCode(css),
          map: { mappings: '' }
        };
      } catch (err) {
        const message = 'Error generating CSS injection code';
        this.warn({ message });
        return null;
      }
    }
  };

  function isUrl(url) {
    try { 
      return !!(new URL(url)); // valid if we can parse it
    }
    catch {
      return false;
    }
  }

  function generateCode(css) {
    var code = `
    ((document)=>{
      const head  = document.getElementsByTagName('head')[0];
      const style = document.createElement('style'); 
      style.innerHTML = ${JSON.stringify(css)}
      head.appendChild(style)
    })(document);`.trim();

    return code;
  }
}
 
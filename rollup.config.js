// rollup.config.js (building more than one bundle)
import util                     from 'util'
import path                     from 'path'
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import alias                    from '@rollup/plugin-alias';
import nodeResolve              from '@rollup/plugin-node-resolve'
import json                     from '@rollup/plugin-json';
import commonjs                 from 'rollup-plugin-commonjs';
import amd                      from 'rollup-plugin-amd';
import vue                      from 'rollup-plugin-vue'
import { string }               from "rollup-plugin-string";
import { terser }               from 'rollup-plugin-terser';
import glob                     from 'glob';
import bootWebApp from './app/boot.js';

const asyncGlob = util.promisify(glob);

const isWatchOn = process.argv.includes('--watch');
const cwd       = path.join(process.cwd(), 'app');
const outputDir = 'dist';

let externals = []

export default async function(){
  
  externals = [...externals, ...await loadExternals()];

  const toBundle = [
    ...await asyncGlob('*.js', { cwd }),
    ...await asyncGlob('{data,directives,routes,filters,providers,services,util,views}/**/*.{js,json}', { cwd }),
  ];

  return [
    ...toBundle.map((o)=>bundle(o)),
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
      alias({ entries : [
        { find: /^~\/(.*)/,   replacement:`${process.cwd()}/app/$1` },
        { find: /^text!(.*)/, replacement:`$1` },
      ]}),
      string({ include: "**/*.html" }),
      json({ namedExports: true }),
      injectCssToDom(),
      vue(),
      amd({ include: 'app/**/*.js'}),
      commonjs({ include: 'node_modules/**/*.js'}),
      nodeResolve({ browser: true, mainFields: [ 'browser', 'module', 'main' ] }),
      isWatchOn ? null : getBabelOutputPlugin({
         presets: [['@babel/preset-env', { targets: "> 0.25%, IE 10, not dead"}]],
         allowAllFormats: true
       }),
       isWatchOn ? null : terser() // DISABLE IN DEV
    ],
  }
}


async function loadExternals() {

  const externals = [];

  //Define requireJS configuration (define() + config.paths ) as externals

  // Shim dependancies 
  const window     = { location : { pathname: '/' } }; 
  const defineJs   = (module) => { if(typeof(module)==='string') externals.push(module) };
  const requireJs  = ( )      => { };
  requireJs.config = (config) => { Object.keys(config.paths).forEach(defineJs); }

  bootWebApp(window, requireJs, defineJs);

  //Define all app file as Externals
  const appFiles = (await asyncGlob('**/*.js', { cwd })).map(o=>o.replace(/\.js$/, ''));

  appFiles.forEach(m=>externals.push(m));

  return externals;
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

      if(isUrl(updatedId)) {// link to URL => let RequireJS handle it for now
        return {id: importeeId, external: true};
      }

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
 
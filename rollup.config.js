// rollup.config.js (building more than one bundle)
import path                     from 'path'
import fs                       from 'fs'
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import alias                    from '@rollup/plugin-alias';
import nodeResolve              from '@rollup/plugin-node-resolve'
import json                     from '@rollup/plugin-json';
import commonjs                 from '@rollup/plugin-commonjs';
import dynamicImportVariables   from 'rollup-plugin-dynamic-import-variables';
import vue                      from 'rollup-plugin-vue'
import { string }               from "rollup-plugin-string";
import { terser }               from 'rollup-plugin-terser';
import bootWebApp, { cdnUrl }   from './app/boot.js';

const isWatchOn = process.argv.includes('--watch');
const outputDir = 'dist';

let externals = [
  'require', 
  'amchart/pie',
  'amchart/serial',
  'ammap/themes/light',
  'amchart/themes/light', 
  'https://cdn.slaask.com/chat.js',
];

export default async function(){
  
  externals = [...externals, ...await loadExternals()];

  return [
    bundle('boot.js') 
  ];
}

function bundle(relativePath, baseDir='app') {

  const ext = path.extname(relativePath);

  return {
    input : path.join(baseDir||'', relativePath),
    output: [{
      format   : 'amd',
      sourcemap: true,
      dir : path.join(outputDir, path.dirname(relativePath)),
      name : relativePath.replace(/[^a-z0-9]/ig, "_"),
      exports: 'named',
      assetFileNames: '[name]-[hash][extname]'
    }],
    external: externals,
    plugins : [
      alias({ entries : [
        { find: /^~\/(.*)/,   replacement:`${process.cwd()}/app/$1` },
        { find: /^text!(.*)/, replacement:`$1` },
        { find: /^cdn!(.*)/,  replacement:`${cdnUrl}$1` },
      ]}),
      stripBom(),
      emitAppAssets(),
      string({ include: "**/*.html" }),
      json({ namedExports: true }),
      injectCssToDom(),
      vue(),
      dynamicImportVariables({ }),
      commonjs({ include: 'node_modules/**/*.js'}),
      nodeResolve({ browser: true, mainFields: [ 'browser', 'module', 'main' ] }),
      isWatchOn ? null :getBabelOutputPlugin({
        presets: [['@babel/preset-env', { targets: "> 0.25%, IE 10, not dead"}]],
        allowAllFormats: true
      }),
      isWatchOn ? null : terser({ mangle: false }) // DISABLE IN DEV
    ]
  }
}


async function loadExternals() {

  const externals = [];

  //Define requireJS configuration (define() + config.paths ) as externals

  // Shim dependencies 
  const window     = { location : { pathname: '/' } }; 
  const defineJs   = (module) => { if(typeof(module)==='string') externals.push(module) };
  const requireJs  = ( )      => { };
  requireJs.config = (config) => { 
    const modules = [
      ...Object.keys(config.paths),
      ...config.packages.map(p=>p.name)
    ]
    modules.forEach(defineJs)
  }

  bootWebApp(window, requireJs, defineJs);

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
        if(!resolved)          return { id: updatedId }
        if(resolved.external)  return null;
        if(isUrl(resolved.id)) return { id: `css!${resolved.id}`, external: true}
        
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

  function isUsePlugin(url) {
    return /^[a-z]+!/i.test(url);
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
 

function stripBom(options = {}) {

  return {
    name: 'stripBom',

    transform(code) {

      if (typeof (code) == "string")
        code = code.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"");

      return { code, map: this.getCombinedSourcemap() };
    }
  };
}

// Emit /app/(images|fonts|data)/* files referenced in sources as hashed assets (cacheable by CDN)
function emitAppAssets() {

  const appUrl      = /\/app\/((?:images|fonts|data)\/[\w\-./]+\.[a-z0-9]+)(?![\w\-./?{$])/gi;
  const placeholder = /__APP_ASSET_([\w$]+)__/g;
  let refIds, moduleRefIds;

  return {
    name: 'emitAppAssets',

    buildStart() {
      refIds       = new Map(); // file path => referenceId
      moduleRefIds = new Map(); // module id => [referenceId]
    },

    transform(code, id) {

      const ids = [];

      code = code.replace(appUrl, (url, name) => {

        const file = path.join('app', name);

        if(!refIds.has(name)) {
          if(!fs.existsSync(file)) return url;
          refIds.set(name, this.emitFile({ type: 'asset', name, source: fs.readFileSync(file) }));
        }

        ids.push(refIds.get(name));

        return `__APP_ASSET_${refIds.get(name)}__`;
      });

      if(!ids.length) return null;

      moduleRefIds.set(id, ids);

      return { code, map: null };
    },

    augmentChunkHash(chunk) { // asset names are resolved in renderChunk; include them in chunk hash
      return Object.keys(chunk.modules).flatMap(id => moduleRefIds.get(id) || []).map(ref => this.getFileName(ref)).join();
    },

    renderChunk(code) {
      if(!code.includes('__APP_ASSET_')) return null;
      return { code: code.replace(placeholder, (_, ref) => `/app/${this.getFileName(ref)}`), map: null };
    }
  };
}

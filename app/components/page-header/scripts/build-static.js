const fs        = require('fs');
const path      = require('path');
const $http     = require('axios');

const writePath = path.resolve(__dirname, '../')
const dapi      = 'https://dapi.cbd.int';

(async() => {
  const siteNavigationElements = stringifyToJsModule((await getMain())[0])

  fs.writeFileSync(`${writePath}/siteNavigationElements.js`, siteNavigationElements)

  console.log('Finished writing static menus')
})()

function stringifyToJsModule(data){
  return `/* eslint-disable */ \n export default ${JSON.stringify(data)} \n // ${new Date()}`
}

function getMain(){
  return $http.get(`${dapi}/menus/main?postfix=WPH`)
    .then(({ data }) => data)
    .then((d) =>  [ { identifier: [ { name: 'drupalMenuName', value: 'main' } ], name: 'main', position: 3, hasPart: d } ])
}

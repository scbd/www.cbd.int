const fs        = require('fs');
const path      = require('path');
const $http     = require('axios');

const writePath = path.resolve(__dirname, '../')
const dapi      = 'https://dapi.cbd.int';

(async() => {
  const siteNavigationElements = stringifyToJsModule((await getFooter()))

  fs.writeFileSync(`${writePath}/footerSiteNavigationElements.js`, siteNavigationElements)

  console.log('Finished writing static menus')
})()

function stringifyToJsModule(data){
  return `/* eslint-disable */ \n export default ${JSON.stringify(data)} \n // ${new Date()}`
}

function getFooter(){
  return $http.get(`${dapi}/menus?q=quick-links,topics,information,aPartOf&postfix=WPH`)
          .then(({ data }) => data)
}

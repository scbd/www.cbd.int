import app from '~/app'
import lstring from './lstring';
import ApiBase from '~/api/api-base';

const api = new ApiBase();
const cacheMap = {};

//============================================================
//
//
//
//============================================================
app.filter("term", [function () {

  return (...args) => {
    const ret = lookupTermText(...args);

    if(ret && ret.then) return;

    return ret;
  }
}]);

export default function lookupTermText(term, locale) {

  if (!term)
    return "";

  if (term && angular.isString(term))
    term = {
      identifier: term
    };

  locale = locale || "en";

  if (term.customValue)
    return lstring(term.customValue, locale);

  const cachedValue = cacheMap[term.identifier];

  if(!cachedValue) {

    return cacheMap[term.identifier] = api.http.get("/api/v2013/thesaurus/terms?termCode=" + encodeURIComponent(term.identifier), {cache:true}).then(function (result) {

      cacheMap[term.identifier] = result.data;
  
      return lstring(cacheMap[term.identifier].title, locale);
  
    }).catch(function () {
  
      cacheMap[term.identifier] = { 
        title: { en : term.identifier },
        ...term
      }
  
      return term.identifier;
  
    });
  }

  if (cachedValue.then)
    return cachedValue; // return pending promise;
  
  return lstring(cachedValue.title || term.identifier, locale);
}
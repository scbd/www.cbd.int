import app from '~/app';

app.factory('translationService',  ['locale', function(locale) {

    let localeCache = {};
    const appLocale = locale || 'en'

    return new function(){ 

        this.set = function (key, values) {
            if(!localeCache) localeCache = {}

            localeCache[key] = values;
        };

        this.get = function(key, cacheKey){

            key = key || '';

            const keys = cacheKey? [cacheKey, key ] : key.split('.');


            if(keys.length != 2)
                throw new Error('Invalid translation key, expected format `key.fieldName`');

            const baseKeyInfo = localeCache[keys[0]][appLocale];

            if(!baseKeyInfo) return key; 
            
            
            return baseKeyInfo[keys[1]] || localeCache[keys[0]]['en'][keys[1]]  || key;
        };
        
        this.remove = function(key){
            appLocale[appLocale][key] = undefined
        };

        this.removeAll = function(){
            localeCache[appLocale] = {};
        };
    };

}]);

app.filter('$translate', ['translationService', function(translationService){

    return function(key, cacheKey){
        if(!cacheKey) return translationService.get(key) || key;
        return translationService.get(key, cacheKey) || key;
    };

}])


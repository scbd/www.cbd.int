import app from '~/app'

const prefLocaleRe = /locale=([a-z]{2})/i;
const localeRe = /^[a-z]{2}$/i

    app.provider('locale', [function() {

        this.$get = ['$cookies', '$location', function($cookies, $location) {

            let   locale  = $cookies.get("locale");
            const cmdPref = $cookies.get("Preferences");
            const qsLang  = $location.search().lg;

            if(prefLocaleRe.test(cmdPref)) locale = cmdPref.match(prefLocaleRe)[1];

            if(localeRe.test(qsLang)) locale = qsLang;

            if(!locale) locale = 'en';

            return locale;
        }];
    }]);
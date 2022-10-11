import app from '~/app'

    app.provider('locale', [function() {

        this.$get = ['$cookies', function($cookies) {

            const lang = $cookies.get("locale");
            return lang || 'en';

        }];
    }]);
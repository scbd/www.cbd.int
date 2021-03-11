import app from '~/app'

    app.provider('locale', [function() {

        this.$get = ['$document', function($document) {

            var matches = /Preferences=Locale=(\w{2,3})/g.exec($document[0].cookie);

            if (matches)
                return matches[1]; //

            return 'en';

        }];
    }]);
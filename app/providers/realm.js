import app from '~/app'

    app.provider("realm", {

        $get : ["$location", function($location) {

            if($location.$$host!= "www.cbd.int"){
                return 'CHM-DEV';
            }
            return 'CHM';
        }]
    });


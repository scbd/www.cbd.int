import app from '~/app'

    app.provider("realm", {

        $get : ["$location", function($location) {

            const isBbi = $location.$$absUrl.includes('/biobridge');

            if($location.$$host!= "www.cbd.int")
                if(!isBbi)
                    return 'CHM-DEV';
                else 
                    return 'BBI-DEV';
            else if(!isBbi)
                return 'CHM';
            else
                return 'BBI';
        }]
    });


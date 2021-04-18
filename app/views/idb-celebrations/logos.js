define(['app', 'lodash',
'https://zachleat.github.io/BigText/dist/bigtext.js',
'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js'], function(app, _) { 'use strict';

    
      
	return ['$q', 'user','$http','$scope', '$rootScope', '$window', 'status',  function( $q, user,$http, $scope,  $rootScope, $window, status) {

        var basePath  = $scope.basePath = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');

        var query = {
            q: { status:status },
            s: { createdOn:-1 }
        };
        $http.get('/api/v2021/idb-logos', {params:query})
        .then(function(result) {
            $scope.logos = result.data;
        })

        $scope.isAdmin = _.intersection(['Administrator', 'idb-logo-administrator'], user.roles).length
        $scope.updateStatus = function(logo, status){
            logo.updating = true;
            $http.put('/api/v2021/idb-logos/'+logo._id+'/'+status)
            .then(function(result) {
                logo.status = status;
            })
            .finally(function(){
               logo.updating = false;
            })
        }
    }]
});




import 'file-saverjs';
import 'bigText';
import 'html2canvas';
import _ from 'lodash';
import 'ngInfiniteScroll'
      
export { default as template  } from './collage.html';

export default ['$q', 'user','$http','$scope', '$rootScope', '$window', 'status',  function( $q, user,$http, $scope,  $rootScope, $window, status) {


    $scope.$root.page={
        title : "International Biodiversity Day logo : collage",
        description : $('#logo-description').text()
    };

    $scope.status = status;
    var basePath  = $scope.basePath = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');
    $scope.isAdmin = _.intersection(['Administrator', 'idb-logo-administrator'], user.roles).length
    var currentPage = 0

    $scope.loadLogs = function(){

        if(!$scope.loading && ($scope.logos||[]).length < $scope.logoCount){

            var query = {
                q: { status:status },
                s: { updatedOn:-1 },
                sk: currentPage,
                l:10

            };
            $scope.loading = true;
            $http.get('/api/v2021/idb-logos', {params:query})
            .then(function(result) {
                if(!$scope.logos)
                    $scope.logos = [];
                _.each(result.data, function(logo){
                    $scope.logos.push(logo)
                });
                currentPage += 10;
            })
            .finally(function(){
                $scope.loading = false;
            })
        }
    }

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

    $scope.selectAll = function(){
        _.each($scope.logos, function(logo){
            if(logo.status == 'draft')
                logo.selected = true;
        })
    }

    $scope.updateSelectedStatus = function(status){
        _.each($scope.logos, function(logo){
            if(logo.status == 'draft' && logo.selected)
                $scope.updateStatus(logo, status)
        });
    }

    function loadLogoCounts(){
        var query = {
            q: { status:status },
            c: 1
        };
        $scope.loading = true;
        return $http.get('/api/v2021/idb-logos', {params:query})
        .then(function(result) {
            $scope.logoCount = result.data.count;
        })
        .finally(function(){
            $scope.loading = false;
        })
    }

    loadLogoCounts().then(function(){
        $scope.loadLogs();
    });
}]


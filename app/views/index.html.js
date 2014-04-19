define(['app'], function(app) {
  app.controller('IndexCtrl', ['$scope', function($scope) {
    $scope.nationalReportQueries = [{
      id: '5th',
      name: '5th National Report'
    }, {
      id: '4th',
      name: '4th National Report'
    }, {
      id: '3rd',
      name: '3rd National Report'
    }, {
      id: '2nd',
      name: '2nd National Report'
    }, {
      id: '1st',
      name: '1st National Report'
    }];


    $scope.selectedQuery = '5th';

    $scope.setQuery = function(id) {
      $scope.setSelectedQuery(id);
    };

    $scope.setSelectedQuery = function(qid) {
      $scope.selectedQuery = qid;
      // reportService.getReports(qid).then(function(reports) {
      //   $rootScope.$emit('updateMap', reports);
      // });
    };

  }]);
});
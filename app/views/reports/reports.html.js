define(['app'], function(app) {
  app.controller('ReportsCtrl', ['$scope', 'reports', '$rootScope',
    function($scope, reports, $rootScope) {
      var self = this;

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
        self.getReportsByType(qid);
      };

      this.getReportsByType(type) {
        reports.getReports({
          reportType: type
        }).then(function(reports) {
          $scope.reports = reports;
          $rootScope.$emit('updateMap', reports);
        });
      }

    }
  ]);
});
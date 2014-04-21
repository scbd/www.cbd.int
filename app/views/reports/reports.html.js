define(['app'], function(app) {
  app.controller('ReportsCtrl', ['$scope', 'reports', '$rootScope', 'growl',
    function($scope, reports, $rootScope, growl) {
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


      $scope.selectedQuery = '';
      $scope.loading = false;

      $scope.setQuery = function(schema, id) {
        $scope.setSelectedQuery(schema, id);
      };

      $scope.setSelectedQuery = function(schema, qid) {
        if ($scope.selectedQuery === qid) return;
        $scope.selectedQuery = qid;
        self.getReportsByType(schema, qid);
      };

      this.getReportsByType = function(schema, type) {
        $scope.loading = true;
        reports.getReports({
          reportType: type,
          schema: schema,
        })
          .then(function(reports) {
            $scope.loading = false;
            if (!reports.length) growl.addInfoMessage('No reports of this type were found...');
            $rootScope.$emit('updateMap', reports);
          });
      };

      $scope.resetCenter = function() {
        $rootScope.$emit('resetCenter');
      };
    }
  ]);
});
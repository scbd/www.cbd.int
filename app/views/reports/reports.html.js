define(['app', 'underscore'], function(app, _) {
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

      // The range is [start, end);
      $scope.aichiTargetOptions = _.range(1, 21);


      $scope.selectedQuery = '';
      $scope.loading = false;

      $scope.setQuery = function(schema, id) {
        $scope.setSelectedQuery(schema, id);
      };

      $scope.setSelectedQuery = function(schema, qid) {
        if ($scope.selectedQuery === schema) return;
        $scope.selectedQuery = qid;
        self.getReportsByType(schema, qid);
      };

      this.getReportsByType = function(schema, type) {
        $scope.loading = true;
        var params = {
          schema: schema
        };
        params[(/aichi/.test(type)) ? 'reportType' : 'aichiTarget'] = type;

        reports.getReports(params)
          .then(function(reports) {
            $scope.loading = false;
            if (!reports.length) growl.addInfoMessage('No reports of this type were found...');
            $rootScope.$emit('updateMap', reports);
          })
          .catch(function(err) {
            $scope.loading = false;
            growl.addErrorMessage(err + ': Please try again.');
          });
      };

      $scope.resetCenter = function() {
        $rootScope.$emit('resetCenter');
      };
    }
  ]);
});
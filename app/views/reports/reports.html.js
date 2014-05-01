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

      $scope.progress = [{
        "guid": "884D8D8C-F2AE-4AAC-82E3-5B73CE627D45",
        "verbal": "On track to exceed target"
      }, {
        "guid": "E49EF94E-0590-486C-903B-68C5E54EC089",
        "verbal": "On track to achieve target"
      }, {
        "guid": "486C27A7-6BDF-460D-92F8-312D337EC6E2",
        "verbal": " Progress towards target but at an insufficient rate "
      }, {
        "guid": "2D241E0A-1D17-4A0A-9D52-B570D34B23BF",
        "verbal": "No significant change"
      }, {
        "guid": "36A174B8-085A-4363-AE11-E34163A9209C",
        "verbal": "Moving away from target"
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
        params[(/AICHI/.test(type)) ? 'aichiTarget' : 'reportType'] = type;

        reports.getReports(params)
          .then(function(reports) {
            if (!reports.length) {
              $scope.loading = false;
              growl.addInfoMessage('No reports of this type were found...');
              return;
            }
            reports.getProgressAssessments()
              .then(function(assessments) {
                $scope.loading = false;
                reports = self.mergeAssessmentsAndReports(reports, assessments);
                $rootScope.$emit('updateMap', reports);
              });
          })
          .catch (function(err) {
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
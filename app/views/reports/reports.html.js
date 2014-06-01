define(['app', 'underscore', 'text!../../data/reports/aichiTargets.json'], function(app, _, aichiTargetJson) {
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

      $scope.aichiTargets = JSON.parse(aichiTargetJson);

      $scope.progressSettings = {
        "884D8D8C-F2AE-4AAC-82E3-5B73CE627D45": {
          verbal: "On track to exceed target",
          color: '#007C35',
          score: 5
        },
        "E49EF94E-0590-486C-903B-68C5E54EC089": {
          verbal: "On track to achieve target",
          color: '#00AB49',
          score: 4
        },
        "486C27A7-6BDF-460D-92F8-312D337EC6E2": {
          verbal: "Insufficient rate of change",
          color: '#00C655',
          score: 3
        },
        "2D241E0A-1D17-4A0A-9D52-B570D34B23BF": {
          verbal: "No significant change",
          color: '#00E362',
          score: 2
        },
        "36A174B8-085A-4363-AE11-E34163A9209C": {
          verbal: "Moving away from target",
          color: '#00FF6E',
          score: 1
        }
      };


      $scope.selectedQuery = '';
      $scope.selectedSchema = '';
      $scope.loading = false;

      $scope.setQuery = function(schema, id) {
        $scope.setSelectedQuery(schema, id);
      };

      $scope.setSelectedQuery = function(schema, qid) {
        if ($scope.selectedQuery === schema) return;
        $scope.selectedQuery = qid;
        $scope.selectedSchema = schema;
        self.getReportsByType(schema, qid);
      };

      this.mergeAssessmentsAndReports = function(reports, assessments) {
        reports.forEach(function(report) {
          assessments.forEach(function(assessment) {
            if (report.aichiTargets.indexOf(assessment.aichiTarget) !== -1 ||
                report.identifier === assessment.nationalTarget) {
              assessment.meta = $scope.progressSettings[assessment.progressGuid];
              report.assessment = assessment;
            }
          });
        });
        return reports;
      };

      this.getReportsByType = function(schema, type) {
        $scope.loading = true;
        var params = {
          schema: schema
        };
        params[(/AICHI/.test(type)) ? 'aichiTarget' : 'reportType'] = type;

        reports.getReports(params)
          .then(function(results) {
            if (!results.length) {
              $scope.loading = false;
              growl.addWarnMessage('No reports of this type were found...');
            }

            if (schema === 'nationalTarget' || schema === 'nationalIndicator') {
              var isAichi = !!params.aichiTarget;
              var guids = _.pluck(results, isAichi ? 'aichiTargets' : 'identifier'),
                targetType = isAichi ? 'aichi' : 'national';

              reports.getProgressAssessments('progressAssessment', guids, targetType)
                .then(function(assessments) {
                  $scope.loading = false;
                  results = self.mergeAssessmentsAndReports(results, assessments);
                  $rootScope.$emit('updateMap', results);
                });

              return;
            }

            $scope.loading = false;
            $rootScope.$emit('updateMap', results);
          })
          .catch (function(err) {
            $scope.loading = false;
            growl.addErrorMessage(err + ': Please try again.');
          });
      };

      // Init the page with the 5th national reports.
      $scope.setSelectedQuery('nationalReport', '5th');

      $scope.resetCenter = function() {
        $rootScope.$emit('resetCenter');
      };
    }
  ]);
});
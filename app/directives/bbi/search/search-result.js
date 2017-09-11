define(['text!./search-result.html', 'app', 'lodash', 'moment', 'lodash', 'authentication','providers/realm','filters/term',    'filters/moment'], function(template, app, _, moment, authentication) {
    'use strict';

    app.directive('searchResult', ['$location', function($location) {
        return {
            restrict: 'EAC',
            template: template,
scope:{document:"="},
            link: function($scope, $el, $attr) {
                if($scope.document.applicationDeadline_dt)
console.log($scope.document);
                $scope.index = Number($attr.index) + 1;
                var killWatch = $scope.$watch('document.id', function() {
                    if (!$scope.document.id) return;

                    var formatDate = function formatDate(date) {
                        return moment(date).format('MMMM Do YYYY');
                    };

                    _.each($scope.document, function(val, property) {
                        if (property.slice(-2) === '_t' && Array.isArray(val)) {
                            $scope.document[property] = val[0];
                        }
                        killWatch();
                    });

                    $scope.schema = $scope.document.schema_EN_t.toUpperCase();
                    $scope.title = $scope.document.title_t;
                    $scope.description = $scope.document.description_t;
                    $scope.source = $scope.document.government_EN_t;

                    if ($scope.document.schema_s == 'focalPoint') {
                        $scope.description = $scope.document.function_t || '';
                        $scope.description += ($scope.document.function_t && $scope.document.department_t) ? ', ' : '';
                        $scope.description += $scope.document.department_t || '';
                        $scope.description2 = $scope.document.organization_t || '';
                    }

                    if ($scope.document.schema_s == 'decision' && $scope.document.body_s == 'XXVII8-COP') $scope.source = 'COP TO THE CONVENTION';
                    if ($scope.document.schema_s == 'decision' && $scope.document.body_s == 'XXVII8b-MOP') $scope.source = 'COP-MOP TO THE CARTAGENA PROTOCOL ON BIOSAFETY';
                    if ($scope.document.schema_s == 'decision') $scope.title = 'Decision ' + $scope.document.code_s;
                    if ($scope.document.schema_s == 'decision') $scope.description = $scope.document.title_t;

                    if ($scope.document.schema_s == 'recommendation' && $scope.document.body_s == 'XXVII8-SBSTTA') {
                        $scope.source = 'SBSTTA';
                        $scope.sourceTooltip = 'Subsidiary Body on Scientific, Technical and Technological Advice';
                    }
                    if ($scope.document.schema_s == 'recommendation' && $scope.document.body_s == 'XXVII8-WGRI') {
                        $scope.source = 'WGRI';
                        $scope.sourceTooltip = 'Working Group on the Review of Implementation';
                    }
                    if ($scope.document.schema_s == 'recommendation' && $scope.document.body_s == 'XXVII8b-ICCP') {
                        $scope.source = 'ICCP';
                        $scope.sourceTooltip = 'Intergovernmental Committee for the Cartagena Protocol on Biosafety';
                    }
                    if ($scope.document.schema_s == 'recommendation' && $scope.document.body_s == 'XXVII8c-ICNP') {
                        $scope.source = 'ICNP';
                        $scope.sourceTooltip = 'Intergovernmental Committee for the Nagoya Protocol on ABS';
                    }
                    if ($scope.document.schema_s == 'recommendation') $scope.title = 'Recommendation ' + $scope.document.code_s;
                    if ($scope.document.schema_s == 'recommendation') $scope.description = $scope.document.title_t;

                    if ($scope.document.schema_s == 'meetingDocument') $scope.source = $scope.document.meeting_s;
                    if ($scope.document.schema_s == 'meetingDocument') $scope.title = $scope.document.symbol_s;
                    if ($scope.document.schema_s == 'meetingDocument') $scope.description = $scope.document.title_t;
                    if ($scope.document.schema_s == 'meetingDocument' && $scope.document.group_s == 'INF') $scope.source += ' - INFORMATION';
                    if ($scope.document.schema_s == 'meetingDocument' && $scope.document.group_s == 'OFC') $scope.source += ' - PRE-SESSION';

                    if ($scope.document.schema_s == 'nationalReport') $scope.description = $scope.document.summary_EN_t;
                    if ($scope.document.schema_s == 'nationalReport') $scope.type = $scope.document.reportType_EN_t;

                    if ($scope.document.schema_s == 'implementationActivity') $scope.type = $scope.document.jurisdiction_EN_t + ' - ' + $scope.document.completion_EN_t;

                    if ($scope.document.schema_s == 'marineEbsa') $scope.schema = 'ECOLOGICALLY OR BIOLOGICALLY SIGNIFICANT AREA';

                    if ($scope.document.schema_s == 'event') {
                        $scope.dates = formatDate(document.startDate_s) + ' to ' + formatDate(document.endDate_s);
                        $scope.venue = document.eventCity_EN_t + ', ' + document.eventCountry_EN_t;
                    }

                });

                //==================================
                //
                //==================================
                $scope.goTo = function(event) {
                  if(event)
                    event.preventDefault();

                    if ($scope.document.schema_s.indexOf('bbi') > -1 || $scope.document.schema_s.indexOf('organization') > -1)
                        $location.path('platform/submit/' + camelToDash($scope.document.schema_s) + '/' + $scope.document.identifier_s + '/view');
                    else
                        window.open($scope.document.url_ss[0], '_blank');

                };
                $scope.goToUrl = function() {

                    if ($scope.document.schema_s.indexOf('bbi') > -1 || $scope.document.schema_s.indexOf('organization') > -1)
                        return 'platform/submit/' + camelToDash($scope.document.schema_s) + '/' + $scope.document.identifier_s + '/view';
                    else if($scope.document.url_ss)
                        return $scope.document.url_ss[0];

                };
                function camelToDash(str) {
                    return str.replace(/\W+/g, '-')
                        .replace(/([a-z\d])([A-Z])/g, '$1-$2');
                }
                //==================================
                //
                //==================================
                $scope.userGovernment = function() {
                    return authentication.user.government;
                };
                //==================================
                //
                //==================================
                $scope.oppIsExpired = function() {
                
                    if(($scope.document.schema_s==='bbiOpportunity' && $scope.document.applicationDeadline_dt &&   moment($scope.document.applicationDeadline_dt).isBefore(moment())))
                        return true;
                    else
                        return false;
                };

            }
        };
    }]);

    app.filter('htmlToTextPerSentance',
        function() {
            return function(items) {
                var stripped = String(String(String(items).replace(/&\w+;\s*/g, '')).replace(/<\/?[^>]+(>|$)/g, '')).replace('undefined', '');
                return stripped.length > 2 ? stripped + '.' : '';
            };
        });
});
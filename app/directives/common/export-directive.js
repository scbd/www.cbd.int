define(['~/app','./export-directive.html', 'lodash', 'ngDialog','moment','~/filters/moment'], function (app, template, _) {
    app.directive('export', ['$timeout', '$q', 'ngDialog',function ($timeout, $q,ngDialog) {
        return {
            restrict: 'EAC',
            template: template,
            scope: {
                exportData: '&',
                helpTitle: '@'
            },
            link: function ($scope, $element, attrs) {
                    
                $scope.showDialog = function(forTour){
                    var exportData = $scope.exportData();

                    ngDialog.open({
                        showClose : !forTour,
                        closeByEscape : !forTour,
                        closeByNavigation : !forTour,
                        closeByDocument : !forTour,
                        name     : 'exportDialog',
                        className : 'ngdialog-theme-default wide',
                        template : 'exportDialog',
                        controller : ['$scope', '$element', function($scope, $element){
                    
                                $scope.downloadFormat = 'xlsx';
                                $scope.downloadData =  function(skipDownload){

                                    var dowloadButton = $element.find('.' + $scope.downloadFormat)
                                    if(dowloadButton && dowloadButton.length==0){
                                        $scope.loading = true;
                                        $q.when(exportData)
                                        .then(function(documents){
                                            $scope.downloadDocuments = documents;
                                            if(!skipDownload)
                                                require(['tableexport'], function(){
                                                    $element.find('#datatable').tableExport({
                                                        formats: ["xlsx", "xls", "csv"],
                                                        filename: "Aichi-Targets-data",
                                                    });
                                                    $element.find('.' + $scope.downloadFormat).click();
                                                });     
                                        })
                                        .finally(function(){
                                            $scope.loading = false;
                                        });                
                                    }
                                    else
                                        dowloadButton.click();                        
                                };

                                $scope.closeDialog = function(){
                                    ngDialog.close();                                            
                                }

                                $scope.downloadData(true);
                        }]
                    })
                }

                $timeout(function(){
                    $element.find('[data-toggle="tooltip"]').tooltip();
                },50);

                $scope.closeDialog = function(){
                    ngDialog.close();     
                }
            }
        };
    }]);
});


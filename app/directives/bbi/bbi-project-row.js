define(['app','text!./bbi-project-row.html','filters/term', 'filters/title-case'], function(app, templateHtml) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('bbiProjectRow',['$filter', function($filter) {
        return {
            restrict: 'E',
            template : templateHtml,
            scope: {
                project: '='
            },
            link: function ($scope) {

              function formatCollaborator(col){
                if(col && col.length==2) return formatCountry(col)
                else return col
              }
              $scope.formatCollaborator = formatCollaborator;
              function formatCountry(term){
                  return $filter("term")(term);
              }
            },
            controller: function ($scope) {

            }
        };
    }]);

});

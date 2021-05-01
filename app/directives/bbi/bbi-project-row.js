import app from '~/app';
import templateHtml from './bbi-project-row.html';
import '~/filters/term';
import '~/filters/title-case'; 

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
            }
        };
    }]);



define(['app', 'lodash', 'text!./meeting-document.html', 'directives/checkbox', 'filters/html-sanitizer'], function(app, _, html) { 'use strict';

	var LANGUAGES = { ar : "العربية", en : "English", es : "Español", fr : "Français", ru : "Русский", zh : "中文" };
    var ONLINE = 'text/html';
    var MIMES = {
        'application/pdf':                                                            { priority: 10,  color: 'red',    btn: 'btn-danger',  icon: 'fa-file-pdf-o'   },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { priority: 20,  color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/msword':                                                         { priority: 30,  color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { priority: 40,  color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.ms-excel':                                                   { priority: 50,  color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { priority: 60,  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/vnd.ms-powerpoint':                                              { priority: 70,  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/zip':                                                            { priority: 80,  color: '',       btn: 'btn-default', icon: 'fa-file-archive-o' },
        'text/html':                                                                  { priority: 80,  color: '',       btn: 'btn-default', icon: 'fa-link' },
        'default':                                                                    { priority:999,  color: 'orange', btn: 'btn-default', icon: 'fa-file-o' }
    };

	 return app.directive('meetingDocument', [function() {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                document:"<",
                enableSelection:"<"
            },
			link: function ($scope) {

                $scope.MIMES     = MIMES;
                $scope.LANGUAGES = LANGUAGES;

                $scope.initByLanguages  = initByLanguages;
                $scope.initByTypes    = initByTypes;
                $scope.breakSymbol    = breakSymbol;
                $scope.downloadble    = canDownload();

                var destroyWatch = $scope.$watch('$root.deviceSize', function(size){
                    if(size=='xs') return; // for performance only load files byTypes  if sreeen > xs
                    initByTypes();         // it prevent unless ng-repeat
                    destroyWatch();
                });

                //==============================
                //
                //==============================
                function initByLanguages() {

                    if($scope.byLanguages)
                        return;

                    $scope.byLanguages = {};

                    _($scope.document.files||[]).sort(function(a,b) {

                        return sortByLanguage(a,b) || sortByType(a,b);

                    }).forEach(function(f){

                        $scope.byLanguages[f.language] = $scope.byLanguages[f.language]   || {};
                        $scope.byLanguages[f.language][f.type] = f;

                    }).value();
                }

                function initByTypes() {

                    if($scope.byTypes)
                        return;

                    $scope.byTypes = {};

                    _($scope.document.files||[]).sort(function(a,b) {

                        return sortByType(a,b) || sortByLanguage(a,b);

                    }).forEach(function(f){

                        $scope.byTypes[f.type] = $scope.byTypes  [f.type]   || {};
                        $scope.byTypes[f.type][f.language] = f;

                    }).value();
                }

                //==============================
                //
                //==============================
                function sortByType(a,b) {

                    if(MIMES[a.type] || MIMES[b.type]) {
                        a = (MIMES[a.type]||MIMES.default).priority;
                        b = (MIMES[b.type]||MIMES.default).priority;
                    }

                    if(a<b) return -1;
                    if(a>b) return  1;

                    return 0;
                }

                //==============================
                //
                //==============================
                function sortByLanguage(a,b) {

                    if(a.language<b.language) return -1;
                    if(a.language>b.language) return  1;

                    return 0;
                }


                //==============================
                //
                //==============================
                function breakSymbol(symbol) {
                    return symbol.replace(/\//g, '/<wbr>');
                }

                //==============================
                //
                //==============================
                function canDownload() {
                    return $scope.document.files && $scope.document.files.length && _.some($scope.document.files, function(f) { return f.type!=ONLINE; });
                }
			}
		};
	}]);
});

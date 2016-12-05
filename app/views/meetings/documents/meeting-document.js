define(['app', 'lodash', 'text!./meeting-document.html', 'directives/checkbox', 'filters/html-sanitizer'], function(app, _, html) { 'use strict';

	var LANGUAGES = { ar : "العربية", en : "English", es : "Español", fr : "Français", ru : "Русский", zh : "中文" };
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
                document:"<"
            },
			link: function ($scope) {

                $scope.MIMES     = MIMES;
                $scope.LANGUAGES = LANGUAGES;

                $scope.isSymbolVisible= !/^[A-Z0-9]{24}$/i.test($scope.document.symbol);
                $scope.initByLocales  = initByLocales;
                $scope.initByMimes    = initByMimes;
                $scope.breakSymbol    = breakSymbol;

                var destroyWatch = $scope.$watch('$root.deviceSize', function(size){
                    if(size=='xs') return; // for performance only load files byMimes  if sreeen > xs
                    initByMimes();         // it prevent unless ng-repeat
                    destroyWatch();
                });

                //==============================
                //
                //==============================
                function initByLocales() {

                    if($scope.byLocales)
                        return;

                    $scope.byLocales = {};

                    _($scope.document.files||[]).sort(function(a,b) {

                        return sortByLocale(a,b) || sortByMime(a,b);

                    }).forEach(function(f){

                        $scope.byLocales[f.locale] = $scope.byLocales[f.locale]   || {};
                        $scope.byLocales[f.locale][f.mime] = f;

                    }).value();
                }

                function initByMimes() {

                    if($scope.byMimes)
                        return;

                    $scope.byMimes = {};

                    _($scope.document.files||[]).sort(function(a,b) {

                        return sortByMime(a,b) || sortByLocale(a,b);

                    }).forEach(function(f){

                        $scope.byMimes[f.mime] = $scope.byMimes  [f.mime]   || {};
                        $scope.byMimes[f.mime][f.locale] = f;

                    }).value();
                }

                //==============================
                //
                //==============================
                function sortByMime(a,b) {

                    if(MIMES[a.mime] || MIMES[b.mime]) {
                        a = (MIMES[a.mime]||MIMES.default).priority;
                        b = (MIMES[b.mime]||MIMES.default).priority;
                    }

                    if(a<b) return -1;
                    if(a>b) return  1;

                    return 0;
                }

                //==============================
                //
                //==============================
                function sortByLocale(a,b) {

                    if(a.locale<b.locale) return -1;
                    if(a.locale>b.locale) return  1;

                    return 0;
                }


                //==============================
                //
                //==============================
                function breakSymbol(symbol) {
                    return symbol.replace(/\//g, '/<wbr>');
                }
			}
		};
	}]);
});

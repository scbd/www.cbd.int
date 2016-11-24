define(['app', 'lodash', 'text!./meeting-document.html', 'directives/checkbox'], function(app, _, html) { 'use strict';

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
                document:"="
            },
			link: function ($scope) {

                $scope.MIMES     = MIMES;
                $scope.LANGUAGES = LANGUAGES;

                $scope.lookupUrl = lookupUrl;
                $scope.isSymbolVisible= isSymbolVisible;
                $scope.locales   = _($scope.document.files).map('locale').uniq().sortBy().value();
                $scope.mimeTypes = _($scope.document.files).map('mime'  ).uniq().sort(function(a,b) {

                    if(MIMES[a] || MIMES[b]) {
                        a = (MIMES[a]||MIMES.default).priority;
                        b = (MIMES[b]||MIMES.default).priority;
                    }

                    if(a==b) return  0;
                    if(a <b) return -1;

                    return 1;

                }).value();


                //================================
                //
                //================================
                function lookupUrl(mime, locale) {
                    return _($scope.document.files).where({ mime: mime, locale: locale }).map('url').first();
                }

                //==============================
                //
                //==============================
                function isSymbolVisible(symbol) {
                    return !/^[A-Z0-9]{24}$/i.test(symbol);
                }
			}
		};
	}]);
});

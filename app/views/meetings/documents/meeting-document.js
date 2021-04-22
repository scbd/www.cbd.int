import app  from '~/app'
import _    from 'lodash'
import html from './meeting-document.html'
import '~/directives/meetings/documents/document-files'
import '~/directives/checkbox'
import '~/filters/html-sanitizer'

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

	app.directive('meetingDocument', ['$rootScope',function($rootScope) {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                document:"<",
                enableSelection:"<",
                showStatistics:"<"
            },
			link: function ($scope) {

                $scope.viewOnly       = $rootScope.viewOnly
                $scope.breakSymbol    = breakSymbol;
                $scope.downloadble    = canDownload();
                $scope.LANGUAGES      = LANGUAGES

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
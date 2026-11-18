import app  from '~/app'
import _    from 'lodash'
import html from './meeting-document.html'
import '~/directives/meetings/documents/document-files'
import '~/directives/checkbox'
import '~/filters/html-sanitizer'
import '~/authentication'
import lstring from '~/services/lstring'
import toDisplaySymbol from '~/filters/to-display-symbol'
import copyLink from '~/components/link.vue';
import AgendaItem from '~/components/meetings/sessions/agenda-item.vue'

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

	app.directive('meetingDocument', ['$rootScope', '$q', '$timeout', 'authentication', 'locale', function($rootScope, $q, $timeout, authentication, locale) {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                document:"<",
                enableSelection:"<",
                showItems:"<",
                showStatistics:"<",
                jumpTo:"<"
            },
			link: function ($scope) {

                $scope.viewOnly       = $rootScope.viewOnly
                $scope.breakSymbol    = breakSymbol;
                $scope.downloadble    = canDownload();
                $scope.linkOnly       = isLinkOnly();
                $scope.symbolUrl      = symbolUrl();
                $scope.titleUrl       = titleUrl();
                $scope.LANGUAGES      = LANGUAGES
                $scope.vueOptions = { components: { copyLink, AgendaItem } } ;
                $scope.dateFormat = ()=>$scope.showStatistics=='full' ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';
                $scope.copyForSharing = copyForSharing;

                $q.when(authentication.getUser()).then(function(user) {
                    $scope.isEditor = authentication.isInRole(user, ["EditorialService"]);
                });

                //==============================
                // Copies "symbol (linked) / title [prefix code]" as rich text with a plain-text fallback
                //==============================
                function copyForSharing() {

                    const { document } = $scope;
                    const symbol = toDisplaySymbol(document.symbol);
                    const url    = new URL(document.url, window.location.href).href;
                    const items  = (document.agendaItems||[]).map(i=>`${i.prefix||''} ${i.code||i.item||i}`.trim());
                    const title  = lstring(document.title, locale) + (items.length ? ` [${items.join(', ')}]` : '');

                    const html  = `<b><a href="${escapeHtml(url)}" style="font-weight:bold">${escapeHtml(symbol)}</a></b><br>${escapeHtml(title)}`;
                    const plain = `${symbol}\n${title}`;

                    navigator.clipboard.write([new ClipboardItem({
                        'text/html' : new Blob([html],  { type: 'text/html' }),
                        'text/plain': new Blob([plain], { type: 'text/plain' })
                    })]).then(function() {
                        $scope.$applyAsync(()=>$scope.copied = true);
                        $timeout(()=>$scope.copied = false, 2000);
                    });
                }

                function escapeHtml(text) {
                    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

                //==============================
                //
                //==============================
                function isLinkOnly() {
                    return Boolean($scope.document.files && $scope.document.files.length && !$scope.downloadble);
                }

                //==============================
                // The symbol is not clickable in view-only
                //==============================
                function symbolUrl() {

                    if($scope.viewOnly)
                        return '';

                    return $scope.document.url;
                }

                //==============================
                // With nothing to download, the target is the link itself
                //==============================
                function titleUrl() {

                    if($scope.linkOnly)
                        return $scope.document.files[0].url;

                    if($scope.viewOnly)
                        return '';

                    return $scope.document.symbol ? null : $scope.document.url;
                }
			}
		};
	}]);
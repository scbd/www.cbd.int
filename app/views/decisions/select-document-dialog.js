import $ from 'jquery'

import '~/filters/lstring'
import '~/directives/meetings/documents/document-files'

export { default as template } from './select-document-dialog.html'

export default ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

        $timeout(function(){ $('form #symbol').focus(); }, 100);

        $scope.search = search;
        $scope.save = save;

        var pending;

		//==========================
		//
		//==========================
        function search(text) {

            delete $scope.document;

            var symbol = (text||'').trim();

            pending = symbol;

            if(!symbol)
                return;

            if(/^http[s]?\:/i.test(symbol)) {

                $scope.document = {
                    symbol : symbol,
                    files  : [{ language : 'en', url : symbol, type : 'text/html' }]
                }

                return;
            }

            symbol = symbol.toUpperCase();

            $http.get("/api/v2016/documents", { cache : true, params : { q : { symbol : symbol }, fo : 1 } })
                .then(function(res){

                    if(pending.toUpperCase() !== symbol) return; // stale response

                    $scope.document = res.data;
                })
                .catch(function(){

                    if(pending.toUpperCase() !== symbol) return; // stale response

                    $scope.document = { symbol : symbol, notFound : true };
                });
        }

		//==========================
		//
		//==========================
        function save() {

            if(!$scope.document || $scope.document.notFound)
                return;

            $scope.closeThisDialog($scope.document.symbol)
        }
	}];

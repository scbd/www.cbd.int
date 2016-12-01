define(['angular', 'lodash', 'dropbox-dropins', 'ngCookies', 'directives/checkbox', 'filters/lstring'], function(angular, _, Dropbox) {'use strict';

    var PDF = 'application/pdf';

    return ['$scope', '$http', '$cookies', 'documents', '$filter', function ($scope, $http, $cookies, documents, $filter) {

        var _ctrl = $scope.printCtrl = this;

        documents = _(documents).filter(function(d) { return _.some(d.files, { mime : PDF }); }).value();

		_ctrl.locales = _(documents).map('files').flatten().where({ mime : PDF}).map('locale').uniq().sortBy().value();
		_ctrl.selectedLocales  = {};
        _ctrl.print = print;
		_ctrl.close = close;
        _ctrl.canPrint = canPrint;
        _ctrl.printShop = printShop;
        _ctrl.hasPrintShop = $cookies.get("printShop")=="true";

		//==============================================
		//
		//
		//==============================================
		function print() {

            if($scope.printForm.$invalid)
                return;

			delete _ctrl.error;
			delete _ctrl.success;

			var postData = {
				badge     : cleanBadge(),
				documents : documentsToPrint()
			};

			_ctrl.loading = true;

			$http.post("/api/v2014/printsmart-requests/batch", postData).then(function() {

				_ctrl.success = true;

			}).catch(function(res){

				if(angular.isObject(res.data)) _ctrl.error = res.data;
				else if(status==404)  _ctrl.error = { error: "NO_SERVICE" };
				else if(status==500)  _ctrl.error = { error: "NO_SERVICE" };
				else                  _ctrl.error = { error: "UNKNOWN",    message : "Unknown error" };

			}).finally(function(){
				delete _ctrl.loading;
            });
		}

		//==============================================
		//
		//
		//==============================================
		function documentsToPrint() {

			return _(documents).map(function(doc) {

                var pdfs  = _.where (doc.files, { mime: PDF });
                var files = _.filter(pdfs, function(f) { return _ctrl.selectedLocales[f.locale]; });

                if(!files.length) files = _.where(pdfs, { locale: 'en' });
                if(!files.length) files = _.take (pdfs, 1);

                var lstring = $filter('lstring');

                return _.map(files, function(f) {
                    return {
						symbol  : doc.symbol,
                        title   : lstring(doc.title||{}, 'en'),
						tag     : doc.tag,
						url     : f.url,
						language: f.locale
                    };
                });

			}).flatten().value();
		}

		//==============================================
		//
		//
		//==============================================
		function cleanBadge(code) {
			return (code||_ctrl.badgeCode||"").replace(/[^0-9]/g, "");
		}

		//==============================================
		//
		//
		//==============================================
		function canPrint() {
			return cleanBadge().length >= 8 && _.some(_ctrl.selectedLocales);
		}

		//==============================================
		//
		//
		//==============================================
		function printShop() {

			delete _ctrl.error;
			delete _ctrl.success;

            localStorage.setItem("printShop", JSON.stringify({
                badge     : cleanBadge(),
                documents : documentsToPrint()
            }));

			close().then(function(){
                $window.location = '/printsmart/printshop';
			});
		}

		//==============================================
		//
		//
		//==============================================
        function focus() {
            angular.element('#badgeCode:visible').focus();
        }

		//==============================================
		//
		//
		//==============================================
		function close(target) {
            $scope.closeThisDialog(target);
		}

	}];
});

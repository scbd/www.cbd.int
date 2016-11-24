define(['app', 'text!./print-smart-checkout.html', 'require', 'lodash', 'angular', 'ngDialog'], function(app, templateHtml, require, _, ng) {

    var PDF = 'application/pdf';

	app.directive('printSmartCheckout', ['$q', '$timeout', 'ngDialog', function($q, $timeout, ngDialog) {
		return {
			restrict : "E",
			replace : true,
			template : templateHtml,
			scope : {
                documents : "&documents"
            },
			link: function ($scope, element) {

                initHelp();

		        $scope.canPrint = function() { return true; };//psCtrl.canPrint();
		        $scope.clear    = clear;
		        $scope.remove   = remove;
		        $scope.checkout = checkout;
		        $scope.print    = print;
		        $scope.download = download;
		        $scope.printableDocuments = printableDocuments;

				//==============================================
				//
				//
				//==============================================
				function documents() {
                    return $scope.documents();
				}

				//==============================================
				//
				//
				//==============================================
				function printableDocuments() {
                    return _(documents).filter(function(d) {
                        return d.printable && _(d.files||[]).some({ mime: PDF }) ;
                    }).value();
                }


				//==============================================
				//
				//
				//==============================================
				function clear() {
                    (documents()||[]).forEach(remove);
				}

				//==============================================
				//
				//
				//==============================================
				function remove(d) {
					delete d.selected;
				}

				//==============================================
				//
				//
				//==============================================
				function checkout() {

                    if(!documents().length) return help(true);

					openDialog('./checkout-dialog', { resolve : { documents: resolver(documents()) } }).then(function(dialog){
                        dialog.closePromise.then(onCloseDialog);
                    });
				}

				//==============================================
				//
				//
				//==============================================
				function print() {

                    if(!documents().length) return help(true);

					openDialog('./print-dialog', { resolve : { documents: resolver(documents()) } }).then(function(dialog){
                        dialog.closePromise.then(onCloseDialog);
                    });
				}

				//==============================================
				//
				//
				//==============================================
				function download() {

                    if(!documents().length) return help(true);

					openDialog('./download-dialog', { resolve : { documents: resolver(documents()) } }).then(function(dialog){
                        dialog.closePromise.then(onCloseDialog);
                    });
				}

				//==============================================
				//
				//
				//==============================================
				function onCloseDialog(res) {
                    if(res.value=='checkout') checkout();
                    if(res.value=='download') download();
                    if(res.value=='print')    print();
                    if(res.value=='clear')    clear();
                }

				//==============================================
				//
				//
				//==============================================
                var helpTimer;
                function help(visible) {

                    $timeout.cancel(helpTimer);

                    element.find('#checkout').popover(visible ? 'show' : 'hide');
                    ng.element('body').toggleClass('printsmart-help', visible);

                    if(visible) {
                        helpTimer = $timeout(function() {
                            help(false);
                        }, 2000);
                    }
                }

				//==============================================
				//
				//
				//==============================================
                function initHelp() {
                    element.find('#checkout').popover({ placement: 'top', trigger : 'manual' });
                    $scope.$on('$destroy', function(){
                        help(false);
                    });
                }
	        }
		};

        //===========================
        //
        //===========================
        function openDialog(dialog, options) {

            options = options || {};

            return $q(function(resolve, reject) {

                require(['text!'+dialog+'.html', dialog], function(template, controller) {

                    options.plain = true;
                    options.template = template;
                    options.controller = controller;

                    if(options.showClose      ===undefined) options.showClose       = false;
                    if(options.closeByDocument===undefined) options.closeByDocument = false;
                    if(options.className      ===undefined) options.className       = 'ngdialog-theme-default printsmart';

                    var dialog = ngDialog.open(options);

                    dialog.closePromise.then(function(res){

                        if(res.value=="$escape")      throw res; //cancel
                        if(res.value=="$document")    throw res; //cancel
                        if(res.value=="$closeButton") throw res; //cancel

                        return res;
                    });

                    resolve(dialog);

                }, reject);
            });
        }

        //===========================
        //
        //===========================
        function resolver(value) {
            return function() { return value; };
        }

	}]);
});

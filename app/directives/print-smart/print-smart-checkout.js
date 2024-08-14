import 'ngDialog'
import '~/filters/lstring'
import locations from './locations'
import app from '~/app'
import templateHtml from './print-smart-checkout.html'
import _ from 'lodash'
import ng from 'angular'

    var PDF    = 'application/pdf';
    var ONLINE = 'text/html';

	app.directive('printSmartCheckout', ['$q', '$timeout', 'ngDialog', '$filter', function($q, $timeout, ngDialog, $filter) {

        var lstring = $filter('lstring');

        return {
			restrict : "E",
			replace : true,
			template : templateHtml,
			scope : {
                documents : "&documents",
                allowPrint : "<allowPrint"
            },
			link: function ($scope, element) {

                initHelp();

		        $scope.clear    = clear;
		        $scope.remove   = remove;
		        $scope.checkout = checkout;
		        $scope.print    = print;
		        $scope.download = download;
		        $scope.printableDocuments = printableDocuments;
		        $scope.downloadableDocuments = downloadableDocuments;
                $scope.displayText = displayText;
                $scope.getButtonSize = getButtonSize;

				//==============================================
				//
				//
				//==============================================
                function getButtonSize() {
                    const isSmall = ['xs', 'sm'].includes($scope.deviceSize);
                    const isSmall = ['xs', 'sm'].includes($scope.$root.deviceSize);
        
                    return { 'btn-xs': isSmall };
                }

				//==============================================
				//
				//
				//==============================================
				function printableDocuments() {
                    return _($scope.documents()).filter(function(d) {
                        return d.metadata && d.metadata.printable && _(d.files||[]).some({ type: PDF }) ;
                    }).value();
                }

				//==============================================
				//
				//
				//==============================================
				function downloadableDocuments() {
                    return _($scope.documents()).filter(function(d) {
                        return !_(d.files||[]).all({ type: ONLINE }) ;
                    }).value();
                }

				//==============================================
				//
				//
				//==============================================
				function clear(source) {

                    var docs = $scope.documents();

                    if(source=='print')
                        docs = printableDocuments();

                    (docs||[]).forEach(remove);
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
                function displayText(d) {
                    return d.symbol || truncate(lstring(d.title, 'en'), 50);
                }

                //==============================================
                //
                //
                //==============================================
                function truncate(t, length) {
                    return t.length>length ? t.substr(0,length)+'...' : t;
                }

				//==============================================
				//
				//
				//==============================================
				function checkout() {

                    if(canPrint() && canDownload())
                    {
                        return openDialog(import('./checkout-dialog'), { resolve : {
                            allowPrint : resolver($scope.allowPrint),
                            documents: resolver({
                                printable : printableDocuments(),
                                downloadable: downloadableDocuments()
                            })
                        }}).then(function(dialog){
                            dialog.closePromise.then(function(res) {
                                onCloseDialog(res.value, 'checkout');
                            });
                        });
                    }

                    if(canPrint())    return print();
                    if(canDownload()) return download();

                    help(true);
                }

                function canPrint()    { return !!printableDocuments()   .length && !!$scope.allowPrint; }
                function canDownload() { return !!downloadableDocuments().length; }

				//==============================================
				//
				//
				//==============================================
				function setLocation() {

                    if(!$scope.documents()  .length) return help(true);
                    if(!printableDocuments().length) return;

					openDialog(import('./print-location-dialog'), { resolve : { } }).then(function(dialog){
                        dialog.closePromise.then(function(res) {
                            var val = res.value || {};

                            onCloseDialog(val.action, 'print', { location: val.location });
                        });
                    });
                }

				//==============================================
				//
				//
				//==============================================
				function print(options) {

                    if(!$scope.documents()  .length) return help(true);
                    if(!printableDocuments().length) return;

                    var location = (options||{}).location;

                    if(locations && locations.length && !location)
                        return setLocation();

                        openDialog(import('./print-dialog'), { 
                        resolve : { 
                            documents: resolver(printableDocuments()), 
                            allowBack: resolver(canDownload()), 
                            location: resolver(location) 
                        }
                    }).then(function(dialog){
                        dialog.closePromise.then(function(res) {
                            onCloseDialog(res.value, 'print');
                        });
                    });
				}

				//==============================================
				//
				//
				//==============================================
				function download() {

                    if(!$scope.documents()     .length) return help(true);
                    if(!downloadableDocuments().length) return;

					openDialog(import('./download-dialog'), { resolve : { documents: resolver(downloadableDocuments()), allowBack: resolver(canPrint()) } }).then(function(dialog){
                        dialog.closePromise.then(function(res) {
                            onCloseDialog(res.value, 'download');
                        });
                    });
				}

				//==============================================
				//
				//
				//==============================================
				function onCloseDialog(action, source, options) {
                    if(action=='checkout') checkout(options);
                    if(action=='download') download(options);
                    if(action=='location') setLocation(options);
                    if(action=='print')    print(options);
                    if(action=='clear')    clear(source);
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
        async function openDialog(dialog, options) {

            options = options || {};

            return $q.when(dialog).then(({ template, default: controller })=>{

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

                return dialog;
            });
        }

        //===========================
        //
        //===========================
        function resolver(value) {
            return function() { return value; };
        }


	}]);
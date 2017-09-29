define(['app', 'directives/es-pages/header-nav', 'filters/term', 'filters/moment', 'filters/title-case', 'services/storage'], function(app) {
    'use strict';

    return ['$routeParams', '$scope', '$sce', '$location', '$window', 'IStorage', '$timeout', function($routeParams, $scope, $sce, $location, $window, storage, $timeout) {

        var _ctrl = this;
        _ctrl.loading = false;
        _ctrl.isFeatured = isFeatured;
        _ctrl.eventWebsite = eventWebsite
        _ctrl.showWebsites = showWebsites
        // if(~$routeParams.id.indexOf('twiiter')){
        // 	_ctrl.twitter=true;
        //     _ctrl.url=decodeURIComponent($routeParams.id);
        // }else
        // 	_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+$routeParams.id+'?rel=0');
        //
        // $scope.$root.page={};
        // $scope.$root.page.title = "Media: Cristiana Pașca Palmer";

        // window.location.replace("https://www.cbd.int/2011-2020/dashboard/submit/event/"+$routeParams.id+"/view", "_self")
        init();


        //==================================
        //
        //==================================
        function init() {
            _ctrl.loading = true;

            var identifier = $routeParams.id;
            var promise = null;
            var config = {};
            var header = {};
            config.headers = {
                realm: undefined
            };

            if (identifier) {
                promise = storage.documents.get(identifier, {
                    cache: false
                }, config);
                promise.then(
                    function(doc) {

                        _ctrl.document = doc.data;

                        if (doc.governments && doc.governments.length === 198)
                            $scope.document.everyCountry = true;

                        if (!doc.type) doc.type = [{
                            "identifier": "60C32FAE-649C-4D33-B0E6-DDE1F8B06C55"
                        }];
                        var cover;

                        if (_ctrl.document && _ctrl.document.images)
                            cover = _ctrl.document.images.find(function(i) {
                                if (i.name === 'cover') return true;
                            });
                        if (cover)
                            _ctrl.cover = cover.url;

                        var header = storage.documents.get(identifier, {
                            info: '',
                            cache: false
                        }, config);
                        header.then(function(h) {
                            _ctrl.header = h.data;
                        });
                        _ctrl.loading = false;
                        $timeout(function() {
                            popup.init();
                        });
						loadReference(_ctrl.document.contactOrganization).then(function(ref){
							_ctrl.contactOrganization ={};
								_ctrl.contactOrganization.document=ref.data;
								if(_ctrl.contactOrganization.document.relevantDocuments)
								_ctrl.contactOrganization.logo=_ctrl.contactOrganization.document.relevantDocuments.find(function(e){if(e.name==='logo')return true;});
						});
                    }).then(null,
                    function(err) {
                        $location.path('/404');
                        _ctrl.loading = false;
                        onError(err.data, err.status);
                        throw err;
                    });

            }



        }

        //==================================
        //
        //==================================
        function showWebsites() {

            if (!_ctrl.document || !_ctrl.document.websites) return false;

            if (_ctrl.document.websites && eventWebsite() && _ctrl.document.websites.length > 1)
                return true
            if (_ctrl.document.websites && !eventWebsite())
                return true

            return false;
        }
        //==================================
        //
        //==================================
        function isFeatured() {
            if (!_ctrl.document) return false;

            if (_ctrl.document.thematicAreas) {
                var tA = _ctrl.document.thematicAreas
                return tA.find(function(element) {
                    if (element.identifier === '3FEF79FF-9EA2-4E3A-BEC9-2991CCDD7F3A') return true
                })
            }
            return false;
        }
        //==================================
        //
        //==================================
        function eventWebsite() {
            if (!_ctrl.document || !_ctrl.document.websites) return false;

            if (_ctrl.document.websites) {
                var sites = _ctrl.document.websites
                return sites.find(function(element) {
                    if (element.name === 'website') return true
                }).url;
            }
            return false;
        }
		function loadReference(ref) {

				return storage.documents.get(ref.identifier, { cache : true})
					.success(function(data){
						return ref= data;
					}).error(function(error, code){
						if (code == 404 && $scope.allowDrafts == "true") {

							return storage.drafts.get(ref.identifier, { cache : true})
								.success(function(data){
									return ref= data;
								}).error(function(draftError, draftCode){
									ref.document  = undefined;
									ref.error     = draftError;
									ref.errorCode = draftCode;
								});
						}

						ref.document  = undefined;
						ref.error     = error;
						ref.errorCode = code;

					});

		};
        //==================================
        //
        //==================================
        function onError(error, status) {
            $scope.status = "error";

            if (status == "notAuthorized") {
                _ctrl.status = "hidden";
                _ctrl.error = "You are not authorized to modify this record";
            } else if (status == 404) {
                _ctrl.status = "hidden";
                _ctrl.error = "Record not found.";
            } else if (status == "badSchema") {
                _ctrl.status = "hidden";
                _ctrl.error = "Record type is invalid.";
            } else if (error.Message)
                _ctrl.error = error.Message;
            else
                _ctrl.error = error;
        };
        var popup = {
            init: function() {
                $('figure').click(function() {
                    popup.open($(this));
                });

                $(document).on('click', '.popup img', function() {
                    return false;
                }).on('click', '.popup img', function() {
                    popup.close();
                }).on('click', '.popup', function() {
                    popup.close();
                })
            },
            open: function(id) {
                var $figure = $('#' + id);

                $('.gallery').addClass('pop');
                var $popup = $('<div class="popup" />').appendTo($('body'));
                var $fig = $figure.clone().appendTo($('.popup'));
                $fig.removeClass('hidden');
                var $bg = $('<div class="bg" />').appendTo($('.popup'));
                var $close = $('<div class="close"><svg><use xlink:href="#close"></use></svg></div>').appendTo($fig);
                var $shadow = $('<div class="shadow" />').appendTo($fig);
                var src = $('img', $fig).attr('src');
                $shadow.css({
                    backgroundImage: 'url(' + src + ')'
                });
                $bg.css({
                    backgroundImage: 'url(' + src + ')'
                });
                setTimeout(function() {
                    $('.popup').addClass('pop');
                }, 10);
            },
            close: function() {
                $('.gallery, .popup').removeClass('pop');
                setTimeout(function() {
                    $('.popup').remove()
                }, 100);
            }
        }

        _ctrl.pop = popup.open;
    }];
});
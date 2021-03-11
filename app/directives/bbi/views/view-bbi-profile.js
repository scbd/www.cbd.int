define(['text!./view-bbi-profile.html', '~/app', 'angular', 'lodash', '~/services/storage'
], function(template, app, angular, _) {
	'use strict';

	app.directive('viewBbiProfile', ["IStorage","$location", function (storage,$location) {
		return {
			restrict: 'E',
			template: template,
			replace: true,
			transclude: false,
			scope: {
				document: '=ngModel',
				locale	: '=',
					user:"=?",
				loading:"=?",
				header:"=?"
			},
			link: function($scope) {
								if(typeof $scope.header==='undefined') $scope.header=true;
                $scope.$watch("document.contact", function()
                {
                    if($scope.document)
                        $scope.contact = angular.fromJson(angular.toJson($scope.document.contact));

                    if($scope.contact)
                        $scope.loadReferences($scope.contact).then(function(data){
                            $scope.contact = data;
														if(data.contactOrganization)
																$scope.loadReferences(data.contactOrganization).then(function(d){
																		$scope.contactOrg = d;
																});
                        });
                });


								//====================
								//
								//====================
								$scope.isAdmin = function() {
									if($scope.user)
										 return !!_.intersection($scope.user.roles, ["Administrator","BbiAdministrator"]).length;
								};
								//====================
								//
								//====================
								$scope.isReview = function() {
										 return !!($location.url().indexOf('/view')>-1);
								};
                //====================
                //
                //====================
                $scope.$watch("document.organization", function()
                {
                    if($scope.document)
                        $scope.organization = angular.fromJson(angular.toJson($scope.document.organization));

                    if($scope.organization)
                        $scope.loadReferences($scope.organization).then(function(data){
                            $scope.organization = data;

                        });
                });

								//====================
								//
								//====================
								$scope.getLogo = function() {

									  if(!$scope.contactOrg || !$scope.contactOrg.relevantDocuments) return false;
										return _.find($scope.contactOrg.relevantDocuments,{name:'logo'});
								};
                //====================
                //
                //====================
                $scope.loadReferences = function(ref) {

                   return storage.documents.get(ref.identifier, { cache : true})
                        .then(function(data){
                            ref = data.data;
                            return ref;
                        })
                        .catch(function(error, code){
                            if (error.status == 404) {

                            return storage.drafts.get(ref.identifier, { cache : true})
                                    .then(function(data){
                                        ref =  data.data;
                                        return ref;
                                    })
                                    .catch(function(draftError, draftCode){
                                        return { error  : error, errorCode : code};
                                    });
                            }
                            else{
                                return { error  : error, errorCode : code};
                            }
                        });
                };
			}
		};
	}]);
});
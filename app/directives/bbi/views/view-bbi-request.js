define(['text!./view-bbi-request.html', 'app', 'lodash',  'services/storage','services/mongo-storage',
], function(template, app, _) {
	'use strict';

	app.directive('viewBbiRequest', ["IStorage","$location", function (storage,$location) {
		return {
			restrict: 'E',
			template: template,
			replace: true,
			transclude: false,
			scope: {
				document: '=ngModel',
				locale	: '=',
				loading:"=?",
				user:"=?",
				header:"=?"
			},
			link: function($scope) {
  							if(typeof $scope.header==='undefined') $scope.header=true;
                var killWatchContact = $scope.$watch("document.contact", function()
                {
                    if($scope.document )
                    $scope.contact = angular.fromJson(angular.toJson($scope.document.contact));

                    if($scope.contact)
                        $scope.loadReferences($scope.contact).then(function(data){
                            $scope.contact = data[0];
														killWatchContact();
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
									$scope.isOwnerOrAdmin= function() {
																					 var isAdmin;
										if($scope.user)
											 isAdmin = !!_.intersection($scope.user.roles, ["Administrator","BbiAdministrator"]).length;
											 var isNotReview = !!($location.url().indexOf('/view')>-1);
											 var isOwner = ($scope.document && $scope.document.meta && $scope.user && $scope.user.userID===$scope.document.meta.createdBy);

										 return ((isOwner || isAdmin) && isNotReview);
								};
                // //====================
                // //
                // //====================
                // var killWatchPriCon = $scope.$watch("document.primaryOrganization", function()
                // {
                //     if($scope.document && !$scope.document.primaryOrganization) return;
								//
                //     $scope.primaryOrganization = angular.fromJson(angular.toJson($scope.document.primaryOrganization));
                //     if($scope.primaryOrganization)
                //         $scope.loadReferences($scope.primaryOrganization).then(function(data){
                //             $scope.primaryOrganization = data[0];
								// 						$scope.loadReferences($scope.primaryOrganization.organization).then(function(orgData){
								// 								Object.assign($scope.primaryOrganization,orgData[0]);
								// 						});
								// 						killWatchPriCon();
                //         });
                // });

								//====================
                //
                //====================
                var killWatchOrg = $scope.$watch("document.organization", function()
                {
                    if(!$scope.document || !$scope.document.organization)return;

										$scope.organization  = angular.fromJson(angular.toJson($scope.document.organization));

                    if($scope.organization)
												$scope.loadReferences($scope.organization).then(function(data){ //jshint ignore:line
														Object.assign($scope.organization,data[0]);
												});

										killWatchOrg();
                });
								//====================
								//
								//====================
								$scope.getLogo = function() {

									  if(!$scope.organization ||  !$scope.organization.relevantDocuments) return false;
										return _.find($scope.organization.relevantDocuments,{name:'logo'});
								};
                //====================
                //
                //====================
                $scope.loadReferences = function(ref,index) {

									if(Number.isInteger(index) && Array.isArray(ref)) ref=ref[index];
                   return storage.documents.get(ref.identifier, { cache : true})
                        .then(function(data){
													 ref=[];
                            ref[0] = data.data;
														ref[1] = index;
                            return ref;
                        })
                        .catch(function(error, code){
                            if (error.status == 404) {

                            return storage.drafts.get(ref.identifier, { cache : true})
                                    .then(function(data){
																			ref=[];
					                             ref[0] = data.data;
					 														ref[1] = index;
                                        return ref;
                                    })
                                    .catch(function(error){
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
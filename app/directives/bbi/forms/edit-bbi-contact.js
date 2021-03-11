import template from './edit-bbi-contact.html';
import bbiRecordsDialog from './bbi-records-dialog.html';
import bbiFirstContactDialog from './first-contact-dialog.html';
import app from '~/app';
import angular from 'angular';
import _ from 'lodash';
import '~/authentication';
import '~/services/editFormUtility';
import '~/services/storage';
import '~/services/workflows';
import '~/directives/bbi/controls/km-control-group';
import '~/directives/bbi/controls/km-select';
import '~/directives/bbi/controls/km-link';
import '~/directives/bbi/controls/km-inputtext-ml';
import '~/directives/bbi/controls/km-inputtext-list';
import '~/directives/bbi/controls/km-document-validation';
import '~/directives/bbi/controls/km-form-languages';
import '~/directives/bbi/controls/km-form-std-buttons';
import '~/providers/locale';
import '../views/view-bbi-contact';
	

	app.directive('editBbiContact', ['$http', "$rootScope", "Enumerable", "$filter", "$q", "guid", "$location", "Thesaurus", 'authentication', 'editFormUtility', 'IStorage', '$route', 'locale','userSettings','ngDialog','$timeout', function($http, $rootScope, Enumerable, $filter, $q, guid, $location, thesaurus, authentication, editFormUtility, storage, $route,locale,userSettings,ngDialog,$timeout) {
		return {
			restrict: 'E',
			template: template,
			replace: true,
			transclude: false,
			scope: {
				user: '='
			},
			link: function($scope) {
			$scope.schema = 'bbi-contact';
				$scope.status = "";
				$scope.error = null;
				$scope.document = null;
				$scope.tab = 'general';
				$scope.review = {
					locale: "en"
				};
				$scope.options = {
					allLanguages: allLanguages,
					languages: function() {
						return $http.get("/api/v2013/thesaurus/domains/52AFC0EE-7A02-4EFA-9277-8B6C327CE21F/terms", {
							cache: true
						}).then(function(o) {
							return $filter('orderBy')(o.data, 'name');
						});
					},
					countries: function() {
						return $http.get("/api/v2013/thesaurus/domains/countries/terms", {
							cache: true
						}).then(function(o) {
							return $filter('orderBy')(o.data, 'name');
						});
					},
					libraries: function() {
						return $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms", {
							cache: true
						}).then(function(o) {
							return o.data;
						});
					},
				};


			userSettings.ready.then(bbiRecords).then(function(){$timeout(firstContact,1000);});
				//============================================================
				//
				//
				//============================================================
				function bbiRecords() {
					  if(typeof userSettings.setting('bbi.recordsNotice') ==='undefined' || !userSettings.setting('bbi.recordsNotice')){
								$scope.bbiRecordsNotice=false;
								return ngDialog.open({
											template: bbiRecordsDialog,
											className: 'ngdialog-theme-default',
											closeByDocument: false,
											plain: true,
											scope:$scope
								}).closePromise;
						}
				}

				//============================================================
				//
				//
				//============================================================
				function firstContact() {
					  if(typeof userSettings.setting('bbi.firstContactNotice') ==='undefined' || !userSettings.setting('bbi.firstContactNotice')){
								$scope.bbiFirstContact=false;
								userSettings.setting('bbi.firstContactNotice',false);
								return ngDialog.open({
											template: bbiFirstContactDialog,
											className: 'ngdialog-theme-default',
											closeByDocument: false,
											plain: true,
											scope:$scope
								}).closePromise;
						}
				}

				//============================================================
				//
				//
				//============================================================
				function settingsChange(key,value) {
						userSettings.setting(key,value);
				}//bbiRecordsNoticeChange
	 			$scope.settingsChange=settingsChange;

				function allLanguages() {
					return $q.all([
						$http.get("/api/v2013/thesaurus/domains/ISO639-2/terms", {
							cache: true
						})
					]).then(function(o) {
						var data = $filter("orderBy")(o[0].data, "name");

						return data;
					});
				}
				//============================================================
				//
				//============================================================
				$scope.nextTab = function() {
					var next = 'review';

					if ($scope.tab == 'general') {
						next = 'org';
					}
						if ($scope.tab == 'org') {
							next = 'address';
						}
					if ($scope.tab == 'address') {
						next = 'contact';
					}
					if ($scope.tab == 'contact') {
						next = 'review';
						$scope.validate();
					}

					$scope.tab = next;
				};

				//============================================================
				//
				//============================================================
				$scope.prevTab = function() {
					var prev;

					if ($scope.tab == 'org') {
						prev = 'general';
					}
						if ($scope.tab == 'address') {
							prev = 'org';
						}
					if ($scope.tab == 'contact') {
						prev = 'address';
					}
					if ($scope.tab == 'review') {
						prev = 'contact';
					}
					$scope.tab = prev;
				};

				//============================================================
				//
				//============================================================
				$scope.updateWebsites = function(name, value) {
					if (!$scope.document.websites) $scope.document.websites = [];
					var site = _.find($scope.document.websites, {
						'name': name
					});
					if (site)
						if (value && value.trim()!=='')
							site.url = value;
						else
							delete($scope.document.websites[_.findIndex($scope.document.websites, {
								'name': name
							})]);

					else
						$scope.document.websites.push({
							name: name,
							url: value,
							tags: 'link'
						});
					$scope.document.websites = _.compact($scope.document.websites);
				};





				//==============================
				//
				//
				//==============================
				function onError(err) {

					err = err.data || err;
					$scope.$emit('showError', 'ERROR: Cobtact  was not saved.');
					$scope.errors = err.errors || [err];

					console.error($scope.errors);
				}

				//==============================
				//
				//
				//==============================
				$scope.clearAddressSearch = function() {
					$scope.selectedAddress = '';
					$scope.placeSearch = '';
					$scope.noPredictions = false;
					delete($scope.document.organization);
					delete($scope.document.address);
					delete($scope.document.city);
					delete($scope.document.state);
					delete($scope.document.country);
					delete($scope.document.phones);
					delete($scope.document.websites);
					delete($scope.document.phones);
					delete($scope.document.postalCode);
					delete($scope.document.profileLink);
										delete($scope.document.coordinates);
				};
				$scope.newAddress = function() {
					$scope.clearAddressSearch();
					$scope.isNewAddress = true;
				};


				//==================================
				//
				//==================================
				$scope.isLoading = function() {
					return $scope.status == "loading";
				};

				//==================================
				//
				//==================================
				$scope.hasError = function() {
					return !!$scope.error;
				};

				//==================================
				//
				//==================================
				$scope.userGovernment = function() {
					return $scope.user.government;
				};

				//==================================
				//
				//==================================
				$scope.init = function() {
					//  $scope.initMap();
					if ($scope.document )
						return;

					$scope.status = "loading";

					var identifier = $route.current.params.id;
					var promise = null;

					if (identifier && identifier !='new')
						promise = editFormUtility.load(identifier, "bbiContact");
					else
						promise = $q.when({
							header: {
								identifier: guid(),
								schema: "bbiContact",
								languages: ["en"]
							}
						});


					promise.then(
						function(doc) {
							$scope.status = "ready";
							$scope.document = doc;
						}).then(null,
						function(err) {
							$scope.onError(err.data, err.status);
							throw err;
						});
				};

				//==================================
				//
				//==================================
				$scope.onPreSaveDraft = function() {
					return $scope.cleanUp();
				};

				//==================================
				//
				//==================================
				$scope.onPrePublish = function() {
					return $scope.validate(false).then(function(hasError) {
						if (hasError)
							$scope.tab = "review";
						return hasError;
					});
				};
				//==================================
				//
				//==================================
				$scope.onPostWorkflow = function() {
					$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
					gotoManager();
				  $location.search('index-view','workflow');
				};

				//==================================
				//
				//==================================
				$scope.onPostPublish = function() {
					$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
					gotoManager();
					$location.search('index-view','public');
				};

				//==================================
				//
				//==================================
				$scope.onPostSaveDraft = function() {
					$rootScope.$broadcast("onSaveDraft", "Draft record saved.");
				};

				//==================================
				//
				//==================================
				$scope.onPostClose = function() {
					$rootScope.$broadcast("onPostClose", "Record closed.");
					gotoManager();
				};
				//==================================
				//
				//==================================
				function gotoManager() {
					$scope.$emit('showInfo', 'Contact successfully updated.');
					$location.path("/platform/submit/bbi-contact");
					$location.search('index-update',$scope.document.header.identifier);

				}

				//==================================
				//
				//==================================
				$scope.cleanUp = function(document) {
					document = document || $scope.document;

					_.each(document,function(property,name){
							if(_.isEmpty(document[name])) delete(document[name]);
					});
					if (!document)
						return $q.when(true);


					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;

					return $q.when(false);
				};
				//=======================================================================
				//
				//=======================================================================
			function generateValidationReport () {
						$scope.editForm.$submitted = true;
						var report;
						if($scope.editForm.$error && $scope.editForm.$error.required && $scope.editForm.$error.required.length){
								report = {};
								report.errors=[];
								for(var i=0; i<$scope.editForm.$error.required.length;i++)
									if($scope.editForm.$error.required[i].$name!=='linkForm' && $scope.editForm.$error.required[i].$name)
											report.errors.push({code:'Error.Mandatory',property:$scope.editForm.$error.required[i].$name});

						}
					return report;

				}
				//============================================================
				//
				//============================================================
				function initFromProfile(preFill) {


								if(preFill)
								return $http.get('/api/v2013/users/' + $scope.user.userID).then(function onsuccess(response) {


										$scope.document.emails = [response.data.Email];
										// $scope.document.address = response.data.Address;
										// $scope.document.city = response.data.City;
										// if(response.data.Country)
										// 	$scope.document.country = {identifier:response.data.Country};
										if(response.data.Department){
										  $scope.document.department={};
											$scope.document.department[locale]= response.data.Department;
										}

										if(response.data.Designation){
										  $scope.document.designation={};
											$scope.document.designation[locale]= response.data.Designation;
										}
										$scope.document.prefix = {en:response.data.Title};
										// $scope.document.state = response.data.State;
										// if(response.data.Zip){
										// 	$scope.document.postalCode={};
										// 	$scope.document.postalCode[locale] = response.data.Zip;
										// }
										$scope.document.phones = [response.data.Phone];
										$scope.document.firstName = response.data.FirstName;
										$scope.document.lastName = response.data.LastName;


								}).catch(onError);
								else{
									$scope.document.emails = '';
									$scope.document.address = '';
									$scope.document.city = '';
									$scope.document.country = '';
									$scope.document.department= '';
									$scope.document.designation= '';
									$scope.document.prefix = '';
									$scope.document.state = '';
									$scope.document.zip = '';
									$scope.document.phones = '';
									$scope.document.firstName = '';
									$scope.document.lastName = '';
								}



				} // initProfile()
				$scope.initFromProfile=initFromProfile;
				//==================================
				//
				//==================================
				$scope.validate = function(clone) {
  				var frontEndValidationReport = generateValidationReport();

					$scope.validationReport = null;

					var oDocument = $scope.document;
					if (clone !== false)
						oDocument = angular.fromJson(angular.toJson(oDocument));

					return $scope.cleanUp(oDocument).then(function(cleanUpError) {
						return storage.documents.validate(oDocument).then(
							function(success) {
								$scope.validationReport = success.data;

								if($scope.validationReport.errors && Array.isArray($scope.validationReport.errors) && $scope.validationReport.errors.length){

									_.each(frontEndValidationReport.errors,function(err){
												if(err.property==='org')
														_.each($scope.validationReport.errors,function(e,i){
															  if(!e)return;
																if(e.property==='address' ||
																	 e.property==='city' ||
																	e.property==='state' ||
																	e.property==='zip')
																	$scope.validationReport.errors=$scope.validationReport.errors.splice(i,1);
														});
												if(!_.find($scope.validationReport.errors,{property:err.property,code:err.code}))
													$scope.validationReport.errors.push(err);
									});
								}else{

									if(frontEndValidationReport)
									_.each(frontEndValidationReport.errors,function(err){
											if(!$scope.validationReport.errors)$scope.validationReport.errors=[];
														$scope.validationReport.errors.push(err);
									});
								}
								return cleanUpError || !!(success.data && success.data.errors && success.data.errors.length);
							},
							function(error) {
								$scope.onError(error.data);
								return true;
							}
						);
					});
				};

				//==================================
				//
				//==================================
				$scope.isFieldValid = function(field) {
					if (field && $scope.validationReport && $scope.validationReport.errors)
						return !Enumerable.From($scope.validationReport.errors).Any(function(x) {
							return x.property == field;
						});

					return true;
				};

				//==================================
				//
				//==================================
				$scope.onError = function(error, status) {
					$scope.status = "error";

					if (status == "notAuthorized") {
						$scope.status = "hidden";
						$scope.error = "You are not authorized to modify this record";
					} else if (status == 404) {
						$scope.status = "hidden";
						$scope.error = "Record not found.";
					} else if (status == "badSchema") {
						$scope.status = "hidden";
						$scope.error = "Record type is invalid.";
					} else if (error.Message)
						$scope.error = error.Message;
					else
						$scope.error = error;
				};

				//==================================
				//
				//==================================
				$scope.loadRecords = function(identifier, schema) {

					if (identifier) { //lookup single record
						var deferred = $q.defer();

						storage.documents.get(identifier, {
								info: ""
							})
							.then(function(r) {
								deferred.resolve(r.data);
							}, function(e) {
								if (e.status == 404) {
									storage.drafts.get(identifier, {
											info: ""
										})
										.then(function(r) {
												deferred.resolve(r.data);
											},
											function(e) {
												deferred.reject(e);
											});
								} else {
									deferred.reject(e);
								}
							});
						return deferred.promise;
					}

					//Load all record of specified schema;

					var sQuery = "type eq '" + encodeURI(schema) + "'";

					return $q.all([storage.documents.query(sQuery, null, {
								cache: true
							}),
							storage.drafts.query(sQuery, null, {
								cache: true
							})
						])
						.then(function(results) {
							var qResult = Enumerable.From(results[0].data.Items)
								.Union(results[1].data.Items, "$.identifier");
							return qResult.ToArray();
						});
				};

				$scope.init();
			}
		};
	}]);

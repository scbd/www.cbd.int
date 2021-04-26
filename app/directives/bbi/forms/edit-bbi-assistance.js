import template from './edit-bbi-assistance.html';
import bbiRecordsDialog from './bbi-records-dialog.html';
import bbiFirstRequestDialog from './first-request-dialog.html';
import app from '~/app';
import angular from 'angular';
import _ from 'lodash';
import '~/authentication';
import 'ngSmoothScroll';
import '~/services/editFormUtility';
import '~/services/mongo-storage';
import '~/services/storage';
import '~/services/workflows';
import '~/services/user-settings';
import '~/directives/bbi/controls/km-form-languages';
import '~/directives/bbi/controls/km-form-std-buttons';
import '~/directives/bbi/controls/km-control-group';
import '~/directives/bbi/select-contact';
import '~/directives/bbi/controls/km-select';
import '~/directives/bbi/controls/km-link';
import '~/directives/bbi/controls/km-date';
import '~/directives/bbi/controls/km-inputtext-ml';
import '~/directives/bbi/controls/km-inputtext-list';
import '~/directives/bbi/controls/mongo-form-std-buttons';
import '~/directives/bbi/controls/km-document-validation';
import '~/providers/locale';
import '../views/view-bbi-request';
	

	app.directive('editBbiAssistance', ['$http', "$rootScope", "Enumerable", "$filter", "$q", "guid", "$location", "Thesaurus", 'authentication', '$route', '$timeout', 'locale', 'mongoStorage', 'smoothScroll', 'IStorage', 'ngDialog', 'userSettings', function($http, $rootScope, Enumerable, $filter, $q, guid, $location, thesaurus, authentication, $route, $timeout, locale, mongoStorage, smoothScroll, storage, ngDialog, userSettings) {
		return {
			restrict: 'E',
			template: template,
			replace: true,
			transclude: false,
			scope: {
				user: '='
			},
			link: function($scope) {
				$scope.schema = 'bbi-requests';
				$scope.status = "";
				$scope.error = null;
				$scope.document = null;
				$scope.tab = 'org';
				$scope.review = {
					locale: "en"
				};
				$scope.loading = {};
				$scope.loading.contact = false;
				$scope.loading.org = false;
				// $scope.user=user;
				$scope.options = { //5FF88869-FD8C-438F-9F77-66AB1CFB3BD4

					organizationTypes: function() {
						return $http.get("/api/v2013/thesaurus/domains/Organization%20Types/terms", {
							cache: true
						}).then(function(o) {
							return $filter('orderBy')(o.data, 'name');
						});
					},
					aichiTargets: function() {
						return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", {
							cache: true
						}).then(function(o) {
							return o.data;
						});
					},

					jurisdictions: function() {
						return $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", {
							cache: true
						}).then(function(o) {
							return o.data;
						});
					},
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
					assistanceTypes: function() {
						return $http.get("/api/v2013/thesaurus/domains/441381DA-856A-4E89-8568-9EBE7145FA50/terms", {
							cache: true
						}).then(function(o) {
							var data = _.filter(o.data, function(term){
									return term.identifier !="2DB66EA6-F4D1-4103-8BA1-55626DD42290"
									&& !_.contains(term.broaderTerms, "2DB66EA6-F4D1-4103-8BA1-55626DD42290")
								});
							return thesaurus.buildTree(data);
						});
					},
					regions: function() {
						return $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms", {
								cache: true
							}),
							$http.get("/api/v2013/thesaurus/domains/regions/terms", {
								cache: true
							})
						]).then(function(o) {
							return $filter('orderBy')(_.union(o[0].data, o[1].data), 'name');
						});
					},
					cbdSubjects: function() {
						return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
							cache: true
						}).then(function(o) {

							var subjects = ['CBD-SUBJECT-BIOMES', 'CBD-SUBJECT-CROSS-CUTTING'];
							var items = [];

							_.forEach(subjects, function(subject) {
								var term = _.findWhere(o.data, {
									'identifier': subject
								});

								items.push(term);

								_(term.narrowerTerms).forEach(function(term) {
									items.push(_.findWhere(o.data, {
										'identifier': term
									}));
								}).value();

							});

							return items;
						});
					}
				};

				userSettings.ready.then(bbiRecords).then(function() {
					$timeout(firstRequest, 1000);
				});
				//============================================================
				//
				//
				//============================================================
				function bbiRecords() {

					if (typeof userSettings.setting('bbi.recordsNotice') === 'undefined' || !userSettings.setting('bbi.recordsNotice')) {
						$scope.bbiRecordsNotice = false;
						userSettings.setting('bbi.recordsNotice', false);
						return ngDialog.open({
							template: bbiRecordsDialog,
							className: 'ngdialog-theme-default',
							closeByDocument: false,
							plain: true,
							scope: $scope
						}).closePromise;
					}
				}

				//============================================================
				//
				//
				//============================================================
				function firstRequest() {
					if (typeof userSettings.setting('bbi.firstRequestNotice') === 'undefined' || !userSettings.setting('bbi.firstRequestNotice')) {
						$scope.bbiFirstRequest = false;
						userSettings.setting('bbi.firstRequestNotice', false);
						return ngDialog.open({
							template: bbiFirstRequestDialog,
							className: 'ngdialog-theme-default',
							closeByDocument: false,
							plain: true,
							scope: $scope
						}).closePromise;
					}
				}

				//============================================================
				//
				//
				//============================================================
				function settingsChange(key, value) {
					userSettings.setting(key, value);
				} //bbiRecordsNoticeChange
				$scope.settingsChange = settingsChange;

				//==================================
				//
				//==================================
				$scope.loadRecords = function(identifier) {

					if (identifier) { //lookup single record
						var deferred = $q.defer();

						storage.documents.get(identifier)
							.then(function(r) {
								deferred.resolve(r.data);
							}, function(e) {
								if (e.status == 404) {
									storage.drafts.get(identifier)
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

				};

				var killContactWatch = $scope.$watch("document.contact", function() {

					if ($scope.document && $scope.document.contact) {
						$scope.loading.contact = true;
						$scope.loadRecords($scope.document.contact.identifier)
							.then(function(data) {
								$scope.loading.contact = false;

								if (data.contactOrganization && data.contactOrganization.identifier) {
									$scope.loading.org = true;
									$scope.loadRecords(data.contactOrganization.identifier)
										.then(function(d) {
											$scope.document.organization = {
												identifier: d.header.identifier
											};
											$scope.loading.org = false;
											killContactWatch();
										});
								} else killContactWatch();
							});
					}
				});

				//====================
				//
				//====================
				var killOrgWatch = $scope.$watch("document.organization", function() {

					if ($scope.document && $scope.document.organization)
						$scope.loadRecords($scope.document.organization.identifier)
						.then(function(data) {
							if (data.country)
								$scope.document.country = data.country;
							killOrgWatch();
						});
				});
				//==================================
				//
				//==================================
				$scope.init = function() {

					if ($scope.document)
						return;
					$scope.status = "loading";

					var id = $route.current.params.id;
					if (id === 'new') {
						$q.when(authentication.getUser()).then(function(u) {
							$scope.user = u;
						}).then(loadDraftOrNew);
					} else
						mongoStorage.loadDoc($scope.schema, id).then(loadDoc);
				};

				//==================================
				//
				//==================================
				$scope.maxTypes = function() {

					return 3;
				};

				//============================================================
				//
				//============================================================
				$scope.nextTab = function() {
					var next = 'review';

					if ($scope.tab == 'org') {
						next = 'general';
					}
					if ($scope.tab == 'general') {
						next = 'details';
					}
					if ($scope.tab == 'details') {
						next = 'linkages';
					}
					if ($scope.tab == 'linkages') {
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

					if ($scope.tab == 'review') {
						prev = 'linkages';
					}
					if ($scope.tab == 'linkages') {
						prev = 'details';
					}
					if ($scope.tab == 'details') {
						prev = 'general';
					}
					if ($scope.tab == 'general') {
						prev = 'org';
					}

					$scope.tab = prev;
				};
				//=======================================================================
				//
				//=======================================================================
				function loadDraftOrNew() {

					var q = {
						'meta.createdBy': $scope.user.userID,
						'meta.status': 'draft',
					};
					var fields = {
						history: 0
					};

					var sort = {
						'meta.modifiedOn': -1
					};

					return mongoStorage.loadDocs('bbi-requests', q, 0, 100, sort, fields).then(
						function(res) {
							if (res.data.length > 0) {
								$scope.document = res.data[0];
								if ($scope.document.meta && !$scope.document.meta.languages) $scope.document.meta.languages = [locale];
								if ($scope.document && $scope.document.meta && !$scope.document.meta.baseUrl)
									$scope.document.meta.baseUrl = $location.host();
								if ($scope.document.meta.baseUrl === 'localhost')
									$scope.document.meta.baseUrl = 'bbi.staging.cbd.int';
								$scope.status = false;
							} else
								return $scope.saveDoc('draft').then(function(r) {

									$scope.document._id = r.data.id;
									$route.current.params.id == r.data.id;
									$scope.status = false;
								});
						});
				} //loadDraftOrNew

				//=======================================================================
				//
				//=======================================================================
				$scope.saveDoc = function(status) {


					if (!$scope.document)
						$scope.document = {};
					if (!$scope.document.meta)
						$scope.document.meta = {};
					if ($scope.document && $scope.document.meta && status)
						$scope.document.meta.status = status;
					if ($scope.document && $scope.document.meta && !$scope.document.meta.languages)
						$scope.document.meta.languages = [locale];
					if (!$scope.document.typesDetails)
						$scope.document.typesDetails = {};

					if ($scope.document && $scope.document.meta && !$scope.document.meta.baseUrl)
						$scope.document.meta.baseUrl = $location.host();
					if ($scope.document.meta.baseUrl === 'localhost')
						$scope.document.meta.baseUrl = 'bbi.staging.cbd.int';
					if (!$scope.document.id && !$scope.document._id)
						return mongoStorage.save($scope.schema, cleanDoc($scope.document)).catch($scope.onError).then(function(res) {

							$scope.$emit('showSuccess', 'Request for Assistance Created');
							return res;
						}).catch($scope.onError);
					else
						return mongoStorage.save($scope.schema, cleanDoc($scope.document), $scope._id).then(function() {
							var msg = 'intitled';
							if ($scope.document.title)
								msg = $scope.document.title[locale];

							$scope.$emit('showSuccess', 'Requests for Assistance ' + msg + ' Saved as ' + status);

							if ($scope.document.meta.status !== 'draft')
								$timeout(function() {
									$location.path('platform/submit/' + $scope.schema.slice(0, -1));
									$location.search('index-update', $scope.document._id);
									$location.search('index-view', status);
								}, 1500);
						}).catch($scope.onError);
				};
				//=======================================================================
				//
				//=======================================================================
				function loadDoc(doc) {

					$scope.document = doc;
					if ($scope.document.meta && !$scope.document.meta.languages) $scope.document.meta.languages = [locale];
					if ($scope.document && $scope.document.meta && !$scope.document.meta.baseUrl)
						$scope.document.meta.baseUrl = $location.host();
					if ($scope.document && $scope.document.meta && !$scope.document.meta.baseUrl)
						$scope.document.meta.baseUrl = $location.host();
					if ($scope.document.meta.baseUrl === 'localhost')
						$scope.document.meta.baseUrl = 'bbi.staging.cbd.int';
					if (!$scope.document.typesDetails) $scope.document.typesDetails = {};
					$scope.status = false;
				}

				//=======================================================================
				//
				//=======================================================================
				$scope.saveDraft = function() {

					// validateRequestedBy($scope.editForm);
					// validateGeneral($scope.editForm);
					// $scope.generateValidationReport();
					return $scope.saveDoc('draft');
				};

				//=======================================================================
				//
				//=======================================================================
				$scope.generateValidationReport = function() {
					$scope.editForm.$submitted = true;
					if ($scope.editForm.$error && $scope.editForm.$error.required && $scope.editForm.$error.required.length) {
						$scope.validationReport = [];
						$scope.validationReport.errors = [];
						for (var i = 0; i < $scope.editForm.$error.required.length; i++)
							if ($scope.editForm.$error.required[i].$name !== 'linkForm' && $scope.editForm.$error.required[i].$name)
								$scope.validationReport.errors.push({
									code: 'Error.Mandatory',
									property: $scope.editForm.$error.required[i].$name
								});

					}

					//	return $scope.saveDoc('draft');
				};
				$scope.validate = $scope.generateValidationReport;
				//=======================================================================
				//
				//=======================================================================
				function validateRequestedBy(formData) {
					formData.$submitted = true;

					if (formData.organization.$error.required && formData.$submitted) {
						changeTab('org');
						findScrollFocus('editForm.organization');
					}
					if (formData.contact.$error.required && formData.$submitted) {
						changeTab('org');
						findScrollFocus('editForm.contact');
					}
					if (formData.country.$error.required && formData.$submitted) {
						changeTab('org');
						findScrollFocus('editForm.country');
					}
				} //validateRequestedBy


				//=======================================================================
				//
				//=======================================================================
				function validateGeneral(formData) {
					formData.$submitted = true;

					if (formData.title.$error.required && formData.$submitted) {
						changeTab('org');
						findScrollFocus('editForm.title');
					}
					if (formData.contact.$error.required && formData.$submitted) {
						changeTab('org');
						findScrollFocus('editForm.contact');
					}
					if (formData.country.$error.required && formData.$submitted) {
						changeTab('org');
						findScrollFocus('editForm.country');
					}
				} //validateRequestedBy


				//=======================================================================
				//
				//=======================================================================
				function changeTab(tab) {
					$timeout(function() {
						$scope.tab = tab;
						$('#' + tab).tab('show');
					});
				}


				//=======================================================================
				//
				//=======================================================================
				function findScrollFocus(id) {

					var el = document.getElementById(id);


					if (!$scope.focused) {

						smoothScroll(el);
						if ($(el).is("input") || $(el).is("select"))
							el.focus();
						else {
							if ($(el).find('input').length === 0)
								$(el).find('textarea').focus();
							else
								$(el).find('input').focus();

						}
						$scope.focused = true;
					}
				}

				//=======================================================================
				//
				//=======================================================================
				$scope.saveRequest = function() {
					validateRequestedBy($scope.editForm);
					validateGeneral($scope.editForm);
					$scope.generateValidationReport();

					if ($scope.validationReport && !$scope.validationReport.errors.length)
						return $scope.saveDoc('workflow');
				};


				//=======================================================================
				//
				//=======================================================================
				$scope.saveCompleted = function() {
					validateRequestedBy($scope.editForm);
					validateGeneral($scope.editForm);
					$scope.generateValidationReport();

					if ($scope.validationReport && !$scope.validationReport.errors.length)
						return $scope.saveDoc('public');
				};


				//=======================================================================
				//
				//=======================================================================
				function cleanDoc(doc) {
					var cDoc = _.cloneDeep(doc);
					delete(cDoc.history);
					_.each(cDoc, function(property, name) {
						if (_.isEmpty(document[name])) delete(document[name]);
					});
					return cDoc;
				} //toggleListView

				//============================================================
				//
				//============================================================
				$scope.wordCount = function(s) {
					if (!s || !_.isString(s)) return;
					s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
					s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
					s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
					return s.split(' ').length;
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
						if (value)
							site.value = value;
						else
							delete($scope.document.websites[_.findIndex($scope.document.websites, {
								'name': name
							})]);

					else
						$scope.document.websites.push({
							name: name,
							url: value,
							type: 'link'
						});
					$scope.document.websites = _.compact($scope.document.websites);
				};


				//==================================
				//
				//==================================
				$scope.isLoading = function() {

					return $scope.status === "loading";
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


				$scope.init();
			}
		};
	}]);

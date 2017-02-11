define(['text!./edit-bbi-opportunity.html','text!./bbi-records-dialog.html','text!./first-opportunity-dialog.html', 'app', 'angular', 'lodash', 'moment','authentication',
'services/editFormUtility',
'services/storage',
'services/workflows',
'directives/bbi/controls/km-select',
'directives/bbi/controls/km-link',
'directives/bbi/controls/km-inputtext-ml',
'directives/bbi/controls/km-inputtext-list',
'directives/bbi/controls/km-terms-check',
'providers/locale',
'directives/bbi/controls/km-date',
'directives/bbi/controls/km-document-validation',
'directives/bbi/views/view-bbi-opportunity',
'directives/bbi/controls/km-form-languages',
'directives/bbi/controls/km-form-std-buttons',
'directives/bbi/controls/km-control-group',

], function(template,bbiRecordsDialog,firstOpportunityDialog, app, angular, _,moment) { 'use strict';

app.directive('editBbiOpportunity', ['$http',"$rootScope", "Enumerable", "$filter", "$q", "guid", "$location", "Thesaurus", 'authentication', 'editFormUtility',  'IStorage', '$route','$timeout','userSettings','ngDialog',  function ($http, $rootScope, Enumerable, $filter, $q, guid, $location, thesaurus, authentication, editFormUtility, storage, $route,$timeout,userSettings,ngDialog) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {user:'='},
		link : function($scope)
		{
			$scope.schema = 'bbi-opportunity';
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'org';
			$scope.review   = { locale: "en" };
			$scope.options  = {//5FF88869-FD8C-438F-9F77-66AB1CFB3BD4
				languages     : function() { return $http.get("/api/v2013/thesaurus/domains/52AFC0EE-7A02-4EFA-9277-8B6C327CE21F/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				countries			: function() { return $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				assistanceTypes			: function() { return $http.get("/api/v2013/thesaurus/domains/441381DA-856A-4E89-8568-9EBE7145FA50/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				regions       : function() { return $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }),
														    $http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true })]).then(function(o) {
														    	return $filter('orderBy')(_.union(o[0].data,o[1].data), 'name');
														   }); },
				aichiTargets  : function() { return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms",                        { cache: true }).then(function(o){ return o.data; }); },

				cbdSubjects     : function() { return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",                         { cache: true }).then(function(o){

														   	var subjects = ['CBD-SUBJECT-BIOMES', 'CBD-SUBJECT-CROSS-CUTTING'];
														   	var items = [];

														   		_.forEach(subjects, function(subject) {
														   			var term = _.findWhere(o.data, {'identifier': subject } );

														   			items.push(term);

														   			_(term.narrowerTerms).forEach(function (term) {
														   				items.push(_.findWhere(o.data, {'identifier':term}));
														   			}).value();

														   		});

														   		return items;
														   	});
														   }
			};
			userSettings.ready.then(bbiRecords).then(function(){$timeout(firstOpportunity,1000);});
			//============================================================
			//
			//
			//============================================================
			function bbiRecords() {
					if(typeof userSettings.setting('bbi.recordsNotice') ==='undefined' || !userSettings.setting('bbi.recordsNotice')){
							$scope.bbiRecordsNotice=true;
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
			function firstOpportunity() {
				  if(typeof userSettings.setting('bbi.firstOpportunityNotice') ==='undefined' || !userSettings.setting('bbi.firstOpportunityNotice')){
							$scope.bbiFirstOpportunity=true;
							userSettings.setting('bbi.firstOpportunityNotice',true);
							return ngDialog.open({
										template: firstOpportunityDialog,
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
			//============================================================
			//
			//============================================================
			$scope.startdateStart = function(deadline) {
						if(!deadline) return;


						return moment(deadline,'YYYY-MM-DD').add(1,'day').format('YYYY-MM-DD');

			};



			//============================================================
			//
			//============================================================
			$scope.nextTab = function() {
				var next = 'review';

				if($scope.tab=='org') 	{ next = 'oppor';}
				if($scope.tab=='oppor') { next = 'detail';   }
				if($scope.tab=='detail' 	) 		{ next = 'linkages'; }
				if($scope.tab=='linkages') 		{ next = 'social';   }
				if($scope.tab=='social'	) 		{ next = 'review';$scope.validate();}

				$scope.tab = next;
			};

			$scope.wordCount = function(s) {
				if(!s) return;
				s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
				s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
				s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
				return s.split(' ').length;
			};
			//============================================================
			//
			//============================================================
			$scope.prevTab = function() {
				var prev;

				if($scope.tab=='review' ) { prev = 'social'; 	 }
				if($scope.tab=='social'	) { prev = 'linkages';  }
				if($scope.tab=='linkages'	) { prev = 'detail'; 	 }
				if($scope.tab=='detail'	) { prev = 'oppor';}
				if($scope.tab=='oppor'	) { prev = 'org';}
				$scope.tab = prev;
			};

			//==================================
			//
			//==================================
			$scope.maxTypes= function() {
					return 3;
			};

			//============================================================
			//
			//============================================================
			$scope.updateWebsites = function(name,value) {
				if(!$scope.document.relevantDocuments) $scope.document.relevantDocuments =[];
				var site = _.find($scope.document.relevantDocuments,{'name':name});
				if(site)
						if(value)
							site.value=value;
						else
							delete($scope.document.relevantDocuments[_.findIndex($scope.document.relevantDocuments,{'name':name})]);

				else
					 $scope.document.relevantDocuments.push({name:name,url:value,type:'link'});
				$scope.document.relevantDocuments=_.compact($scope.document.relevantDocuments);
			};


			//==================================
			//
			//==================================
			$scope.isLoading = function() {
				return $scope.status=="loading";
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
			$scope.init = function() {

				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = $route.current.params.id;
				var promise = null;

				if(identifier && identifier != 'new')
					promise = editFormUtility.load(identifier, "bbiOpportunity");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "bbiOpportunity",
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
				$timeout(function(){$location.path('platform/submit/'+$scope.schema);},1000);
			};

			//==================================
			//
			//==================================
			function gotoManager() {
				$scope.$emit('showInfo', 'Contact successfully updated.');
				$location.path("/platform/submit/"+$scope.schema);
				$location.search('index-update',$scope.document.header.identifier);

			}

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
				return $q.when(true);


				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
			};

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
											if(!_.find($scope.validationReport.errors,{property:err.property,code:err.code}))
												$scope.validationReport.errors.push(err);
								});
							}else{
								$scope.validationReport.errors=[];
								_.each(frontEndValidationReport.errors,function(err){
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

			//==================================
			//
			//==================================
			$scope.isFieldValid = function(field) {
				if (field && $scope.validationReport && $scope.validationReport.errors)
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field;});

				return true;
			};

			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				$scope.status = "error";

				if (status == "notAuthorized") {
					$scope.status = "hidden";
					$scope.error  = "You are not authorized to modify this record";
				}
				else if (status == 404) {
					$scope.status = "hidden";
					$scope.error  = "Record not found.";
				}
				else if (status == "badSchema") {
					$scope.status = "hidden";
					$scope.error  = "Record type is invalid.";
				}
				else if (error.Message)
					$scope.error = error.Message;
				else
					$scope.error = error;
			};


			//====================
			//
			//====================
			$scope.$watch("document.contact", function()
			{

					if($scope.document && $scope.document.contact){
						$scope.loadingOrg=true;
						$scope.loadRecords($scope.document.contact.identifier)
						.then(function(data){
							$scope.loadRecords(data.contactOrganization.identifier)
							.then(function(d){
									$scope.document.primaryOrganization = {identifier:d.header.identifier};
									$scope.loadingOrg=false;
							});
						});
					}
			});

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record
					var deferred = $q.defer();

					storage.documents.get(identifier)
						.then(function(r) {
							deferred.resolve(r.data);
						}, function(e) {
							if (e.status == 404) {
								storage.drafts.get(identifier)
									.then(function(r) { deferred.resolve(r.data);},
										  function(e) { deferred.reject (e);});
							}
							else {
								deferred.reject (e);
							}
						});
					return deferred.promise;
				}

				//Load all record of specified schema;

				var sQuery = "type eq '" + encodeURI(schema) + "'";

				return $q.all([storage.documents.query(sQuery, null, { cache: true }),
							   storage.drafts   .query(sQuery, null, { cache: true })])
					.then(function(results) {
						var qResult = Enumerable.From (results[0].data.Items)
												.Union(results[1].data.Items, "$.identifier");
						return qResult.ToArray();
					});
			};

			$scope.init();
		}
	};
}]);
});

define(['app','data/idb-celebrations/links','directives/idb-celebrations/menu-vertical','filters/lstring'], function(app,links) { 'use strict';

	return ['$scope','$routeParams','$q','$http','$filter','$location', function ($scope,$routeParams,$q,$http,$filter,$location) {

        var _ctrl   = this;
				var canceler = null;
				var currentDate= new Date();

	      _ctrl.links 		= links.links;

				if(parseInt($routeParams.year) ===404 || !parseInt($routeParams.year))
		    	$location.path(currentDate.getFullYear());
				else
					_ctrl.year  	= parseInt($routeParams.year);

				_ctrl.documents	= {};
				_ctrl.getCountry= getCountry;

				getCountries().then(getEvents().then(function(){
					 mapGovernment();
				}));

				//============================================================
				//
				//============================================================
				function getCountries() {
					return $http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(
						function(o){
							_ctrl.governments	=$filter('orderBy')(o.data, 'name');
					});
				}

				//============================================================
				//
				//============================================================
				function getCountry (code) {
								if(_ctrl.governments && _ctrl.governments.length)
									for(var i=0; i<_ctrl.governments.length;i++){
											if(_ctrl.governments[i].identifier===code)
												return _ctrl.governments[i];
									}
				}

				//============================================================
				//
				//============================================================
				function getEvents () {
								var q = 'schema_s:event AND  (startDate_s:['+_ctrl.year+'-01-01T00:00:00.000Z TO '+_ctrl.year+'-12-31T00:00:00.000Z])';//_state_s:public AND
								return query('event',q);
				}
				//============================================================
				//
				//============================================================
				function mapGovernment() {
								_ctrl.numGovernments={};
								if(_ctrl.documents && Array.isArray(_ctrl.documents.event))
									for(var i=0; i<_ctrl.documents.event.length;i++){
										if(_ctrl.documents.event[i].governments_ss)
											for(var j=0; j<_ctrl.documents.event[i].governments_ss.length;j++){
												    var government = _ctrl.documents.event[i].governments_ss[j];
														if(_ctrl.numGovernments[government]) _ctrl.numGovernments[government]++;
														else _ctrl.numGovernments[government]=1;
											}
									}
									_ctrl.governmentsFound = Object.keys(_ctrl.numGovernments).sort();
				}
				//=======================================================================
				//
				//=======================================================================
				function query(schema,query) {

							_ctrl.loading         = true;


						var queryParameters = {
								'q': query,
								'sort': 'createdDate_dt desc',
					//			'fl': 'identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
								'wt': 'json',
								'start': 0,
								'rows': 25,
								'facet': true,
								'facet.field': ['schema_s', 'hostGovernments_ss', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss'],
								'facet.limit': 999999,
								'facet.mincount' : 1
						};

						if (canceler) {
								canceler.resolve(true);
						}

						canceler = $q.defer();
						var pagePromise = $q.when($http.get('/api/v2013/index/select', {  params: queryParameters, timeout: canceler}))
							.then(function (data) {
									data=data.data;
									canceler = null;

								_ctrl.documents[schema]=data.response.docs;
								_ctrl[schema]={};
								_ctrl[schema].count = data.response.numFound;
								_ctrl[schema].start = data.response.start;
								_ctrl[schema].stop  = _ctrl.documents[schema].length;
								_ctrl[schema].rows  = data.response.docs.length;
						}).catch(function(error) {
								console.log('ERROR: ' + error);
						})
						.finally(function(){
							_ctrl.loading = false;
						});
						return pagePromise;
				}// query


    }];
});

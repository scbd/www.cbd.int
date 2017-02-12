define(['app', 'lodash','data/bbi/links-platform', 'directives/bbi/menu','directives/bbi/search/search-result','directives/bbi/forums/cbd-forums'], function(app, _,links) { 'use strict';

	return ['$location','$route','$q','$http',function ($location,$route,$q,$http) {

        var _ctrl = this;
				var canceler = null;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
				_ctrl.documents = {};
				_ctrl.textQuery=textQuery;
				_ctrl.clearText =clearText ;

				var bbi = $http.get('/api/v2014/discussions/forums/17490/threads');

				init();



				//============================================================
				//
				//============================================================
				function init () {
						getResources();
						getInitiatives ();
						loadTreads();
						$q.when(bbi ).then(function(val){
							console.log(val.data);
						});
				}

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
				//============================================================
				//
				//============================================================
				function getResources () {
								var q = 'schema_s:resource';
								query('resource',q);
				}

				//============================================================
				//
				//============================================================
				function getInitiatives () {
								var q = 'schema_s:capacityBuildingInitiative AND categories_ss:9D6E1BC7-4656-46A7-B1BC-F733017B5F9B';
								query('capacityBuildingInitiative',q);
				}

				//============================================================
				//
				//============================================================
				function clearText (schema, text) {
								text='';

								if(schema==="capacityBuildingInitiative")getInitiatives ();
								else getResources ();
				}
				//============================================================
				//
				//============================================================
				function textQuery (schema,keywords) {
								var q = 'schema_s:'+schema+' AND '+'(title_t:"' + keywords + '*" OR description_t:"' + keywords + '*" OR text_EN_txt:"' + keywords + '*")';
								query(schema,q);
				}
				//=======================================================================
				//
				//=======================================================================
				function query(schema,query) {

							_ctrl.loading         = true;


						var queryParameters = {
								'q': query,
								'sort': 'createdDate_dt desc',
								'fl': 'identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
								'wt': 'json',
								'start': 0,
								'rows': 25,
								'facet': true,
								'facet.field': ['schema_s', 'government_s', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss'],
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

				//=======================================================================
				//
				//=======================================================================
				function loadTreads() {
							$q.when(bbi).then(function(response) {
									_ctrl.bbiThreads = response.data;
							})
							.catch(function(error){
								 console.log(error);
						 });
				}
    }];
});

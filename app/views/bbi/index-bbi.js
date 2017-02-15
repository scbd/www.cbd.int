define(['app', 'lodash','data/bbi/links', 'directives/bbi/slider', 'directives/bbi/menu','directives/bbi/auto-linker'], function(app, _,links) { 'use strict';

	return ['$location','$http','$q','$scope','locale', function ($location,$http,$q,$scope,locale) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.outReachRecords={};
				_ctrl.goTo = goTo;
				getNew();
				getNews ();
				getMeeting();
				getNotifications();
				$scope.$root.page={};
				$scope.$root.page.title = "Bio Bridge Initiative";

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}

				//============================================================
				//
				//============================================================
				function getNew () {
								var q = 'schema_s:(new) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR text_'+locale.toUpperCase()+'_txt:"technical and scientific cooperation*")'; //meeting notification pressRelease statement news
								return query('new',q);
				}

				//============================================================
				//
				//============================================================
				function getNews () {
								var q = 'schema_s:(news pressRelease announcement statement) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR text_'+locale.toUpperCase()+'_txt:"technical and scientific cooperation*")'; //meeting notification pressRelease statement news
								return query('news',q);
				}

				//============================================================
				//
				//============================================================
				function getMeeting() {
								var q = 'schema_s:(meeting event sideEvent) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR symbol_s:"COP-13")'; //meeting notification pressRelease statement news
								return query('meeting',q);
				}

				//============================================================
				//
				//============================================================
				function getNotifications() {
								var q = 'schema_s:(notification statement) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR text_'+locale.toUpperCase()+'_txt:"technical and scientific cooperation*")'; //meeting notification pressRelease statement news
								return query('notification',q);
				}

				var canceler;
				//=======================================================================
				//
				//=======================================================================
				function query(schema,query) {

							_ctrl.loading         = true;


						var queryParameters = {
								'q': query,
								'sort': 'createdDate_dt desc',
								'fl': 'start_dt,end_dt,startDate_dt,endDate_dt,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
								'wt': 'json',
								'start': 0,
								'rows': 5,
								'facet': true,
								'facet.field': ['schema_s', 'government_s', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss'],
								'facet.limit': 999999,
								'facet.mincount' : 1
						};

						if (canceler) {
								canceler.resolve(true);
						}

						canceler = $q.defer();
						var pagePromise = $q.when($http.get('https://api.cbd.int/api/v2013/index/select', {  params: queryParameters, timeout: canceler}))
							.then(function (data) {
									data=data.data;
									canceler = null;


								_ctrl.outReachRecords[schema]={};
								_ctrl.outReachRecords[schema].data=data.response.docs;
								_ctrl.outReachRecords[schema].count = data.response.numFound;
								_ctrl.outReachRecords[schema].start = data.response.start;
								_ctrl.outReachRecords[schema].stop  = _ctrl.outReachRecords[schema].length;
								_ctrl.outReachRecords[schema].rows  = data.response.docs.length;


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

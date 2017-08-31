define(['app','data/es-pages/statements','directives/es-pages/header-nav','filters/moment'], function(app,statements) { 'use strict';

return ['$location','$scope','$q','$http', function ($location,$scope,$q,$http) {

			var _ctrl = this;
			_ctrl.documents ={}
			var canceler = null;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "At Work: Cristiana Pașca Palmer";
			_ctrl.work = statements;
console.log("_ctrl.work ",_ctrl.work );
			getEvents();
			//============================================================
			//
			//============================================================
			function goTo (url) {
					$location.path(url);
			}
			//============================================================
			//
			//============================================================
			function getEvents () {
							var q = 'schema_s:event AND thematicArea_ss:BD8F75CA-32D4-427B-A9CE-55079989A0CC';//_state_s:public AND
							return query('event',q).then(function(){
								console.log(_ctrl.documents);
							});
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
					var pagePromise = $q.when($http.get('https://www.cbd.int/api/v2013/index/select', {  params: queryParameters, timeout: canceler}))
						.then(function (data) {
								data=data.data;
								canceler = null;

							// _ctrl.documents[schema]=
							_ctrl.work = 	_ctrl.work.concat(data.response.docs);
							// _ctrl[schema]={};
							// _ctrl[schema].count = data.response.numFound;
							// _ctrl[schema].start = data.response.start;
							// _ctrl[schema].stop  = _ctrl.documents[schema].length;
							// _ctrl[schema].rows  = data.response.docs.length;
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

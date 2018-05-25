define(['app', 'data/bbi/links','moment-timezone',  'directives/bbi/menu','directives/bbi/auto-linker','filters/moment'], function(app,links,moment) { 'use strict';

	return ['$location','$scope','locale','$q','$http','$timeout', function ($location,$scope,locale,$q,$http,$timeout) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
        _ctrl.past = []
        _ctrl.future = []
        getPast()
        getFuture()

				$scope.$root.page={};
				$scope.$root.page.title = "Communication and Outreach: Bio Bridge Initiative";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
        //============================================================
        //
        //============================================================
        function getFuture() {
                var today = moment().toISOString();
                _ctrl['futureLoading'] = true;
                var q = '(startDate_s:[ '+today+' TO *]) AND schema_s:(meeting event sideEvent) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR symbol_s:"COP-13" OR symbol_s:"COP-14")'; //meeting notification pressRelease statement news
                return query('future',q);
        }
        //============================================================
        //
        //============================================================
        function getPast() {
                var today = moment().toISOString();
                _ctrl['pastLoading'] = true;
                var q = '(startDate_s:[ * TO '+today+']) AND schema_s:(meeting event sideEvent) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR symbol_s:"COP-13" OR symbol_s:"COP-14")'; //meeting notification pressRelease statement news
                return query('past',q);
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
                'fl': 'urls_ss,start_dt,end_dt,startDate_dt,endDate_dt,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
                'wt': 'json',
                'start': 0,
                'rows': 500,
                'facet': true,
                'facet.field': ['schema_s', 'hostGovernments_ss', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss'],
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

                _ctrl[schema]=data.response.docs;
                _ctrl[schema+'Count'] = data.response.numFound;
                _ctrl[schema+'Start'] = data.response.start;
                _ctrl[schema+'Stop'] = _ctrl[schema].length;
                _ctrl[schema+'Rows'] = data.response.docs.length;
                _ctrl[schema+'Loading'] = false;

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

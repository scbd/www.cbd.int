define(['app', 'lodash','data/bbi/links-platform','text!directives/bbi/forms/bbi-records-dialog.html','text!./first-dash-dialog.html','services/user-settings', 'directives/bbi/menu',"util/solr", 'providers/realm','directives/bbi/auto-linker','ngDialog'], function(app, _,links,recordsDialog,dashDialog) { 'use strict';

	return ['$scope','$location','user','solr','realm','$http','$q','userSettings','$timeout','ngDialog', function ($scope,$location,user,solr,realm,$http,$q,userSettings,$timeout,ngDialog) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
				_ctrl.getFacet=getFacet;
				_ctrl.settingsChange=settingsChange;

				init ();
				userSettings.ready.then(bbiRecords).then(function(){$timeout(firstDash,1000);});
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
				//
				//============================================================
				function bbiRecords() {

						if(typeof userSettings.setting('bbi.recordsNotice') ==='undefined' || !userSettings.setting('bbi.recordsNotice')){
								$scope.bbiRecordsNotice=true;
								userSettings.setting('bbi.recordsNotice',true);
								return ngDialog.open({
											template: recordsDialog,
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
				function firstDash() {
						if(typeof userSettings.setting('bbi.firstDashNotice') ==='undefined' || !userSettings.setting('bbi.firstDashNotice')){
								$scope.dashNotice=true;
								userSettings.setting('bbi.firstDashNotice',true);
								return ngDialog.open({
											template: dashDialog,
											className: 'ngdialog-theme-default',
											closeByDocument: false,
											plain: true,
											scope:$scope
								}).closePromise;
						}
				}



					//============================================================
					//
					//============================================================
					function init () {
						_ctrl.schemasList=[
							{ identifier: 'bbiContact'            ,public:0, draft:0, workflow:0 },
							{ identifier: 'organization'             ,public:0, draft:0, workflow:0 },
							{ identifier: 'bbiRequest'      ,public:0, draft:0, workflow:0 },
							{ identifier: 'bbiOpportunity'                ,public:0, draft:0, workflow:0 },
							{ identifier: 'bbiProfile'       ,public:0, draft:0, workflow:0 }];
							getFacets();
					}
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}

				function getFacet(schema){
				            return _.find(_ctrl.schemasList,{"identifier":schema});
				}

				//============================================================
				//
				//============================================================
				function getFacets () {


            ////////////////
            // CHM Facets
            ///////////////


            var filter = [ 'organization','bbiRequest','bbiOpportunity','bbiProfile','bbiContact'];
            var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";


              // Apply ownership
              var userGroups = [];
              user.userGroups.map(function(group){
                  userGroups.push(solr.escape(group));
              });

            var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';
            var q = '(realm_ss:' + realm.toLowerCase() + ' ' + qSchema + ownershipQuery + ')';

            var qsOtherSchemaFacetParams =
             {
                "q"  : q,
                "rows" : 0,
               "facet":true,
               "facet.mincount":1,
               "facet.pivot":"schema_s,_state_s"
             };


             var OtherSchemaFacet     = $http.get('/api/v2013/index/select', { params : qsOtherSchemaFacetParams});

            $q.when(OtherSchemaFacet).then(function(results) {

                  _.each(results.data.facet_counts.facet_pivot['schema_s,_state_s'], function(facet){

                       var schema = facet.value;
                    	var reportType = _.first(_.where(_ctrl.schemasList, {'identifier':schema}));

            	        if(reportType)
                    	   facetSummation(facet,reportType);
                  });

            }).then(function(){

						}, function(error) {
               console.log(error );
            });
				}

				//============================================================
				//
				//============================================================
				function facetSummation(facets,reportType){
					_.each(facets.pivot,function(facet){

							reportType[facet.value] += facet.count;
					});
				}

    }];
});

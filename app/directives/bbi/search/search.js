define(['text!./search.html',
		'app',
		'jquery',
		'lodash',
		"services/editFormUtility",
		'filters/byLetter',
		"./search-result",
		"./search-filter-keywords",
		"./search-filter-schemas",
		"./search-filter-countries",
		"./search-filter-regions",
		"./search-filter-aichi",
		"./search-filter-themes",
		"./search-filter-dates",
    "./search-filter-assistance-types",
		'ngInfiniteScroll'
	], function(template, app, $, _) { 'use strict';

	app.directive('search', ['$http', 'realm', '$q', '$timeout', '$location','locale', function ($http, realm, $q, $timeout, $location,locale) {
	    return {
	        restrict: 'E',
	        template: template,
	        replace: true,
	        scope: {optionsParam:'=options',user:"="},
					require: '^search',
			link : function($scope, $element, $attr, searchCtrl) {  // jshint ignore:line

								$scope.options={
										tabs:{
												type:true,
												country:true,
												subject:true,
												aichi:true,
												region:true,
												date:true
										},
										filtersLabels:true,
										queryString:true,
										xs:false,
								};

								if($scope.optionsParam)
									_.each($scope.optionsParam,function(value,property){

										 if(_.isObject(value))
										 		_.each(value,function(val,prop){
														$scope.options[property][prop]=val;
												});
										 else {
										 		$scope.options[property]=value;
										 }
									});

	            var iconMap = {
	                'focalPoint'                 : 'fa fa-user',
	                'notification'               : 'icon-envelope',
	                'pressRelease'               : 'icon-bullhorn',
	                'statement'                  : 'icon-microphone',
	                'announcement'               : 'icon-rss',
	                'event'                      : 'icon-calendar',
	                'organization'               : 'icon-building',
	                'resource'                   : 'fa fa-book',
	                'aichiTarget'                : 'fa fa-flag',
	                'strategicPlanIndicator'     : 'icon-signal',
	                'marineEbsa'                 : 'icon-map-marker',
	                'meeting'                    : 'icon-calendar',
	                'meetingDocument'            : 'fa fa-file-o',
	                'decision'                   : 'icon-legal',
	                'recommendation'             : 'icon-legal',
	                'nationalReport'             : 'icon-quote-left',
	                'nationalTarget'             : 'fa fa-flag',
	                'nationalIndicator'          : 'icon-signal',
	                'nationalAssessment'         : 'icon-eye-open',
	                'implementationActivity'     : 'icon-retweet',
	                'nationalSupportTool'        : 'icon-wrench',
									'resourceMobilisation'       : 'fa fa-university',
									'capacityBuildingInitiative' : 'fa fa-book',
									'bbiContact' 								 : 'fa fa-book',
									'bbiRequest' 								 : 'fa fa-book',
									'bbiProfile' 								 : 'fa fa-book',
									'bbiOpportunity' 						 : 'fa fa-book',
	            };
	            $scope.loading         = false;
	            $scope.loaded          = false;
	            $scope.itemsPerPage    = 15;
	            $scope.pageCount       = 0;
	            $scope.currentPage     = 0;
							$scope.pages=[];
							var queryScheduled ;
							$scope.subQueries = {};
							if($location.search().currentPage >=0)
									$scope.currentPage=$location.search().currentPage;

									//======================================================================
								  //
									//======================================================================
									$scope.loadExisting = function () {

											if($scope.currentPage<$scope.pageCount){

												if($scope.pages[$scope.currentPage] && !$scope.pages[$scope.currentPage+1]){
														$scope.currentPage++;
			  										searchCtrl.query($scope);
												}
												// else if($scope.pages[$scope.currentPage+1]){
												// 	$scope.pages[$scope.currentPage+1].pagePromise.then(function(){
												//
												// 				searchCtrl.query($scope);
												// 	});
												// }
											}
											else return;
				          };//$scope.icon

							//======================================================================
						  //
							//======================================================================
							$scope.icon = function (schema) {

		              return iconMap[schema];
		          };//$scope.icon

							//======================================================================
						  //
							//======================================================================
							$scope.actionSetPage = function (pageNumber) {

			            $scope.currentPage = Math.min($scope.pageCount, Math.max(0, pageNumber));
									searchCtrl.search();
									$location.replace();
									$location.search("currentPage", $scope.currentPage);
			        };//$scope.actionSetPage

						  //=======================================================================
						  //
							//=======================================================================
			        $scope.fixUrl = function (url) {

		                if(url){
									     if(url.indexOf( "http://chm.cbd.int/")===0)
											 		url = url.substr("http://chm.cbd.int" .length); // jshint ignore:line
				               else if(url.indexOf("https://chm.cbd.int/")===0)
											 		url = url.substr("https://chm.cbd.int".length); // jshint ignore:line
										}
		                return url;
			         };//$scope.fixUrl

							//=======================================================================
						   //
							 //=======================================================================
					     $scope.readFacets2 = function (solrArray) {

						        var facets = [];
											if(solrArray)
													for (var i = 0; i < solrArray.length; i += 2) {
															var facet = solrArray[i];
															facets.push({ symbol: facet, title: facet, count: solrArray[i + 1] });
													}
						          return facets;
					      };//$scope.readFacets2

								//=======================================================================
								//
								//=======================================================================
								$scope.buildQuery = function()
								{
										// NOT version_s:* remove non-public records from resultset
										var realmQ = '(realm_ss:chm OR realm_ss:abs)';
										if(realm.toLowerCase() !=='chm')
											realmQ = '(realm_ss:chm-dev OR realm_ss:abs-dev)';

										var q = 'NOT version_s:* AND '+realmQ +' ';

										var subQueries = _.compact([getFormatedSubQuery('schema_s'),
																								getFormatedSubQuery('hostGovernments_ss'),
																								getFormatedSubQuery('government_REL_ss'),
																								getFormatedSubQuery('thematicArea_REL_ss'),
																								getFormatedSubQuery('aichiTarget_ss'),
																								getFormatedSubQuery('createdDate_s'),
																								getFormatedSubQuery('keywords'),
                                                getFormatedSubQuery('assistanceTypes_ss')]);

										if(subQueries.length)
											q += " AND " + subQueries.join(" AND ");

										if(!$scope.subQueries['schema_s'] || !$scope.subQueries['schema_s'].length)q += " AND " +  emptySchema();
										return q;
								};//$scope.buildQuery


								//======================================================================
							  //hides filter if parent search result in no hits for this filter
								//======================================================================
								$scope.isFilterEmpty = function (filter) {
											var total=0;

										  _.each(filter,function (filterElement){

															if (filterElement.count) total++;
											});

			              	if(total)
												return total;
											else
												return 0;
			          };//$scope.isFilterEmpty

								//=======================================================================
								//
								//=======================================================================
		            $scope.range = function (start, end) {

		                var ret = [];
		                if (!end) {
		                    end = start;
		                    start = 0;
		                }

		                var maxCount = 10;
		                var middle = 5;
		                var count = end - start;

		                if (count > maxCount) {
		                    if ($scope.currentPage > middle)
		                        start = $scope.currentPage - middle;

		                    end = Math.min(count, start + maxCount);
		                    start = Math.max(0, end - maxCount);
		                }

		                for (var i = start; i < end; i++) {
		                    ret.push(i);
		                }
		                return ret;
			          };//$scope.range

								//=======================================================================
								//
								//=======================================================================
								function getFormatedSubQuery (name) {

										var subQ='';
										if($scope.subQueries[name] && _.isArray($scope.subQueries[name]) && $scope.subQueries[name].length){
												if(name==='keywords' && $scope.subQueries[name][0])
															subQ +=  $scope.subQueries[name].join(" OR ");
												else if(name==='schema_s' )
														  subQ += buildSchemaQuery($scope.subQueries[name]);
												else
															subQ +=  name+':'+$scope.subQueries[name].join(" OR "+name+":");
												subQ = '('+subQ+')';
										}

										return subQ;
								}//function getFormatedSubQuery (name)

								//=======================================================================
								//
								//=======================================================================
								function emptySchema() {

										var emptySchemaString = '';
  									emptySchemaString += '(schema_s:(sideEvent meetings announcement statement notification event announcement news pressRelease)  AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR text_'+locale.toUpperCase()+'_txt:"technical and scientific cooperation*")) OR ';
										emptySchemaString += 'schema_s:(organization bbiContact bbiProposal bbiRequest bbiOpportunity bbiProfile)  OR ';
										emptySchemaString += '(schema_s:resource  AND absSubjects_ss:16CEAEC3B006443A903284CA65C73C29) OR ';
										emptySchemaString += '(schema_s:capacityBuildingInitiative  AND categories_ss:9D6E1BC7-4656-46A7-B1BC-F733017B5F9B) OR ';
										emptySchemaString =emptySchemaString .slice(0,-4);
										emptySchemaString = '('+emptySchemaString+')';
										return emptySchemaString ;
								}
								//=======================================================================
								//
								//=======================================================================
								function buildSchemaQuery (subQueriesArr) {

											var returnSubQ='';
											var textSearch = ' AND (realm_ss:chm-dev OR realm_ss:chm AND NOT realm_ss:abs) AND (themes_ss:CBD-SUBJECT-BBI OR text_'+locale.toUpperCase()+'_txt:"bio-bridge*" OR text_'+locale.toUpperCase()+'_txt:"bbi*" OR text_'+locale.toUpperCase()+'_txt:"TSC*" OR text_'+locale.toUpperCase()+'_txt:"technical and scientific cooperation*")';
											for(var i = 0; i<subQueriesArr.length;i++ ){

											   if(subQueriesArr[i]==='new')
												 {
													 	returnSubQ+= '(schema_s:'+subQueriesArr[i]+textSearch+') OR ';
												 } else if(subQueriesArr[i]==='notification'){
													 	returnSubQ+= '(schema_s:(notification)'+textSearch+') OR ';
												 }else if(subQueriesArr[i]==='statement'){
													 	returnSubQ+= '(schema_s:(statement)'+textSearch+') OR ';
												 }  else if(subQueriesArr[i]==='news'){
													 	returnSubQ+= '(schema_s:(news pressRelease announcement)'+textSearch+') OR ';
												 }	else if(subQueriesArr[i]==='event' ){
												 		 	returnSubQ+= '(schema_s:(event)'+textSearch+') OR ';
												 }else if(subQueriesArr[i]==='sideEvent' ){
												 		 	returnSubQ+= '(schema_s:(sideEvent)'+textSearch+') OR ';
												 }else if(subQueriesArr[i]==='meeting' ){
												 		 	returnSubQ+= '(schema_s:(meeting)'+textSearch+') OR ';
												 }else if(subQueriesArr[i]==='pressRelease' ){
												 		 	returnSubQ+= '(schema_s:(pressRelease)'+textSearch+') OR ';
												 }else if(subQueriesArr[i]==='announcement' ){
												 		 	returnSubQ+= '(schema_s:(announcement)'+textSearch+') OR ';
												 }else if(subQueriesArr[i]==='resource' ){
												 		 	returnSubQ+= '(schema_s:(resource) AND absSubjects_ss:16CEAEC3B006443A903284CA65C73C29) OR ';
												 }else if(subQueriesArr[i]==='capacityBuildingInitiative' ){
												 		 	returnSubQ+= '(schema_s:(capacityBuildingInitiative) AND (absSubjects_ss:16CEAEC3B006443A903284CA65C73C29 OR categories_ss:9D6E1BC7-4656-46A7-B1BC-F733017B5F9B)) OR ';
												 }
												 // else if(subQueriesArr[i]==='bbiOpportunity' ){
												 // 		 	returnSubQ+= '(schema_s:bbiOpportunity AND ((*:* NOT applicationDeadline_dt:*) OR applicationDeadline_dt: [NOW TO *]))  OR ';//OR applicationDeadline_dt: [NOW TO *]
												 // }
												 else returnSubQ+= '(schema_s:'+subQueriesArr[i]+') OR ';
											}
											returnSubQ=returnSubQ.slice(0,-4);
											return returnSubQ;

								}//function getFormatedSubQuery (name)
	    }, //link

			//=======================================================================
			//
			//=======================================================================
			controller : ["$scope", function($scope) {
					var queryScheduled  = null;
					var canceler 				= null;
					$scope.filters=[];
				//=======================================================================
				//
				//=======================================================================
				function query($scope) {

					    if(($scope.currentPage * $scope.itemsPerPage)>$scope.count)return;
							if($scope.pages.length && $scope.pages[$scope.currentPage])return;

	            $scope.loading         = true;

						readQueryString ();
						var queryParameters = {
								'q': $scope.buildQuery(),
								'sort': 'applicationDeadline_dt desc, createdDate_dt desc',
								// 'fl': 'organizationType_s,logo_s,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',

								'wt': 'json',
								'start': $scope.currentPage * $scope.itemsPerPage,
								'rows': $scope.itemsPerPage,
								'facet': true,
								'facet.field': ['schema_s', 'hostGovernments_ss', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss', 'assistanceTypes_ss'],
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

									if(!Array.isArray($scope.documents))$scope.documents=[];

									_.each(data.response.docs,function(doc){
										if(!_.find($scope.documents,{id:doc.id}))
											$scope.documents.push(doc);
									});
									$scope.count = data.response.numFound;
									$scope.start = data.response.start;
									$scope.stop  = $scope.documents.length;
									$scope.rows  = data.response.docs.length;
									$scope.pageCount = Math.ceil(data.response.numFound / $scope.itemsPerPage);

									$scope.schemas       = $scope.readFacets2(data.facet_counts.facet_fields.schema_s);
									$scope.governments   = $scope.readFacets2(data.facet_counts.facet_fields.hostGovernments_ss);
									$scope.regions       = $scope.readFacets2(data.facet_counts.facet_fields.government_REL_ss);
									$scope.aichiTargets  = $scope.readFacets2(data.facet_counts.facet_fields.aichiTarget_ss);
									$scope.thematicAreas = $scope.readFacets2(data.facet_counts.facet_fields.thematicArea_REL_ss);
                  $scope.assistanceTypes = $scope.readFacets2(data.facet_counts.facet_fields.assistanceTypes_ss);
						}).catch(function(error) {
								console.log('ERROR: ' + error);
						})
						.finally(function(){

							updateQueryString();
							$timeout(function(){$scope.loading = false;},500);

						});

						$scope.pages[$scope.currentPage]={canceler:canceler,pagePromise:pagePromise};

						return pagePromise;

				}// query

				//=======================================================================
				//
				//=======================================================================
				function readQueryString () {

						var qsSchema = _([$location.search().schema_s]).flatten().compact().value(); // takes query string into array
						var qsCountry = _([$location.search().hostGovernments_ss]).flatten().compact().value(); // takes query string into array
						var qsAichi = _([$location.search().aichiTarget_ss]).flatten().compact().value(); // takes query string into array
						var qsThematic = _([$location.search().thematicArea_REL_ss]).flatten().compact().value(); // takes query string into array
						var qsGovRel = _([$location.search().government_REL_ss]).flatten().compact().value(); // takes query string into array
            var qsAssistanceTypes = _([$location.search().assistanceTypes_ss]).flatten().compact().value(); // takes query string into array

						var qsArrByField = {'schema_s':qsSchema,'hostGovernments_ss':qsCountry,'aichiTarget_ss':qsAichi,'thematicArea_REL_ss':qsThematic,'government_REL_ss':qsGovRel,'assistanceTypes_ss':qsAssistanceTypes};
						_.each(qsArrByField,function (idArr,schemaKey){
								_.each(idArr,function(id){

										addSubQuery({name:schemaKey,identifier:id,title:id});
								});//_.each
						});//_.each
				}//readQueryString

				//=======================================================================
				//
				//=======================================================================
				function updateQueryString () {
						var keywords = [];
							keywords = 	$location.search().keywords;
							$location.replace();
						_.each($scope.subQueries,function(itemIdArr,schemaKey){

											if(schemaKey!=='createdDate_s' && schemaKey!=='keywords')
													$location.search(schemaKey, itemIdArr);

											if(schemaKey==='keywords')
													$location.search(schemaKey, keywords);
						});
				}//getFormatedSubQuery

				//=======================================================================
				//
				//=======================================================================
				function search () {

						if(queryScheduled)
								$timeout.cancel($scope.queryScheduled);
						queryScheduled = $timeout(function () { query($scope); }, 1);
				}//search
				//=======================================================================
				//
				//=======================================================================
				function destroyPages () {
						_.each($scope.pages,function(page){
							  if(page)
									page.canceler.resolve(true);
						});
						$scope.pages=[];
						$scope.documents=[];
						$scope.start =0;
						$scope.currentPage=0;

				}//search
				//=======================================================================
				//
				//=======================================================================
				function addSubQuery (item,name) {
						if(!item.name) item.name=name;
						addFilter(item);
						if(!$scope.subQueries) // if called from controler without link ex4ecuting first
							$scope.subQueries=[];
						if(!_.isArray($scope.subQueries[item.name])) // initialize
							$scope.subQueries[item.name]=[];
					  if($scope.subQueries[item.name].indexOf(item.identifier)<0) // if not already there add
									$scope.subQueries[item.name].push(item.identifier);
				}//addSubQuery

				//=======================================================================
				//
				//=======================================================================
				function addFilter (item) {
						// if(!$scope.filters)$scope.filters=[];
						var filter = _.find($scope.filters,{identifier:item.identifier});

						if(!filter)
							 $scope.filters.push(item);
						else
						 		filter=item;

				}

				//=======================================================================
				//
				//=======================================================================
				function removeFilter (query) {

						_.each($scope.filters,function(filter,index){

									if(filter && filter.identifier===query){
											$scope.filters.splice(index, 1);
										}

						});
				}
				$scope.removeFilter=removeFilter;

				//=======================================================================
				//
				//=======================================================================
				function deleteSubQuery(name, scope) {
						var item=null;

						if(scope.item === undefined)
							item = scope;
						else{
							item = scope.item;
							item.selected = !item.selected;
						}

						var i = $scope.subQueries[name].indexOf(item.identifier);
						if(i !==-1)
							$scope.subQueries[name].splice(i,1);

						removeFilter(item.identifier);
						destroyPages ();
						if(!$scope.subQueries[name].length)search();

						updateQueryString();
						search();

				}//deleteSubQuery

				$scope.deleteSubQuery=deleteSubQuery;
				//=======================================================================
				//
				//=======================================================================
				function deleteAllSubQuery(name) {
						if($scope.subQueries)
							$scope.subQueries[name]=[];
				}//deleteSubQuery

				//=======================================================================
				//
				//@ data - raw country data taken from api call
				//@ terms -
				//@ qsSelection -
				//=======================================================================
				function updateTerms(terms,items,facet,data) {

						var qsSelection = _([$location.search()[facet]]).flatten().compact().value(); // takes query string into array
						var termsx = {};

						if(!data)data=terms;
						terms =  _.map(data, function(t) {
									if(qsSelection && !_.isEmpty(qsSelection))
											t.selected = qsSelection.indexOf(t.identifier)>=0; // adds query string frmo url into query

									termsx[t.identifier] = t;
									return t;
						});//_.map
						insertCounts(items,termsx);
						return termsx;
				}//updateTerms

				//=======================================================================
				// initiates all counts to 0 and then insert facit counts based on country
				//
				//=======================================================================
				function insertCounts(items,termsx) {
	// console.log('items',items);
						if(termsx)
								_.each(termsx,function (item) {
										item.count = 0;

								});//  _.each
						if(items)
								items.forEach(function (item) {

										if(_.has(termsx, item.symbol)){
												termsx[item.symbol].count = item.count;
												if(!termsx[item.symbol].init){
														termsx[item.symbol].init = item.count;
														item.init=item.count;
												}
												// else item.init = termsx[item.symbol].init;

										}

								});//items.forEach
				}//insertCounts

				//=======================================================================
				//
				//=======================================================================
				function buildChildQuery (terms,items,facet,data) {
						if(!items)return;
						else destroyPages();

						if(!_.isEmpty(terms) )
								_.each(terms,function (item) {
										if(item.selected){
												addSubQuery(item,facet);
											}
						});
						search();
						updateTerms(terms,items,facet,data);
				}//buildQuery

				//=======================================================================
				//
				//=======================================================================
				function refresh (item,forceDelete,terms,items,facet,data) {
						if(item.selected  && !forceDelete)
								buildChildQuery(terms,items,facet,data);
						else{
								deleteSubQuery(facet,item);
								buildChildQuery(terms,items,facet,data);
						}
				}//buildQuery

				this.deleteAllSubQuery=deleteAllSubQuery;
				this.refresh =refresh;
				this.buildChildQuery =buildChildQuery;
				this.updateTerms =updateTerms;
				this.deleteSubQuery =deleteSubQuery;
				this.search = search;
				this.addSubQuery= addSubQuery;
				this.query=query;
				this.filters=$scope.filters;
				this.destroyPages =destroyPages;
			}]//controlerr
		};//return
	}]); //directive

	//============================================================
	//
	//
	//============================================================
	app.directive('bindIndeterminate', [function () {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            scope.$watch(attrs.bindIndeterminate, function (value) {
	                element[0].indeterminate = value;
	            });
	        }
	    };
	}]); //directive



	app.filter('toArray', function () {
	  return function (obj, addKey) {
	    if (!_.isObject(obj)) return obj;
	    if ( addKey === false ) {
	      return Object.keys(obj).map(function(key) {
	        return obj[key];
	      });
	    } else {
	      return Object.keys(obj).map(function (key) {
	        var value = obj[key];
	        return _.isObject(value) ?
	          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
	          { $key: key, $value: value };
	      });
	    }
	  };
	});

});//define

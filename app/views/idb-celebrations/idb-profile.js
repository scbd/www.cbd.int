define(['app','data/idb-celebrations/links','lodash','directives/idb-celebrations/menu-vertical','filters/lstring','filters/truncate','services/storage','directives/idb-celebrations/zoom-map'], function(app,links,_) { 'use strict';

	return ['$location', '$routeParams','$http','$filter','$q','IStorage', function( $location, $routeParams,$http,$filter,$q,storage) {

		var _ctrl 		= this;
		var canceler = null;

		_ctrl.gov 				= $routeParams.gov;
		_ctrl.year 				= parseInt($routeParams.year);
	  _ctrl.links 			= links.links;
		_ctrl.getCountry  = getCountry;
		_ctrl.documents		= {};
		_ctrl.getOrgLogo =getOrgLogo;
			getCountries();
			getEvents ();

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
			function mapOrgs(events) {

							if(events && Array.isArray(events))
								for(var i=0; i<events.length;i++){
									if(events[i].websites_C_ss)
										for(var j=0; j<events[i].websites_C_ss.length;j++)
												events[i].websites_C_ss[j] = JSON.parse(events[i].websites_C_ss[j]);
									if(events[i].images_C_ss)
										for(var j=0; j<events[i].images_C_ss.length;j++) //jshint ignore:line
												events[i].images_C_ss[j] = JSON.parse(events[i].images_C_ss[j]);
									if(events[i].documents_C_ss)
										for(var j=0; j<events[i].documents_C_ss.length;j++)//jshint ignore:line
												events[i].documents_C_ss[j] = JSON.parse(events[i].documents_C_ss[j]);

									if(events[i].contactOrganization_s)
									{
										 var event = events[i];
											loadReference ({identifier:events[i].contactOrganization_s}).then(
												function(res){
													event.org=res.data;
												}
											);
									}

								}
			}// mapOrgs()

			//============================================================
			//
			//============================================================
			function getOrgLogo(event) {

					if(event && event.org)
					return _.find(event.org.relevantDocuments,{name:'logo'});

			}
			//============================================================
			//
			//============================================================
			function loadReference (ref) {

					return storage.documents.get(ref.identifier, { cache : true})
						.success(function(data){
							ref= data;
							return ref;
						}).error(function(error, code){
							if (code == 404 ) {

								return storage.drafts.get(ref.identifier, { cache : true})
									.success(function(data){
										ref= data;
										return ref;
									}).error(function(draftError, draftCode){
										ref.document  = undefined;
										ref.error     = draftError;
										ref.errorCode = draftCode;
									});
							}

							ref.document  = undefined;
							ref.error     = error;
							ref.errorCode = code;

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
								if(schema==='event') mapOrgs(data.response.docs);
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

import _ from 'lodash'
import links from '~/data/idb/menu.json'
import '~/directives/idb-celebrations/menu-vertical'
import '~/filters/lstring'
import '~/providers/locale'
import '~/filters/truncate'
import '~/services/storage'
import '~/directives/idb-celebrations/zoom-map'
import '~/filters/term'
import '~/filters/moment'
import '~/filters/trust-as-resource-url'

export { default as template } from './idb-profile.html'

export default ['$location', '$routeParams','$http','$filter','$q','IStorage','locale','$timeout','user', '$scope',  function( $location, $routeParams,$http,$filter,$q,storage,locale,$timeout, user, $scope) {

		var _ctrl 		= this;
		var canceler = null;

		_ctrl.gov 						= $routeParams.gov;
		_ctrl.year 						= parseInt($routeParams.year);
	  _ctrl.links 					= links.links[_ctrl.year];
		_ctrl.getCountry  		= getCountry;
    _ctrl.isAdmin         = isAdmin;
		_ctrl.documents				= {};
		_ctrl.getOrgLogo  		= getOrgLogo;
		_ctrl.getWebsite  		= getWebsite;
		_ctrl.getCountry  		= getCountry;
		_ctrl.locale      		= locale;
		_ctrl.getEmbedMapUrl  = getEmbedMapUrl;
    _ctrl.createArticle   = createArticle;

			getCountries().then(function(){
        getEvents ();
				getArticle();
      });
      
      //============================================================
      //
      //============================================================
      function getArticle() {

        var params = {
            q: {
                'tags.title.en': { $all : [getNameEnglish(_ctrl.gov), 'International Day for Biodiversity']},//IDB
                'customTags.title.en': _ctrl.year.toString()
            }, fo:1
        };
        return $http.get("/api/v2017/articles",{params:params}).then(
          function(o){
            if(o.data){
              _ctrl.article = o.data
              _ctrl.articleContent = o.data.content[locale]
            }
        });
			}
			//============================================================
      //
      //============================================================
      function getTagIds(tags) {

        var params = {
            q: {
                'title.en': { "$in" : tags },//IDB
            }, f: {_id:1}
        };
        return $http.get("/api/v2017/article-tags/",{params:params}).then(
          function(o){
            if(o.data && o.data.length)
              return _.map(o.data, "_id");
        });
      }

      //============================================================
      //
      //============================================================
      function createArticle() {

				if(!_ctrl.article){
					$scope.creatingArticle = true;
					getTagIds(['International Day for Biodiversity', getNameEnglish(_ctrl.gov)])
					.then(function(tagsIds){
							var data =  {
								'tags': tagsIds,//IDB
								'customTags': [{ en : _ctrl.year.toString()}],
								'adminTags': [{ en : 'idb'}, { en : 'celebrations'}],
								'title':{en: _ctrl.year + ' Biodiversity celebrations for ' + getNameEnglish(_ctrl.gov)},
								'content':{en: _ctrl.year + ' Biodiversity celebrations for ' + getNameEnglish(_ctrl.gov)}
							};
							return $http.post("/api/v2017/articles",data).then(function(o){
								_ctrl.article = o.data

								if(_ctrl.article.id)
									window.open('https://www.cbd.int/management/articles/'+_ctrl.article.id+'/edit', '_blank')
							});
					})
					.finally(function(){
						$scope.creatingArticle = false;
					})
				}
				else	
					window.open('https://www.cbd.int/management/articles/'+_ctrl.article.id+'/edit', '_blank');
      }
			//============================================================
			//
			//============================================================
			function getCountries() {
				return $http.get("/api/v2013/thesaurus/domains/countries/terms").then(
					function(o){
						_ctrl.governments	=$filter('orderBy')(o.data, 'name');
				});
			}
      //============================================================
      //
      //============================================================
     function isAdmin () {
        if($scope.user)
           return !!_.intersection($scope.user.roles, ["Administrator","ChmAdministrator","undb-administrator"]).length;
      }
			//============================================================
			//
			//============================================================
			function getEmbedMapUrl(id) {
				if(!id) return false;
				return 'https://www.google.com/maps/embed/v1/place?key=AIzaSyCyD6f0w00dLyl1iU39Pd9MpVVMOtfEuNI&q=place_id:'+id;
			}
      //============================================================
			//
			//============================================================

			//============================================================
			//
			//============================================================
			function getCountry (code) {

              if(code==='all') {

                return {title:{en:'All Countries'}} }
							if(_ctrl.governments && _ctrl.governments.length)
								for(var i=0; i<_ctrl.governments.length;i++){
										if(_ctrl.governments[i].identifier===code)
											return _ctrl.governments[i];
								}

			}

      //============================================================
      //
      //============================================================
      function getNameEnglish(code) {
        if(_ctrl.governments && _ctrl.governments.length)
          for(var i=0; i<_ctrl.governments.length;i++)
              if(_ctrl.governments[i].identifier===code)
                return _ctrl.governments[i].title.en;
      }
			//============================================================
			//
			//============================================================
			function getEvents () {
        if(_ctrl.gov === 'all')
							var q = 'schema_s:event AND _state_s:public AND thematicArea_ss:CBD-SUBJECT-IBD AND (startDate_s:['+_ctrl.year+'-01-01T00:00:00.000Z TO '+_ctrl.year+'-12-31T00:00:00.000Z]) ';//
        else
          var q = 'schema_s:event AND _state_s:public AND thematicArea_ss:CBD-SUBJECT-IBD AND (startDate_s:['+_ctrl.year+'-01-01T00:00:00.000Z TO '+_ctrl.year+'-12-31T00:00:00.000Z]) AND (country_s:'+_ctrl.gov+' OR hostGovernments_ss:'+_ctrl.gov+')';//


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
									if(events[i].thematicArea_ss)
										for(var j=0; j<events[i].thematicArea_ss.length;j++)//jshint ignore:lin
											$filter('term')(events[i].thematicArea_ss[j],locale)

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
			function getWebsite(event) {

					if(event && event.websites_C_ss)
					return _.find(event.websites_C_ss,{name:'website'});

			}
			//============================================================
			//
			//============================================================
			function loadReference (ref) {

					return storage.documents.get(ref.identifier, { cache : true})
						.then(function({data}){
							ref= data;
							return ref;
						}).error(function(error, code){
							if (code == 404 ) {

								return storage.drafts.get(ref.identifier, { cache : true})
									.then(function({data}){
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
			//=======================================================================
			//
			//=======================================================================
			function query(schema,query) {

						_ctrl.loading         = true;


					var queryParameters = {
							'q': query,
							'sort': 'createdDate_dt desc',
				      'fl': 'hostGovernments_ss,governments_ss,country_s,postalCode_s,state_s,city_s,address_s,lat_d,lng_d,googlePlaceId_s,onlineEvent_b,thematicArea_ss,descriptionNative_s,logo_s,websites_C_ss,images_C_ss,documents_C_ss,startDate_s,endDate_s,identifier_s,id,title_s,description_s,url_ss,schema_EN_t,government_EN_t,schema_s,aichiTarget_ss,symbol_s,',
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
								if(schema==='event') mapOrgs(data.response.docs);
							$timeout(function(){
								_ctrl.documents[schema]=data.response.docs;
								_ctrl[schema].stop  = _ctrl.documents[schema].length;
								_ctrl.loading = false;
							},300);

							_ctrl[schema]={};
							_ctrl[schema].count = data.response.numFound;
							_ctrl[schema].start = data.response.start;

							_ctrl[schema].rows  = data.response.docs.length;
					}).catch(function(error) {
							console.log('ERROR: ' + error);
					})
					.finally(function(){
						_ctrl.loading = true;
					});
					return pagePromise;
			}// query
	}];
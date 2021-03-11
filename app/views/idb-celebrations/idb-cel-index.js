import links from '~/data/idb/menu.json'
import '~/directives/idb-celebrations/menu-vertical'
import '~/filters/lstring'
import '~/providers/locale'

export { default as template } from './idb-cel-index.html'

export default ['$scope','$routeParams','$q','$http','$filter','$location','locale','user', function ($scope,$routeParams,$q,$http,$filter,$location,locale, user) {

        var _ctrl   = this;
				var canceler = null;
				var currentDate= new Date();


        _ctrl.isAdmin = isAdmin;

				if(!parseInt($routeParams.year) ||  Number($routeParams.year) < 2018)
		    	window.location.href = '/404'
				else
					_ctrl.year  	= parseInt($routeParams.year);

        _ctrl.links 	= links.links[_ctrl.year];
				_ctrl.documents	= {};
				_ctrl.getCountry= getCountry;


				getCountries().then(getEvents().then(function(){
					 mapGovernment();
           getArticle();
           getOtherCelebrations();
				}));

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
				function getCountries() {
					return $http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(
						function(o){
							_ctrl.governments	=$filter('orderBy')(o.data, 'name');
					});
				}

        //============================================================
        //
        //============================================================
        function getArticle() {

          var params = {
              q: {
									'tags.title.en'				: 'International Day for Biodiversity',//IDB
                  'customTags.title.en'	: _ctrl.year.toString()
              }, fo:1
          };
          return $http.get("https://api.cbd.int/api/v2017/articles",{params:params}).then(
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
        function getOtherCelebrations() {

          var params = {
              q: {
									'tags.title.en'				: 'International Day for Biodiversity',//IDB
                  'customTags.title.en'	: { $all : [_ctrl.year.toString(), 'other-celebrations']}
              }, fo:1
          };
          return $http.get("https://api.cbd.int/api/v2017/articles",{params:params}).then(
            function(o){
              if(o.data){
                _ctrl.otherCelebrations = o.data
                _ctrl.otherCelebrationsContent = o.data.content[locale]
              }
          });
        }
///management/articles/5acb8b88bf653b00011f5112/IDB-Celebrations-Around-the-World
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
								var q = 'schema_s:event AND thematicArea_ss:CBD-SUBJECT-IBD AND  (startDate_s:['+_ctrl.year+'-01-01T00:00:00.000Z TO '+_ctrl.year+'-12-31T00:00:00.000Z])';//_state_s:public AND
								return query('event',q);
				}
				//============================================================
				//
				//============================================================
				function mapGovernment() {
								_ctrl.numGovernments={};
								if(_ctrl.documents && Array.isArray(_ctrl.documents.event))
									for(var i=0; i<_ctrl.documents.event.length;i++){
										if(_ctrl.documents.event[i].hostGovernments_ss)
											for(var j=0; j<_ctrl.documents.event[i].hostGovernments_ss.length;j++){
												    var government = _ctrl.documents.event[i].hostGovernments_ss[j];
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
								'fl': 'identifier_s,hostGovernments_ss',
								'wt': 'json',
								'start': 0,
								'rows': 50000,
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
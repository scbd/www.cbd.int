define(['angular', 'lodash', './data/actors', './data/statuses', './data/sessions', 'filters/lodash', 'filters/lstring', './view-element',
 'css!./view.css', 'directives/aichi-targets/pagination','filters/term'], 
function(ng, _, actorList, statusesList, sessionList){
    

    return ['$scope', '$http', '$q', '$location', '$compile', '$timeout', '$sce', '$filter',
      function($scope, $http, $q, $location, $compile, $timeout, $sce, $filter){

        $scope.pageSort     = ''
        $scope.freeText     = '';
        $scope.type         = '';
        $scope.itemsPerPage = '';
        $scope.currentPage  = 0;        
        $scope.selectedFilter = {
            session         : [],
            elementType     : [],
            subjects        : [], 
            aichiTargets    : [],
            actors          : [],
            status          : [],
            freeText        : []            
        };

        $scope.collections = {
            session : _(sessionList ).reduce(function(r,v){ r[v.code] = v; return r; }, {}),
            elementType    : {
                decision:{title:'Decision', code: 'decision'},paragraph:{title:'Paragraph', code: 'paragraph'},
            },
            actors  : _(actorList   ).reduce(function(r,v){ r[v.code] = v; return r; }, {}),
            status  : _(statusesList).reduce(function(r,v){ r[v.code] = v; return r; }, {})
        };

        $scope.addSearchFilter = function(selected, list, skipQS){
            
            if(list == 'freeText'){
                if(selected!=''){
                    $scope.selectedFilter.freeText[0] = ({ title: selected, type:list, code:selected });
                }
                else{
                    $scope.selectedFilter.freeText.splice(0, 1);
                }
                return;
            }

            var selectedDetails = $scope.collections[list][selected];

            if(!selectedDetails)
                return;

            if(!$scope.selectedFilter[list])
                $scope.selectedFilter[list] = [];

            if(_.some($scope.selectedFilter[list], { code:selected}))
                return;
            
            var title = selectedDetails.name||selectedDetails.title;

            if(list == 'session')
                title = selectedDetails.group + '-' + selectedDetails.title;

            $scope.selectedFilter[list].push({ title: title, type:list, code:selected });
            if(!skipQS)
                updateQueryString();
        }

        $scope.removeFilter = function(value, list){
            // delete $scope.selectedFilter[item];
            var list = $scope.selectedFilter[list];
            var index = _.findIndex(list, {code:value.code})
            list.splice(index, 1);
            if(value.type=='freeText')
                $scope.freeText = undefined;
            updateQueryString();
            $scope.search();
        }


		var canceler 				= null;
        $scope.search = function(selected, list, skipQS, count){
            if(selected)
                $scope.addSearchFilter(selected, list, skipQS);

            $scope.isLoading = true;
            
            var query = {
                '$and':[]
            }
            _.each($scope.selectedFilter, function(item, key){
                var inQuery;
                //for session split to two fields
                if(key == 'session'){
                    var sessionOr =  _(item).map(function(v){ 
                        var session =  v.code.replace(/^[a-z]+-/ig, '');
                        var body    =  v.code.replace(/-[0-9]+$/ig, '');
                        return { body    : body     ,
                                 session : parseInt(session)  
                        };
                    }).value();
                    if(sessionOr && sessionOr.length > 0)
                        inQuery = {$or    : sessionOr };
                }
                else if(key == 'freeText' && ($scope.freeText||'')!=''){
                    query.$and.push({
                        'text' : { '$$contains' : $scope.freeText }
                    })
                }
                else{
                    var codes = _.map(item, 'code');
                    if(codes.length){
                        inQuery = {
                            [key] : { '$in' : codes } 
                        }
                    }
                }
                if(inQuery)
                    query.$and.push(inQuery);
            });
            var qs = {
                c   : 1
            }

            if($scope.pageSort)
                qs.s = {[$scope.pageSort] : 1};

            if(query.$and.length == 0)
                query.$and = undefined;

            qs.q  =  JSON.stringify(query)

            var countQuery;

            if (canceler) {
                    canceler.resolve(true);
            }
            canceler = $q.defer();

            if(!count){
                $scope.currentPage  = 0;      
                countQuery = $http.get('/api/v2016/decision-texts/search',  { params : qs, timeout: canceler.promise} );
            }
            else
                countQuery = { data : {count : count }};

            $q.when(countQuery)
            .then(function(result){
                
                canceler = null;
                $scope.searchCount = result.data.count;                
                refreshPager($scope.currentPage);

                if($scope.searchCount == 0 ){
                    $scope.searchResult = undefined;
                    $scope.pages        = 0;
                    return;
                }

                qs.c  = undefined;
                qs.l  = $scope.itemsPerPage;
                qs.sk = $scope.currentPage * $scope.itemsPerPage;

                return $q.when($http.get('/api/v2016/decision-texts/search',  { params : qs} ))
                .then(function(result){
                    
                    $scope.searchResult =   result.data;
                    return $timeout(function(){

                        var searchResultElements = ng.element('.searchResultElement');
                        searchResultElements.each(function(i, e){
                            var html = $(e.innerHTML);
                            html.attr('show-decision', "true")
                            var link     = $compile(html);
                            var content  = link($scope);
                            ng.element(e).html(content)
                        });

                    }, 500)

                })
            })
            .finally(function(){                    
                $scope.isLoading=false;
            });
        }

        $scope.freeTextSearch = function(selected, list){
            
            $scope.addSearchFilter(selected, list);
            // $timeout(function(){
                $scope.search(selected, list);
            // }, 2000)

        }
        $scope.onPage = function(pageIndex){
            $scope.currentPage = pageIndex;
            $scope.search(undefined, undefined, undefined, $scope.searchCount);
        }

        $scope.trustedHtml = function (plainText) {
            return $sce.trustAsHtml(plainText);            
        }

        $scope.term = function(code){
            var termCode = {identifier:code};
            return $filter("term")(termCode);
        }

        $scope.updateQueryString = updateQueryString;
        $scope.romanize          = romanize;
        //===========================
        //
        //===========================
        function init() {

            var q0 = $http.get('/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms',  { cache: true } );
            var q1 = $http.get('/api/v2013/thesaurus/domains/AICHI-TARGETS/terms', { cache: true } );

            $q.all([q0, q1]).then(function(res) {

                $scope.collections.subjectsMap          =   res[0].data;
                $scope.collections.aichiTargetsMap      =   res[1].data;
                $scope.collections.subjects             = _(res[0].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});
                $scope.collections.aichiTargets         = _(res[1].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});

                readQueryString();
                if($scope.selectedFilter){
                    if(($scope.itemsPerPage||'')=='')
                        $scope.itemsPerPage = '50';
                    $scope.search();
                }
            }).catch(function(err){
                err = (err||{}).data || err;
                console.error(err);
                alert(err.message||err);
            });
        }

        function updateQueryString(){
            
            var qs = $location.search();

            _.each($scope.selectedFilter, function(item, key){
                $location.replace();
                $location.search(key, _.pluck(item, 'code'))
            })

            if(($scope.freeText||'')!=='')
                $location.search('freeText', $scope.freeText)
            else 
                $location.search('freeText', null)
            if($scope.itemsPerPage!==undefined)
                $location.search('itemsPerPage', $scope.itemsPerPage)
            if($scope.pageSort!==undefined)
                $location.search('pageSort', $scope.pageSort)
        }

        function readQueryString(){
            
            var qs = $location.search();

            _.each(qs, function(codes, key){
                if(_.isArray(codes)){
                    _.each(codes, function(code){                
                        $scope.addSearchFilter(code, key, true);
                    })
                }
                else if($scope[key]!=undefined){
                    $scope[key] = codes.toString();
                    if(key == 'freeText')
                        $scope.addSearchFilter(codes, key, true);
                }
                else 
                    $scope.addSearchFilter(codes, key, true);
            })

        }
        function refreshPager(currentPage)
        {
            currentPage = currentPage || 0;

            var pageCount = Math.ceil(Math.max($scope.searchCount||0, 0) / Number($scope.itemsPerPage));

            var pages     = [];
            var start = 0;
            var end = (pageCount<6)? pageCount:6;

            if(currentPage > 0 && currentPage <=pageCount && (pageCount>=6)){
            start = currentPage-1;
            end = currentPage+1;
            if(end>pageCount)
                end = pageCount;
            for (var i = start; i <= end; i++) {
                pages.push({ index : i, text : i+1 });
            }
            }else{
            for (var i = start; i < end; i++) {  //jshint ignore:line
                pages.push({ index : i, text : i+1 });
            }
            }

            $scope.pages       = pages;
        }


        //==============================
        //
        //==============================
        function romanize (n) {
            var roman = [ '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX' ];
            return roman[n];
        }

        init();
    }]
})

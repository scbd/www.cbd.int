import template from './search-filter-assistance-types.html';
import app from '~/app';
import _ from 'lodash';
import angular from 'angular'; 

	//==============================================
	//
	//
	//==============================================
	app.directive('searchFilterAssistanceTypes',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
				require : '^search',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet',
							count: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, searchCtrl)
        {
            $scope.expanded = false;
            var termsMap =[];
						$scope.termsArray=[];
						$scope.terms = [];

						$scope.filters=searchCtrl.filters;
					
						buildTermsAndQuery();
            $scope.$watch('items',function(){

							searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
						});

						//=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {
                    if(_.isEmpty(termsMap)){ // get terms once and save

												$http.get('/api/v2013/thesaurus/domains/441381DA-856A-4E89-8568-9EBE7145FA50/terms').success(function (data) {

														$scope.terms = thesaurus.buildTree(data);

														termsMap   = flatten($scope.terms, {});
														$scope.termsArray = _.values(termsMap);
														_.each($scope.termsArray,function(term){
                                term.name=$scope.facet;

                            });

														termsMap=searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                            searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);


												});

                    }else{
														termsMap = searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
														searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);

                    }

            }//buildTermsAndQuery()

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item,forceDelete){
							var term = item;

										term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;
										setBroaders(term.broaderTerms, term.selected);
										setNarrowers(term.narrowerTerms, term.selected);
			              searchCtrl.refresh(item,forceDelete,termsMap,$scope.items,$scope.facet);
            };//$scope.refresh

						//=======================================================================
      			//
      			//=======================================================================
            function setBroaders(broaderTerms, selected) {

                if(!broaderTerms) return;

                broaderTerms.forEach(function (term) {
                    term.indeterminateCounterA = term.indeterminateCounterA + (selected ? 1 : -1);
                    term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;
                    setBroaders(term.broaderTerms, selected);
                });

            }//setBroaders(broaderTerms, selected)

						//=======================================================================
						//
						//=======================================================================
            function setNarrowers(narrowerTerms, selected) {

                if(!narrowerTerms) return;

                narrowerTerms.forEach(function (term) {
                    term.indeterminateCounterB = term.indeterminateCounterB + (selected ? 1 : -1);
                    term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;
                    setNarrowers(term.narrowerTerms, selected);
                });
            }//setNarrowers(narrowerTerms, selected)


						//=======================================================================
      			//
      			//=======================================================================
            function flatten(items, collection) {
                items.forEach(function (item) {
                    item.selected = false;
                    item.indeterminateCounterA = 0;
                    item.indeterminateCounterB = 0;

                    collection[item.identifier] = item;


                    if(item.narrowerTerms)
                        flatten(item.narrowerTerms, collection);
                });
                return collection;
            }//flatten(items, collection)

				}//link
    }; // return
  }]);  //app.directive('searchFilterCountries
// define

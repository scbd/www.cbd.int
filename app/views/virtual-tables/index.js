import app from '~/app';
import 'angular-grid';
import _ from 'lodash';
import '~/services/article-service'
import 'ngInfiniteScroll'
import '~/directives/articles/cbd-article';
import 'ngDialog';
import '../articles';
import moment from 'moment';
import cbdAddNewArticle from '~/directives/articles/cbd-add-new-article.vue'
import 'angular-vue';
      
export { default as template  } from './index.html';

export default ['$q', 'user','$http','$scope', '$rootScope', '$timeout', 'articleService', 'angularGridInstance', 'ngDialog', '$route',
 function( $q, user,$http, $scope,  $rootScope, $timeout, articleService, angularGridInstance, ngDialog, $route) {

    var basePath  = $scope.basePath = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');

    $scope.$root.page={
        title : "Virtual display table : " + ($route.current.params.type||'').toUpperCase(),
        description : $('#poster-description').text()
    };
    $scope.filterByType = 'all';
    $scope.filterByMeeting = 'all';
    $scope.filterByEventType = 'all';

    $scope.publicationType = {
        'all'                              : 'All type',
        'newsletter'                       : 'Newsletter',
        'flyer-brochure-booklet'           : 'Flyer / Brochure / Booklet',
        'policy-brief'                     : 'Policy brief',
        'position-paper'                   : 'Position paper',
        'specialized-technical-publication': 'Specialized or technical publication',
        'report'                           : 'Report',
        'other'                            : 'Other'
    }
    $scope.meetingType = {
        'all':'All meetings',
        'sbstta-24'  : 'SBSTTA-24',
        'sbi-3': 'SBI-3'
    }
    $scope.eventType = {
        'all'                                     : 'All types',
        'open-webinar-or-online-training'         : 'Open webinar or online training',
        'on-invitation-webinar-or-online-training': 'On-invitation webinar or online training',
        'in-person-event-meeting-or-activity'     : 'In-person event, meeting or activity',
        'other'                                   : 'Other'
    }

    $scope.isEvent = $route.current.params.type == 'event';
    $scope.isPublication = $route.current.params.type == 'publication';

    $scope.isAdmin = (user.roles||[]).find(r=>['administrator', 'oasisArticleEditor'].includes(r))!=undefined;
    $scope.vueOptions = {
        components : {cbdAddNewArticle}
    }
    $scope.setFilterByField = function(key, type){

        $scope[type] = key;
        $timeout(function(){
            angularGridInstance.gallery.refresh();
        }, 200)
    }

    $scope.filterBy = function(item){
        return item 
        &&  ($scope.filterByMeeting == 'all'  || item[$scope.filterByMeeting])
        &&  ($scope.filterByType    == 'all'  || item[$scope.filterByType])
        &&  ($scope.filterByEventType    == 'all'  || item[$scope.filterByEventType])

    }

    $scope.showArticle =function(article){
        ngDialog.open({
            template:'articleDetails',
            name     : 'articleDetails',
            controller : ['$scope', '$element', function($scope, $element){
                    $scope.virtualArticleQuery = [{"$match"   : {_id: { $oid: article._id}} }];
                    $scope.closeDialog = function(){
                        ngDialog.close();                                            
                    }

                    $scope.onArticleLoad = function(article){
                        $scope.virtualArticle = article;
                        $scope.isLoading = false;
                    }

                    $($element).scroll(onScroll);

                    $scope.$on('$destroy', ()=>{$($element).off('scroll', onScroll)})

                    function onScroll(){
                        var scroll = $($element).scrollTop();
                          $element.find(".zoom img").css({
                              transform: 'translate3d(-50%, -'+(scroll/100)+'%, 0) scale('+(100 + scroll/5)/100+')',
                          });
                    }
            }]
        })
    }

    $scope.loadPastEvents = function(){
        $scope.includePastEvents=!$scope.includePastEvents;
        fetchPosterArticles();
    }

    function fetchPosterArticles(){
        $scope.filterAdminTags = ["virtual-table", encodeURIComponent($route.current.params.type), encodeURIComponent($route.current.params.code)]
        $scope.loading = true;
        var ag = [];
        var sortBy = {$sort : {'customProperties.sortOrder':-1 }};
        ag.push({"$match":{ "$and" : [{"adminTags":{"$all":$scope.filterAdminTags}}]}});
        
        if($scope.isEvent){
            if(!$scope.includePastEvents)
                ag.push({
                            $match : { 'customProperties.eventDate' : { $gte : { $date : moment().add(-1, 'day')}} }
                        })
            sortBy.$sort['customProperties.eventDate'] = -1;
        }
        else{
            sortBy.$sort['meta.createdOn'] = -1
        }
        
        ag.push(sortBy);
        ag.push({"$project" : { coverImage:1, adminTags:1, title:1, summary:1,eventData:1}});
        ag.push({"$limit":1000});

        articleService.query({ "ag" : JSON.stringify(ag) })
        .then(function(posters){                    
            _.each(posters, function(article){
                if(article.coverImage && article.coverImage.url){
                    article.url_600 = article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&600x400/');                    
                }

                if(article.adminTags){
                    article.adminTags.forEach(t=>{
                        if( $scope.publicationType[t])
                            article[t] = true;
                        if( $scope.meetingType[t])
                            article[t] = true;
                        if( $scope.eventType[t])
                            article[t] = true;
                    })
                }
            });
            $scope.posters = posters
            return $timeout(function(){
                angularGridInstance.gallery.refresh();
            }, 1000)
        })
        .finally(function(){
            $scope.loading = false;
        })
    }

    function buildQuery(){
        var ag   = [];
        var tags = ['virtual-table', 'introduction', encodeURIComponent($route.current.params.code)];
        
        
        var match = { "adminTags" : { $all: _(tags).map(kebabCase).value() }};

        if($route.current.params.articleId)
            match = {_id: { $oid: $route.current.params.articleId}}

        ag.push({"$match"   : match });
        ag.push({"$project" : { title:1, content:1, coverImage:1}});
        ag.push({"$sort"    : { "meta.updatedOn":-1}});
        ag.push({"$limit"   : 1 });

        $scope.articleQuery = ag;
    }

    function kebabCase(val){
        return val.toLowerCase().replace(/\s/g, '-')
    }

    buildQuery();

    fetchPosterArticles();

}];

app.filter('unsafe', function ($sce) {
    return $sce.trustAsHtml;
});
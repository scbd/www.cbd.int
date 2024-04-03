import '~/app'
import '~/services/article-service'
import '~/services/conference-service'
import '~/directives/social-media'
import '~/filters/lstring'
import '~/filters/moment'
import '~/directives/articles/cbd-article-cover-image' 
import ng from 'angular';

export { default as template } from './conferences.html'

export default ['$location','$scope','conferenceService', '$q', 'articleService',
        function ($location, $scope, conferenceService, $q, articleService) {
       
			var _ctrl = this;
                // institution:'CBD',
            var query = {
                "showOnPortal":true,
                code: { $exists :1 },
                conference: { $exists :1 }
            }
            var fields = {
                _id:1, Title:1, Description:1, Venue:1, Dates:1, StartDate:1, EndDate:1, timezone:1, code:1, active:1, articleId:1, "conference.articleId":1
            };

            $q.when(conferenceService.getConferences(query, fields, { active:-1, StartDate:-1})).then(({ data })=> data )
            .then(async (conferences) => {

                const articleIds = conferences.map(c=>c.conference?.articleId || c.articleId);

                var ag = [
                    {"$match"   : { "_id" : { $in: articleIds.map(id=>({ $oid: id })) } } },
                    {"$project" : { coverImage:1, adminTags:1, title:1}}
                ];

                const articles = (await articleService.query({ "ag" : JSON.stringify(ag) })).map(normalizeArticle);

                conferences.forEach(conference=>{

                    const articleId = conference.conference?.articleId || conference.articleId;
                    conference.article = articles.find(a=>a._id==articleId);;
                });

                const activeConference = conferences.find(o=>o.active) || conferences[0];

                $scope.$applyAsync(()=>{ // because of `async` function we are potentially out of `apply` phase!
                    $scope.activeConference = activeConference
                    $scope.conferences      = conferences.filter(o=>o!=activeConference);
                });
            });


            $scope.showConference = function(code){
                //$location.path(encodeURIComponent(code)); // TOO BAD NOT WORKING
                const basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');
                window.location.href = `${basePath}/${encodeURIComponent(code)}`;
            }
    }];


function normalizeArticle(article) {

    if(article.coverImage?.url){
        //sometime the file name has space/special chars, use new URL's href prop which encodes the special chars
        const url = new URL(article.coverImage.url)
        article.coverImage.url = url.href;

        article.url_300 = article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&500x300/')
        article.url_1200 = article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
    }

    return article;
}
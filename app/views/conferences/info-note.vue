<template>
    <div>
        <div class="row" v-if="showEditButton" >
            <div class="col-sm-12">
                <cbd-article :query="articleQuery" :admin-tags="introAdminTags" target="_self"></cbd-article>
            </div>
        </div>
        </br>
        <div class="row">
            <div class="col-sm-12">
                <cbd-add-new-article :admin-tags="infoNoteAdminTags" target="_self" class="btn btn-default pull-right">
                    <slot><i class="fa fa-edit"></i>  Add info note</slot>
                </cbd-add-new-article>
            </div>
            <div class="col-sm-12">
                <articles-accordion :query="query" ></articles-accordion>        
            </div>
        </div>
    </div>
</template>

<script>
import articlesAccordion from '~/directives/articles/articles-accordion.vue';
import cbdArticle     from '~/directives/articles/cbd-article.vue';
import cbdAddNewArticle from '~/directives/articles/cbd-add-new-article.vue';

export default {
    components : { articlesAccordion, cbdArticle, cbdAddNewArticle },
    data(){
        return{
            introAdminTags : ['conferences', 'info-note', 'introduction', encodeURIComponent(this.getMeetingCode())],
            infoNoteAdminTags : ['conferences', 'info-note', 'accordion', encodeURIComponent(this.getMeetingCode())],
            showEditButton : false
        }
    },
    mounted(){
        this.showEditButton = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
    },
    methods:{
        query (){

            const ag = [];
            ag.push({"$match":{ "$and" : [{"adminTags":{"$all":['conferences', 'info-note', 'accordion', this.getMeetingCode()] }}]}});
                        
            ag.push({$sort : {'title.en':1 }});
            ag.push({"$project" : { title:1, content:1, 'meta.createdOn':1}});
            ag.push({"$limit":1000});

            return { ag : JSON.stringify(ag) };
        },
        articleQuery(){
            const ag = [];
            ag.push({"$match":{ "$and" : [{"adminTags":{"$all":['conferences', 'introduction', 'info-note', encodeURIComponent(this.getMeetingCode())] }}]}});
                        
            ag.push({$sort : {'title.en':1 }});
            ag.push({"$project" : { title:1, content:1, 'meta.createdOn':1}});
            ag.push({"$limit":1000});

            return { ag : JSON.stringify(ag) };
        },
        getMeetingCode(){
            const url = window.location.pathname;
            const codeRegex = /conferences\/(.*)\/.*/

            const matches = url.match(codeRegex);
            
            return matches[1];
        }
    }
}
</script>

<style>

</style>
<template>
    <div>
        <div class="row" >
            <div class="col-sm-12">
                <cbd-article :query="articleQuery" :admin-tags="introAdminTags" target="_self"></cbd-article>
            </div>
        </div>
        </br>
        <div class="row"  >
            <div class="col-sm-12">
                 <span class="pull-right badge badge-warning mb-1" style="margin-right:2.5%" v-if="lastModifiedOn">Updated : {{lastModifiedOn | formatDate('yyyy-LL-dd HH:mm')}}</span>
                <cbd-add-new-article v-if="showEditButton" :admin-tags="infoNoteAdminTags" target="_self" class="btn btn-default pull-left mb-1">
                    <slot><i class="fa fa-edit"></i>  Add info note</slot>
                </cbd-add-new-article>
            </div>
            <div class="col-sm-12">
                <articles-accordion :query="query" @onArticlesLoad="onArticlesLoad" ></articles-accordion>        
            </div>
        </div>
    </div>
</template>

<script>
import articlesAccordion from '~/directives/articles/articles-accordion.vue';
import cbdArticle     from '~/directives/articles/cbd-article.vue';
import cbdAddNewArticle from '~/directives/articles/cbd-add-new-article.vue';
import { format as formatDate } from '~/components/meetings/datetime';
import { sortByOrder } from 'lodash'

export default {
    components : { articlesAccordion, cbdArticle, cbdAddNewArticle },
    data(){
        return{
            introAdminTags : ['conferences', 'info-note', 'introduction', encodeURIComponent(this.$route.params.code)],
            infoNoteAdminTags : ['conferences', 'info-note', 'accordion', encodeURIComponent(this.$route.params.code)],
            showEditButton : false,
            lastModifiedOn : null
        }
    },
    mounted(){
        this.showEditButton = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
    },
    computed:{
        query (){

            const ag = [];
            ag.push({"$match":{ "$and" : [{"adminTags":{"$all":['conferences', 'info-note', 'accordion', this.$route.params.code] }}]}});
                        
            ag.push({$sort : {'title.en':1 }});
            ag.push({"$project" : { title:1, content:1, 'meta.modifiedOn':1}});
            ag.push({"$limit":1000});

            return { ag : JSON.stringify(ag) };
        },
        articleQuery(){
            const ag = [];
            ag.push({"$match":{ "$and" : [{"adminTags":{"$all":['conferences', 'introduction', 'info-note', encodeURIComponent(this.$route.params.code)] }}]}});
                        
            ag.push({$sort : {'title.en':1 }});
            ag.push({"$project" : { title:1, content:1, 'meta.modifiedOn':1}});
            ag.push({"$limit":1000});

            return { ag : JSON.stringify(ag) };
        }
    },
    methods:{
        onArticlesLoad(articles){           
            if(articles.length){
               this.lastModifiedOn = sortByOrder(articles, o=>o.meta.modifiedOn, 'desc')[0].meta.modifiedOn;
            }
            console.log(this.$route)
        }
    },
    filters: {
        formatDate
    }
}
</script>

<style>

</style>
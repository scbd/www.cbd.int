<template>
    <div>
        <div class="row" >
            <div class="col-sm-12">
                <cbd-article :query="articleQuery" :admin-tags="introAdminTags" target="_self" show-edit="true"></cbd-article>
            </div>
        </div>
        </br>
        <div class="row"  >
            <div class="col-sm-12">
                <cbd-add-new-article v-if="showEditButton" :admin-tags="infoNoteAdminTags" target="_self" class="btn btn-default pull-left mb-1">
                    <slot><i class="fa fa-edit"></i>  Add info note</slot>
                </cbd-add-new-article>

                <div class="pull-right">
                    Sort by 
                    <select v-model="sortBy" @change="onSortChange()">
                        <option value="title">Title</option>
                        <option value="modifiedOn">Last updated</option>
                    </select>
                </div>
            </div>
            <div class="col-sm-12" v-if="showAccordion">
                <articles-accordion :query="query" @onArticlesLoad="onArticlesLoad" :show-new="true"
                    :print-header="printHeader" ></articles-accordion>        
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
import Api  from '~/components/meetings/api.js'
import remapCode  from '~/components/meetings/sessions/re-map.js'

export default {
    components : { articlesAccordion, cbdArticle, cbdAddNewArticle },
    data(){
        return{
            introAdminTags : ['conferences', 'info-note', 'introduction', encodeURIComponent(this.$route.params.code)],
            infoNoteAdminTags : ['conferences', 'info-note', 'accordion', encodeURIComponent(this.$route.params.code)],
            showEditButton : false,
            sortBy : 'title',
            showAccordion:true,
            printHeader:''
        }
    },
    created() {
        this.api = new Api() //anonymous 
    },
    mounted(){
        this.showEditButton = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
        this.init();
    },
    computed:{
        query (){

            const ag = [];
            ag.push({"$match":{ "$and" : [{"adminTags":{"$all":['conferences', 'info-note', 'accordion', this.$route.params.code] }}]}});
              
            if(this.sortBy == 'modifiedOn')            
                ag.push({$sort : {'meta.modifiedOn':-1 }});
            else 
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
        onSortChange(){
            this.showAccordion = false;
            setTimeout(() => {
                this.showAccordion = true;
            }, 100);
        },
        async init(){
            const $route = this.$options.parent.route
            if($route?.params?.code){
                const conferenceCode = remapCode($route.params.code);
                const conference     = await this.api.getConference(conferenceCode);
                this.printHeader     = conference.conference.customHeader||'';

                console.log(this.printHeader)
            }
        }
    },
    filters: {
        formatDate
    }
}
</script>

<style>

</style>
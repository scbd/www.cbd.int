
<template>
    <div class="articles-accordion">
        <div class="row" v-if="showAddNew">
            <div class="col-sm-12">
                <cbd-add-new-article v-if="showAddNew && adminTags" :admin-tags="adminTags" target="_self"
                    class="btn btn-default pull-left mb-1">
                    <slot name="addNewTitle"><i class="fa fa-plus"></i>  Add new</slot>
                </cbd-add-new-article>
            </div>
        </div>
        <div id="accordion">
            <div class="card item" v-for="article in articles" :key="article._id" :id="'cardItem_'+article._id">
                <div class="card-header collapsed" :id="article._id" data-toggle="collapse" :data-target="'#' + article.hashTitle"
                            aria-expanded="true" aria-controls="collapseOne">
                    <h5 class="mb-0">
                        
                        <i class="fa fa-chevron-up pull-right"></i>
                        <span class="pull-right" style="font-size: 70%;font-weight: 300;" v-if="showDate && article.meta.modifiedOn">Updated: {{article.meta.modifiedOn | formatDate('dd LLL')}}</span>
                        
                        {{ article.title | lstring($locale)  }}
                        <span class="badge badge-danger label-new" v-if="showNewLabel && article.showNewLabel">New</span>
                    </h5>
                    
                </div>

                <div :id="article.hashTitle" class="collapse" :aria-labelledby="article._id" data-parent="#accordion">
                    <div class="card-body">
                        <cbd-add-new-article v-if="showEditButton" :id="article._id" target="_self" class="btn btn-default pull-right"></cbd-add-new-article>
                        <button class="btn btn-info pull-right btn-print" @click="print('cardItem_'+article._id, article)" 
                            style="cursor:pointer" v-if="showPrint"><i class="fa fa-print"></i> Print</button>
                        <cbd-article :article="article" :show-edit="true" :hide-cover-image="true"></cbd-article>                        
                     </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import moment from 'moment'
import 'css!cdn!npm/@scbd/ckeditor5-build-inline-full@35.0.0/build/content-style.css';
import ArticlesApi from '../../api/articles';
import cbdArticle from './cbd-article.vue'
import cbdAddNewArticle from './cbd-add-new-article.vue';
import { format as formatDate } from '~/components/meetings/datetime';
import {lstring } from '~/filters/vue-filters'
import 'printThis'
import { sanitizeHtml } from '~/services/html';


export default {
    name: 'articlesAccordion',
    components : { cbdAddNewArticle, cbdArticle },
    props: {
        query: { type: Object, required: true },
        showAddNew : { type: Boolean, required: false, default:false },
        printHeader  : { type: String, required: false },
        adminTags 	 : { type: Array  , required: false, default:[]           }, // [] of adminTag text
        showNewLabel : { type: Boolean, required: false, default:true },
        showDate     : { type: Boolean, required: false, default:true },
        showPrint    : { type: Boolean, required: false, default:true },
        
    },
    data() {
        return {
            articles: [],
            showEditButton : false            
        }
    },
    created() {
        this.ArticlesApi = new ArticlesApi({ token: ()=>this.$auth.strategy.token.get() })
    },
    mounted() {
        this.loadArticles();
        this.$auth.fetchUser().then(()=>{
            this.showEditButton = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
        })

    },
    methods: {
        sanitizeHtml,
        async loadArticles() {
            const today = moment().add(-2, 'day')
            
            const query = this.query;
            const articles = await this.ArticlesApi.queryArticles(query);
            this.articles = articles.map(e=>{
                e.showNewLabel = moment(e.meta.modifiedOn) > today
                e.hashTitle = lstring(e.title, this.$locale).replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
                return e;
            });
            this.$emit('onArticlesLoad', this.articles);
        },
        print(section, article){
            $('#'+section).printThis({
                debug:false,
                printContainer:true,
                importCSS:true,
                importStyle : true,
                pageTitle :  lstring(article.title, this.$locale),
                // loadCSS : '/app/css/print-friendly.css',
                header : this.printHeader||'',
                // footer : footer
            });	

        }
    },
    filters: {
        formatDate
    }
}
</script>
    
<style>
    .articles-accordion .card.item{
        margin-bottom: 10px;
    }
    .articles-accordion .card-header .fa {
        transition: .3s transform ease-in-out;
    }
    .articles-accordion .card-header.collapsed .fa {
        transform: rotate(180deg);
    }
    .articles-accordion .card-header{
        cursor: pointer;
    }
    .articles-accordion .card-body .ck-content {
        padding-top: 5px;
    }

    .articles-accordion .card-body .ck-content p {
        margin-bottom: 10px!important;
    }
    
    .label-new{
        margin-left : 5px;
    }

    @media print {
        .fa-chevron-up, .fa-print, .label-new, .btn-print{
            display: none;
        }
    }
</style>
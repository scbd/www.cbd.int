
<template>
    <div class="articles-accordion">
        <div id="accordion">
            <div class="card item" v-for="article in articles" :key="article._id">
                <div class="card-header collapsed" :id="article._id" data-toggle="collapse" :data-target="'#' + article.hashTitle"
                            aria-expanded="true" aria-controls="collapseOne">
                    <h5 class="mb-0">
                        <i class="fa fa-chevron-up pull-right"></i>
                        <span class="pull-right" style="font-size: 70%;font-weight: 300;" v-if="article.meta.modifiedOn">Updated: {{article.meta.modifiedOn | formatDate('dd LLL')}}</span>
                        {{ article.title | lstring($locale)  }}
                    </h5>
                </div>

                <div :id="article.hashTitle" class="collapse" :aria-labelledby="article._id" data-parent="#accordion">
                    <div class="card-body">
                         <cbd-add-new-article v-if="showEditButton" :id="article._id" target="_self" class="btn btn-default pull-right"></cbd-add-new-article>
                         <div v-html="$options.filters.lstring(article.content, $locale)" class="ck-content"></div>
                     </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import 'css!cdn!npm/@scbd/ckeditor5-build-inline-full@35.0.0/build/content-style.css';
import ArticlesApi from '../../api/articles';
import cbdAddNewArticle from './cbd-add-new-article.vue';
import { format as formatDate } from '~/components/meetings/datetime';
import {lstring } from '~/filters/vue-filters'


export default {
    name: 'articlesAccordion',
    components : { cbdAddNewArticle },
    props: {
        query: { type: Object, required: true }
    },
    data() {
        return {
            articles: [],
            showEditButton : false
        }
    },
    created() {
        this.ArticlesApi = new ArticlesApi({ token: this.$auth.strategy.token.get() })
    },
    mounted() {
        this.loadArticles(); 
        this.showEditButton = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
    },
    methods: {
        async loadArticles() {
            const query = this.query;
            const articles = await this.ArticlesApi.queryArticles(query);
            this.articles = articles.map(e=>{
                e.hashTitle = lstring(e.title, this.$locale).replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
                return e;
            });
            this.$emit('onArticlesLoad', this.articles);
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
    
</style>
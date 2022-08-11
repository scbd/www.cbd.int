
<template>
    <div>
        <div id="accordion">
            <div class="card item" v-for="article in articles" :key="article._id">
                <div class="card-header collapsed" :id="article._id" data-toggle="collapse" :data-target="'#' + article.hashTItle"
                            aria-expanded="true" aria-controls="collapseOne">
                    <h5 class="mb-0">
                        <i class="fa fa-chevron-up pull-right"></i>
                        {{ article.title.en }}
                    </h5>
                </div>

                <div :id="article.hashTItle" class="collapse" :aria-labelledby="article._id" data-parent="#accordion">
                     <cbd-add-new-article :id="article._id" target="_self" class="btn btn-default pull-right"></cbd-add-new-article>
                    <div class="card-body" v-html="(article.content||{}).en "></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import('css!https://cdn.cbd.int/@scbd/ckeditor5-build-inline-full@22.0.0/build/ckeditor.css');

import ArticlesApi from '../../api/articles';
import cbdAddNewArticle from './cbd-add-new-article.vue';

export default {
    name: 'articlesAccordion',
    components : { cbdAddNewArticle },
    props: {
        query: { type: Function, required: true }
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
            const query = this.query();

            this.articles = await this.ArticlesApi.queryArticles(query);
            this.articles = this.articles.map(e=>{
                e.hashTItle = e.title.en.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
                return e;
            });
        }
    }
}
</script>
    
<style>
    .card.item{
        margin-bottom: 10px;
    }
    .card-header .fa {
        transition: .3s transform ease-in-out;
    }
    .card-header.collapsed .fa {
        transform: rotate(180deg);
    }
    

</style>

<template>
   <div class="ck-editor" style="border:none" v-if="article">
        <div ng-if="!hideCoverImage && article.coverImage">
            <cbd-article-cover-image cover-image="article.coverImage"></cbd-article-cover-image>
        </div>
       
        <div v-if="showEdit" class="pull-right">    
            <cbd-add-new-article :tags="tags" :admin-tags="adminTags" :custom-tags="customTags" :id="(article||{})._id" :target="target"
                class="btn btn-default"></cbd-add-new-article>
            <br/>    
        </div>
        <div v-html="$options.filters.lstring(article.content, $locale)" class="ck-content"></div>
    </div>

</template>

<script>

import 'css!cdn!npm/@scbd/ckeditor5-build-inline-full@22.0.0/build/ckeditor.css';
import axios from 'axios';
import ArticlesApi from '../../api/articles';
import cbdAddNewArticle from './cbd-add-new-article.vue';
// import { getAuthToken, getUser } from '~/authentication'
import '~/filters/vue-filters.js'

export default {
    name: 'cbdArticle',
    components : { cbdAddNewArticle },
    props: {
        hideCoverImage  : { type: Boolean, required: false, default:false        },
        showEdit        : { type: Boolean, required: false, default:undefined    },
        article         : { type: Object,  required: false, default:undefined    },
        query           : { type: Object,  required: true                        },
        tags 		    : { type: Array  , required: false, default:[]           }, // [] of tag id's
        customTags 	    : { type: Array  , required: false, default:[]           }, // [] of customTag id's
        adminTags 	    : { type: Array  , required: false, default:[]           }, // [] of adminTag text
        target          : { type: String , required: false, default: '_self'     },
    },
    data() {
        return {
            returnUrl       : window.location.href,
        }
    },
    created() {
       this.ArticlesApi = new ArticlesApi({ token: this.$auth.strategy.token.get() });
    },
    mounted() {
        if(!this.article)
            this.loadArticle();
    },
    methods: {
        async loadArticle() {
            const query = this.query;
            const article = await this.ArticlesApi.queryArticles(query)
     
                if(article.length ==0 ){
                    this.article = {
                        content : { en : 'No information is available for this section'}
                    }
                }
                else
                    this.article = article[0];

                this.preProcessOEmbed();

                if(this.article.coverImage?.url){
                    //sometime the file name has space/special chars, use new URL's href prop which encodes the special chars
                    const url = new URL(this.article.coverImage.url)
                    this.article.coverImage.url = url.href;

                    this.article.coverImage.url_1200  = this.article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
                }

                this.$emit('load', { ...this.article });   

                if(this.hasOwnProperty(this.showEdit))         
                    this.showEdit = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
                
        },
        preProcessOEmbed() {

            setTimeout(function(){

                document.querySelectorAll( 'oembed[url]' ).forEach(async function(element) {
                    var url = element.attributes.url.value;
                    var params = {
                        url : encodeURI(url),
                    }

                    const response = await axios.get('/api/v2020/oembed', {params:params});                    
                    var embedHtml = '<div class="ck-media__wrapper" style="width:100%">' + response.data.html +'</div>'
                    element.insertAdjacentHTML("afterend", embedHtml);
                    
                });

            }, 200)
        }
    }
}
</script>
    
<style>
   .ck-content {
        padding-top: 15px;
    }

    .ck-content p {
        margin-top: inherit!important;
        margin-bottom: inherit!important;
    }

    .ck-content .table th, .table td {
        vertical-align: inherit;
    }
    

</style>

<!-- this.returnUrl	  = $location.absUrl(); -->

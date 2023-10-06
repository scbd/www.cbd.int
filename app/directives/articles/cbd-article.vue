
<template>
   <div style="border:none;margin-top:10px">
        <div v-if="!loading">
            <div v-if="!hideCoverImage && article && article.coverImage && article.coverImage.url">
                <cbd-article-cover-image cover-image="article.coverImage"></cbd-article-cover-image>
            </div>
        
            <div v-if="hasEditRights" class="pull-right">    
                <cbd-add-new-article :tags="tags" :admin-tags="adminTags" :custom-tags="customTags" :id="(article||{})._id" :target="target"
                    class="btn btn-default"></cbd-add-new-article>
                <br/>    
            </div>
            <div v-if="article" ref="container" v-html="$options.filters.lstring(article.content, $locale)" class="ck-content"></div>
            <div v-if="!article" class="ck-content">No information is available for this section at the moment.</div>
        </div>
        <div v-if="loading">Loading section content<i class="fa fa-spinner fa-spin"></i></div>
    </div>

</template>

<script>

import 'css!cdn!npm/@scbd/ckeditor5-build-inline-full@35.0.0/build/content-style.css';
import axios from 'axios';
import ArticlesApi from '../../api/articles';
import cbdAddNewArticle from './cbd-add-new-article.vue';
// import { getAuthToken, getUser } from '~/authentication'
import '~/filters/vue-filters.js'
import jumpToAnchor from '~/services/jump-to-anchor';

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
            hasEditRights   : false,
            loading         : false
        }
    },
    created() {
       this.ArticlesApi = new ArticlesApi({ token: this.$auth.strategy.token.get() });
    },
    mounted() {
        if(!this.article)
            this.loadArticle();
    },
    watch:{
        article: function() {

            this.$nextTick(()=>{
                const { container } = this.$refs;

                if(!container) return;

                preProcessAnchors.call(this);
                preProcessOEmbed.call(this);
            });

            this.$nextTick(jumpToAnchor);
        }
    },
    methods: {
        async loadArticle() {
            try{
                this.loading = true;
                const query = this.query;
                const article = await this.ArticlesApi.queryArticles(query)
     
                if(article.length){
                    this.article = article[0];

                    if(this.article.coverImage?.url){
                        //sometime the file name has space/special chars, use new URL's href prop which encodes the special chars
                        const url = new URL(this.article.coverImage.url)
                        this.article.coverImage.url = url.href;

                        this.article.coverImage.url_1200  = this.article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
                    }

                    this.$emit('load', { ...this.article });   
                }
                else {
                    this.$emit('load');
                }

                this.$auth.fetchUser().then(()=>{
                    if(this.showEdit || this.showEdit == 'true' || this.hasOwnProperty(this.showEdit)){
                        this.hasEditRights = this.$auth.hasScope(['oasisArticleEditor', 'Administrator']);
                    }
                })
            }
            catch(e){
                console.error(e)
            }
            finally{
                this.loading = false;
            }
        },
    }
}

function preProcessOEmbed() {

    const { container } = this.$refs;

    container.querySelectorAll( 'oembed[url]' ).forEach(async function(element) {
        var url = element.attributes.url.value;
        var params = {
            url : encodeURIComponent(url),
        }

        const response = await axios.get('/api/v2020/oembed', {params:params});                    
        var embedHtml = '<div class="ck-media__wrapper" style="width:100%">' + response.data.html +'</div>'
        element.insertAdjacentHTML("afterend", embedHtml);
        
    });
}

//============================================
//
//============================================
function preProcessAnchors() {

    const { container } = this.$refs;

    const headings = container.querySelectorAll('h1,h2,h3,h4,h5,h6');


    headings.forEach((heading)=>{

        const name = heading.innerText
                    .replace(/[^a-z0-9-_]/gim, '-')
                    .replace(/_{2,}/gim, '-')
                    .replace(/(^-+|-+$)/gim, '')
                    .toLowerCase();
        
        const anchor = document.createElement('a');

        anchor.setAttribute('name', name);

        heading.parentElement.insertBefore(anchor, heading);
    });
}
</script>
    
<style>

</style>

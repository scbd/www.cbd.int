
<template>
   <div style="border:none;margin-top:10px">
        <div v-if="!hideCoverImage && article.coverImage">
            <cbd-article-cover-image cover-image="article.coverImage"></cbd-article-cover-image>
        </div>
       
        <div v-if="showEdit" class="pull-right">    
            <cbd-add-new-article :tags="tags" :admin-tags="adminTags" :custom-tags="customTags" :id="(article||{})._id" :target="target"
                class="btn btn-default"></cbd-add-new-article>
            <br/>    
        </div>
        <div v-if="article" v-html="$options.filters.lstring(article.content, $locale)" class="ck-content"></div>
        <div v-if="!article" class="ck-content">No information is available for this section at the moment.</div>
    </div>

</template>

<script>

import 'css!cdn!npm/@scbd/ckeditor5-build-inline-full@35.0.0/build/content-style.css';
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
     
                if(article.length){
                    this.article = article[0];

                    this.preProcessOEmbed();

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

    .ck-content .table th, .table td {
        vertical-align: inherit;
    }
    
.cbd-article .image-credit-wrapper img {
  width: 100% !important;
}

.cbd-article .image-credit-wrapper {
  overflow: hidden;
  position: relative;
  /* margin-left: -15px;
  margin-right: -15px; */
  max-height: 375px;
  width: 100%
}

.cbd-article .image-credit-wrapper .image-credit {
  position: absolute;
  right: 0px;
  bottom: 4px;
}

.cbd-article .image-credit {
  background: rgba(0, 0, 0, .7);
  color: #ccc;
  display: inline-block;
  font-size: 11px;
  font-family: helvetica;
  font-weight: 300;
  padding: 5px 8px;
  position: absolute;
  bottom: 0;
  right: 0;
}

.cbd-article .cover-image{
  width: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;

}

.cbd-article .cover-image-top{
  background-position: top;
}

.cbd-article .cover-image-center{
  background-position: center;
}

.cbd-article .cover-image-bottom{
  background-position: bottom;
}

@media (max-width: 767px) {
  /*For all phone sizes*/
  .cbd-article .image-credit-wrapper{
      height: 120px;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  /* For IPads*/
  .cbd-article .image-credit-wrapper{
      height: 250px;
  }
}
@media (min-width: 992px) and (max-width: 1199px) {
  /* For IPad pro*/
  .cbd-article .image-credit-wrapper{
      height: 300px;
  }
}
@media (min-width: 1200px) {
  /* For big screens*/
  .cbd-article .image-credit-wrapper{
      height: 350px;
  }
}

</style>

<!-- this.returnUrl	  = $location.absUrl(); -->

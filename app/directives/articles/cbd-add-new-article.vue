<template>
     <a :href="newArticleUrl" :target="target" :class="cssClass">
        {{buttonText||'Add article'}}
    </a>
</template>

<script>
    export default {
        name:'cbdAddNewArticle',
        props: {
            tags 		: { type: Array  , required: false, default:[]           }, // [] of tag id's
            customTags 	: { type: Array  , required: false, default:[]           }, // [] of customTag id's
            adminTags 	: { type: Array  , required: false, default:[]           }, // [] of adminTag text
            target		: { type: String , required: false, default:'_self'      },
            buttonText	: { type: String , required: false, default:'Add Article'},
            cssClass	: { type: String , required: false, default:''           },
        },
        computed: {
            newArticleUrl : function(){

                const domain = window.location.hostname.replace(/[^\.]+\./, '');
				let baseUrl = 'https://cbd.int/management'

				if(domain=='localhost' || domain == 'cbddev.xyz')
            		baseUrl = 'https://oasis.cbddev.xyz';

				const queryString = 'tags='		+ (this.tags||[]).join(',') +
									 '&customTags='	+ (this.customTags||[]).join(',') +
									 '&adminTags='	+ (this.adminTags||[]).join(',');

                return `${baseUrl}/articles/new?${queryString}`
            }
        }
    }
</script>

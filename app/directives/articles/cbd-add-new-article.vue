<template>
     <a :href="newArticleUrl" :target="target">
        <slot>Add Article</slot>
    </a>
</template>

<script>
    export default {
        name:'cbdAddNewArticle',
        props: {
            tags 		: { type: Array  , required: false, default:[]           }, // [] of tag id's
            customTags 	: { type: Array  , required: false, default:[]           }, // [] of customTag id's
            adminTags 	: { type: Array  , required: false, default:[]           }, // [] of adminTag text
        },
        computed: {
            newArticleUrl : function(){

                const domain = window.location.hostname.replace(/[^\.]+\./, '');
				let baseUrl = 'https://cbd.int/management'

				if(domain=='localhost' || domain == 'cbddev.xyz')
            		baseUrl = 'https://oasis.cbddev.xyz';

				const queryString = 'tags='		+ (this.tags||[]).map(encodeURIComponent).join(',') +
									 '&customTags='	+ (this.customTags||[]).map(encodeURIComponent).join(',') +
									 '&adminTags='	+ (this.adminTags||[]).map(encodeURIComponent).join(',');

                return `${baseUrl}/articles/new?${queryString}`
            }
        }
    }
</script>

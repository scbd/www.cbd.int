<template>
    <div>
        <document-files 
            v-if="document.files.length"
            :files="document.files"
            class="visible-xs pull-right" 
            style="margin-top:10px;" />

	    <b>{{ document.symbol }}</b>
        <div v-show="$options.filters.lstring(document.title)" style="max-height:50px;overflow:hidden">
		    {{ document.title | lstring}}
	    </div>
        <document-files
            :files="document.files"
            class="hidden-xs" 
            style="margin-top:10px;" />
    </div>
</template>

<script>
import DocumentFiles from '~/components/references/document-files.vue';
import lstring       from '~/filters/lstring.js';

export default {
    name: 'MeetingDocumentCard',
    components: { DocumentFiles },
    filters: {lstring},
    props: {
        document: {
            type: Object,
            default: () => {}
        }
    }
}
</script>
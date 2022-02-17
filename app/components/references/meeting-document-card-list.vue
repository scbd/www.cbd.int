<template>
    <div>
        <div 
            v-for="document in documentList"
            :key="document.symbol"
            class="card" 
            style="margin-bottom:4px">
            <div class="card-body" style="padding:12px;font-size:0.9em">
                <meeting-document-card :document="document"/>
            </div>
        </div>
    </div>
</template>

<script>
import MeetingDocumentCard from '~/components/references/meeting-document-card.vue'
import Api from '~/components/meetings/api.js';

export default {
    name: 'MeetingDocumentCardList',
    components: { MeetingDocumentCard },
    props: {
        documents: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            api: new Api(),
            documentList: []
        }
    },
    methods: {
        loadDocumentList,
        lookupMeetingDocuments,
    },
    watch: {
        documents: refresh
    }
}

async function refresh() {
    await this.loadDocumentList();   
}

async function loadDocumentList() {
    const codes = this.documents.filter(c => !!c);

    const linkDocuments = codes.filter(c => isLink(c))
        .map(c => ({
            symbol: c, 
            title: {},
            files: [{ language: 'en', url : c, type:'text/html' }]
    }));

    const lookupDocuments = await this.lookupMeetingDocuments(codes.filter(c => !isLink(c)));

    this.documentList = [...lookupDocuments, ...linkDocuments]; //TODO - Sorting
}

async function lookupMeetingDocuments(codes) {
    if (!codes || codes.length === 0) return [];

    codes = codes.map(c => c.toUpperCase());

    const options = { 
        cache : true, 
        params : { q : { symbol: { $in: [...codes] } }} 
    }
    const documents = await this.api.getMeetingDocuments(options);
    return documents;
}

function isLink(code) {
    return /http[s]?:\/\//.test(code);
}
</script>
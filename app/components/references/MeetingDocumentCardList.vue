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
import MeetingDocumentCard from '~/components/references/MeetingDocumentCard.vue'
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
    created
}

async function created() {
    let { documentList } = this;
    this.documents.forEach(async documentCode => {
        documentList.push(await lookupMeetingDocument.call(this, documentCode));
    });
}

async function lookupMeetingDocument(code) {
    if(!code) return;

    const isLink = /http[s]?:\/\//.test(code);

    if(isLink) {
        return {
            symbol: code, 
            title: {},
            files: [{ language: 'en', url : code, type:'text/html' }]
        }
    }

    const data = { 
        cache : true, 
        params : { q : { symbol: code }, fo: 1 } 
    }
    const document = await this.api.getMeetingDocuments(data);
    return document;
}
</script>
<template>
    <div>
        <div 
            v-for="notification in notificationList"
            :key="notification.symbol"
            class="card" 
            style="margin-bottom:4px">
            <div class="card-body" style="padding:12px;font-size:0.9em">
                <notification-card :notification="notification"/>
            </div>
        </div>
    </div>
</template>

<script>
import NotificationCard from '~/components/references/notification-card.vue'
import Api from '~/components/meetings/api.js';
import _ from 'lodash';
import solr from '~/util/solr.js';

export default {
    name: 'NotificationCardList',
    components: { NotificationCard },
    props: {
        notifications: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            api: new Api(),
            notificationList: [],
        }
    },
    created:refresh,
    watch: {
        notifications: refresh
    },
    methods: {
        lookupNotifications
    }
}

async function refresh() {
    const codes = this.notifications.filter(c => !!c);

    const notificationList = await this.lookupNotifications(codes);
    
    this.notificationList = codes.map(c => notificationList.find(n => n.number === c || n.symbol === c) || {symbol: c, files: []})
}

async function lookupNotifications(codes) {
    if(!codes || codes.length === 0) return [];

    const q = `symbol_s: (${codes.map(solr.escape).join(' or ')})`
    const fl = "id, symbol_s,reference_s,title_t,date_dt,url_ss,files_ss"

    const res = await this.api.getNotifications({ q, fl, cache: true });

    const results = _.map(res, function(n) {
        return _.defaults(n, {
            _id: n.id,
            symbol: n.reference_s || n.symbol_s,
            number: n.symbol_s,
            date:   n.date_dt,
            type:  'notification',
            status : 'public',
            title : { en : n.title_t },
            url :   absoluteUrl((n.url_ss||[])[0]),
            files : parseFiles(n.files_ss)
        });
    });

    return results || [];
}

// files_ss holds a single JSON string containing the array of document descriptors.
// The landing page (url_ss) is not a file — it is linked from the card itself.
function parseFiles(files_ss) {

    const [json] = files_ss || [];

    if(!json) return [];

    let files;

    try {
        files = JSON.parse(json);
    }
    catch(err) {
        console.error('Unable to parse notification files_ss', err);
        return [];
    }

    return _.map(files || [], f => ({
        ...f,
        language : f.language || 'en',
        url      : absoluteUrl(f.url)
    }));
}

function absoluteUrl(url) {

    return url ? new URL(url, 'https://www.cbd.int').href : undefined;
}

</script>
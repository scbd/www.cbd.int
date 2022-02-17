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
    
    this.notificationList = codes.map(c => notificationList.find(n => n.symbol === c) || {symbol: c, files: []})
}

async function lookupNotifications(codes) {
    if(!codes || codes.length === 0) return [];

    const options = {
        cache: true,
        params : {
            q : `schema_s:notification AND symbol_s (${codes.map(solr.escape).join(' or ')})`,
            fl : "id, symbol_s,reference_s,title_t,date_dt,url_ss",
        }
    }

    const res = await this.api.getNotifications(options);

    const results = _.map(res.response.docs, function(n) {
        return _.defaults(n, {
            _id: n.id,
            symbol: n.reference_s || n.symbol_s,
            number: n.symbol_s,
            date:   n.date_dt,
            type:  'notification',
            status : 'public',
            title : { en : n.title_t },
            files : urlToFiles(n.url_ss)
        });
    });
    
    return results || [];
}

function urlToFiles(url_ss) {

    return _.map(url_ss||[], function(url){

        var mime;
        var locale;

        if(/\.pdf$/ .test(url)) mime = 'application/pdf';
        if(/\.doc$/ .test(url)) mime = 'application/msword';
        if(/\.docx$/.test(url)) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if(/-ar\.\w+$/ .test(url)) locale = 'ar';
        if(/-en\.\w+$/ .test(url)) locale = 'en';
        if(/-es\.\w+$/ .test(url)) locale = 'es';
        if(/-fr\.\w+$/ .test(url)) locale = 'fr';
        if(/-ru\.\w+$/ .test(url)) locale = 'ru';
        if(/-zh\.\w+$/ .test(url)) locale = 'zh';

        return {
            type : mime,
            language: locale,
            url : 'https://www.cbd.int'+url
        };
    });
}

</script>
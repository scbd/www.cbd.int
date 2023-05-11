<template>
    <div>
        <div 
            v-for="meeting in meetingList"
            :key="meeting.symbol"
            class="card" 
            style="margin-bottom:4px">
            <div class="card-body" style="padding:12px;font-size:0.9em">
                <meeting-card :meeting="meeting"/>
            </div>
        </div>
    </div>
</template>

<script>
import MeetingCard from '~/components/references/meeting-card.vue'
import Api from '~/components/meetings/api.js';
import _ from 'lodash';

export default {
    name: 'MeetingCardList',
    components: { MeetingCard },
    props: {
        meetings: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            api: new Api(),
            meetingList: [],
        }
    },
    created:refresh,
    watch:{
        meetings: refresh
    },
    methods: {
        lookupMeetings
    }
}

async function refresh() {
    const codes = this.meetings.filter(c => !!c);

    const linkMeetings = codes.filter(c => isUrl(c)).map(c => ({symbol: c, url: c}));

    const meetings = await this.lookupMeetings(codes.filter(c => !isUrl(c)));

    this.meetingList = [...linkMeetings, ...meetings]; 
}

async function lookupMeetings(codes) {
    if(!codes || codes.length === 0) return [];

    codes = codes.map(c => c.toUpperCase());

    /*
    const options = { 
        cache: true,
        params: { 
            q: { normalizedSymbol :{ $in :[...codes] } },
            f: { symbol:1, EVT_CD:1, EVT_FROM_DT:1, EVT_TO_DT:1, title:1, dateText:1, venueText:1 } 
        }
    }
    */

    const q = { normalizedSymbol :{ $in :[...codes] } }
    const f = { symbol:1, EVT_CD:1, EVT_FROM_DT:1, EVT_TO_DT:1, title:1, dateText:1, venueText:1 } 

    const res = await this.api.queryMeetings({ q, f, cache: true });

    // const res = await this.api.getMeetings(options);

    const results = _.map(res, function(m) {
        return _.defaults(m, {
            url:       `/meetings/${encodeURIComponent(m.normalizedSymbol || m.EVT_CD || m.code || '')}`,
            symbol:    m.EVT_CD || m.normalizedSymbol,
            startDate: m.EVT_FROM_DT,
            endDate:   m.EVT_TO_DT,
        });
    });

    return results;
}

function isUrl(text) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
}
</script>
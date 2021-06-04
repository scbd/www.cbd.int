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
        <div v-if="meeting"><meeting-card :meeting="meeting"/></div>
    </div>
</template>

<script>
import MeetingCard from '~/components/references/MeetingCard.vue'
import Api from '~/components/meetings/api.js';
import _ from 'lodash';

export default {
    name: 'MeetingCardList',
    components: { MeetingCard },
    props: {
        meetings: {
            type: [Object, Array],
            default: () => []
        }
    },
    data() {
        return {
            api: new Api(),
            meetingList: [],
            meeting: null
        }
    },
    created
}

async function created() {
    const {meetings} = this;
    if(Array.isArray(this.meetings)) {
        let { meetingList } = this;
        meetings.forEach(async meetingCode => {
            meetingList.push(await lookupMeeting.call(this, meetingCode));
        });
    } else {
        this.meeting = await lookupMeeting.call(this, meetings);
    }
}

async function lookupMeeting(code) {

    if(!code) return;

    if(isUrl(code || '')) return {symbol: code, url: code};

    const data = { 
        cache: true, 
        params: { f: { symbol:1, EVT_CD:1, EVT_FROM_DT:1, EVT_TO_DT:1, title:1, dateText:1, venueText:1 } }
    }

    const result = await this.api.getMeetings(code, data);

    result.url = `/meetings/${encodeURIComponent(result.symbol || result.EVT_CD || code)}`;
    
    const meeting = _.defaults({}, result, {
        symbol:    result.EVT_CD || code,
        startDate: result.EVT_FROM_DT,
        endDate:   result.EVT_TO_DT,
    })

    return meeting;
}

function isUrl(text) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
}
</script>
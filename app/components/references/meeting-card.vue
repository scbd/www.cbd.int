<template>
    <div>
        <b>
            <a :href="meeting.url" target="_blank">
                {{ meeting.symbol || meeting.EVT_CD }} 
                <i class="fa fa-external-link" aria-hidden="true"></i>
            </a>
        </b>
        <div v-if="meeting._id">
            <div style="max-height:50px;overflow:hidden">
                {{ meeting.title | lstring }}
            </div>
    	    <div>
                <i class="fa fa-fw fa-calendar" aria-hidden="true"></i>
                <span>{{meetingDate}}</span>
            </div>
            <div>
                <i class="fa fa-fw fa-map-marker" aria-hidden="true"></i>
                {{meeting.venueText | lstring}}
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment-timezone'
import lstring from '~/filters/lstring.js';

export default {
    name: 'MeetingCard',
    props: {
        meeting: {
            type: Object,
            default: () => {}
        }
    },
    filters: {lstring},
    computed: {
        meetingDate() {
            const {meeting} = this;
            const {startDate, endDate, endDatet} = meeting;
            const mStartDate = moment(startDate);
            const mEndDate = moment(endDate);
            const mEndDatet = moment(endDatet);

            if(mStartDate.month() === mEndDate.month()) {
                if(mStartDate.day() === mEndDatet.day()) {
                    return mEndDate.format('D MMMM, YYYY');
                }
                return `${mStartDate.format('D')} - ${mEndDate.format('D MMMM, YYYY')}`;
            }

            return `${mStartDate.format('D MMM')} - ${mEndDate.format('D MMM, YYYY')}`;
        }
    }
}
</script>
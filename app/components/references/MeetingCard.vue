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
import {momentTimezone} from '~/filters/moment.js';
import {lstring} from '~/filters/lstring.js';

export default {
    name: 'MeetingCard',
    props: {
        meeting: {
            type: Object,
            default: () => {}
        }
    },
    filters: {momentTimezone, lstring},
    computed: {
        meetingDate() {
            const {meeting} = this;
            const {startDate, endDate, endDatet} = meeting;
            if(momentTimezone(startDate, 'month') === momentTimezone(endDate, 'month')) {
                if(momentTimezone(startDate, 'day') === momentTimezone(endDatet, 'day')) {
                    return momentTimezone(endDate, 'format', 'D MMMM, YYYY');
                }
                return `${momentTimezone(startDate, 'format', 'D')} - ${momentTimezone(endDate, 'format', 'D MMMM, YYYY')}`;
            }
            
            return `${momentTimezone(startDate, 'format', 'D MMM')} - ${momentTimezone(endDate, 'format', 'D MMM, YYYY')}`;
        }
    }
}
</script>
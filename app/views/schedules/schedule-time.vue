
<template >
  <div>
    <!-- timezone -->
    <div class="text-primary" :title="timezone" >
        <b class="text-nowrap">
          {{zoneStartTime}} - {{ zoneEndTime }}
        </b>
        <span v-if="zoneStartDate != zoneEndDate" class="text-nowrap"><br>
            ({{zoneEndDate}})
        </span>

        <small v-if="showLocal" class="text-nowrap">
          <i>Venue time</i>
        </small>
    </div>

    <div v-if="showLocal" class="small">
        <i class="text-muted" title="Local time">
            <span class="text-nowrap">
                <span v-if="localStartDate!=zoneStartDate">
                  {{ localStartDate }}
                </span>
                <span>
                    {{ localStartTime}} - {{ localEndTime }}
                </span>
            </span>
            <span v-if="localStartDate!=localEndDate" class="text-nowrap">
                  {{ localEndDate }}
            </span>
            <span class="text-nowrap">Local time</span>
        </i>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
const TIME = 'H:mm';
const DATE = 'MMM DD';

export default {
  name : 'ScheduleTime',
  props: { 
    start : { type: [String, Date],  required: true },
    end:    { type: [String, Date],  required: true },
    timezone: { type: String, required: true }
  },
  computed: {
    localStartTime() { return this.format(this.start, null, TIME)},
    localEndTime  () { return this.format(this.end,   null, TIME)},
    localStartDate() { return this.format(this.start, null, DATE)},
    localEndDate  () { return this.format(this.end,   null, DATE)},

    zoneStartTime () { return this.format(this.start, this.timezone, TIME)},
    zoneEndTime   () { return this.format(this.end,   this.timezone, TIME)},
    zoneStartDate () { return this.format(this.start, this.timezone, DATE)},
    zoneEndDate   () { return this.format(this.end,   this.timezone, DATE)},

    showLocal() {
      return this.zoneStartTime != this.localStartTime || this.zoneStartDate != this.localStartDate;
    }
  },
  methods : {
    format(datetime, timezone, format) {
      let d = moment(datetime);

      if(timezone) d = d.tz(timezone);
      
      return d.format(format);
    },
  }
}
</script>

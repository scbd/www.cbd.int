
<template >
  <div class="input-group">
    <select :disabled="disabled" class="form-control" id="datePart" v-model="datePart" @change="onChange">
        <option v-for="item in dates" :key="item" :value="item">{{item}}</option>
    </select>
    &nbsp;
    <select :disabled="disabled" class="form-control" id="hourPart" v-model="hourPart" @change="onChange">
        <option v-for="item in hours" :key="item" :value="item">{{item}}</option>
    </select>
    <span class="form-control">h</span>
    <select :disabled="disabled" class="form-control" id="minutePart" v-model="minutePart" @change="onChange">
        <option v-for="item in minutes" :key="item" :value="item">{{item}}</option>
    </select>
  </div>
</template>

<script>
import {DateTime} from 'luxon'
import { asDateTime } from '../filters.js'

const HOURS   = enumerate(24);
const MINUTES = enumerate(60);

export default {
  name : 'AgendaItem',
  props: { 
    value    : { type: [Date, String], required: true },
    disabled : { type: Boolean,        required: false, default:false },
    timezone : { type: String,         required: false }, // TODO!!!
  },
  computed : {
    dates,
    hours()     { return HOURS },
    minutes()   { return MINUTES },
    datePart:   { get() { return this.getPart('yyyy-MM-dd') }, set(value) { this.setDatePart  (value) } },
    hourPart:   { get() { return this.getPart('HH') },         set(value) { this.setHourPart  (value) } },
    minutePart: { get() { return this.getPart('mm') },         set(value) { this.setMinutePart(value) } },
  },
  methods:{
    onChange,
    getPart,
    setDatePart,
    setHourPart,
    setMinutePart,
    emitUpdate,
  }
}

function getPart(format) {
  return asDateTime(this.value).toFormat(format)
}

function onChange() {
  console.log('onChange', this.value)
  this.$emit('change', this.value);
}

function setDatePart(value) {
  console.log('setDatePart', this.value)

  const [,year,month, day] = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  
  let date = asDateTime(this.value);

  date = date.set({ 
    year:  parseInt(year,  10),
    month: parseInt(month, 10),
    day:   parseInt(day,   10)
  });

  this.emitUpdate(date)
}


function setHourPart(value) {
  console.log('setHourPart', this.value)

  let date = asDateTime(this.value);

  date = date.set({ hour:  parseInt(value,  10) });

  this.emitUpdate(date)
}

function setMinutePart(value) {

  let date = asDateTime(this.value);

  date = date.set({ minute:  parseInt(value,  10) });

  this.emitUpdate(date)
}

function emitUpdate(date) {

  date = date.set({ second:0, millisecond: 0 });

  if(typeof(this.value) == 'string' )  // was string???
    this.$emit('input', date.toUTC().toISO());
  else 
    this.$emit('input', date.toJSDate());
}

// OPTIONS

function dates() {

  let date = asDateTime(this.value);

  const dates = [];

  for(let days = -10; days<10; days++) {
    dates.push(date.plus({ days }).toFormat('yyyy-MM-dd'));
  }

  return dates;
}

function enumerate(count) {
  const serie = [];
  for(let i=0; i<count; ++i) serie.push(`00${i}`.slice(-2));
  return serie;
}

</script>
<style scoped>
 .input-group > .form-control {
   flex: unset;
   width: auto;
 }
</style>

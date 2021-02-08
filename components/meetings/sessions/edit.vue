
<template >
  <table v-if="session" class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
    <tbody>
        <tr>
          <th class="index-col d-none d-md-table-cell">#</th>
          <th class="agenda-items-col">{{$t('Item')}}</th>
          <th class="time-col">{{$t('Time')}}</th>
          <th >{{$t('Speaker (Country / Organization)')}}</th>
          <th class="files-col">{{$t('Files')}}</th>
          <th class="d-none d-md-table-cell private-col" ></th>
        </tr>
      <tr v-for="({ agendaItem, datetime, title, organizationType, status, files }, index) in session.interventions" v-bind:key="index">

        <th scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">{{index+1}}.</th>

        <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
            <multiselect v-model="value" deselect-label="Can't remove this value"  placeholder="" :options="options" :searchable="false" >
              <template slot="singleLabel" slot-scope="{option}"><AgendaItem  :item="option"/></template>
            </multiselect>
        </td>

        <td class="time-col" style="text-align: center; vertical-align: middle;">{{ datetime | timeFilter }}</td>

        <td style="vertical-align: middle;">
          
            <multiselect v-model="value" deselect-label="Can't remove this value"  placeholder="" :options="options" :searchable="false" :allow-empty="false">
              <template slot="singleLabel" slot-scope="{option}"><AgendaItem  :item="option"/></template>
            </multiselect>
          
          {{title}}<span class="float-right type">{{organizationType}}</span> </td>

        <td class="files-col" style="text-align: center; vertical-align: middle;">
          <FilesView :files="files"/>
        </td>
        <td class="d-none d-md-table-cell private-col" style="text-align: center; vertical-align: middle;">
          <i v-if="status==='hidden'" class="fa fa-eye-slash" style="font-size:1.25em"/>
        </td>
      </tr>
    </tbody>
  </table>
</template>


<script>

import Multiselect from 'vue-multiselect'
import AgendaItem from './agenda-item.vue'
import FilesView  from './files-view.vue'
import i18n       from '../locales.js'

import { DateTime                    } from 'luxon'
import { addApiOptions , getSession } from '../api.js'
import { getSessionId              } from '../util'


export default {
  name: 'SessionsView',
  props:{
    tokenReader: { type: Function, required: false },
  },
  components:{ Multiselect, AgendaItem, FilesView},
  methods: { header },
  filters: { timeFilter },
  i18n,
  mounted,
  data,
  watch: { 
    tokenReader: function(tokenReader) {  
      if(tokenReader) addApiOptions({ tokenReader }) 
    }
  }
}

function data(){
  return { 
    value:'',
    session: undefined,
          options: [1,2,3,4,5,6,7,8,9]
    }
}


async function mounted(){

  this.session = await getSession(getSessionId())

}

function timeFilter (isoDateString)  {
  return DateTime.fromISO(isoDateString).toFormat('T')
}

function dateTimeFilter (isoDateString) {
  return DateTime.fromISO(isoDateString).toFormat('T  - cccc, d MMMM yyyy')
}

function header({title, startDate }){
  return title? title : dateTimeFilter(startDate)
}
</script>


<style scoped>
.type{
  font-weight: lighter;
  text-transform: uppercase;
}
table.sessions {
  table-layout: fixed;
  width: 100%;
}
.index-col{
  width: 2em;
  max-width: 3em;
  text-align: center;
}


.agenda-items-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}


.files-col{
  width:340px;
  text-align: center;
  vertical-align: middle;
}
.private-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}
.time-col{
  width:65px;
  text-align: center;
}

@media screen and (max-width: 768px) {
  .files-col{
    width:65px;
    text-align: center;
    vertical-align: middle;
  }
}
</style>


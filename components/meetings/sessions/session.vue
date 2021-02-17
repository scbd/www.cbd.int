
<template >
  <table v-if="interventions.length" class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
    <slot v-for="(intervention, index) in interventions" v-bind="{ intervention, index }">
      <tbody v-bind:key="index" >

      </tbody>
    </slot>
  </table>
</template>


<script>

export default {
  name      : 'SessionsView',
  props     : { 
                interventions: { type: Array,   required: false },
                showStatus   : { type: Boolean, required: false, default: false },
                selectLimit: { type: Number, required: false, default: 1 }
              },
  methods   : { edit, select, isSelectedRow, isSelectedEditRow },
  data
}


function data(){
  return{
    selected: [],
    selectedEdit:undefined
  }
}

function edit(row){
  const { _id } = row

  if(this.isSelectedEditRow(row)) this.selectedEdit = undefined
  else this.selectedEdit = _id
  

  this.$forceUpdate()
}

function select(row){
  const { _id } = row

  if(!this.selected)this.selected=[]

  if(this.selected.includes(_id))
    this.selected = this.selected.filter((x)=> x !== _id)
  else this.selectLimit===1? this.selected = [_id] : this.selected.push(_id)

  this.$forceUpdate()
}

function isSelectedRow(row){
  const { _id } = row

  return !!this?.selected?.includes(_id)
}
function isSelectedEditRow(row){
  const { _id } = row

  return this.selectedEdit === _id
}


</script>
<template>
  <div >
    <h4 >
        <i class="fa fa-edit"></i> 
        <span v-if="isNew">Create</span>
        <span v-if="!isNew">Edit</span> 
        Intervention
    </h4>

    <div >
        <form  id="statement-submission-form" @submit.prevent="submitForm" ref="form" novalidate :class="{ 'was-validated': wasValidated }">
            <div class="form-group row">
                <label for="Summary" class="col-sm-3 col-form-label">Code</label>
                <div class="col-sm-9">
                    <input :disabled="!!progress" type="text"  class="form-control" id="title"  v-model.trim="code">
                </div>
            </div>

            <div class="form-group row" >
                <label for="participantIdentity" class="col-sm-3 col-form-label">Reservation</label>
                <div class="col-sm-9">

                </div>
            </div> 

            <div class="form-group row">
                <label for="title" class="col-sm-3 col-form-label">Title</label>
                <div class="col-sm-9">
                    <input :disabled="!!progress" type="text"  class="form-control" id="title"  v-model.trim="title">
                </div>
            </div> 

            <div class="form-group row">
                <label for="Summary" class="col-sm-3 col-form-label">Summary</label>
                <div class="col-sm-9">
                    <input :disabled="!!progress" type="text"  class="form-control" id="title"  v-model.trim="summary">
                </div>
            </div>


            <div class="alert alert-warning" role="alert" v-if="error">
                <span>{{error.message||'Unknown error'}}</span>
            </div> 
        </form>
    </div>

    <div class="modal-footer">
        <i  class="fa fa-cog fa-spin"></i>
        <button  :disabled="!!progress" type="submit" class="btn btn-success" @click="save(true)"><i class="fa fa-microphone"></i> <span>Publish</span></button>
        <button  :disabled="!!progress" type="submit" class="btn btn-primary" @click="save()"><i class="fa fa-save"></i> <span>Save</span></button>
        <button :disabled="!!progress" type="button" class="btn btn-default" @click="close()"><i class="fa fa-power-off"></i> <span>Close</span></button>
    </div>
  </div>

</template>

<script>

import Api  from '../api.js'
import ReservationSelect from '~/components/meetings/sessions/reservation-select.vue'

export default {
    name: 'EditSession',
    components: { ReservationSelect },
    props: { 
        tokenReader  : { type: Function, required: false },
        route        : { type: Object,   required: false },
    },
    computed: { isNew },
    data,
    created,
    mounted, 
}

/*************************
 * vue lifecycle function
**************************/
async function created() {
  this.api = new Api(this.tokenReader)
}

function data(){
  return {
      progress: null,
      error : null,
  }
}

function mounted(){

}

/*************************
 * component computed
**************************/
function isNew(){
  const { sessionId } = this.route.params

  return sessionId.toLowerCase() === 'new'
}

/*************************
 * component methods
**************************/
function clearError() {
  this.error    = null;
  this.progress = null;
}


function getReservations(){
  const { http }   = this.api
  const { params } = this.route
  

}
</script>
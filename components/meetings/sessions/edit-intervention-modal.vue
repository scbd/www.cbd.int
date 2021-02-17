<template>

    <div class="modal-content-upload">
        <!-- Modal -->
        <div class="modal fade" id="editIntervention" ref="editIntervention" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="uploadModalLabel">
                            <i class="fa fa-arrow-circle-up"></i> Edit Intervention 
                        </h4>
                        <button  type="button" class="close" aria-label="Close" @click="close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        
                        <form  id="statement-submission-form" @submit.prevent="submitForm" ref="form" novalidate :class="{ 'was-validated': wasValidated }">

                            <div class="form-group row">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Country / Org</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="title" ref="title" v-model.trim="title" required>
                                        <div class="input-group-append">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="auto" title="Priority-Pass code is included in your registration email (eg: ABCDE-12345)"><i class="fa fa-question-circle"></i></span>
                                        </div>      
                                    </div>
                                </div>
                            </div> 

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Type</label>
                                <div class="col-sm-9">
                                    <select  class="form-control" id="agendaItem"  v-model="organizationTypeId" required>
                                        <optgroup v-for="{ _id: meetingId, agenda, normalizedSymbol } in meetings" :key="meetingId" :label="normalizedSymbol">
                                            <option v-for="{ item, shortTitle, title } in agenda.items" :key="item" :value="{ meetingId, item }">{{item }} - {{ shortTitle || title }} </option>
                                        </optgroup>
                                    </select>
                                    <div class="invalid-feedback">Please select a an organization type.</div>
                                </div>
                            </div>


                            <div class="form-group row">
                                <label for="fileLanguage" class="col-sm-3 col-form-label">Satus</label>
                                <div class="col-sm-9">
                                    <select  class="form-control" id="fileLanguage" v-model="status">
                                        <option value="public">Spoken/Delivery</option>
                                        <option value="pending">Uploaded / Pending</option>
                                    </select>
                                </div>        
                            </div>       

                            <h5>Files</h5>

                            <div v-for="file in files" :key="file" class="form-group row">
                                <label for="allowPublic" class="col-sm-3 col-form-label">{file.filename}}</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <select  class="form-control" id="fileLanguage" v-model="file.language">
                                            <option value="ar">العربية</option>
                                            <option value="en" selected>English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="ru">Русский</option>
                                            <option value="zh">中文</option>
                                        </select>
                                    </div>
                                </div>
                            </div>  

                            <div class="alert alert-warning" role="alert" v-if="error">
                                <span>{{error.message||'Unknown error'}}</span>
                            </div> 
                           
                        </form>  
                    </div>
                
                    <div class="modal-footer">
                        <button  type="submit" class="btn btn-primary" @click="save()"><i class="fa fa-save"></i> <span>Save</span></button>
                        <button  type="button" class="btn btn-default" @click="close()"><i class="fa fa-power-off"></i> <span>Close</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import $    from 'jquery';
import Api  from '../api.js'

export default {
    name: 'uploadStatement',
    props: { 
        tokenReader  : { type: Function, required: false },
        route        : { type: Object,   required: false },
        intervention : { type: Object,   required: true  },
        sessionId    : { type: String,   required: false },
        show         : { type: Boolean,  required: false }
    },
    data:  function(){
        return {
            title :              this.intervention.title,
            organizationTypeId : this.intervention.organizationTypeId,
            status:              this.intervention.status,
            files:               this.intervention.files,
            error : null,
        }
    },
    created() {
        this.api = new Api() //anonymous 
    },
    mounted(){
        $('[data-toggle="tooltip"]').tooltip();
        this.open();
    },
    methods: {
        open, close, clearError, save,
    }
}

function open() { 
  $(this.$refs.editIntervention).modal('show') 
}

function close(intervention){ 
  $(this.$refs.editIntervention).modal('hide');
  this.$emit('close', intervention) 
}

async function save(){
  try {
    this.clearError();
    this.wasValidated = true;

    if(!this.isFormValid)
        return e.stopPropagation();

    const passCode = this.cleanParticipantIdentity;
    const data = {
        meetingId   : this.selectedAgendaItem.meetingId,
        filename    : this.file.name,
        contentType : this.file.type,
        agendaItem  : ((this.selectedAgendaItem.item || "").toString() || undefined),
        language    : this.selectedLanguage,
        allowPublic : this.allowPublic,
    }


    this.progress = { message: "Preparing..." };

    const slot    = await this.api.createInterventionFileSlot(passCode, data)

    this.progress = { message: "Uploading...", percent: 0 };

    const { contentType } = slot;
    const onUploadProgress = (...args)=> this.onUploadProgress(...args);

    await this.api.uploadTemporaryFile(slot.url, this.file, { contentType, onUploadProgress });

    this.progress = { message: "Saving...", percent: 100 };

    const intervention = await this.api.commitInterventionFileSlot(slot.uid, passCode, data.meetingId);

    this.$emit("notify", `Your file "${slot.metadata.filename}" has been submitted successfully`);

    this.close();

  } catch(err) {
    if(err.code=='forbidden') this.$refs.participantIdentity.setCustomValidity("Invalid badge or priority-pass number")
    this.error = err
  } finally {
    this.progress = null;
  }
}


function clearError() {
  this.error    = null;
  this.progress = null;
}

</script>
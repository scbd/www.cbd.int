<template>

    <div class="modal-content-upload">
        <!-- Modal -->
        <div class="modal fade" id="editIntervention" ref="editIntervention" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="uploadModalLabel">
                            <i class="fa fa-edit"></i> Edit Intervention 
                        </h4>
                        <button  type="button" class="close" aria-label="Close" @click="close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        
                        <form  id="statement-submission-form" @submit.prevent="submitForm" ref="form" novalidate :class="{ 'was-validated': wasValidated }">

                            <div class="form-group row" v-if="!intervention._id">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Search</label>
                                <div class="col-sm-9">
                                    <OrganizationSearch :disabled="!!progress" :meetings="meetings" :tokenReader="tokenReader" @change="onOrganizationChange"/>
                                </div>
                            </div> 

                            <div class="form-group row">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Country / Organization </label>
                                <div class="col-sm-9">
                                    <input :disabled="!!progress" type="text"  class="form-control" id="title" ref="title" v-model.trim="title" required>
                                </div>
                            </div> 

                            <div class="form-group row">
                                <label for="organizationTypeId" class="col-sm-3 col-form-label">Type</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress" class="form-control" id="organizationTypeId"  v-model="organizationTypeId" required>
                                        <option v-for="{ _id, acronym, title } in organizationTypes" :key="_id" :value="_id">{{acronym}} - {{ title }} </option>
                                    </select>
                                    <div class="invalid-feedback">Please select a an organization type.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Agenda Item</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress" class="form-control" id="agendaItem"  v-model="agendaItem" required>
                                        <optgroup v-for="{ _id: meetingId, agenda, normalizedSymbol } in meetings" :key="meetingId" :label="normalizedSymbol">
                                            <option v-for="{ item, shortTitle, title } in agenda.items" :key="item" :value="{ meetingId, item }">{{item }} - {{ shortTitle || title }} </option>
                                        </optgroup>
                                    </select>
                                    <div class="invalid-feedback">Please select a an agenda item.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="status" class="col-sm-3 col-form-label">Status</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress || !canUpdateStatus" class="form-control" id="types" v-model="status">
                                        <option value="public">Delivered</option>
                                        <option value="pending" selected>Uploaded / Pending</option>
                                    </select>
                                </div>        
                            </div>       

                            <div class="form-group row">
                                <label for="status" class="col-sm-3 col-form-label">Date / Time</label>
                                <div class="col-sm-9">
                                    <DateTimeSelector :disabled="!!progress" v-model="datetime" :timezone="timezone"/>
                                </div>        
                            </div>       

                            <h5>Files</h5>
                            <hr>

                            <div v-for="file in files" :key="file" class="form-group row">

                                <label v-if=" file._id" for="allowPublic" class="col-sm-3 col-form-label" :title="file.filename">{{file.filename}}</label>
                                <input :disabled="!!progress" v-if="!file._id" type="file" class="col-sm-3 col-form-label" @change="file.htmlFile = $event.target.files[0]" ref="file">

                                <div class="col-sm-3">
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

                                <div class="col-sm-5">
                                    <div class="input-group">
                                        <div class="form-check">
                                            <input :disabled="!!progress || !file.allowPublic"  type="checkbox" class="form-check-input" id="public" v-model="file.public" >
                                            <label class="form-check-label" for="public">Visible on website</label>
                                        </div>
                                        <div class="form-check">
                                            <input :disabled="!!progress || !!file._id"  type="checkbox" class="form-check-input" id="allowPublic" v-model="file.allowPublic" >
                                            <label class="form-check-label" for="allowPublic">Participant allowed publication</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="alert alert-warning" role="alert" v-if="error">
                                <span>{{error.message||'Unknown error'}}</span>
                            </div> 
                           
                        </form>  
                    </div>
                
                    <div class="modal-footer">
                        <i v-if="!!progress" class="fa fa-cog fa-spin"></i>
                        <button v-if=" canPublish" :disabled="!!progress" type="submit" class="btn btn-success" @click="save(true)"><i class="fa fa-microphone"></i> <span>Publish</span></button>
                        <button v-if="!canPublish" :disabled="!!progress" type="submit" class="btn btn-primary" @click="save()"><i class="fa fa-save"></i> <span>Save</span></button>
                        <button :disabled="!!progress" type="button" class="btn btn-default" @click="close()"><i class="fa fa-power-off"></i> <span>Close</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { cloneDeep } from 'lodash'
import $    from 'jquery';
import Api  from '../api.js'
import OrganizationSearch from './organization-search.vue'
import DateTimeSelector   from './datetime-selector.vue'
import { format as formatDate } from '../datetime.js'

export default {
    name: 'uploadStatement',
    components: { OrganizationSearch, DateTimeSelector },
    props: { 
        tokenReader  : { type: Function, required: false },
        route        : { type: Object,   required: false },
        intervention : { type: Object,   required: true  },
        sessionId    : { type: String,   required: false },
        timezone     : { type: String,   required: false },
        meetings     : { type: Array,    required: false },
        action       : { type: String,   required: false, default: "edit" },
    },
    data:  function(){
        return {
            interventionId :     this.intervention._id,
            title :              this.intervention.title,
            organizationTypeId : this.intervention.organizationTypeId,
            status:              this.intervention.status,
            organizationId:      this.intervention.organizationId,
            government:          this.intervention.government,
            datetime:            this.datetime || this.intervention.datetime || new Date(),
            files:               cloneDeep(this.intervention.files||[]),
            meta:                cloneDeep(this.intervention.meta||[]),
            agendaItem:          { meetingId : this.intervention.meetingId, item: this.intervention.agendaItem },
            organizationTypes  : [],
            organization : null,
            progress: null,
            error : null,
        }
    },
    computed: { canUpdateStatus, canPublish },
    methods: { open, close, clearError, save, onOrganizationChange, isKronosUser, formatDate },
    created,
    mounted, 
}

async function created() {
  this.api = new Api(this.tokenReader)

  if(this.action=='publish') {
      this.datetime = new Date();
      this.status   = 'public';
      this.files.forEach(f => {
          f.public = !!f.allowPublic;
      });
  }

  this.organizationTypes = await this.api.getInterventionOrganizationTypes();
}

function mounted(){
  $('[data-toggle="tooltip"]').tooltip();
  this.open();
}

function open() { 
  $(this.$refs.editIntervention).modal('show') 
}

function close(intervention){ 
  $(this.$refs.editIntervention).modal('hide');
  this.$emit('close', intervention) 
}

function canUpdateStatus() { 
    return this.sessionId &&
         (!this.intervention._id || this.intervention.status=='pending');
}

function canPublish() { 
    return this.status=='public' &&  
           this.status!=this.intervention.status;
}

function onOrganizationChange(o) {
    this.organization       = o;
    this.government         = o.government;
    this.organizationId     = o.organizationTypeId;
    this.organizationTypeId = o.organizationTypeId;
    this.title              = `${o.name} ${(o.acronym||'') && `(${o.acronym})`}`;
}

function isKronosUser(id) {
    const pattern = /^[a-fA-F0-9]{24}$/;

    return pattern.test(id);
}

async function save(publish=false){
  try {

      this.progress = true;

    let   interventionId     = this.interventionId;
    const title              = this.title;
    const status             = this.status;
    const organizationId     = this.organizationId;
    const organizationTypeId = this.organizationTypeId;
    const meetingId          = this.agendaItem.meetingId;
    const agendaItem         = this.agendaItem.item;
    const datetime           = this.datetime;
    const government         = (this.government||'').toLowerCase() || undefined;
    const filesToAdd         = this.files.filter(o=> !o._id);
    const filesToUpdate      = this.files.filter(o=>!!o._id);

    const validUploads = filesToAdd.every(o=>!!o.htmlFile);
    
    if(!validUploads) throw new Error("Must select a file to upload")

    const updates = { 
        ...this.intervention, 
        meetingId, 
        agendaItem, 
        title, 
        status, 
        datetime,
        government, 
        organizationId,
        organizationTypeId,
        files: undefined, // avoid sending back
    };

    let updatedIntervention = interventionId  ? await this.api.updateIntervention(interventionId, updates)   
                                                : await this.api.createPendingIntervention(updates);

    interventionId      = updatedIntervention._id;
    this.interventionId = updatedIntervention._id;

    //TODO Optimize 
    const updatedFiles = await Promise.all(filesToUpdate.map(f=> {
        const data = mapFileData(f);
        return this.api.updateInterventionFile(interventionId, f._id, data);
      }));

    const addedFiles   = await Promise.all(filesToAdd.map(f=> { 
        const { htmlFile } = f;
        const data = { ...mapFileData(f),
            filename    : htmlFile.name,
            contentType : htmlFile.type,
        }
        return this.api.uploadInterventionFile(interventionId, data, htmlFile);
    }));

    updatedIntervention.files = addedFiles.concat(updatedFiles);

    if(publish) {
        const { sessionId } = this;

        updatedIntervention = await this.api.assignInterventionToSession(sessionId,  interventionId, { datetime })
    }

    this.close(updatedIntervention);

  } catch(err) {
    this.error = err
  } finally {
    this.progress = null;
  }
}

function mapFileData(file) {
    let { allowPublic, public: isPublic } = file;

    allowPublic = allowPublic || false;
    isPublic    = isPublic    && allowPublic;

    const data = {
        ...file,
        allowPublic,
        public : isPublic,
        htmlFile: undefined,
        text: undefined
    }

    return data;
}

function clearError() {
  this.error    = null;
  this.progress = null;
}

</script>
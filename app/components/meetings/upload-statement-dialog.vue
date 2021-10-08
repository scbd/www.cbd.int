<template>

    <div class="modal-content-upload">
        <!-- Modal -->
        <div class="modal fade" id="uploadModal" ref="uploadModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="uploadModalLabel">
                            <i class="fa fa-arrow-circle-up"></i> Statement Submission 
                            <small v-for="({normalizedSymbol}, index) in meetings" :key="normalizedSymbol">
                                <span class="text-nowrap">{{normalizedSymbol}}</span><span v-if="index<(meetings.length-1)">, </span>
                                </small>
                        </h4>
                        <button :disabled="!!progress" type="button" class="close" aria-label="Close" @click="close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        
                        <p v-if="false">TODO Instructions....</p>

                        <form  id="statement-submission-form" @submit.prevent="submitForm" enctype="multipart/form-data" ref="form" novalidate :class="{ 'was-validated': wasValidated }">

                            <div class="form-group row">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Priority-Pass Code</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <input :disabled="!!progress" type="text" class="form-control" id="participantIdentity" ref="participantIdentity" placeholder="ABCDE-12345" v-model.trim="participantIdentity" required>
                                        <div class="input-group-append">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="auto" title="Priority-Pass code is included in your registration email (eg: ABCDE-12345)"><i class="fa fa-question-circle"></i></span>
                                        </div>      
                                        <div class="invalid-feedback">Please enter a valid Identity code.</div>
                                                                        
                                    </div>
                                    <div class="form-check">
                                        <div class="text-muted">
                                            <input :disabled="!!progress" class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                                            <label class="form-check-label" for="rememberMe">Remember me (I use private computer)</label>
                                        </div>
                                    </div>
                                </div>
                            </div> 

                            <div class="form-group row">
                                <label for="fileName" class="col-sm-3 col-form-label">File</label>
                                <div class="col-sm-9">
                                    <input :disabled="uploading" type="file" class="form-control-file" id="file" ref="file" name="file" @change="onFileChange($event.target.files)" required 
                                           accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                                    <div class="invalid-feedback">Please select a valid file.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Agenda Item</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress" class="form-control" id="agendaItem"  v-model="selectedAgendaItem" required>
                                        <optgroup v-for="{ _id: meetingId, agenda, normalizedSymbol } in meetings" :key="meetingId" :label="normalizedSymbol">
                                            <option v-for="{ item, shortTitle, title } in agenda.items" :key="item" :value="{ meetingId, item }">
                                                {{ meetings.length>1 ? (agenda.prefix||'') : '' }}
                                                {{ item }} - {{ shortTitle || title }} 
                                            </option>
                                        </optgroup>
                                    </select>
                                    <div class="invalid-feedback">Please select a an agenda item.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label"></label>
                                <div class="col-sm-9">
                                    <div class="form-check">
                                        <div class="text-muted">
                                            <input :disabled="!!progress" class="form-check-input" type="checkbox" id="isRegional" v-model="isRegional">
                                            <label class="form-check-label" for="isRegional">This is a regional statement</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div  class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Region</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress || !isRegional" class="form-control" id="region"  v-model="selectedRegion" aria-placeholder="" :required="isRegional">
                                        <option value="AFRICA">African Group</option>
                                        <option value="AP">Asia and the Pacific Group</option>
                                        <option value="CEE">Central and Eastern Europe Group</option>
                                        <option value="EU">European Union</option>
                                        <option value="GRULAC">Latin America and the Caribbean Group</option>
                                        <option value="JUSCANZ">JUSCANZ</option>
                                    </select>
                                    <div class="invalid-feedback">Please select a region.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="fileLanguage" class="col-sm-3 col-form-label">Language</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress" class="form-control" id="fileLanguage" v-model="selectedLanguage">
                                        <option value="ar">العربية</option>
                                        <option value="en" selected>English</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                        <option value="ru">Русский</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>        
                            </div>       
                            
                            <div class="form-group row">
                                <label for="allowPublic" class="col-sm-3 col-form-label">Do you allow public access?</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <select :disabled="!!progress" class="form-control" id="allowPublic" v-model="allowPublic" required> 
                                            <optgroup>
                                                <option value="true">Yes - I allow publication of this file on the CBD website (publicly available upon validation)</option>
                                                <option value="false">No  - Do not publish this file on CBD website (Secretariat and interpreters access only)</option>
                                            </optgroup>
                                        </select>                                    
                                        <div class="input-group-append">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="auto" title="If you select `yes` you grant permission to the Secretariat to publish this document publicly on its website"><i class="fa fa-question-circle"></i></span>
                                        </div>      
                                        <div class="invalid-feedback">Please select if you allow publication of you file on website.</div>
                                    </div>
                                </div>
                            </div>  

                            <div class="alert alert-warning" role="alert" v-if="error">
                                <span v-if="error.code === 'forbidden'">
                                    <b>Invalid or expired badged or prority-pass.</b> <br>
                                    Please verify the priority pass number and try again.  
                                </span>
                                <span v-else>{{error.message||'Unknown error'}}</span>
                            </div> 
                           
                        </form>  
                    </div>
                
                    <div class="modal-footer">

                        <span v-if="progress" style="width:100%">
                            <i class="fa fa-cog fa-spin"></i> {{progress.message}}
                            <div class="progress" v-if="progress.percent>=0">
                                <div class="progress-bar progress-bar-striped bg-success progress-bar-animated" role="progressbar" :style="{ width: `${progress.percent}%`}" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100">
                                    {{progress.percent}}%
                                </div>
                            </div>
                        </span>

                        <button :disabled="!!progress" type="submit" class="btn btn-success" @click="submitForm"><i class="fa fa-upload"></i> <span>Submit</span></button>
                        <button :disabled="!!progress" type="button" class="btn btn-default" @click="close()"><i class="fa fa-power-off"></i> <span class="hidden-xs">Close</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import $    from 'jquery';
import i18n from './locales.js'
import Api  from './api.js'
import remapCode  from './sessions/re-map.js'

export default {
    name: 'uploadStatement',
    i18n,
    props: { 
        route: { type: Object, required: false },
        show : { type: Boolean, required: false }
    },
    data:  function(){
        return {
            file               : null,
            meetings           : [],
            selectedAgendaItem : null,
            selectedLanguage   : "en",
            selectedRegion     : null,
            isRegional         : false,
            allowPublic        : null,
            participantIdentity: '',
            rememberMe         : false,
            wasValidated       : false,
            progress           : null,
            error              : null,
        }
    },
    created() {
        this.api = new Api() //anonymous 
    },
    mounted(){
        $('[data-toggle="tooltip"]').tooltip();
        this.openDialog(this.show);
    },
    watch: {
        show(visible) { this.openDialog(visible) },

         isRegional(checked) {
             if(!checked) this.selectedRegion = null;
         }
    },

    computed: {

        title() {
            const [meeting] = this.meetings;
            return ((meeting||{}).title||{}).en||'';
        },
        isFormValid(){ 
            return !!this.file
                && !!this.cleanParticipantIdentity
                && !!this.selectedAgendaItem
                && !!this.selectedLanguage
                && (!this.isRegional || !!this.selectedRegion)
                &&   this.allowPublic!==null;
        },
        cleanParticipantIdentity(){ 
            return this.participantIdentity.replace(/[^a-z0-9]/gi, "").toUpperCase();
        },
    },

    methods: {
        async init(){

            if(this.route.params.meeting){
                const meetingCode = remapCode(this.route.params.meeting);
                const meeting     = await this.api.getMeetingByCode(meetingCode)

                this.meetings    = [meeting];
            }
            else if(this.route.params.code){
                const conferenceCode = remapCode(this.route.params.code);
                const conference     = await this.api.getConference(conferenceCode);
                const meetingIds     = conference.MajorEventIDs.map(remapCode);
                const meetings       = await Promise.all(meetingIds.map(id=>this.api.getMeetingById(id)));

                this.meetings = meetings.filter(o=>!!o.agenda);
            }
            else {
                error = { message : "Invalid status: No Meeting or Conference"}
            }

            this.meetings = this.meetings.filter(o=>o.uploadStatement);
        },

        open()  { this.openDialog(true) },
        close() { this.openDialog(false) },
        
        openDialog(visible) {

            this.resetForm()

            $(this.$refs.uploadModal).modal(visible ? 'show' : 'hide')

            if(this.show!=visible)
                this.$emit("update:show", visible);

            if(visible) this.init();            
        },
  
        onFileChange(files) {
            this.file = files[0]
        },
        clearError() {
            this.$refs.participantIdentity.setCustomValidity("")
            this.error    = null;
            this.progress = null;
        },
        async submitForm(e){
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
                allowPublic : this.allowPublic===true || this.allowPublic==='true',
                region      : this.isRegional ? this.selectedRegion : null
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
        },
        resetForm(){
            this.wasValidated        = false;
            this.error               = null;
            this.uploading           = false;
            this.$refs.file.value    = null;
            this.file                = null;
            this.selectedAgendaItem  = null;
            this.selectedLanguage    = "en",
            this.selectedRegion      = null;
            this.isRegional          = false;
            this.allowPublic         = null;
            this.persistIdentity(); 

            if(localStorage.participantIdentity) {
                this.participantIdentity = localStorage.participantIdentity;
                this.rememberMe = !!this.participantIdentity;
            }

            if(this.route.query.uploadStatementBy) {
                this.participantIdentity = this.route.query.uploadStatementBy;
            }

        },

        persistIdentity() {
            if(this.rememberMe){
                localStorage.setItem('participantIdentity', this.participantIdentity);
            }
            else{
                localStorage.removeItem('participantIdentity');
                this.participantIdentity = '';
            }
        },

        onUploadProgress({loaded, total}) {
            (this.progress||{}).percent = (loaded*100/total)|0;
        }
    }
}
</script>
<style scoped>
.modal-content-upload {
    display: inline;
}
</style>
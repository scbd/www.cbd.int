<template>

    <div class="modal-content-upload">
        <!-- Modal -->
        <div class="modal fade" id="uploadModal" ref="uploadModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="uploadModalLabel">
                            <i class="fa fa-arrow-circle-up"></i> Statement Submission
                        </h4>
                        <button :disabled="uploading" type="button" class="close" aria-label="Close" @click="close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h5>{{ title }}</h5>

                        <form  id="statement-submission-form" @submit.prevent="submitForm" enctype="multipart/form-data" ref="form" novalidate :class="{ 'was-validated': wasValidated  }">
                            <div class="form-group row">
                                <label for="fileName" class="col-sm-3 col-form-label">File</label>
                                <div class="col-sm-9">
                                    <input :disabled="uploading" type="file" class="form-control-file" id="file" ref="file" name="file" @change="setFileUpload" required 
                                           accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                                    <div class="invalid-feedback">Please select a valid file.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Agenda Item</label>
                                <div class="col-sm-9">
                                    <select :disabled="uploading" class="form-control" id="agendaItem"  v-model="selectedAgendaItem" required>
                                        <optgroup v-for="{ _id: meetingId, agenda, normalizedSymbol } in meetings" :key="meetingId" :label="normalizedSymbol">
                                            <option v-for="{ item, shortTitle, title } in agenda.items" :key="item" :value="{ meetingId, item }">{{item }} - {{ shortTitle || title }} </option>
                                        </optgroup>
                                    </select>
                                    <div class="invalid-feedback">Please select a an agenda item.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="fileLanguage" class="col-sm-3 col-form-label">Language</label>
                                <div class="col-sm-9">
                                    <select :disabled="uploading" class="form-control" id="fileLanguage" v-model="selectedLanguage">
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
                                <label for="allowPublic" class="col-sm-3 col-form-label">Public on website?</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <select :disabled="uploading" class="form-control" id="allowPublic" v-model="allowPublic" required> 
                                            <option value="true" selected>Yes</option>
                                            <option value="false">No</option>
                                        </select>                                    
                                        <div class="input-group-append">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="auto" title="If you select `yes` you grant permission to the Secretariat to publish this document publicly on its website"><i class="fa fa-question-circle"></i></span>
                                        </div>      
                                        <div class="invalid-feedback">Please select if you allow publication of you file on website.</div>
                                    </div>
                                </div>
                            </div>  

                            <div class="form-group row">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Participant Identity</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <input :disabled="uploading" type="text" class="form-control" id="participantIdentity" placeholder="ABCDE-12345" v-model.trim="participantIdentity" required>
                                        <div class="input-group-append">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="auto" title="Enter your PriorityPass code or Badge code."><i class="fa fa-question-circle"></i></span>
                                        </div>      
                                        <div class="invalid-feedback">Please enter your Identity code.</div>
                                                                        
                                    </div>
                                    <div class="form-check">
                                        <div>
                                            <input :disabled="uploading" class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                                            <label class="form-check-label" for="rememberMe">Remember me (I use private computer)</label>
                                        </div>
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

                        <span v-if="uploading">
                            <i class="fa fa-cog fa-spin"></i> Uploading file...
                        </span>

                        <button :disabled="uploading" type="submit" class="btn btn-success" @click="submitForm"><i class="fa fa-upload"></i> <span class="hidden-xs">Submit</span></button>
                        <button :disabled="uploading" type="button" class="btn btn-default" @click="close()"><i class="fa fa-power-off"></i> <span class="hidden-xs">Close</span></button>
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
            allowPublic        : null,
            participantIdentity: '',
            rememberMe         : false,
            wasValidated       : false,
            uploading          : true,
            error              : null,
        }
    },
    created() {
        this.api = new Api() //anonymous 
    },
    mounted(){

        if(localStorage.participantIdentity) {
            this.participantIdentity = localStorage.participantIdentity;
            this.rememberMe = !!this.participantIdentity;
        }

        $('[data-toggle="tooltip"]').tooltip();
    },
    watch: {
        show(visible) { 
            this.resetForm()
            $(this.$refs.uploadModal).modal(visible ? 'show' : 'hide')
            this.$emit("update:show", visible);

            if(visible) this.init();            
         }
    },

    computed: {

        title() {
            const [meeting] = this.meetings;
            return ((meeting||{}).title||{}).en||'';
        },
        isFormValid(){ 
            return !!this.file
                && !!this.participantIdentity
                && !!this.selectedAgendaItem
                && !!this.selectedLanguage
                && this.allowPublic!==null;
        },
    },

    methods: {
        async init(){

            if(this.route.params.code){
                const conferenceCode = this.route.params.code
                const conference     = await this.api.getConference(conferenceCode);
             
                if(conference.length > 0){

                    // SHOW Agenda Items for all meetings in MajorEventIDs ?? 
                    // const conf = conference[0];
                    // this.title = conf.Title.en;
                    // const mtgs = await this.getMeetingsByIds(conf.MajorEventIDs);

                    // if(mtgs.length > 0){
                    //     mtgs.forEach(mtg => {
                    //         _.map(mtg.agenda.items, (item) => {
                    //             this.agendaItems.push( _.assign(item, { meetingId: mtg._id, code: mtg.EVT_CD  }));
                    //         });
                    //     });
                    // }

                    // get meetingId from url
                    const params = new URLSearchParams(window.location.search);

                    if(params.has('meetingId')){
                        const meetingId = params.get('meetingId');
                        const meeting = await this.api.getMeetingById(meetingId)
                        
                        this.meetings    = [meeting];
                    }
                    else{
                        const meetingCode = this.route.params.meeting;
                        const meeting     = await this.api.getMeetingByCode(meetingCode)
                        
                        this.meetings    = [meeting];
                    }
                }
            }
            else if(this.route.params.meeting){
            
                const meetingCode = this.route.params.meeting;
                const meeting     = await this.api.getMeetingByCode(meetingCode)

                this.meetings    = [meeting];
            }
        },

        open() { this.$emit("update:show", true) },
        close(){ this.$emit("update:show", false) },
  
        setFileUpload() {
            this.file = this.$refs.file.files[0];
        },

        async submitForm(e){
          try {
            this.error = null;
            this.uploading = true;
            this.wasValidated = true;

            if(!this.isFormValid)
                return e.stopPropagation();

            let data = {
                meetingId   : this.selectedAgendaItem.meetingId,
                filename    : this.file.name,
                contentType : this.file.type,
                agendaItem  : ((this.selectedAgendaItem.item || "").toString() || undefined),
                language    : this.selectedLanguage,
                allowPublic : this.allowPublic,
            }
            const passCode =this.participantIdentity.replace(/-/g, "");

            const slot     = await this.api.createInterventionFileSlot(passCode, data)
            const response = await this.uploadFileToSlot(slot, this.file);

            if(!response.ok) throw Error("Error uploadinf file");

            const intervention = await this.api.commitInterventionFileSlot(slot.uid, passCode, data.meetingId);

            this.$emit("notify", `Your file "${slot.metadata.filename}" has been submitted successfully`);

            this.close();

          } catch(err) {
              this.error = err
          } finally {
            this.uploading = false;
          }
        },

        async uploadFileToSlot(slot, file){

            const headers = new Headers();
                  headers.append("Content-Type", slot.contentType);

            const requestOptions = {
                  method  : 'PUT',
                  headers : headers,
                  body    : file,
                  prefixUrl: null
            };

            return await this.api.http(slot.url, requestOptions);;
        },

        resetForm(){
            this.wasValidated        = false;
            this.error               = null;
            this.uploading           = false;
            this.$refs.file.value    = null;
            this.file                = null;
            this.selectedAgendaItem  = null;
            this.selectedLanguage    = "en",
            this.allowPublic         = null;
            this.persistIdentity(); 
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
    }
}
</script>
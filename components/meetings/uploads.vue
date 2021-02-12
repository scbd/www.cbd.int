<template>

    <div class="modal-content-upload">
        <!-- Button trigger modal -->
        <a class="btn btn-link" data-toggle="modal" data-target="#uploadModal">
            <slot>
                <button type="button"  class="btn btn-link" data-toggle="modal" data-target="#uploadModal" >Upload Statement</button>
            </slot>
        </a>
        
        <!-- Modal -->
        <div class="modal fade" id="uploadModal" ref="uploadModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="uploadModalLabel">
                            <i class="fa fa-arrow-circle-up"></i> Statement Submission {{  $t('hello') }}
                        </h4>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h5>{{ title }}</h5>

                        <form  id="statement-submission-form" @submit.prevent="submitForm" enctype="multipart/form-data" ref="form" novalidate :class="{ 'was-validated': wasValidated  }">
                            <div class="form-group row">
                                <label for="fileName" class="col-sm-3 col-form-label">File</label>
                                <div class="col-sm-9">
                                    <input type="file" class="form-control-file" id="file" ref="file" name="file" @change="setFileUpload" required 
                                           accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                                    <div class="invalid-feedback">Please select a valid file.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Agenda Item</label>
                                <div class="col-sm-9">
                                    <select class="form-control" id="agendaItem"  v-model="selectedAgendaItem">
                                        <option v-for="agenda in agendaItems" :key="agenda.item" :value="agenda">{{agenda.code}}: {{ agenda.item }} - {{ agenda.shortTitle }} </option>
                                    </select>
                                    <div class="invalid-feedback">Please select a an agenda item.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="fileLanguage" class="col-sm-3 col-form-label">Language</label>
                                <div class="col-sm-9">
                                    <select class="form-control" id="fileLanguage" v-model="selectedLanguage">
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
                                <label for="isPublic" class="col-sm-3 col-form-label">Public on website?</label>
                                <div class="col-sm-9">
                                    <select class="form-control" id="isPublic" v-model="isPublic"> 
                                        <option value="true" selected>Yes</option>
                                        <option value="false">No</option>
                                    </select>                                    
                                </div>
                            </div>  

                            <div class="form-group row">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Participant Identity</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="participantIdentity" placeholder="ABCDE-12345" v-model.trim="participantIdentity" required>
                                        <div class="input-group-append">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="auto" title="Enter your PriorityPass code or Badge code."><i class="fa fa-question-circle"></i></span>
                                        </div>      
                                        <div class="invalid-feedback">Please enter your Identity code.</div>
                                                                        
                                    </div>
                                    <div class="form-check">
                                        <div>
                                            <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                                            <label class="form-check-label" for="rememberMe">Remember me (I use private computer)</label>
                                        </div>
                                    </div>
                                </div>
                            </div>  
                           
                        </form>  
                    </div>
                
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="submitForm" data-dismiss="modal"><i class="fa fa-upload"></i> <span class="hidden-xs">Submit</span></button>
                        <button type="button" class="btn btn-default" data-dismiss="modal" @click="resetForm"><i class="fa fa-power-off"></i> <span class="hidden-xs">Close</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import ky   from 'ky';
import i18n from './locales.js'
import { isConference, getConferenceCode, getMeetingCode, isMeeting } from './util.js';

export default {
    name: 'uploadStatement',
    i18n,
    data:  function(){
        return {
            title              : '',
            file               : null,
            agendaItems        : [],
            selectedAgendaItem : {},
            selectedLanguage   : "en",
            isPublic           : true,
            participantIdentity: '',
            rememberMe         : false,

            wasValidated    : false
        }
    },

    mounted: function(){
        this.init();        

        if(localStorage.participantIdentity) 
            this.participantIdentity = localStorage.participantIdentity;

        $('[data-toggle="tooltip"]').tooltip();
    },

    computed: {
        isFormValid(){ 
            return !!this.file && !!this.participantIdentity; // && !_.isEmpty(this.selectedAgendaItem);
        }   
    },

    methods: {
        async init(){

            if(isConference()){
                const conferenceCode = getConferenceCode();
                const conference     = await this.getConference(conferenceCode);
             
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

                        if(meetingId.match(/^[0-9a-fA-F]{24}$/))
                        {
                            const meeting     = await this.getMeetingById(meetingId)

                            if(!_.isEmpty(meeting)){
                                const mtg  = meeting[0];
                                this.title = mtg.title.en;
                                this.agendaItems   = _.map(mtg.agenda.items, (item) => {
                                    return _.assign(item, { meetingId: mtg._id, code: mtg.EVT_CD  });
                                }); 
                            }
                        }
                    }
                    else{
                        const meetingCode = getMeetingCode();
                        const meeting     = await this.getMeetingByCode(meetingCode)

                        if(!_.isEmpty(meeting)){
                            const mtg  = meeting[0];
                            this.title = mtg.title.en;
                            this.agendaItems   = _.map(mtg.agenda.items, (item) => {
                                return _.assign(item, { meetingId: mtg._id, code: mtg.EVT_CD  });
                            }); 
                        }
                    }
                }
            }
            if(isMeeting()){
            
                const meetingCode = getMeetingCode();
                const meeting     = await this.getMeetingByCode(meetingCode)

                if(!_.isEmpty(meeting)){
                    const mtg  = meeting[0];
                    this.title = mtg.title.en;
                    this.agendaItems   = _.map(mtg.agenda.items, (item) => {
                        return _.assign(item, { meetingId: mtg._id, code: mtg.EVT_CD  });
                    }); 
                }
            }
        },
  
        setFileUpload() {
            this.file = this.$refs.file.files[0];
        },

        async submitForm(e){
            this.wasValidated = true;

            if(this.isFormValid){
                let data = {
                        meetingId   : this.selectedAgendaItem.meetingId,
                        filename    : this.file.name,
                        contentType : this.file.type,
                        agendaItem  : ((this.selectedAgendaItem.item || "").toString() || undefined),
                        language    : this.selectedLanguage,
                        allowPublic : this.isPublic,
                }
                const passCode =this.participantIdentity.replace(/-/g, "");

                const slot     = await this.getSlotInfo(passCode, data)
                const response = await this.uploadSlot(slot, this.file);

                if(response.ok){
                    const commited  = await this.commitSlot(slot, passCode, data.meetingId);

                    if(commited){
                        console.log('the intervention has been commited!');
                    }
                }
                else{
                    throw new HTTPError(`Upload error: ${response.statusText}`);
                }
                
                this.resetForm();
            }
            else{
                e.stopPropagation();
            }
        },

        async commitSlot(slot, passCode, meetingId){


            const url  = "https://api.cbddev.xyz/api/v2021/meeting-interventions/slot/"+slot.uid+'/commit';

            let headers = new Headers();
                headers.append("Authorization", "Pass "+passCode);
                headers.append("Content-Type", "application/json");
            
            const data = { meetingId:  meetingId };

            let requestOptions = {
                method  : 'PUT',
                headers : headers,
                body    : JSON.stringify(data)
            };
  
            return  await ky(url, requestOptions).json();
        },

        async uploadSlot(slot, file){

            const headers = new Headers();
                  headers.append("Content-Type", slot.contentType);

            const requestOptions = {
                  method  : 'PUT',
                  headers : headers,
                  body    : file
            };

            return await ky(slot.url, requestOptions);;
        },

        async getSlotInfo(pass, data){
            const url  = "https://api.cbddev.xyz/api/v2021/meeting-interventions/slot";

            const headers = new Headers();
                  headers.append("Authorization", "Pass "+pass);
                  headers.append("Content-Type", "application/json");
            
            const requestOptions = {
                  method  : 'POST',
                  headers : headers,
                  body    : JSON.stringify(data)
            };
  
            return  await ky(url, requestOptions).json();
        },

        resetForm(){
            this.wasValidated = false;

            this.$refs.file.value    = null;
            this.file                = null;
            this.selectedAgendaItem  = {};
            this.selectedLanguage    = "en",
            this.isPublic            = true;
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

        async getConference(code){

            if(!code) return;

            const url  = "http://localhost:8000/api/v2016/conferences/";

            const params       = { code: code } ;
            const searchParams = new URLSearchParams("q="+JSON.stringify(params));
  
            return await ky.get(url, { searchParams: searchParams }).json();
        },

        async getMeetingsByIds(ids){
            if(!ids || !ids.length) return;

            const url  = "http://localhost:8000/api/v2016/meetings/";
            
            let oidArray=[];
            for (var i=0; i<ids.length; i++) {
                oidArray.push({ '$oid': ids[i] });
            }
                       
            const params       = { _id: {$in:oidArray} } ;
            const searchParams = new URLSearchParams("q="+JSON.stringify(params));

            return  ky.get(url, { searchParams: searchParams }).json();
        },

        async getMeetingByCode(code){
            if(!code) return;

            const url    = "http://localhost:8000/api/v2016/meetings/";
            const params = { EVT_CD: code.toUpperCase() } ;

            const searchParams = new URLSearchParams("q="+JSON.stringify(params));

            return await ky.get(url, { searchParams: searchParams }).json();
        },
        
        async getMeetingById(id){
            if(!id) return;

            const url  = "http://localhost:8000/api/v2016/meetings/";

            const params = { _id: { '$oid':id } } ;
            const searchParams = new URLSearchParams("q="+JSON.stringify(params));

            return await ky.get(url, { searchParams: searchParams }).json();
        },        
                   
    }
}
</script>
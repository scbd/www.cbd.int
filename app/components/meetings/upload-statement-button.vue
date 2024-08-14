<template>
    <span>
        <button type="button" class="btn btn-success" :class="{'btn-xs':size=='xs'}"  @click="showDialog = !showDialog" title="Upload statement">
            <i class="fa fa-upload"></i>
            <span class="hidden-xs">Statement</span>
        </button>
        <!-- <upload-dialog :show.sync="showDialog" :route="route" @notify="$emit('notify')" /> -->
    </span>
</template>

<script>
import Vue from 'vue';
import UploadDialog from './upload-statement-dialog.vue';

export default {
    name: 'uploadStatementButton',
    components: { UploadDialog },
    props: { 
        route: { type: Object,  required: false },
        show : { type: Boolean, required: false },
        size : { type: String,  required: false },
        filterByMeetingAgenda: { type: Object, required: false }
    },
    data: function() { 
        return {
            showDialog : this.show,
        };
    },
    mounted(){

        const dialog = new (Vue.extend(UploadDialog))({
            propsData : { 
                route: this.route,
                show: this.showDialog,
                filterByMeetingAgenda:this.filterByMeetingAgenda
            }
        });
        dialog.$on("notify",      (v) => this.$emit('notify', v));
        this.$watch('show',       (v) => this.showDialog = v);
        this.$watch('showDialog', (v) => dialog.$props.show = v);
        dialog.$on("update:show", (v) => { 
            this.showDialog = v 
            this.$emit("update:show", v);
        });

        const target = document.getElementsByTagName('ng-view')[0];
        
        dialog.$mount();

        target.appendChild(dialog.$el);

        this.$once('hook:beforeDestroy', () => {
            dialog.$destroy();
            target.removeChild(dialog.$el)
        });
        
        if(this.route.query.uploadStatementBy) {
            this.showDialog = true;
        }
    }
}
</script>
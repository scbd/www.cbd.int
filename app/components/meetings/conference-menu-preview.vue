<template>
    <div ref="host" @click.capture="blockNavigation"></div>
</template>

<script>
import ng from 'angular'
import '~/directives/meetings/conference-header'

// Renders the real <conference-header> directive against the draft conference
export default {
    name  : 'ConferenceMenuPreview',
    props : {
        conference : { type: Object, required: true }, // conference record (with code / timezone)
        menus      : { type: Array,  required: true }  // draft menus
    },
    watch: {
        draft : { handler: 'update', deep: true }
    },
    computed: {
        draft() {
            const { conference, menus } = this
            return JSON.parse(JSON.stringify({ ...conference, conference: { ...conference.conference, menus } }))
        }
    },
    mounted() {
        const injector = ng.element(document.body).injector()

        this.scope = injector.get('$rootScope').$new(true)
        this.scope.draft = this.draft

        const element = injector.get('$compile')('<conference-header preview-conference="draft"></conference-header>')(this.scope)
        this.$refs.host.appendChild(element[0])
        this.scope.$applyAsync()
    },
    beforeDestroy() {
        if(this.scope) this.scope.$destroy()
    },
    methods: {
        // The preview is only a mock-up: menu links must not leave the editor. ng-click handlers (expand/select) still run.
        blockNavigation(event) {
            if(event.target.closest('a')) event.preventDefault()
        },
        update() {
            this.scope.draft = this.draft
            this.scope.$applyAsync()
        }
    }
}
</script>

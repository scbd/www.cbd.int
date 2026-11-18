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
    data() {
        return { selectedCode: null }
    },
    watch: {
        draft    : { handler: 'update', deep: true },
        selected : 'update'
    },
    computed: {
        // On small screens the header shows the sub-menus of the menu matching the page url: here the one clicked, else the first with sub-menus
        selected() {
            const menus = this.draft.conference.menus || []
            const first = menus.find(m => (m.menus || []).length)

            return menus.some(m => m.code && m.code === this.selectedCode) ? this.selectedCode : first && first.code
        },
        draft() {
            const { conference, menus } = this
            return JSON.parse(JSON.stringify({ ...conference, conference: { ...conference.conference, menus } }))
        }
    },
    mounted() {
        const injector = ng.element(document.body).injector()

        this.scope = injector.get('$rootScope').$new(true)
        this.scope.draft    = this.draft
        this.scope.selected = this.selected

        const element = injector.get('$compile')('<conference-header preview-conference="draft" preview-selected="selected"></conference-header>')(this.scope)
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

            const cell = event.target.closest('td.meetingnav-buttongroup') // top-level cells follow the order of the draft menus
            const menu = cell && this.draft.conference.menus[Array.prototype.indexOf.call(cell.parentNode.children, cell)]

            if(menu && menu.code && (menu.menus || []).length) this.selectedCode = menu.code
        },
        update() {
            this.scope.draft    = this.draft
            this.scope.selected = this.selected
            this.scope.$applyAsync()
        }
    }
}
</script>

<template>
	<span style="display:inline-block;">
		<a href="#" @click.prevent="startTour">{{title}}</a>
		<v-tour name="decision-search-tour" :steps="steps"></v-tour>
	</span>
</template>

<script>
import VueTour from 'vue-tour';

export default {
    name: 'DecisionSearchHelp',
	components: {
		VueTour
	},
	props: {
		title: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			steps: [
				{
					target: '#step1',
					header: {
						title: 'Search',
					},
					content: 'Here you can search the decisions.',
			        params: { 
						enableScrolling: false,
						placement: 'top',
					}
				},
				{
					target: '#step2',
					header: {
						title: 'Free Text',
					},
					content: `Search with free text!`,
			        params: { 
						enableScrolling: false,
						placement: 'top',
					}
				},
				{
					target: '#step3',
					content: 'Click here to advance search with other filters!',
			        params: { 
						enableScrolling: false,
						placement: 'top',
					}
				}
			]
		}
	},
    methods: {
		startTour() {
			this.$tours['decision-search-tour'].start()
		}
    }
}
</script>
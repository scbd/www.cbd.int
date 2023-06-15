<template>
	<span style="display:inline-block;">
		<a href="#" @click.prevent="startTour">{{title}}</a>
		<v-tour name="decision-view-tour" :steps="steps"></v-tour>
	</span>
</template>

<script>
import VueTour from 'vue-tour';

export default {
    name: 'DecisionViewHelp',
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
						title: 'Decision number',
					},
					content: `Find the decision number here.`,
			        params: { 
						enableScrolling: false,
						placement: 'top',
					}
				},
				{
					target: '#step2',
					header: {
						title: 'Decision Title',
					},
					content: `Here is the decision title.`,
			        params: { 
						enableScrolling: false,
						placement: 'top',
					}
				},
				{
					target: '#step3',
					content: 'Change language to see content on preferred language!',
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
			this.$tours['decision-view-tour'].start()
		}
    }
}
</script>
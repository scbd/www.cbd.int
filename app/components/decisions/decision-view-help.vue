<template>
	<span style="display:inline-block;">
		<a href="javascript:void(0)" @click="startTour">{{title}}</a>
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
						title: 'Title',
					},
					content: `Decision!`,
			        params: { 
						enableScrolling: false,
						placement: 'top',
					}
				},
				{
					target: '#step2',
					header: {
						title: 'Title',
					},
					content: `Decision Title!`,
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
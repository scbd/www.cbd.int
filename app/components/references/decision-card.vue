<template>
    <div>
        <b>
            <a :href="decision.url" target="_blank">
                {{ decision.symbol || decision.code }}
                <span v-if="decision.elements[0]">
                    <span v-if="decision.elements[0].section">
                        {{ decision.elements[0].section | uppercase }}
                    </span>
                    <span v-if="decision.elements[0].paragraph">
                        para {{ decision.elements[0].paragraph }}
                    </span>
                    <span v-if="decision.elements[0].item">
                        {{ decision.elements[0].item | lowercase }})
                    </span>
                    <span v-if="decision.elements[0].subitem">
                        {{ decision.elements[0].subitem | lowercase }})
                    </span>
                </span>
                <i class="fa fa-external-link" aria-hidden="true"></i>
            </a>
        </b>
        <div v-if="decision._id">
    	    <div style="max-height:50px;overflow:hidden">
    		    {{ decision.title | lstring }}
    	    </div>
    	    <div style="max-height:50px;overflow:hidden">
    		    <i>{{ decision.elements[0].text | lstring }}</i>
    	    </div>
        </div>
    </div>
</template>

<script>
import { lstring } from '~/filters/lstring.js';

export default {
    name: 'Decision',
    props: {
        decision: {
            type: Object,
            required: true
        },
    },
    filters: {
        lstring,
        uppercase(text) {
            return (text + '').toUpperCase();
        },
        lowercase(text) {
            return (text + '').toLowerCase()
        }
    }
}
</script>

<style>

</style>
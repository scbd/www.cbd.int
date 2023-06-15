<template>
    <div>
        <b>
            <a :href="decision.url" target="_blank">
                {{ decision.symbol || decision.code }}
                <span v-if="decision.elements[0]">
                    <span v-if="decision.elements[0].section" class="uppercase">
                        {{ decision.elements[0].section }}
                    </span>
                    <span v-if="decision.elements[0].paragraph">
                        para {{ decision.elements[0].paragraph }}
                    </span>
                    <span v-if="decision.elements[0].item" class="lowercase">
                        {{ decision.elements[0].item }})
                    </span>
                    <span v-if="decision.elements[0].subitem" class="lowercase">
                        {{ decision.elements[0].subitem }})
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
import lstring from '~/filters/lstring.js';

export default {
    name: 'Decision',
    props: {
        decision: {
            type: Object,
            required: true
        },
    },
    filters: {
        lstring
    }
}
</script>

<style>
.uppercase {
    text-transform: uppercase;
}
.lowercase {
    text-transform: lowercase;
}
</style>
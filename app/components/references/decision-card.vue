<template>
    <div>
        <b>
            <a :href="decision.url" target="_blank">
                {{ decision.symbol || decision.code }}
                <span v-if="decision.elements">
                    <span v-if="decision.elements.section" class="uppercase">
                        {{ decision.elements.section }}
                    </span>
                    <span v-if="decision.elements.paragraph">
                        para {{ decision.elements.paragraph }}
                    </span>
                    <span v-if="decision.elements.item" class="lowercase">
                        {{ decision.elements.item }})
                    </span>
                    <span v-if="decision.elements.subitem" class="lowercase">
                        {{ decision.elements.subitem }})
                    </span>
                </span>
                <i class="fa fa-external-link" aria-hidden="true"></i>
            </a>
        </b>
        <div v-if="decision._id">
    	    <div style="max-height:50px;overflow:hidden">
    		    {{ decision.title | lstring }}
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
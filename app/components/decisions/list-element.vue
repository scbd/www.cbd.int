<template>
    <div v-if="nodes && nodes.length > 0">
        <div v-for="node in nodes" :key="node">
            <view-element :node="node"></view-element>
        </div>
    </div>

</template>

<script>
import ViewElement from '~/components/decisions/view-element.vue';

export default {
    name: 'ListElement',
    components: { ViewElement },
    props: {
        nodes: {
            type: Array,
            default: () => []
        }
    },
}
</script>
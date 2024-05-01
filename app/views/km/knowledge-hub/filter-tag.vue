<template>
    <span class="border border-primary text-small rounded p-1 w-100 mr-1">
        <slot name="default"/>
        <a href="#" class="text-danger" @click.prevent="remove()">&times;</a>
    </span>
</template>

<script>

export default {
    name: "FilterTag",
    emits: ['remove'],
    methods: {
        remove() { this.$emit('remove') },
    }
}

</script>
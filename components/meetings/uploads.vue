<template>
    <div>
        
        <h1>Uploads</h1>
        <hr/>
        <myCounter></myCounter>
        <hr/>
    </div>
</template>

<script>

import myCounter from "./test-click-button.vue"

export default {
    components: { myCounter },
    data:  () => {
        return {
            count: 0
        }
    }
}

</script>
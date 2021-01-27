<template>
    <div>
        
        <h1 class="red"> Sessions hello Randy !!!</h1>
        <hr/>
        <myCounter></myCounter>
        <hr/>
    </div>
</template>

<script>

import ky from "ky"
import myCounter from "./test-click-button.vue"

console.log(ky);
debugger;
export default {
    components: { myCounter },
    data:  () => {
        return {
            count: 0
        }
    }
}

</script>
<style scoped>
 .red  { color: #FF00FF;}
</style>
<template >
  <svg :class="{ [`icon-${$props.name}`]:true }" class="icon" >
    <use :xlink:href="`#icon-${$props.name}`"></use>
  </svg>
</template>
<script>
export default {
  name : 'IconWPH',
  props: [ 'name' ]
}
</script>
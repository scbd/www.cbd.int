
<template >
  <table  class="table table-striped table-hover no-border-first-row sessions">
    <tbody >
      <slot />
    </tbody>
  </table>
</template>

<script>
export default {
  name      : 'SessionsView'
}
</script>
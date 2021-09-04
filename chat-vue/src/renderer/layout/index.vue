<template>
  <div class="no-drag">
    layout
    <router-view />
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
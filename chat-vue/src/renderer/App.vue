<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'chat-vue'
  }
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  -webkit-app-region: drag;
}
</style>

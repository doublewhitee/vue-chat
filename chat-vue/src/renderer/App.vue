<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'chat-vue',
    sockets: {
      count (messageCount) {
        this.$store.commit('SET_MESSAGE_COUNT', messageCount)
      },
      count_change (data) {
        this.$store.commit('CHANGE_MESSAGE_COUNT', data)
      }
    }
  }
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  -webkit-app-region: drag;
}
</style>

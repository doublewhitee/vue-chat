<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'chat-vue',
  sockets: {
    count (messageCount) {
      this.$store.commit('SET_MESSAGE_COUNT', messageCount)
    },
    count_change (data) {
      this.$store.commit('CHANGE_MESSAGE_COUNT', data)
    },
    disconnect () {
      // 断连则退出登录
      this.$store.commit('CLEAR_USER_STATE')
      this.$router.replace('/login')
      ipcRenderer.send('LOG_OUT')
      this.$message.success('您已断开连接，自动退出登录！')
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

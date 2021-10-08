<template>
  <div class="main">
    {{ $store.state.User.messageCount }}
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  width: 240px;
  background-color: #EEE;
  -webkit-app-region: no-drag;
}
</style>
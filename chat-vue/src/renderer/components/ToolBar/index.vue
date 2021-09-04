<template>
  <div class="tool-bar" :style="{ color }">
    <i class="el-icon-minus" @click="handleMinimize" />
    <i class="el-icon-close" @click="handleClose" />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  props: {
    color: {
      type: String,
      default: '#FFF'
    }
  },
  methods: {
    handleMinimize () {
      ipcRenderer.send('MINIMIZE')
    },
    handleClose () {
      ipcRenderer.send('CLOSE')
    }
  }
}
</script>

<style lang="scss">
.tool-bar {
  position: absolute;
  right: 0;
  z-index: 999;
  -webkit-app-region: no-drag;
  i {
    cursor: pointer;
    font-weight: bold;
    font-size: 20px;
    padding-right: 10px;
    padding-top: 10px;
  }
}
</style>
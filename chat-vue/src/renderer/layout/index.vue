<template>
  <el-container style="height: 100vh">
    <el-aside width="60px" class="no-drag">
      <SideBar />
    </el-aside>
    <el-container>
      <ToolBar color="#000" />
      <el-main style="padding: 0px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import SideBar from '@/components/SideBar'
import ToolBar from '@/components/ToolBar'

export default {
  components: {
    SideBar,
    ToolBar
  }
}
</script>

<style lang="scss" scoped>
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
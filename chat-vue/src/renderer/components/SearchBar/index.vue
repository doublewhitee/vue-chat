<template>
  <div class="container">
    <el-input size="mini" placeholder="请输入" class="no-drag" style="padding-right: 10px">
      <i slot="prefix" class="el-input__icon el-icon-search" />
    </el-input>
    <el-button
      size="mini"
      type="primary"
      icon="el-icon-plus"
      @click="handleClickBtn"
      class="no-drag"
    />
  </div>
</template>

<script>
export default {
  methods: {
    handleClickBtn () {
      this.$emit('clickAddBtn')
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 30px 10px 10px 10px;
  display: flex;
  background-color: #FFF;
  border-bottom: 1px solid #DCDFE6;
}

.no-drag {
  -webkit-app-region: no-drag;
}
</style>
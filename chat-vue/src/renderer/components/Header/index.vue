<template>
  <div class="header">
    <div class="name">{{ title }}</div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '聊天名称' }
  }
}
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 60px;
  border-bottom: 1px solid #DCDFE6;
  .name {
    font-size: 20px;
    padding: 30px 0 10px 20px;
  }
}
</style>
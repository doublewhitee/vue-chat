<template>
  <div class="header">
    <div class="item">{{ title }}</div>
    <i class="el-icon-info item info" v-if="type === 'group'" @click="handleClickIcon" />
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '聊天名称' },
    type: { type: String, default: 'friend' }
  },
  methods: {
    handleClickIcon () {
      this.$emit('showMoreInfo')
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 68px;
  border-bottom: 1px solid #DCDFE6;
  display: flex;
  .item {
    font-size: 20px;
    padding: 30px 0 10px 20px;
  }
  .info {
    cursor: pointer;
    -webkit-app-region: no-drag;
    color: #DCDFE6;
    padding-top: 32px;
    padding-left: 10px;
  }
}
</style>
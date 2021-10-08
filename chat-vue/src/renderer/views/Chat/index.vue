<template>
  <div style="height: 100%; display: flex;">
    <FriendList />
    <div style="width: 600px">
      <Header />
      
      <div class="content">content</div>
    </div>
  </div>
</template>

<script>
import FriendList from './childComps/FriendList'
import Header from '@/components/Header'

export default {
  components: {
    FriendList,
    Header
  }
}
</script>

<style lang="scss" scoped>
.content {
  height: 400px;
  border-bottom: 1px solid #DCDFE6;
}
</style>
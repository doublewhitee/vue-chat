<template>
  <div class="main">
    <!-- <SearchBar @clickAddBtn="handleAddFriend" @searchFriend="getSearchFriend" /> -->
    <SearchBar />
    <List />
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'
import List from './List'

export default {
  components: {
    SearchBar,
    List
  }
  // mounted () {

  // }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  width: 240px;
  background-color: #EEE;
  border-right: 1px solid #DCDFE6;
}
</style>
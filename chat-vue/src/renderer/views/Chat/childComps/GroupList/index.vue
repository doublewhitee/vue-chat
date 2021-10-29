<template>
  <div class="main">
    <!-- <SearchBar @clickAddBtn="handleAddFriend" @searchFriend="getSearchFriend" /> -->
    <SearchBar @searchFriend="getSearchChat" />
    <List v-if="searchText===''" />
    <SearchList v-else :searchText="searchText" />
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'
import List from './List'
import SearchList from './SearchList.vue'

export default {
  components: {
    SearchBar,
    List,
    SearchList
  },
  data () {
    return {
      searchText: ''
    }
  },
  methods: {
    getSearchChat (text) {
      this.searchText = text
    }
  }
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
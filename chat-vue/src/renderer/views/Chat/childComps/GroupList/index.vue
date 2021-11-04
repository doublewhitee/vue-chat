<template>
  <div class="main">
    <SearchBar @clickAddBtn="handleAddGroup" @searchFriend="getSearchChat" />
    <List v-if="searchText===''" />
    <SearchList v-else :searchText="searchText" />

    <GroupModal
      ref="groupModal"
      dialogTitle="创建群聊"
      :dialogVisible="addDialogVisible"
      :friendList="friendList"
      :checkedList="checkedList"
      :loading="loading"
      @clickItem="handleClickListItem"
      @changeInput="handleChangeInput"
      @close="addDialogVisible=false"
      @submit="handleCreateGroup"
    />
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'
import List from './List'
import SearchList from './SearchList.vue'
import GroupModal from '../GroupModal'

import { BASE_IMG_URL } from '@/config/constant'

import { reqFriendList } from '@/api/friend'
import { reqCreateGroup } from '@/api/group'

export default {
  components: {
    SearchBar,
    List,
    SearchList,
    GroupModal
  },
  data () {
    return {
      searchText: '',
      addDialogVisible: false,
      addSearchInput: '',
      friendList: [],
      checkedList: [],
      loading: false,
      BASE_IMG_URL
    }
  },
  methods: {
    getSearchChat (text) {
      this.searchText = text
    },
    async handleAddGroup () {
      this.$refs.groupModal.clear()
      this.friendList.forEach(i => { i.isChecked = false })
      this.checkedList = []
      await this.getFriendList()
      this.addDialogVisible = true
    },
    handleClickListItem (item) {
      const isExist = this.checkedList.some((i, index) => {
        if (i.friend_id._id === item.friend_id._id) {
          item.isChecked = false
          this.checkedList.splice(index, 1)
          return true
        }
      })
      if (!isExist) {
        item.isChecked = true
        this.checkedList.push(item)
      }
      this.$refs.groupModal.update()
    },
    handleChangeInput (search) {
      this.getFriendList(search)
    },

    async handleCreateGroup () {
      const userList = []
      this.checkedList.forEach(i => userList.push(i.friend_id._id))
      userList.push(this.$store.state.User._id)
      // 创建群聊
      const res = await reqCreateGroup(userList, this.$store.state.User._id)
      if (res) {
        if (res.code === 0) {
          this.$socket.emit('send_msg', {
            user_id: this.$store.state.User._id,
            group_id: res.group._id,
            chat_id: res.chat
          })
          this.$bus.$emit('updateChatList', { group: res.group._id, time: res.chat.create_at })
          this.addDialogVisible = false
        } else {
          this.$message(res.msg)
        }
      }
    },

    async getFriendList (input = '') {
      this.loading = true
      const res = await reqFriendList(this.$store.state.User._id, input)
      if (res) {
        if (res.code === 0) {
          this.friendList = res.data
          this.friendList.forEach(i => {
            if (this.checkedList.some(item => item.friend_id._id === i.friend_id._id)) {
              i.isChecked = true
            } else {
              i.isChecked = false
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      }
      this.loading = false
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
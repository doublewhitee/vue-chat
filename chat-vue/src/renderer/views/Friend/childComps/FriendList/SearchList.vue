<template>
  <div class="container">
    <div v-if="friendList.length > 0">
      <div style="font-size: 12px; margin: 10px">搜索结果</div>
      <div
        v-for="friend in friendList" :key="friend._id"
        @click="handleClickFriend(friend.friend_id._id)"
        :class="[activeId === friend.friend_id._id ? 'friend-item active' : 'friend-item']"
      >
        <img
          class="friend-item-img"
          :src="BASE_IMG_URL + friend.friend_id.avatar"
          alt="avatar"
          style="width: 45px; height: 45px"
        />
        <div v-html="highlightText(searchText, friend.friend_name || friend.friend_id.username)" class="highlight-container" />
      </div>
    </div>

    <div v-else class="info">未查找到相关结果</div>
  </div>
</template>

<script>
import { BASE_IMG_URL } from '@/config/constant'
import { highlightText } from '@/utils'

import { reqFriendList } from '@/api/friend'

export default {
  data () {
    return {
      friendList: {},
      activeId: '',
      BASE_IMG_URL
    }
  },
  props: {
    searchText: {
      type: String
    }
  },
  watch: {
    searchText () {
      this.getFriendList()
    }
  },
  mounted () {
    if (this.$route.query && this.$route.query.id) {
      this.activeId = this.$route.query.id
    }
    this.getFriendList()
    this.$bus.$on('getFriendList', this.getFriendList)
  },
  destroyed () {
    this.$bus.$off('searchFriend')
  },
  methods: {
    async getFriendList () {
      const res = await reqFriendList(this.$store.state.User._id, this.searchText)
      if (res) {
        if (res.code === 0) {
          this.friendList = res.data
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    handleClickFriend (id) {
      this.activeId = id
      this.$router.replace({ path: '/chat/friend', query: { id } })
    },
    highlightText
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 70px);
  overflow-y: auto;
}

.container::-webkit-scrollbar {
	width: 10px;
	height: 16px;
	background-color: #F5F5F5;
}

.container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #DDD;
}

.friend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  background-color: #EEE;
  -webkit-app-region: no-drag;
  .friend-item-img {
    width: 45px;
    height: 45px;
    padding: 10px;
  }
}

.highlight-container {
  /deep/ div {
    font-size: 12px;
    color: #909399;
  }
  /deep/ span {
    color: #409EFF;
  }
}

.friend-item:hover {
  background-color: #DDD;
}

.active {
  background-color: #DDD;
}

.info {
  font-size: 12px;
  text-align: center;
  margin-top: 20px;
}
</style>
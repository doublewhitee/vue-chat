<template>
  <div class="container">
    <el-collapse v-model="activeNames">
      <el-collapse-item
        v-for="item in Object.keys(friendList)"
        :key="item"
        :title="`${titleMap[item]} (${friendList[item].length})`"
        :name="item"
      >
        <div v-for="friend in friendList[item]" :key="friend._id">
          <div
            v-if="friend._id === 'new_friend'"
            :class="[activeId === 'new_friend' ? 'friend-item active' : 'friend-item']"
            @click="handleClickFriend('new_friend')"
          >
            <div class="friend-item-img">
              <el-badge
                v-if="$store.state.User.messageCount.new_friend > 0"
                :value="$store.state.User.messageCount.new_friend"
              >
                <img src="@/assets/new_friend.png" alt="new_friend" style="width: 45px; height: 45px" />
              </el-badge>
              <img
                v-else
                src="@/assets/new_friend.png"
                alt="new_friend"
                style="width: 45px; height: 45px"
              />
            </div>
            <span class="friend-item-title">新的朋友</span>
          </div>

          <div
            v-else
            @click="handleClickFriend(friend.friend_id._id)"
            :class="[activeId === friend.friend_id._id ? 'friend-item active' : 'friend-item']"
          >
            <img
              class="friend-item-img"
              :src="BASE_IMG_URL + friend.friend_id.avatar"
              alt="avatar"
              style="width: 45px; height: 45px"
            />
            <div class="friend-item-title">{{ friend.friend_name || friend.friend_id.username }}</div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { BASE_IMG_URL } from '@/config/constant'

import { reqFriendList } from '@/api/friend'

export default {
  data () {
    return {
      friendList: { new: [{ _id: 'new_friend' }], group: [], friend: [] },
      activeNames: [ 'new', 'friend' ],
      titleMap: { new: '新的朋友', group: '群聊', friend: '好友列表' },
      activeId: '',
      BASE_IMG_URL
    }
  },
  mounted () {
    if (this.$route.query && this.$route.query.id) {
      this.activeId = this.$route.query.id
    }
    this.getSingleFriendList()
    this.$bus.$on('getFriendList', this.getSingleFriendList)
  },
  destroyed () {
    this.$bus.$off('getFriendList')
  },
  methods: {
    handleClickFriend (id) {
      this.activeId = id
      if (this.$route.query && this.$route.query.id && this.$route.query.id === id) {
        this.$bus.$emit('refreshFriend')
      } else {
        this.$router.replace({ path: '/chat/friend', query: { id } })
      }
    },

    async getSingleFriendList () {
      const res = await reqFriendList(this.$store.state.User._id)
      if (res) {
        if (res.code === 0) {
          this.friendList.friend = res.data
        } else {
          this.$message.error(res.msg)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 70px);
  overflow-y: auto;
  -webkit-app-region: no-drag;
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
  background-color: #EEE;
  .friend-item-img {
    width: 45px;
    height: 45px;
    padding: 10px;
  }
}

.active {
  background-color: #DDD;
}

.friend-item:hover {
  background-color: #DDD;
}
</style>

<style>
.el-collapse-item__header {
  height: 30px;
  font-size: 12px;
  padding-left: 10px;
  background-color: #EEE;
}

.el-collapse-item__content {
  padding-bottom: 0;
}
</style>
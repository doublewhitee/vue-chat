<template>
  <div class="container">
    <div v-if="groupInfo.length > 0">
      <div
        v-for="group in groupInfo" :key="group._id"
        @click="handleClickGroup(group._id, group.user_info[0])"
        :class="[activeId === group._id ? 'group-item active' : 'group-item']"
      >
        <div v-if="group.type === 'single'" class="group-item-con">
          <div style="display: flex; align-items: center">
            <img
              class="group-item-img"
              :src="BASE_IMG_URL + group.user_info[0].avatar"
              alt="avatar"
              style="width: 45px; height: 45px"
            />
            <div>
              <div class="group-item-title">{{ getUserTitle(group.user_info[0]) }}</div>
              <div class="group-item-info">{{ `共有${group.count}条相关消息` }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="info">未查找到相关结果</div>
  </div>
</template>

<script>
import { BASE_IMG_URL } from '@/config/constant'

import { reqChatHistoryCount } from '@/api/group'
import { reqFriendList } from '@/api/friend'

export default {
  data () {
    return {
      groupInfo: [],
      activeId: '',
      BASE_IMG_URL
    }
  },
  props: {
    searchText: {
      type: String
    }
  },
  computed: {
    getUserTitle: function () {
      return info => {
        if (info.friend_name && info.friend_name !== '') {
          return info.friend_name
        } else {
          return info.username
        }
      }
    }
  },
  async mounted () {
    await this.getGroupInfo()
    if (this.$route.query && this.$route.query.id) {
      this.activeId = this.$route.query.id
    }
    this.$forceUpdate()
  },
  methods: {
    handleClickGroup (id, info) {
      if (this.$route.query) {
        if (!this.$route.query.id || this.$route.query.id !== id) {
          this.$router.replace({ path: '/chat/group', query: { id, title: this.getUserTitle(info) } })
        }
      }
      this.activeId = id
    },

    async getGroupInfo () {
      const res = await reqChatHistoryCount(this.$store.state.User._id, this.searchText)
      if (res) {
        if (res.code === 0) {
          this.groupInfo = res.data
          // 过滤自己的信息
          this.groupInfo.forEach(i => {
            i.user_info.some((user, index) => {
              if (user._id === this.$store.state.User._id) {
                i.user_info.splice(index, 1)
                return true
              }
            })
          })
          // 好友信息
          const info = await reqFriendList(this.$store.state.User._id)
          if (info) {
            if (info.code === 0) {
              this.groupInfo.forEach(i => {
                if (i.type === 'single') {
                  info.data.some(user => {
                    if (user.friend_id._id === i.user_info[0]._id) {
                      i.user_info[0].friend_name = user.friend_name
                      return true
                    }
                  })
                }
              })
            } else {
              this.$message.error(info.msg)
            }
          }
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

.group-item {
  font-size: 12px;
  background-color: #EEE;
  -webkit-app-region: no-drag;
  .group-item-con {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .group-item-img {
    width: 45px;
    height: 45px;
    padding: 10px;
  }
  .group-item-info {
    color: #999;
    font-size: 12px;
    margin-top: 5px;
  }
}

.group-item:hover {
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
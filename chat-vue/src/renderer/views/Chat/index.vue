<template>
  <div style="height: 100%; display: flex;">
    <FriendList />
    <div style="width: 600px">
      <div v-if="$route.query && $route.query.id" style="height: 100%">
        <Header :title="groupTitle" />
        <div class="content-box">
          <ChatBox
            :chatArray="currentChatArray"
            :isChatLoaded="isChatLoaded[$route.query.id]"
            :type="groupType"
            @loadChatList="getChatData($route.query.id)"
          />
        </div>
        <TextArea @sendMsg="handleSendMsg" />
      </div>

      <div v-else class="content">
        <img src="@/assets/icon.png" alt="icon" class="icon-img">
      </div>
    </div>
  </div>
</template>

<script>
import FriendList from './childComps/GroupList'
import ChatBox from './childComps/ChatBox'
import TextArea from './childComps/TextArea'
import Header from '@/components/Header'

import { reqGroupDetail, reqChatList } from '@/api/group'

export default {
  components: {
    FriendList,
    ChatBox,
    TextArea,
    Header
  },
  async mounted () {
    if (this.$route.query && this.$route.query.id) {
      this.chatInfo = []
      this.isChatLoaded[this.$route.query.id] = false
      await this.getGroupData(this.$route.query.id)
      await this.getChatData(this.$route.query.id)
      // 将未读消息设为0
      this.$store.commit('CLEAR_MESSAGE_COUNT', this.$route.query.id)
      this.$socket.emit('join_room', { group_id: this.$route.query.id, user_id: this.$store.state.User._id })
    }
  },
  data () {
    return {
      groupInfo: null,
      groupTitle: '',
      groupType: '',
      chatInfo: [],
      isChatLoaded: {},
      currentChatArray: null
    }
  },
  watch: {
    '$route.query': async function (newVal, oldVal) {
      if (newVal.id) {
        this.chatInfo = []
        this.isChatLoaded[newVal.id] = false
        await this.getGroupData(newVal.id)
        await this.getChatData(newVal.id)
        // 将未读消息设为0
        this.$store.commit('CLEAR_MESSAGE_COUNT', newVal.id)
        // socket加入、退出房间
        if (oldVal.id) {
          this.$socket.emit('leave_room', { group_id: oldVal.id, user_id: this.$store.state.User._id })
        }
        this.$socket.emit('join_room', { group_id: newVal.id, user_id: this.$store.state.User._id })
      }
    }
  },
  sockets: {
    receive_msg (msg) {
      this.chatInfo.unshift(msg)
      this.currentChatArray = this.chatInfo.concat().reverse()
      this.$bus.$emit('updateChatList', { group: msg.group, time: msg.create_at })
      // 聊天框自动定位到底部
      this.$bus.$emit('scrollToBottom')
    }
  },
  methods: {
    async getGroupData (id) {
      if (id) {
        const res = await reqGroupDetail(id)
        if (res) {
          if (res.code === 0) {
            this.groupInfo = res.data
            this.groupType = res.data.type
            // 获取群聊名称
            if (this.groupInfo.type === 'single') {
              this.groupTitle = this.$route.query.title
            } else {
              this.groupTitle = res.data.group_name
            }
          } else {
            this.$message.error(res.msg)
          }
        }
      }
    },
    async getChatData (groupId) {
      let skip = 0
      if (!this.isChatLoaded[groupId]) {
        skip = this.chatInfo.length
        const res = await reqChatList(groupId, skip)
        if (res) {
          if (res.code === 0) {
            if (res.data.length === 0) {
              this.isChatLoaded[groupId] = true
            } else {
              res.data.forEach(i => this.chatInfo.push(i))
              this.currentChatArray = this.chatInfo.concat().reverse()
            }
          } else {
            this.$message.error(res.msg)
          }
        }
        this.$forceUpdate()
      }
    },
    handleSendMsg (msg) {
      // 当前聊天框内消息列表更新
      this.chatInfo.unshift(msg)
      this.currentChatArray = this.chatInfo.concat().reverse()
      // 修改列表中的时间显示
      this.$bus.$emit('updateChatList', { group: msg.group, time: msg.create_at })
      // 聊天框自动定位到底部
      this.$bus.$emit('scrollToBottom')
    }
  }
}
</script>

<style lang="scss" scoped>
.content-box {
  height: 350px;
  border-bottom: 1px solid #DCDFE6;
}

.content {
  width: 100%;
  height: 100%;
  position: relative;
  .icon-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
<template>
  <div class="container">
    <div class="chat-tool-bar">
      <el-popover
        placement="top-start"
        title="表情"
        width="380"
        trigger="click"
      >
        <span v-for="item in emojiList" :key="item" class="emoji" @click="clickEmoji(item)">
          {{item}}
        </span>
        <i slot="reference" class="el-icon-s-opportunity" />
      </el-popover>
      <i class="el-icon-chat-dot-round" />
    </div>
    <el-input
      type="textarea"
      :rows="4"
      placeholder="请输入聊天信息"
      v-model="message">
    </el-input>
    <el-button
      type="primary"
      size="small"
      class="send-btn"
      @click="handleSendMsg"
      :disabled="message.trim() === ''"
    >
      发送
    </el-button>
  </div>
</template>

<script>
import { reqSendMsg } from '@/api/group'

export default {
  data () {
    return {
      message: '',
      emojiList: []
    }
  },
  mounted () {
    this.emojiList = [
      '😀', '😄', '😅', '🤣', '😂', '😉', '😊', '😍', '😘', '😜',
      '😝', '😏', '😒', '🙄', '😔', '😴', '😷', '🤮', '🥵', '😎',
      '😮', '😰', '😭', '😱', '😩', '😡', '💀', '👽', '🤓', '🥳',
      '😺', '😹', '😻', '🤚', '💩', '👍', '👎', '👏', '🙏', '💪',
      '👀', '👌'
    ]
  },
  methods: {
    clickEmoji (emoji) {
      this.message += emoji
    },
    async handleSendMsg () {
      const res = await reqSendMsg(this.$route.query.id, this.$store.state.User._id, this.message)
      if (res) {
        if (res.code === 0) {
          this.message = ''
          this.$socket.emit('send_msg', {
            user_id: this.$store.state.User._id,
            group_id: this.$route.query.id,
            chat_id: res.data._id
          })
          this.$emit('sendMsg', res.data)
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
  -webkit-app-region: no-drag;
  width: 100%;
  height: calc(100vh - 70px - 350px);
  position: relative;
}

.chat-tool-bar {
  font-size: 20px;
  padding: 0 10px;
  i {
    margin: 5px 0;
    padding-left: 5px;
    color: #909399;
    cursor: pointer;
  }
}

.emoji {
  display: inline-block;
  text-align: center;
  font-size: 18px;
  line-height: 34px;
  width: 34px;
  cursor: pointer;
}

.send-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>

<style>
.el-textarea__inner {
  border: none;
  resize: none;
}

.el-textarea__inner::-webkit-scrollbar {
	width: 10px;
	height: 16px;
	background-color: #F5F5F5;
}

.el-textarea__inner::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #DDD;
}
</style>
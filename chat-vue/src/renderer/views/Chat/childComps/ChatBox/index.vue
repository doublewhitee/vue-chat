<template>
  <div class="container" @mousewheel="handleMouseWheel" id="chatbox">
    <div v-show="isChatLoaded || loading" style="text-align: center; margin-top: 5px">
      <i v-if="loading && !isChatLoaded" class="el-icon-loading" />
      <div v-else style="font-size: 12px; color: #999">-全部聊天加载完毕-</div>
    </div>
    <div ref="chatBar" />
    <div v-for="chat in chatArray" :key="chat._id">
      <div class="time-bubble">{{ getTimeInfo(chat.create_at) }}</div>
      <div class="chat-bubble">
        <img
          :src="BASE_IMG_URL + chat.user.avatar"
          alt="avatar"
          class="chat-avatar"
          v-if="chat.user._id !== $store.state.User._id"
        />
        <div style="width: 100%">
          <div class="chat-name" v-if="type === 'group' && chat.user._id !== $store.state.User._id">
            {{ chat.user.username }}
          </div>
          <div :class="chat.user._id !== $store.state.User._id ? 'chat-receive' : 'chat-send'">
            <div v-if="chat.type === 'audio'">
              <AudioWave :url="chat.content" :ref="chat._id" />
            </div>
            <div v-else>{{ chat.content }}</div>
          </div>
        </div>
        <img
          :src="BASE_IMG_URL + chat.user.avatar"
          alt="avatar"
          class="chat-avatar"
          v-if="chat.user._id === $store.state.User._id"
          style="margin-left: 0px; margin-right: 10px;"
        />
        </div>
    </div>
  </div>
</template>

<script>
import { BASE_IMG_URL } from '@/config/constant'

import { getTimeInfo } from '@/utils/time'
import { throttle } from '@/utils'

import AudioWave from '@/components/AudioWave'

export default {
  components: {
    AudioWave
  },
  props: {
    type: {
      type: String,
      default: 'single'
    },
    isChatLoaded: {
      type: Boolean,
      default: false
    },
    chatArray: {
      type: Array,
      default () {
        return []
      }
    }
  },
  mounted () {
    this.$bus.$on('scrollToBottom', () => {
      this.scrollFlag = true
    })
  },
  destroyed () {
    this.$bus.$off('scrollToBottom')
  },
  data () {
    return {
      chatList: null,
      loading: false,
      scrollFlag: false,
      BASE_IMG_URL
    }
  },
  watch: {
    chatArray () {
      this.loading = false
    }
  },
  updated () {
    if (this.scrollFlag) {
      // 自动定位到底部
      const ele = document.getElementById('chatbox')
      ele.scrollTop = ele.scrollHeight
      this.scrollFlag = false
    }
  },
  computed: {
    getTimeInfo: function () {
      return time => {
        return getTimeInfo(time, 'detail')
      }
    }
  },
  methods: {
    handleMouseWheel (e) {
      // 判断是否向上滚动
      const isUp = e.deltaY < 0
      if (isUp && !this.loading && !this.isChatLoaded) {
        this.throttleWheel()
      }
    },

    throttleWheel:
      throttle(function () {
        // 顶部元素距离顶部高度
        const top = this.$refs.chatBar.getBoundingClientRect().top
        // 如果移动到顶部
        if (top === 69) {
          this.$emit('loadChatList')
          this.loading = true
        }
      }, 500)
  }
}
</script>

<style lang="scss" scoped>
$send-color: #B3D8FF;
$receive-color: #F4F4F5;

.container {
  height: calc(100vh - 250px);
  overflow-y: auto;
  -webkit-app-region: no-drag;
}

.container::-webkit-scrollbar {
	width: 10px;
	background-color: #F5F5F5;
}

.container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #DDD;
}

.time-bubble {
  font-size: 12px;
  text-align: center;
  padding: 10px;
  color: #999;
}

.chat-bubble {
  font-size: 14px;
  clear: both;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .chat-avatar {
    width: 40px;
    height: 40px;
    border-radius: 100px;
    margin-left: 10px;
  }
  .chat-name {
    font-size: 10px;
    color: #999;
    margin-left: 10px;
    margin-top: 5px;
  }
  .chat-receive {
    display: inline-block;
    position: relative;
    max-width: 50%;
    word-wrap: break-word;
    background-color: $receive-color;
    padding: 10px;
    margin: 5px 10px;
    border-radius: 5px;
  }
  .chat-receive::before {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    left: -5px;
    border-top: 5px solid transparent;
    border-right: 5px solid $receive-color;
    border-bottom: 5px solid transparent;
  }
  .chat-send {
    position: relative;
    float: right;
    justify-items: right;
    max-width: 50%;
    word-wrap: break-word;
    background-color: $send-color;
    padding: 10px;
    margin: 5px 10px;
    border-radius: 5px;
  }
  .chat-send::before {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    right: -5px;
    border-top: 5px solid transparent;
    border-left: 5px solid $send-color;
    border-bottom: 5px solid transparent;
  }
}
</style>
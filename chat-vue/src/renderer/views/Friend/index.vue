<template>
  <div style="height: 100%; display: flex;">
    <FriendList />
    
    <div style="width: 600px">
      <div v-if="$route.query && $route.query.id">
        <div v-if="$route.query.id === 'new_friend'">
          <Header title="新的朋友" />
          <div v-if="newFriendList.length > 0">
            <div v-for="item in newFriendList" :key="item._id" class="new-friend-item">
              <div class="new-friend-detail">
                <img :src="BASE_IMG_URL + item.detail[0].avatar" alt="avatar" class="friend-avatar" />
                <div>
                  <div class="friend-title">{{ item.detail[0].username }}</div>
                  <div class="friend-content">{{ item.detail[item.detail.length - 1].content }}</div>
                </div>
              </div>
              <div>
                <el-button size="small" @click="handleClickDetail(item.detail)">查看</el-button>
                <el-dropdown
                  split-button
                  type="primary"
                  size="small"
                  @click="handleClickAccept(item)"
                  @command="handleCommand"
                >
                  接受
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{ command: 'ignore', id: item._id }">忽略</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </div>

          <div v-else class="prompt">还没有收到好友请求哦</div>
        </div>
      </div>

      <div v-else class="content">
        <img src="@/assets/icon.png" alt="icon" class="icon-img">
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <div
        v-if="currentUserInfo && currentUserInfo.username"
        style="display: flex; align-items: center"
      >
        <el-image
          style="width: 70px; height: 70px; padding-right: 20px"
          :src="BASE_IMG_URL + currentUserInfo.avatar"
          alt="avatar"
          :preview-src-list="[BASE_IMG_URL + currentUserInfo.avatar]"
        />
        <div>
          <div style="font-weight: bold; font-size: 18px">{{ currentUserInfo.username }}</div>
          <div style="padding-top: 10px; font-size: 12px">{{ `手机号：${currentUserInfo.phone}` }}</div>
        </div>
      </div>
      <el-divider />

      <div v-if="dialogTitle === '详情'">
        <div style="font-weight: bold; font-size: 16px; padding-bottom: 10px">消息记录</div>
        <div class="history-container">
          <div v-for="(i, index) in currentUserInfo.content" :key="index" class="history-item">
            {{ `${currentUserInfo.username}：${i}` }}
          </div>
        </div>
      </div>

      <div v-else>
        <div style="display: flex; align-items: center">
          <div style="width: 100px">好友备注</div>
          <el-input placeholder="请输入备注名" v-model="nickname" />
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end">
          <el-button type="primary" @click="handleAdd" :loading="loading">添加好友</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FriendList from './childComps/FriendList'
import Header from '@/components/Header'

import { reqAcceptFriend, reqNewFriendList, reqIgnoreRequest } from '@/api/friend'
import { BASE_IMG_URL } from '@/config/constant'

export default {
  components: {
    FriendList,
    Header
  },
  data () {
    return {
      newFriendList: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      currentUserInfo: {},
      currentGroupId: '',
      nickname: '',
      BASE_IMG_URL
    }
  },
  watch: {
    '$route.query': async function (newVal, oldVal) {
      console.log(newVal, oldVal)
      if (newVal.id === 'new_friend') {
        await this.getNewFriendList()
      }
    }
  },
  methods: {
    handleClickDetail (info) {
      const detail = JSON.parse(JSON.stringify(info[0]))
      detail.content = []
      info.forEach(i => {
        detail.content.push(i.content)
      })
      this.currentUserInfo = detail
      this.dialogTitle = '详情'
      this.dialogVisible = true
    },
    handleClickAccept (info) {
      const detail = info.detail[0]
      this.currentUserInfo = detail
      this.currentGroupId = info._id
      this.nickname = detail.username
      this.dialogTitle = '好友备注'
      this.dialogVisible = true
    },
    async handleAdd () {
      this.loading = true
      const res = await reqAcceptFriend(this.$store.state.User._id, this.currentUserInfo._id, this.nickname.trim(), this.currentGroupId)
      if (res) {
        this.loading = false
        this.dialogVisible = false
        if (res.code === 0) {
          this.$bus.$emit('getFriendList')
          this.$store.commit('CHANGE_MESSAGE_COUNT', { id: 'new_friend', count: -1 })
          await this.getNewFriendList()
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    async handleCommand (info) {
      if (info.command === 'ignore') {
        await this.$confirm('您确定要退出登录吗？').then(async () => {
          const res = await reqIgnoreRequest(info.id)
          if (res) {
            if (res.code === 0) {
              this.$message.success('已忽略')
              this.$store.commit('CHANGE_MESSAGE_COUNT', { id: 'new_friend', count: -1 })
              await this.getNewFriendList()
            } else {
              this.$message.error(res.msg)
            }
          }
        }).catch(() => {
          this.$message.info('已取消')
        })
      }
    },

    async getNewFriendList () {
      const res = await reqNewFriendList(this.$store.state.User._id)
      if (res) {
        if (res.code === 0) {
          this.newFriendList = res.data
        } else {
          this.$message.error(res.msg)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.new-friend-item {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  padding: 15px 0;
  margin: 0 60px;
  justify-content: space-between;
  border-bottom: 1px solid #DCDFE6;
  .new-friend-detail {
    display: flex;
    align-items: center;
    .friend-avatar {
      width: 60px;
      height: 60px;
      margin: 0 20px 0 10px;
    }
    .friend-title {
      font-weight: bold;
    }
    .friend-content {
      font-size: 12px;
      padding-top: 5px;
      color: #777;
    }
  }
}

.history-container {
  height: 100px;
  overflow-y: auto;
  .history-item {
    font-size: 14px;
    padding: 5px 0;
  }
}

.history-container::-webkit-scrollbar {
	width: 10px;
	height: 16px;
	background-color: #F5F5F5;
}

.history-container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #DDD;
}

.prompt {
  text-align: center;
  margin: 40px 60px 0px 60px;
  padding-bottom: 20px;
  font-size: 14px;
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
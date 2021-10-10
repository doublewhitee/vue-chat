<template>
  <div style="height: 100%; display: flex;">
    <FriendList />
    
    <div style="width: 600px;">
      <div v-if="$route.query && $route.query.id" style="height: 100%">
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

        <div v-else class="user-info-container">
          <div class="user-info">
            <div style="display: flex; align-items: center">
              <el-image
                style="width: 80px; height: 80px; margin-right: 30px"
                :src="BASE_IMG_URL + currentUserInfo.avatar"
                alt="avatar"
                :preview-src-list="[BASE_IMG_URL + currentUserInfo.avatar]"
              />
              <div style="font-weight: bold; font-size: 18px">{{ currentUserInfo.username }}</div>
            </div>
            <el-divider />
            <div>
              <div class="user-info-detail">
                <span class="user-info-detail-title">备注名</span>
                <span v-if="!editNicknameMode">{{ currentUserInfo.friend_name }}</span>
                <div v-else style="display: flex">
                  <el-input v-model="nickname" size="small" />
                  <el-button size="mini" type="primary" @click="handleConfirmChangeName" style="margin-left: 10px">确认</el-button>
                </div>
              </div>
              <div class="user-info-detail">
                <span class="user-info-detail-title">手 机</span>
                <span>{{ currentUserInfo.phone }}</span>
              </div>
              <div class="user-info-detail">
                <span class="user-info-detail-title">_id</span>
                <span>{{ currentUserInfo._id }}</span>
              </div>
            </div>
            <div style="text-align: center; margin-top: 50px">
              <el-button type="primary" style="margin-right: 10px">聊天</el-button>
              <el-dropdown trigger="click" @command="handleFriendCommand">
                <el-button>更多<i class="el-icon-arrow-down el-icon--right" /></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="changeName">修改备注</el-dropdown-item>
                  <el-dropdown-item divided command="delete">删除好友</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
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

import { reqAcceptFriend, reqNewFriendList, reqIgnoreRequest, reqChangeNickname, reqDeleteFriend } from '@/api/friend'
import { reqUserInfo } from '@/api/user'
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
      editNicknameMode: false,
      nickname: '',
      BASE_IMG_URL
    }
  },
  watch: {
    '$route.query': async function (newVal) {
      if (newVal.id) {
        if (newVal.id === 'new_friend') {
          await this.getNewFriendList()
        } else {
          this.editNicknameMode = false
          const res = await reqUserInfo(this.$store.state.User._id, newVal.id)
          if (res) {
            if (res.code === 0) {
              this.currentUserInfo = res.data
              this.currentUserInfo.friend_name = res.friend.friend_name
            } else {
              this.$message.error(res.msg)
            }
          }
        }
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
        await this.$confirm('您确定要忽略吗？').then(async () => {
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
    async handleFriendCommand (command) {
      if (command === 'changeName') {
        this.nickname = this.currentUserInfo.friend_name
        this.editNicknameMode = true
      } else if (command === 'delete') {
        await this.$confirm('您确定要删除该好友吗？').then(async () => {
          const res = await reqDeleteFriend(this.$store.state.User._id, this.currentUserInfo._id)
          if (res) {
            if (res.code === 0) {
              this.$router.replace({ path: '/chat/friend' })
              this.$message.success('已成功删除好友!')
              this.$bus.$emit('getFriendList')
            } else {
              this.$message.error(res.msg)
            }
          }
        }).catch(() => {
          this.$message.info('已取消')
        })
      }
    },
    async handleConfirmChangeName () {
      const res = await reqChangeNickname(this.$store.state.User._id, this.currentUserInfo._id, this.nickname)
      if (res) {
        this.editNicknameMode = false
        if (res.code === 0) {
          this.currentUserInfo.friend_name = this.nickname
          this.$message.success('修改好友备注成功！')
          this.$bus.$emit('getFriendList')
        } else {
          this.$message.error(res.msg)
        }
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

.user-info-container {
  position: relative;
  width: 100%;
  height: 100%;
  .user-info {
    -webkit-app-region: no-drag;
    position: absolute;
    width: 400px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .user-info-detail {
    margin: 10px 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    .user-info-detail-title {
      display: inline-block;
      font-size: 14px;
      width: 120px;
      text-align: center;
      color: #777;
    }
  }
}

.el-dropdown-menu {
  -webkit-app-region: no-drag;
}
</style>
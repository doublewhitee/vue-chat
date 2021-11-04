<template>
  <div style="height: 100%; display: flex;">
    <FriendList />
    <div style="width: 600px">
      <div v-if="$route.query && $route.query.id" style="height: 100%">
        <Header :title="groupTitle" :type="groupType" @showMoreInfo="handleShowMoreInfo" />
        <div class="content-box">
          <ChatBox
            :chatArray="currentChatArray"
            :isChatLoaded="isChatLoaded[$route.query.id]"
            :type="groupType"
            @loadChatList="getChatData($route.query.id)"
          />
        </div>
        <TextArea @sendMsg="handleSendMsg" @openHistory="handleHistory" />
      </div>

      <div v-else class="content">
        <img src="@/assets/icon.png" alt="icon" class="icon-img">
      </div>
    </div>

    <el-dialog
      title="历史记录"
      :visible.sync="dialogVisible"
      width="60%"
    >
      <el-input v-model="searchInput" @input="handleInputChange" placeholder="请输入要查询的聊天记录内容">
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <el-divider />

      <div v-if="historyMsg !== ''" class="history-msg">
        {{ historyMsg }}
      </div>

      <div v-else>
        <div v-for="item in historyList" :key="item._id" class="history-item">
          <img
            :src="BASE_IMG_URL + item.user.avatar"
            alt="avatar"
          />
          <div>
            <div class="history-name">{{ item.user.username }}</div>
            <div>{{ getTimeInfo(item.create_at) }}</div>
            <div v-html="highlightText(searchInput, item.content)" class="highlight-container" />
          </div>
        </div>
        <el-pagination
          small
          style="text-align: center"
          layout="prev, pager, next"
          :total="historyTotal"
          :page-size="3"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-dialog>

    <el-drawer
      title="群聊详情"
      v-if="groupType === 'group'"
      size="40%"
      :visible.sync="isDrawerShow"
    >
      <div class="drawer-con">
        <div>
          <el-input
            v-model="searchGroupMemberInput"
            @input="handleSearchInputChange"
            placeholder="输入查找群成员"
            size="mini"
            style="margin-bottom: 15px;"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
          <el-row>
            <el-col
              v-for="(i, index) in groupMemberList"
              :key="i._id"
              :span="6"
              class="drawer-group"
            >
              <div v-if="isShowMoreMember || (!isShowMoreMember && index < memberShowIndex)">
                <el-badge value="群主" class="item" type="primary" v-if="groupInfo.group_admin._id === i._id">
                  <img :src="BASE_IMG_URL + i.avatar" alt="avatar" class="drawer-group-avatar" />
                  <div class="drawer-group-username">{{ i.username.length > 4 ? i.username.slice(0,4) + '...' : i.username }}</div>
                </el-badge>

                <div v-else>
                  <img :src="BASE_IMG_URL + i.avatar" alt="avatar" class="drawer-group-avatar" />
                  <div class="drawer-group-username">{{ i.username.length > 4 ? i.username.slice(0,4) + '...' : i.username }}</div>
                </div>
              </div>
            </el-col>

            <el-col :span="6" class="drawer-group" style="cursor: pointer">
              <div @click="handleEditMember('add')">
                <div class="drawer-group-avatar drawer-group-tool">
                  <i 
                    class="el-icon-plus"
                    style="font-size: 22px; color: #DCDFE6;"
                  />
                </div>
                <div class="drawer-group-username">添加成员</div>
              </div>
            </el-col>

            <el-col :span="6" class="drawer-group" style="cursor: pointer" v-if="groupInfo.group_admin._id === $store.state.User._id">
              <div @click="handleEditMember('drop')">
                <div class="drawer-group-avatar drawer-group-tool">
                  <i 
                    class="el-icon-minus"
                    style="font-size: 22px; color: #DCDFE6;"
                  />
                </div>
                <div class="drawer-group-username">踢出群聊</div>
              </div>
            </el-col>
          </el-row>

          <div v-if="groupMemberList.length === 0" class="drawer-prompt">未查找到相关成员</div>
          <div
            v-else-if="groupMemberList.length > memberShowIndex"
            class="drawer-prompt"
            style="cursor: pointer"
            @click="isShowMoreMember = !isShowMoreMember"
          >{{ isShowMoreMember ? '收起成员列表' : '加载更多群成员' }}</div>
          <div v-else class="drawer-prompt">已加载全部群成员</div>
        </div>
        
        <div>
          <div class="info-row">
            <div style="display: flex; align-items: center">
              <div style="width: 80px">群名称</div>
              <div v-if="!isEditMode">{{ groupInfo.group_name }}</div>
              <el-input v-else v-model="editTitleInput" size="mini" style="padding-right: 10px;"></el-input>
            </div>
            <div v-if="groupInfo.group_admin._id === $store.state.User._id">
              <el-button size="mini" v-if="!isEditMode" @click="handleEditGroupTitle">修改</el-button>
              <el-button size="mini" type="primary" v-else @click="handleSaveGroupChange('group_name')">保存</el-button>
            </div>
          </div>
          <div class="info-row">
            <div style="display: flex; align-items: center">
              <div style="width: 80px">群头像</div>
              <el-image
                :src="BASE_IMG_URL + groupInfo.group_img"
                alt="avatar"
                :preview-src-list="[BASE_IMG_URL + groupInfo.group_img]"
                style="width: 50px; height: 50px"
              />
            </div>
            <el-button size="mini" v-if="groupInfo.group_admin._id === $store.state.User._id" @click="handleChangeGroupAvatar">修改</el-button>
          </div>
        </div>
      </div>

      <div style="padding: 10px; position: absolute; width: 100%; bottom: 10px">
        <div>
          <el-button
            type="text"
            style="width: 100%; margin-bottom: 10px; color: #F56C6C"
            @click="handleExitGroup"
          >
            退出该群
          </el-button>
        </div>
        <div v-if="groupInfo.group_admin._id === $store.state.User._id">
          <el-button type="danger" style="width: 100%;" @click="handleDeleteGroup">解散群聊</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="修改群头像" :visible.sync="avatarDialogVisible">
      <div style="text-align: center" v-if="avatarDialogVisible">
        <ImgCutter :imgUrl="groupInfo.group_img" mode="group_avatar" @imgInfo="handleUploadGroupAvatar" />
        <div style="font-size: 12px; padding-top: 10px;">点击修改头像</div>
      </div>
    </el-dialog>

    <GroupModal
      ref="groupModal"
      :dialogTitle="modalTitle"
      :dialogVisible="modalVisible"
      :friendList="friendList"
      :checkedList="checkedList"
      :loading="loading"
      @clickItem="handleClickListItem"
      @changeInput="handleChangeInput"
      @submit="handleSubmit"
      @close="modalVisible=false"
    />
  </div>
</template>

<script>
import FriendList from './childComps/GroupList'
import ChatBox from './childComps/ChatBox'
import TextArea from './childComps/TextArea'
import GroupModal from './childComps/GroupModal'
import Header from '@/components/Header'
import ImgCutter from '@/components/ImageCutter'

import {
  reqGroupDetail,
  reqChatList,
  reqChatHistory,
  reqUpdateGroupMembers,
  reqUpdateGroupInfo,
  reqExitGroup,
  reqDeleteGroup
} from '@/api/group'
import { reqFriendList } from '@/api/friend'
import { debounce, highlightText } from '@/utils'
import { getTimeInfo } from '@/utils/time'
import { BASE_IMG_URL } from '@/config/constant'

const historyPrompt = '请输入想要查找的聊天记录'

export default {
  components: {
    FriendList,
    ChatBox,
    TextArea,
    GroupModal,
    Header,
    ImgCutter
  },
  async mounted () {
    this.historyMsg = historyPrompt
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
      currentChatArray: null,
      historyList: [],
      dialogVisible: false,
      searchInput: '',
      historyMsg: '',
      currentPage: 1,
      historyTotal: 0,
      isDrawerShow: false,
      memberShowIndex: 3,
      groupMemberList: [],
      searchGroupMemberInput: '',
      isShowMoreMember: false,
      modalTitle: '',
      modalVisible: false,
      loading: false,
      friendList: [],
      checkedList: [],
      isEditMode: false,
      editTitleInput: '',
      avatarDialogVisible: false,
      BASE_IMG_URL
    }
  },
  computed: {
    getTimeInfo: function () {
      return time => {
        return getTimeInfo(time, 'detail')
      }
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
      } else {
        if (oldVal.id) {
          this.$socket.emit('leave_room', { group_id: oldVal.id, user_id: this.$store.state.User._id })
        }
      }
    },
    groupInfo (val) {
      if (val.type === 'group') {
        if (val.group_admin._id === this.$store.state.User._id) {
          this.memberShowIndex = 2
        }
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
    },
    count_change (data) {
      this.$bus.$emit('updateChatList', { group: data.id, time: data.create_at })
    },
    async update_current_group_info () {
      await this.getGroupData(this.$route.query.id)
      if (!this.groupInfo.user_list.some(i => i._id === this.$store.state.User._id)) {
        this.$router.replace({ path: '/chat/group' })
      }
      this.isDrawerShow = false
    },
    delete_current_group () {
      this.$router.replace({ path: '/chat/group' })
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
              this.groupTitle = `${res.data.group_name}(${res.data.user_list.length})`
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
    },
    handleHistory () {
      this.dialogVisible = true
      this.searchInput = ''
      this.historyTotal = 0
      this.historyList = []
      this.historyMsg = historyPrompt
    },
    handleInputChange:
      debounce(async function () {
        this.currentPage = 1
        if (this.searchInput === '') {
          this.historyMsg = historyPrompt
        } else {
          this.searchChatHistory()
        }
      }, 500),
    async searchChatHistory () {
      this.historyMsg = '加载中...'
      const res = await reqChatHistory(this.$route.query.id, this.searchInput, this.currentPage)
      if (res) {
        if (res.code === 0) {
          this.historyMsg = ''
          this.historyTotal = res.total
          this.historyList = res.data
        } else {
          this.historyMsg = res.msg
        }
      }
    },
    handleCurrentChange (page) {
      this.currentPage = page
      this.searchChatHistory()
    },
    handleShowMoreInfo () {
      this.isDrawerShow = true
      this.groupMemberList = this.groupInfo.user_list
      this.isShowMoreMember = false
      this.searchGroupMemberInput = ''
      this.isEditMode = false
    },
    handleSearchInputChange:
      debounce(async function () {
        if (this.searchGroupMemberInput === '') {
          this.groupMemberList = this.groupInfo.user_list
        } else {
          const regex = new RegExp(this.searchGroupMemberInput, 'g')
          this.groupMemberList = []
          this.groupInfo.user_list.forEach(i => {
            if (regex.test(i.username)) {
              this.groupMemberList.push(i)
            }
          })
        }
      }, 500),
    async handleEditMember (type) {
      if (type === 'drop') {
        this.modalTitle = '群成员管理'
        this.checkedList = []
        this.friendList = []
        this.groupInfo.user_list.forEach(i => {
          if (i._id !== this.$store.state.User._id) {
            this.friendList.push({
              _id: i._id,
              friend_id: i,
              isChecked: false
            })
          }
        })
      } else {
        this.modalTitle = '邀请群成员'
        this.checkedList = []
        await this.getFriendList('', type = 'init')
      }
      this.$refs.groupModal.clear()
      this.modalVisible = true
    },
    handleChangeInput (search) {
      if (this.modalTitle === '邀请群成员') {
        this.getFriendList(search)
      } else {
        const regex = new RegExp(search, 'g')
        this.friendList = []
        this.groupInfo.user_list.forEach(i => {
          if (i._id !== this.$store.state.User._id && regex.test(i.username)) {
            this.friendList.push({
              _id: i._id,
              friend_id: i,
              isChecked: false
            })
          }
        })
        this.friendList.forEach(i => {
          if (this.checkedList.some(item => item.friend_id._id === i.friend_id._id)) {
            i.isChecked = true
          } else {
            i.isChecked = false
          }
        })
      }
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
    async getFriendList (input = '', type = '') {
      this.loading = true
      const res = await reqFriendList(this.$store.state.User._id, input)
      if (res) {
        if (res.code === 0) {
          this.friendList = res.data
          // 初始化checkedList
          if (this.modalTitle === '邀请群成员' && type === 'init') {
            const ids = []
            this.groupInfo.user_list.forEach(k => {
              ids.push(k._id)
            })
            this.friendList.forEach(i => {
              if (ids.indexOf(i.friend_id._id) !== -1) {
                this.checkedList.push(i)
              }
            })
          }
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
    },
    async handleSubmit (info = '') {
      this.loading = true
      let res
      if (this.modalTitle === '邀请群成员') {
        res = await reqUpdateGroupMembers(this.groupInfo._id, 'add', info)
      } else {
        const ids = []
        this.checkedList.forEach(i => {
          ids.push(i.friend_id._id)
        })
        res = await reqUpdateGroupMembers(this.groupInfo._id, 'drop', ids)
      }
      if (res) {
        if (res.code === 0) {
          // 更新
          this.$bus.$emit('refreshChatList')
          this.$socket.emit('update_group', { group_id: this.groupInfo._id, user_ids: res.data.user_list, type: 'update' })
          this.modalVisible = false
          this.$message.success('更新群成员成功！')
          await this.getGroupData(this.$route.query.id)
          this.isDrawerShow = false
        } else {
          this.$message.error(res.msg)
        }
      }
      this.loading = false
    },
    async handleSaveGroupChange (key) {
      let res = null
      if (key === 'group_name') {
        if (this.editTitleInput !== this.groupInfo.group_name) {
          res = await reqUpdateGroupInfo(this.groupInfo._id, key, this.editTitleInput)
        }
        this.isEditMode = false
      }
      if (res) {
        if (res.code === 0) {
          // 更新
          this.$bus.$emit('refreshChatList')
          this.$socket.emit('update_group', { group_id: this.groupInfo._id, user_ids: res.data.user_list, type: 'update' })
          this.modalVisible = false
          this.$message.success('更新群信息成功！')
          await this.getGroupData(this.$route.query.id)
          this.isDrawerShow = false
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    async handleUploadGroupAvatar (info) {
      const res = await reqUpdateGroupInfo(this.groupInfo._id, 'group_img', info.name)
      if (res) {
        if (res.code === 0) {
          // 更新
          this.$bus.$emit('refreshChatList')
          this.$socket.emit('update_group', { group_id: this.groupInfo._id, user_ids: res.data.user_list, type: 'update' })
          this.modalVisible = false
          this.$message.success('更新群信息成功！')
          await this.getGroupData(this.$route.query.id)
          this.isDrawerShow = false
          this.avatarDialogVisible = false
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    handleEditGroupTitle () {
      this.isEditMode = true
      this.editTitleInput = this.groupInfo.group_name
    },
    handleChangeGroupAvatar () {
      this.avatarDialogVisible = true
    },
    async handleExitGroup () {
      await this.$confirm('您确定要退出这个群聊吗？').then(async () => {
        const res = await reqExitGroup(this.groupInfo._id, this.$store.state.User._id)
        if (res) {
          if (res.code === 0) {
            // 更新
            this.$bus.$emit('refreshChatList')
            this.$socket.emit('update_group', { group_id: this.groupInfo._id, user_ids: res.data.user_list, type: 'update' })
            this.isDrawerShow = false
            this.$router.replace({ path: '/chat/group' })
            this.$message.success('退出群聊成功！')
          }
        } else {
          this.$message.error(res.msg)
        }
      }).catch(() => {})
    },
    async handleDeleteGroup () {
      await this.$confirm('您确定要解散这个群聊吗？').then(async () => {
        const res = await reqDeleteGroup(this.groupInfo._id)
        if (res) {
          if (res.code === 0) {
            // 更新
            this.$bus.$emit('refreshChatList')
            const ids = []
            this.groupInfo.user_list.forEach(i => { ids.push(i._id) })
            this.$socket.emit('update_group', { group_id: this.groupInfo._id, user_ids: ids, type: 'delete' })
            this.isDrawerShow = false
            this.$router.replace({ path: '/chat/group' })
            this.$message.success('解散群聊成功！')
          }
        } else {
          this.$message.error(res.msg)
        }
      }).catch(() => {})
    },
    highlightText
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

.history-msg {
  text-align: center;
  margin-left: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  img {
    width: 50px;
    height: 50px;
    margin: 10px;
  }
  div {
    font-size: 12px;
    color: #909399;
  }
  .history-name {
    font-size: 14px;
    font-weight: bold;
    padding-bottom: 5px;
    color: #606266;
  }
}

.highlight-container {
  margin-top: 5px;
  /deep/ div {
    font-size: 12px;
    color: #909399;
  }
  /deep/ span {
    color: #409EFF;
  }
}

.drawer-con {
  padding: 0 15px;
  height: 400px;
  overflow: auto;
  .drawer-prompt {
    font-size: 12px;
    text-align: center;
    color: #999;
  }
  .drawer-group {
    text-align: center;
    .drawer-group-avatar {
      width: 40px;
      height: 40px;
    }
    .drawer-group-username {
      font-size: 12px;
      padding: 3px 0 10px 0;
    }
    .drawer-group-tool {
      line-height: 40px;
      vertical-align: middle;
      margin: 0 auto;
      border: 2px dashed #DCDFE6;
      border-radius: 10px;
    }
  }
}

.drawer-con::-webkit-scrollbar {
	width: 10px;
	height: 16px;
	background-color: #F5F5F5;
}

.drawer-con::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #DDD;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 10px;
}

.el-drawer__container {
  -webkit-app-region: no-drag;
}
</style>
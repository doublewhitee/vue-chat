<template>
  <div class="main">
    <SearchBar @clickAddBtn="handleAddFriend" @searchFriend="getSearchFriend" />
    <List v-if="searchText===''" />
    <SearchList v-else :searchText="searchText" />

    <el-dialog
      title="添加好友"
      :visible.sync="addDialogVisible"
      width="60%"
    >
      <el-input v-model="addSearchInput" @input="handleAddInputChange" placeholder="请输入手机号进行查询">
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <el-divider />
      <div v-if="addUserMsg !== ''" class="add-msg">
        {{ addUserMsg }}
      </div>
      <div v-else>
        <div v-for="i in addUserList" :key="i._id" class="friend-list">
          <div class="friend-item">
            <el-image
              style="width: 50px; height: 50px; padding-right: 20px;"
              :src="BASE_IMG_URL + i.avatar"
              alt="avatar"
            />
            <span>
              <div class="friend-item-title">{{ i.username }}</div>
              <div v-html="highlightText(addSearchInput, `手机：${i.phone}`)" class="highlight-container" />
            </span>
          </div>
          <div style="display: flex; align-items: center">
            <el-button size="small" type="primary" @click="handleAddDetail(i._id)">查看</el-button>
          </div>
        </div>
        <el-pagination
          small
          style="text-align: center"
          layout="prev, pager, next"
          :total="addUserTotal"
          :page-size="3"
          :current-page="addCurrentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-dialog>

    <el-dialog
      title="详情"
      :visible.sync="detailDialogVisible"
      width="40%"
    >
    <div class="detail-container" v-if="detailInfo !== null && detailInfo._id">
      <el-image
        style="width: 80px; height: 80px; padding-right: 20px;"
        :src="BASE_IMG_URL + detailInfo.avatar"
        alt="avatar"
        :preview-src-list="[BASE_IMG_URL + detailInfo.avatar]"
      />
      <div>
        <div class="username">{{ detailInfo.username }}</div>
        <div class="info">{{ `ID: ${detailInfo._id}` }}</div>
        <div class="info">{{ `手机: ${detailInfo.phone}` }}</div>
      </div>
    </div>
    <el-divider />
    <div v-if="detailInfo && !detailInfo.isFriend">
      <el-input
        type="textarea"
        :rows="4"
        placeholder="请输入好友申请"
        v-model="addRequestText"
        style="margin-top: 20px"
      />
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-button type="primary" @click="handleSendAddRequest" :disabled="addRequestText === ''">添加好友</el-button>
      </div>
    </div>
    <div v-else style="margin-top: 20px; text-align: center">
      <span>你们已经是好友啦，快去聊天吧！</span>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'
import List from './List'
import SearchList from './SearchList.vue'

import { reqUserToAdd, reqAddFriend } from '@/api/friend'
import { reqUserInfo } from '@/api/user'
import { debounce, highlightText } from '@/utils'
import { BASE_IMG_URL } from '@/config/constant'

const addPrompt = '请输入手机号进行查询，开始添加好友吧！'

export default {
  components: {
    SearchBar,
    List,
    SearchList
  },
  data () {
    return {
      BASE_IMG_URL,
      addDialogVisible: false,
      addSearchInput: '',
      addUserList: [],
      addUserMsg: addPrompt,
      addCurrentPage: 1,
      addUserTotal: 0, // 搜索出的条目总数
      detailDialogVisible: false,
      detailInfo: null,
      addRequestText: '',
      searchText: ''
    }
  },
  methods: {
    handleAddFriend () {
      this.addDialogVisible = true
      this.addSearchInput = ''
      this.addUserMsg = addPrompt
    },
    // 监听添加好友Input改变
    handleAddInputChange:
      debounce(async function () {
        this.addCurrentPage = 1
        if (this.addSearchInput === '') {
          this.addUserMsg = addPrompt
        } else {
          this.searchAddUserList()
        }
      }, 500),
    handleCurrentChange (page) {
      this.addCurrentPage = page
      this.searchAddUserList()
    },
    async handleAddDetail (id) {
      const res = await reqUserInfo(this.$store.state.User._id, id)
      if (res) {
        if (res.code === 0) {
          this.detailDialogVisible = true
          this.detailInfo = res.data
          this.detailInfo.isFriend = res.friend
          this.addRequestText = ''
        } else {
          this.$message.error(res.msg)
        }
      }
    },
    async handleSendAddRequest () {
      const res = await reqAddFriend(this.addRequestText, this.$store.state.User._id, this.detailInfo._id)
      if (res) {
        if (res.code === 0) {
          this.detailDialogVisible = false
          if (!res.data) {
            this.$socket.emit('add_friend', { friend_id: this.detailInfo._id })
          }
          this.$message.success('已成功发送好友请求')
        } else {
          this.$message.error(res.msg)
        }
      }
    },

    async searchAddUserList () {
      this.addUserMsg = '加载中...'
      const res = await reqUserToAdd(this.addSearchInput, this.addCurrentPage, this.$store.state.User._id)
      if (res) {
        if (res.code === 0) {
          this.addUserMsg = ''
          this.addUserTotal = res.total
          this.addUserList = res.data
        } else {
          this.addUserMsg = res.msg
        }
      }
    },
    getSearchFriend (searchText) {
      this.searchText = searchText
    },
    highlightText
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

.add-msg {
  text-align: center;
  margin: 30px 0 0 10px;
}

.friend-list {
  display: flex;
  justify-content: space-between;
  .friend-item {
    display: flex;
    align-items: center;
    .friend-item-title {
      font-weight: bold;
      font-size: 16px;
      color: #606266;
    }
  }
  .friend-item div {
    margin: 15px 0;
  }
}

.friend-list:hover {
  background: #F2F6FC radial-gradient(#DDD, #FFF);
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

.detail-container {
  display: flex;
  align-items: center;
  .username {
    font-weight: bold;
    font-size: 16px;
    color: #606266;
  }
  .info {
    margin-top: 10px;
    font-size: 12px;
  }
}

.el-divider--horizontal {
  margin-bottom: 0px;
}
</style>
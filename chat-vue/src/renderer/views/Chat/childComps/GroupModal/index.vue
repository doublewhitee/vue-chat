<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    width="60%"
  >
    <div style="display: flex">
      <div class="list-col">
        <div style="height: 30px">
          <el-input size="mini" v-model="searchInput" @input="handleChangeInput">
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </div>
        <div class="add-list" v-if="!loading">
          <div v-if="friendList.length > 0">
            <div v-for="friend in friendList" :key="friend._id" class="list-item" @click="handleClickListItem(friend)">
              <el-checkbox v-model="friend.isChecked" @click.native.prevent="" />
              <img
                class="list-item-img"
                :src="BASE_IMG_URL + friend.friend_id.avatar"
                alt="avatar"
                style="width: 45px; height: 45px"
              />
              <div class="friend-item-title">{{ friend.friend_name || friend.friend_id.username }}</div>
            </div>
          </div>
          <div v-else style="padding-top: 10px; text-align: center">没有结果啦</div>
        </div>
        <div v-else style="padding-top: 10px; text-align: center">加载中...</div>
      </div>

      <el-divider direction="vertical" />

      <div class="list-col">
        <div style="height: 30px; line-height: 30px; vertical-align: center">
          请勾选需要添加的联系人
        </div>
        <div class="add-list">
          <div v-for="friend in checkedList" :key="friend._id" class="list-item" @click="handleClickListItem(friend)">
            <el-checkbox v-model="friend.isChecked" @click.native.prevent="" :disabled="constantIds.indexOf(friend._id) !== -1" />
            <img
              class="list-item-img"
              :src="BASE_IMG_URL + friend.friend_id.avatar"
              alt="avatar"
              style="width: 45px; height: 45px"
            />
            <div class="friend-item-title">{{ friend.friend_name || friend.friend_id.username }}</div>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="isBtnDisabled()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { BASE_IMG_URL } from '@/config/constant'

import { debounce } from '@/utils'

export default {
  props: {
    friendList: {
      type: Array,
      default () {
        return []
      }
    },
    checkedList: {
      type: Array,
      default () {
        return []
      }
    },
    dialogVisible: { type: Boolean, default: true },
    dialogTitle: { type: String, default: '默认' },
    loading: { type: Boolean, default: false }
  },
  watch: {
    dialogVisible (val) {
      if (val) {
        this.constantIds = []
        if (this.dialogTitle === '邀请群成员') {
          this.checkedList.forEach(i => {
            this.constantIds.push(i._id)
          })
        }
      }
    }
  },
  computed: {
    isBtnDisabled: function () {
      return () => {
        let res = true
        if (this.dialogTitle === '群成员管理') {
          if (this.checkedList.length > 0) {
            res = false
          }
        } else if (this.dialogTitle === '邀请群成员') {
          this.checkedList.some(i => {
            if (this.constantIds.indexOf(i._id) === -1) {
              res = false
              return true
            }
          })
        } else {
          if (this.checkedList.length >= 2) {
            res = false
          }
        }
        return res
      }
    }
  },
  data () {
    return {
      searchInput: '',
      constantIds: [],
      BASE_IMG_URL
    }
  },
  methods: {
    update () {
      this.$forceUpdate()
    },
    clear () {
      this.searchInput = ''
    },
    handleChangeInput:
      debounce(async function () {
        this.$emit('changeInput', this.searchInput)
      }, 500),
    handleClose () {
      this.$emit('close')
    },
    handleSubmit () {
      if (this.dialogTitle !== '邀请群成员') {
        this.$emit('submit')
      } else {
        const ids = []
        this.checkedList.forEach(i => {
          if (this.constantIds.indexOf(i._id) === -1) {
            ids.push(i.friend_id._id)
          }
        })
        this.$emit('submit', ids)
      }
    },
    handleClickListItem (item) {
      if (this.constantIds.indexOf(item._id) === -1) {
        this.$emit('clickItem', item)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-list {
  padding: 0 5px;
  width: 100%;
  height: 220px;
  overflow-y: auto;
}

.add-list::-webkit-scrollbar {
	width: 5px;
	height: 16px;
	background-color: #F5F5F5;
}

.add-list::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #DDD;
}

.list-col {
  width: 100%;
  padding: 0 5px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  cursor: pointer;
  .list-item-img {
    margin: 0 10px;
  }
}

.list-item:hover {
  background: #F2F6FC radial-gradient(#DDD, #FFF);
}

.el-divider--vertical {
  height: 250px;
}
</style>
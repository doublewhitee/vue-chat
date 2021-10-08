<template>
  <el-menu
    class="side-bar"
    :collapse="true"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    @select="handleSelect"
    :default-active="$route.path"
    >
    <el-popover placement="right" trigger="click" width="300">
      <div class="user-card">
        <div>
          <div class="username">{{ $store.state.User.username }}</div>
          <div class="info">{{ `ID: ${$store.state.User._id}` }}</div>
          <div class="info">{{ `手机: ${$store.state.User.phone}` }}</div>
        </div>
        <el-image
          style="width: 70px; height: 70px"
          :src="BASE_IMG_URL + $store.state.User.avatar"
          alt="avatar"
          :preview-src-list="[BASE_IMG_URL + $store.state.User.avatar]"
        />
      </div>
      <el-image
        :src="BASE_IMG_URL + $store.state.User.avatar"
        alt="avatar"
        class="avatar"
        slot="reference"
      />
    </el-popover>

    <el-menu-item index="/chat/group">
      <i class="el-icon-message-solid" />
      <span slot="title">聊天</span>
    </el-menu-item>
    <el-menu-item index="/chat/friend">
      <i class="el-icon-user-solid" />
      <span slot="title">通讯录</span>
    </el-menu-item>

    <el-dropdown class="bottom-icon" @command="handleCommand">
      <i class="el-icon-s-operation" style="color: #909399; font-size: 18px"/>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="changeAvatar">修改头像</el-dropdown-item>
        <el-dropdown-item command="setting">个人信息设置</el-dropdown-item>
        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="40%">
      
      <div v-if="dialogTitle === '修改头像'" style="text-align: center;">
        <ImgCutter />
        <div style="font-size: 12px; padding-top: 10px;">点击修改头像</div>
      </div>
      <el-form v-else label-width="80px" :model="infoForm" :rules="rules" ref="infoForm">
        <el-form-item label="用户名">
          <el-input v-model="infoForm.username" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="infoForm.phone" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </el-dialog>

  </el-menu>
</template>

<script>
import ImgCutter from '@/components/ImageCutter'

import { ipcRenderer } from 'electron'
import { BASE_IMG_URL, phoneReg } from '@/config/constant'

export default {
  components: {
    ImgCutter
  },
  data () {
    // 自定义表单校验
    const validatePhone = (rule, value, callback) => {
      if (!phoneReg.test(value)) {
        callback(new Error('请输入正确格式的手机号'))
      } else {
        callback()
      }
    }
    return {
      BASE_IMG_URL,
      dialogVisible: false,
      dialogTitle: '',
      infoForm: {
        username: '',
        phone: ''
      },
      rules: { phone: [{ validator: validatePhone, trigger: 'blur' }] }
    }
  },
  methods: {
    handleSelect (key) {
      this.$router.replace(key)
    },
    async handleCommand (command) {
      if (command === 'logout') {
        await this.$confirm('您确定要退出登录吗？').then(async () => {
          this.$socket.emit('logout', { _id: this.$store.state.User._id })
          this.$store.commit('CLEAR_USER_STATE')
          this.$router.replace('/login')
          ipcRenderer.send('LOG_OUT')
          this.$message.success('您已成功退出登录！')
        }).catch(() => {
          this.$message.info('已取消')
        })
      } else if (command === 'changeAvatar') {
        this.dialogVisible = true
        this.dialogTitle = '修改头像'
      } else if (command === 'setting') {
        this.dialogVisible = true
        this.dialogTitle = '设置个人信息'
        this.infoForm.username = this.$store.state.User.username
        this.infoForm.phone = this.$store.state.User.phone
      }
    },
    async handleConfirm () {
      if (this.dialogTitle === '设置个人信息') {
        this.$refs.infoForm.validate(async valid => {
          if (valid) {
            const res = await this.$store.dispatch('CHANGE_INFO', this.infoForm)
            if (res) {
              if (res.code === 0) {
                this.$message.success('更新个人信息成功！')
                this.dialogVisible = false
              } else {
                this.$message.error(res.msg)
              }
            }
          }
        })
      } else {
        this.dialogVisible = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  height: 100%;
  width: 59px;
  position: relative;
  .avatar {
    width: 40px;
    height: 40px;
    margin: 20px 10px 0 10px;
    border-radius: 50%;
    cursor: pointer;
  }
  .bottom-icon {
    position: absolute;
    bottom: 20px;
    left: 20px;
    cursor: pointer;
  }
}

.user-card {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  -webkit-app-region: no-drag;
  .username {
    font-size: 20px;
    font-weight: bold;
  }
  .info {
    font-size: 12px;
    padding-top: 10px;
  }
}
</style>

<style>
.el-submenu__title {
  padding: 0 15px !important;
}

.el-image-viewer__mask {
  -webkit-app-region: no-drag;
}

.el-message-box__wrapper {
  -webkit-app-region: no-drag;
}

.el-dialog__wrapper {
  -webkit-app-region: no-drag;
}
</style>
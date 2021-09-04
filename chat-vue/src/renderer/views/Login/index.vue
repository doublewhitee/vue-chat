<template>
  <div>
    <div class="wave-warp">
      <ToolBar />
      <div class="wave-content">DoubleWhitee</div>
      <span class="wave" />
      <span class="wave" />
      <span class="wave" />
    </div>

    <div class="login-tab no-drag">
      <div
        :class="activeTab === 'register' ? 'active-tab tab-item' : 'tab-item'"
        @click="handleSetActiveTab('register')"
      >
        注册
      </div>
      <div
        :class="activeTab === 'login' ? 'active-tab tab-item' : 'tab-item'"
        @click="handleSetActiveTab('login')"
      >
        登录
      </div>
    </div>

    <el-form
      class="login-form no-drag"
      :model="formData"
      :rules="rules"
      ref="loginForm"
    >
      <el-form-item prop="phone">
        <el-input
          v-model="formData.phone"
          prefix-icon="el-icon-user-solid"
          placeholder="请输入手机"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          prefix-icon="el-icon-s-promotion"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item prop="confirmPass" v-if="activeTab === 'register'">
        <el-input
          v-model="formData.confirmPass"
          prefix-icon="el-icon-s-promotion"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary" round class="login-btn" @click="handleConfirm">确定</el-button>
      </el-form-item>
    </el-form>

    <div class="login-prompt no-drag">
      {{ activeTab === 'login' ? '没有账号，' : '已有帐号，' }}
      <span
        type="primary"
        :underline="false"
        style="font-size: 12px"
        @click="handleSetActiveTab(activeTab === 'login' ? 'register' : 'login')"
      >
        {{ activeTab === 'login' ? '去注册' : '去登陆' }}
      </span>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

import ToolBar from '@/components/ToolBar'

import { phoneReg } from '@/config/constant.js'
import { reqRegister } from '@/api/user.js'
import { encryptAES } from '@/utils/secret'

export default {
  components: {
    ToolBar
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
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.formData.checkPass !== '') {
          this.$refs.loginForm.validateField('checkPass')
        }
        callback()
      }
    }
    const validateConPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formData.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      activeTab: 'login',
      formData: {
        phone: '',
        password: '',
        confirmPass: ''
      },
      rules: {
        phone: [{ validator: validatePhone, trigger: 'blur' }],
        password: [{ validator: validatePass, trigger: 'blur' }],
        confirmPass: [{ validator: validateConPass, trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleSetActiveTab (key) {
      this.activeTab = key
      this.$refs.loginForm.resetFields()
      Object.keys(this.formData).forEach(i => {
        this.formData[i] = ''
      })
    },
    handleConfirm () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          if (this.activeTab === 'login') {
            // 登录
            this.$store.dispatch('LOGIN', this.formData).then(res => {
              if (res) {
                if (res.code === 0) {
                  ipcRenderer.send('CHANGE_WINDOW_SIZE')
                  this.$message.success('登陆成功！')
                  this.$router.push('/chat')
                } else {
                  this.$message.error(res.msg)
                }
              }
            })
          } else {
            // 注册
            const phone = this.formData.phone
            reqRegister(this.formData.phone, encryptAES(this.formData.password)).then(res => {
              if (res) {
                if (res.code === 0) {
                  this.handleSetActiveTab('login')
                  this.formData.phone = phone
                  this.$message.success('注册成功，请前往登录！')
                } else {
                  this.$message.error(res.msg)
                }
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-tab {
  width: 100%;
  display: flex;
  .tab-item {
    width: 50%;
    text-align: center;
    padding: 15px 0;
    cursor: pointer;
  }
}

.login-form {
  padding: 20px 30px 0 30px;
  .login-btn {
    background-color: #7A9AD7;
    width: 60%;
  }
}

.login-prompt {
  font-size: 12px;
  text-align: center;
  span {
    color: #7A9AD7;
    cursor: pointer;
  }
}

.active-tab {
  color: #7A9AD7;
  border-bottom: 2px solid #7A9AD7;
}

.no-drag {
  -webkit-app-region: no-drag;
}

// css波纹效果动画
.wave-warp {
  width: 100%;
  height: 130px;
  overflow: hidden;
  position: relative;
  .wave-content {
    position: relative;
    font-size: 20px;
    color: #FFF;
    z-index: 999;
    text-align: center;
    margin-top: 50px;
  }
}
 
.wave {
  position: absolute;
  width: 160%;
  height: 600px;
  top: -510px;
  left: -100px;
  background-color: rgba(122, 154, 215, 0.4);
  border-radius: 40%;
  animation: drift 5s linear infinite;
}
 
.wave:nth-of-type(1) {
  animation-duration: 4s;
}

.wave:nth-of-type(2) {
  animation-duration: 7s;
}

.wave:nth-of-type(3) {
  animation-duration: 10s;
}

@keyframes drift {
  from {
    transform: rotate(360deg);
  }
}

</style>
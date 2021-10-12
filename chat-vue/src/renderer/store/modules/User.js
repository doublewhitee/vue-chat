import { encryptAES } from '../../utils/secret'
import { reqLogin, reqUploadAvatar, reqUpdateUser } from '../../api/user'

const state = {
  _id: '',
  username: '',
  phone: '',
  avatar: '',
  messageCount: {} // 未读消息数
}

const mutations = {
  SET_USER_STATE (state, payload) {
    state._id = payload._id
    state.username = payload.username
    state.phone = payload.phone
    state.avatar = payload.avatar
    state.newFriendReqCount = 0
  },
  SET_USER_AVATAR (state, avatar) {
    state.avatar = avatar
  },
  CLEAR_USER_STATE (state) {
    Object.keys(state).forEach(k => {
      if (k === 'messageCount') {
        state[k] = {}
      } else {
        state[k] = ''
      }
    })
  },
  SET_MESSAGE_COUNT (state, payload) {
    state.messageCount = payload
  },
  CHANGE_MESSAGE_COUNT (state, payload) {
    state.messageCount[payload.id] = state.messageCount[payload.id] + payload.count
  }
}

const actions = {
  // 用户登录
  LOGIN ({ commit }, userInfo) {
    // do something async
    return new Promise((resolve, reject) => {
      const { phone, password } = userInfo
      const encryptPass = encryptAES(password)
      reqLogin(phone, encryptPass).then(res => {
        if (res && res.code === 0) {
          commit('SET_USER_STATE', res.data)
        }
        resolve(res)
      }).catch(err => reject(err))
    })
  },
  // 更换头像
  CHANGE_AVATAR (context, formData) {
    return new Promise((resolve, reject) => {
      reqUploadAvatar(formData).then(res => {
        if (res && res.code === 0) {
          reqUpdateUser({ avatar: res.data.name }, context.state._id).then(r => {
            if (r && r.code === 0) {
              context.commit('SET_USER_AVATAR', res.data.name)
            } else { resolve(r) }
          })
        }
        resolve(res)
      }).catch(err => reject(err))
    })
  },
  // 更新用户信息
  CHANGE_INFO (context, info) {
    return new Promise((resolve, reject) => {
      reqUpdateUser(info, context.state._id).then(res => {
        if (res && res.code === 0) {
          context.commit('SET_USER_STATE', res.data)
        }
        resolve(res)
      }).catch(err => reject(err))
    })
  }
}

export default {
  state,
  mutations,
  actions
}

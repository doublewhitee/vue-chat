import { encryptAES } from '../../utils/secret'
import { reqLogin } from '../../api/user'

const state = {
  _id: '',
  username: '',
  phone: ''
}

const mutations = {
  SET_USER_STATE (state, payload) {
    state._id = payload._id
    state.username = payload.username
    state.phone = payload.phone
  }
}

const actions = {
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
  }
}

export default {
  state,
  mutations,
  actions
}

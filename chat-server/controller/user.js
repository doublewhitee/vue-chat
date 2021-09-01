'use strict';

import UserModel from '../models/user.js'
import md5 from 'blueimp-md5'

class user_controller {
  async userLogin(req, res, next) {
    const { username, password } = req.body
    UserModel.findOne({ username, password: md5(password) }, { password: 0 }, (err, user) => {
      if(user) {
        res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 })
        res.send({ code: 0, data: user })
      } else {
        res.send({ code: 1, data: '邮箱或密码不正确！' })
      }
    })
  }
}

export default new user_controller()

'use strict';

import UserModel from '../models/user.js'
import md5 from 'blueimp-md5'
import { decryptAES } from '../utils/secret.js'

class user_controller {
  // 用户登录
  async userLogin(req, res, next) {
    try {
      const { phone, password } = req.body
      const decryptPass = decryptAES(password)

      const user = await UserModel.findOne({ phone, password: md5(decryptPass) }, { password: 0 })
      if (user) {
        res.send({ code: 0, data: user })
      } else {
        res.send({ code: 1, msg: '手机或密码不正确！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '登录异常, 请重新尝试！' })
    }
  }

  // 用户注册
  async userRegister(req, res, next) {
    try {
      const { phone, password } = req.body
      const decryptPass = decryptAES(password)
      const user = await UserModel.findOne({ phone })
      if (user) {
        res.send({ code: 1, msg: '此手机号已被注册！' })
      } else {
        await UserModel.create({ phone, password: md5(decryptPass) })
        res.send({ code: 0, data: user })
      }
    } catch (error) {
      res.send({ code: 2, msg: '注册异常, 请重新尝试！' })
    }
  }
}

export default new user_controller()

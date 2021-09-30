'use strict';

import UserModel from '../models/user.js'
import FriendModel from '../models/friend.js'
import md5 from 'blueimp-md5'
import { decryptAES } from '../utils/secret.js'
import config from 'config'

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

  // 更新用户信息
  async userUpdate (req, res, next) {
    try {
      const { info, _id } = req.body
      if (info.phone) {
        const user = await UserModel.findOne({ _id: { $ne: _id }, phone: info.phone })
        if (user) {
          res.send({ code: 1, msg: '此手机号已被使用！' })
          return
        }
      }
      const u = await UserModel.findByIdAndUpdate(_id, info, { new: true })
      res.send({ code: 0, data: u })
    } catch (error) {
      res.send({ code: 2, msg: '更新用户信息失败, 请重新尝试！' })
    }
  }

  // 上传头像
  async uploadImg (req, res, next) {
    try {
      const file = req.files[0]
      res.send({
        code: 0,
        data: {
          name: file.filename,
          url: config.img_url + file.filename
        }
      })
    } catch (error) {
      res.send({ code: 1, msg: '上传图片失败, 请重新尝试！' })
    }
  }

  // 获取用户信息
  async reqUserInfo (req, res, next) {
    try {
      const { user_id, friend_id } = req.query
      const isFriend = await FriendModel.findOne({ user_id, friend_id })
      const user = await UserModel.findOne({ _id: friend_id }, { password: 0 })
      if (user) {
        res.send({ code: 0, data: user, isFriend: Boolean(isFriend) })
      } else {
        res.send({ code: 1, msg: '未查询到该用户信息！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '获取用户信息失败, 请重新尝试！' })
    }
  }
}

export default new user_controller()

'use strict';

import mongoose from 'mongoose'
import md5 from 'blueimp-md5'

const Schema = mongoose.Schema

const userSchema = new Schema({
  phone: { type: String, required: true },
  username: { type: String, default: 'USER' },
  password: { type: String, required: true },
  avatar: { type: String, default: 'user.jpg' },
  create_at: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

// 初始化默认用户
User.findOne({ phone: '13777777777' }).then(user => {
  if (!user) {
    User.create({ phone: '13777777777', password: md5('123456') })
      .then(() => {
        console.log('初始化用户 - 手机: 13777777777 密码: 123456')
      })
  }
})

export default User

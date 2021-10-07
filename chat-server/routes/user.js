'use strict';

import express from 'express'
// 上传图片
import multer from 'multer'
import path from 'path'

import user_controller from '../controller/user.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})
const upload = multer({ storage })

const router = express.Router()

// 图片上传
router.post('/upload', upload.any(), user_controller.uploadImg)

// 用户登录
/*
  body:
  phone: [required, String], 手机
  password: [required, String], 密码
*/
router.post('/login', user_controller.userLogin)

// 用户注册
/*
  body:
  phone: [required, String], 手机
  password: [required, String], 密码
*/
router.post('/register', user_controller.userRegister)

// 用户信息更新
/*
  body:
  _id: [required, String], _id
  info: [required, Object], 更新信息
*/
router.post('/update', user_controller.userUpdate)

// 获取用户信息
/*
  query:
  user_id: [required, String], 当前用户_id
  friend_id: [required, String], 查询用户_id
*/
router.get('/info', user_controller.reqUserInfo)

export default router

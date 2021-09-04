'use strict';

import express from 'express'
import user_controller from '../controller/user.js'

const router = express.Router()

// 用户登录
/*
  body:
  phone: [required, String], 手机
  password: [required, String], 密码
  */
router.post('/login', user_controller.userLogin)

/*
  body:
  phone: [required, String], 手机
  password: [required, String], 密码
  */
  router.post('/register', user_controller.userRegister)

export default router

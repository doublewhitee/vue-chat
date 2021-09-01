'use strict';

import express from 'express'
import user_controller from '../controller/user.js'

const router = express.Router()

// 用户登录
/*
  body:
  mail: [required, String], 用户邮箱
  password: [required, String], 密码
  */
router.post('/login', user_controller.userLogin)

export default router

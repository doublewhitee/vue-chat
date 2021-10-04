'use strict';

import express from 'express'

import friend_controller from '../controller/friend.js'

const router = express.Router()

// 查找好友列表
/*
  query:
  searchText: [required, String], 查找内容
  page: [required, String], 当前页数
  _id: [required, String], 当前用户_id
*/
router.get('/addlist', friend_controller.getUserToAdd)

// 添加好友
/*
  body:
  addText: [required, String], 好友请求内容
  user_id: [required, String], 用户_id
  friend_id: [required, String], 所添加好友_id
*/
router.post('/add', friend_controller.addFriend)

export default router

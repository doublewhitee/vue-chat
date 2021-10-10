'use strict';

import express from 'express'

import friend_controller from '../controller/friend.js'

const router = express.Router()

// 获取好友列表
/*
  query:
  _id: [required, String], 当前用户_id
*/
router.post('/friendlist', friend_controller.getFriendList)

// 添加好友
/*
  body:
  user_id: [required, String], 当前用户_id
  friend_id: [required, String], 好友_id
  friend_name: [Stirng], 好友备注名
  group_id: [required, String]
*/
router.post('/add', friend_controller.addFriend)

// 忽略好友请求(删除group及chat信息)
/*
  body:
  _id: [required, String], group的_id
*/
router.post('/ignore', friend_controller.ignoreRequest)

// 查找好友列表
/*
  query:
  searchText: [required, String], 查找内容
  page: [required, String], 当前页数
  _id: [required, String], 当前用户_id
*/
router.get('/addlist', friend_controller.getUserToAdd)

// 发送好友申请
/*
  body:
  addText: [required, String], 好友请求内容
  user_id: [required, String], 用户_id
  friend_id: [required, String], 所添加好友_id
*/
router.post('/addreq', friend_controller.sendRequest)

// 获取新的朋友（好友请求）列表
/*
  body:
  user_id: [required, String], 用户_id
*/
router.post('/newfriends', friend_controller.friendRequest)

// 修改备注名
/*
  body:
  user_id: [required, String], 当前用户_id
  friend_id: [required, String], 好友_id
  friend_name: [required, String], 好友备注名
*/
router.post('/changename', friend_controller.changeNickname)

// 删除好友
/*
  body:
  user_id: [required, String], 当前用户_id
  friend_id: [required, String], 好友_id
*/
router.post('/delete', friend_controller.deleteFriend)

export default router

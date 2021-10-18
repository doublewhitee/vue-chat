'use strict';

import express from 'express'

import group_controller from '../controller/group.js'

const router = express.Router()

// 获取该用户所有会话
/*
  body:
  _id: [required, String], _id
*/
router.post('/list', group_controller.getGroupList)

// 获取会话详情
/*
  query:
  _id: [required, String], 当前group的_id
*/
router.get('/detail', group_controller.getGroupDetail)

// 获取该会话的聊天信息
/*
  body:
  group_id: [required, String], 当前group的_id
  skip: [required, Number], 跳过个数
*/
router.post('/chat', group_controller.getChatList)

// 发送消息
/*
  body:
  group_id: [required, String], 当前group的_id
  user_id: [required, String], 当前用户_id
  content: [required, String], 消息内容
*/
router.post('/send', group_controller.sendChat)

export default router

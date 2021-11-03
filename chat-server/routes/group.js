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

// 搜索聊天记录
/*
  body:
  group_id: [required, String], 当前group的_id
  searchText: [required, String], 搜索内容
  page: [required, Number], 页码
*/
router.post('/history', group_controller.findHistory)

// 搜索聊天记录数量
/*
  body:
  user_id: [required, String], 当前user的_id
  searchText: [required, String], 搜索内容
*/
router.post('/historycount', group_controller.findHistoryCount)

// 新建群聊
/*
  body:
  user_list: [required, Array], 参与群聊成员_id列表
  admin: [required, String], 当前用户id，群管理员
*/
router.post('/create', group_controller.createGroup)

// 查找当前用户所有群聊
/*
  body:
  user_id: [required, String], 当前user的_id
*/
router.post('/info', group_controller.getGroupChatList)

// 添加/踢出群成员
/*
  body:
  group_id: [required, String], 当前group的_id
  mode: [required, String] add/drop
  ids: [required, Array] 添加/踢出的用户id列表
*/
router.post('/updatemeber', group_controller.editGroupMember)

// 更新群信息
/*
  body:
  group_id: [required, String], 当前group的_id
  key: [required, String] 键
  value: [required, String] 值
*/
router.post('/update', group_controller.updateGroupInfo)

// 退出群聊
/*
  body:
  group_id: [required, String], 当前group的_id
  user_id: [required, String], 当前user的_id
*/
router.post('/exit', group_controller.exitGroupChat)

// 解散群聊
/*
  body:
  group_id: [required, String], 当前group的_id
*/
router.post('/delete', group_controller.deleteGroupChat)

export default router

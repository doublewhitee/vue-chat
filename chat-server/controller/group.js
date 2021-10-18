'use strict';

import mongoose from 'mongoose'

import GroupModel from '../models/group.js'
import ChatModel from '../models/chat.js'

class group_controller {
  // 获取该用户所有会话
  async getGroupList(req, res, next) {
    try {
      const { _id } = req.body
      const groups = await GroupModel.aggregate([
        { $match: {
          type: { $ne: 'new' },
          user_list: { $in: [ mongoose.Types.ObjectId(_id) ]},
        }},
        { $lookup: { from: 'users', localField: 'user_list', foreignField: '_id', as: 'user_info' }},
        { $project: { 'user_info.password': 0, 'user_info.create_at': 0, 'user_list': 0 } },
        { $sort: { update_at: -1 } }
      ])
      res.send({ code: 0, data: groups })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 获取会话详情
  async getGroupDetail(req, res, next) {
    try {
      const { _id } = req.query
      const group = await GroupModel.findById(_id)
      if (group) {
        res.send({ code: 0, data: group })
      } else {
        res.send({ code: 1, msg: '未查找到相关信息！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 获取该会话的聊天信息
  async getChatList(req, res, next) {
    try {
      const { group_id, skip } = req.body
      const chats = await ChatModel.find({ group: group_id }).populate('user', 'username avatar').sort({ create_at: -1 }).skip(skip).limit(3)
      res.send({ code: 0, data: chats })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 发送消息
  async sendChat(req, res, next) {
    try {
      const { user_id, group_id, content } = req.body
      const msg = await ChatModel.create({
        user: user_id,
        group: group_id,
        content: content,
        create_at: new Date()
      })
      await GroupModel.findByIdAndUpdate(group_id, { update_at: new Date() })
      const chat = await ChatModel.findById(msg._id).populate('user', 'username avatar')
      res.send({ code: 0, data: chat })
    } catch (error) {
      res.send({ code: 1, msg: '消息发送失败, 请重新尝试！' })
    }
  }
}

export default new group_controller()

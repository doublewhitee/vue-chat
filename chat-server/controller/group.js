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
      const group = await GroupModel.findById(_id).populate('group_admin', 'username avatar').populate('user_list', 'username avatar')
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
      const { user_id, group_id, content, type } = req.body
      const msg = await ChatModel.create({
        user: user_id,
        group: group_id,
        content: content,
        type,
        create_at: new Date()
      })
      await GroupModel.findByIdAndUpdate(group_id, { update_at: new Date() })
      const chat = await ChatModel.findById(msg._id).populate('user', 'username avatar')
      res.send({ code: 0, data: chat })
    } catch (error) {
      res.send({ code: 1, msg: '消息发送失败, 请重新尝试！' })
    }
  }

  // 搜索聊天记录
  async findHistory(req, res, next) {
    try {
      const { group_id, searchText, page } = req.body
      const skip_num = 3 // 每页条数
      const total = await ChatModel.find({ group: group_id, content: { $regex: searchText }, type: { $ne: 'audio' } }).countDocuments()
      const history = await ChatModel.find({ group: group_id, content: { $regex: searchText }, type: { $ne: 'audio' } })
        .skip((page - 1) * skip_num).limit(3)
        .populate('user', 'username avatar')
        .sort({ create_at: -1 })
      if (history.length > 0) {
        res.send({ code: 0, data: history, total })
      } else {
        res.send({ code: 1, msg: '未查找到相关聊天记录！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '查询聊天记录失败, 请重新尝试！' })
    }
  }

  // 搜索聊天记录数量
  async findHistoryCount (req, res, next) {
    try {
      const { searchText, user_id } = req.body
      const history = await ChatModel.aggregate([
        { $match: {
          type: { $ne: 'audio' },
          'content': { $regex: searchText }
        }},
        { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'group_info' } },
        { $unwind: '$group_info' },
        { $match: {
          'group_info.user_list': { $in: [ mongoose.Types.ObjectId(user_id) ]}
        }},
        { $group: {
          _id: '$group_info._id',
          count: { $sum: 1 },
          user_list: { $first: '$group_info.user_list' },
          type: { $first: '$group_info.type' },
          update_at: { $first: '$group_info.update_at' }
        }},
        { $lookup: { from: 'users', localField: 'user_list', foreignField: '_id', as: 'user_info' } },
        { $project: { 'user_info.password': 0, 'user_info.create_at': 0, 'user_list': 0 } },
      ])
      res.send({ code: 0, data: history })
    } catch (error) {
      res.send({ code: 1, msg: '查询聊天记录失败, 请重新尝试！' })
    }
  }

  // 新建群聊
  async createGroup(req, res, next) {
    try {
      const { user_list, admin } = req.body
      const query = { $and: [] }
      user_list.forEach(i => {
        query.$and.push({ user_list: { $elemMatch: { $eq: i }} })
      })
      const isExist = await GroupModel.findOne({ type: 'group', ...query, user_list: { $size: user_list.length } })
      if (!isExist) {
        const group = await GroupModel.create({ type: 'group', user_list: user_list, group_admin: admin, group_name: '新建群聊' })
        const group_id = group._id
        const chat = await ChatModel.create({ user: admin, group: group_id, content: '我新建了群聊，快来聊天吧！', unread_list: user_list })
        res.send({ code: 0, chat: chat._id, group: group })
      } else {
        res.send({ code: 1, msg: '该群聊已存在！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '新建群聊失败, 请重新尝试！' })
    }
  }

  // 查找当前用户所有群聊
  async getGroupChatList(req, res, next) {
    try {
      const { user_id } = req.body
      const groups = await GroupModel.find({
        user_list: { $elemMatch: { $eq: user_id }},
        type: 'group'
      })
      res.send({ code: 0, data: groups })
    } catch (error) {
      res.send({ code: 1, msg: '查找群聊信息失败, 请重新尝试！' })
    }
  }

  // 添加/踢出群成员
  async editGroupMember(req, res, next) {
    try {
      const { group_id, mode, ids } = req.body
      let group = null
      if (mode === 'add') {
        group = await GroupModel.findByIdAndUpdate(group_id, { $push: { user_list: { $each: ids } } }, { new: true })
      } else {
        group = await GroupModel.findByIdAndUpdate(group_id, { $pull: { user_list: { $in: ids } } })
      }
      res.send({ code: 0, data: group })
    } catch (error) {
      res.send({ code: 1, msg: '更新群成员失败, 请重新尝试！' })
    }
  }

  // 更新群信息
  async updateGroupInfo (req, res, next) {
    try {
      const { group_id, key, value } = req.body
      const group = await GroupModel.findByIdAndUpdate(group_id, { [key]: value })
      res.send({ code: 0, data: group })
    } catch (error) {
      res.send({ code: 1, msg: '更新群信息失败, 请重新尝试！' })
    }
  }

  // 退出群聊
  async exitGroupChat (req, res, next) {
    try {
      const { user_id, group_id } = req.body
      const group = await GroupModel.findById(group_id)
      let info
      // 如果是管理员则让列表中第一位不是管理员的转为管理员
      if (group.group_admin.toString() === user_id) {
        let new_admin
        group.user_list.some(i => {
          if (i !== user_id) {
            new_admin = i
            return true
          }
        })
        info = await GroupModel.findByIdAndUpdate(group_id, { group_admin: new_admin, $pull: { user_list: user_id } })
      } else {
        info = await GroupModel.findByIdAndUpdate(group_id, { $pull: { user_list: user_id } })
      }
      res.send({ code: 0, data: info })
    } catch (error) {
      res.send({ code: 1, msg: '退出群聊失败, 请重新尝试！' })
    }
  }

  // 解散群聊
  async deleteGroupChat (req, res, next) {
    try {
      const { group_id } = req.body
      await ChatModel.deleteMany({ group: group_id })
      await GroupModel.findByIdAndDelete(group_id)
      res.send({ code: 0, data: 'success' })
    } catch (error) {
      res.send({ code: 1, msg: '解散群聊失败, 请重新尝试！' })
    }
  }
}

export default new group_controller()

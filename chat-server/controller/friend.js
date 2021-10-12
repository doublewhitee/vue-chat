'use strict';

import mongoose from 'mongoose'

import FriendModel from '../models/friend.js'
import UserModel from '../models/user.js'
import GroupModel from '../models/group.js'
import ChatModel from '../models/chat.js'

class friend_controller {
  // 获取好友列表
  async getFriendList(req, res, next) {
    try {
      const { _id, searchText } = req.body
      const friends = await FriendModel.find(
        searchText === '' ?
        { user_id: _id } : {
          user_id: _id,
          friend_name: { $regex: searchText }
        }
      ).populate('friend_id', 'username avatar')
      res.send({ code: 0, data: friends })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 添加好友
  async addFriend(req, res, next) {
    try {
      const { user_id, friend_id, friend_name, group_id } = req.body
      await FriendModel.create({ user_id, friend_id, friend_name })
      await FriendModel.create({ user_id: friend_id, friend_id: user_id })
      await GroupModel.findByIdAndUpdate(group_id, { type: 'single', update_at: new Date() })
      res.send({ code: 0, data: 'success' })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 忽略好友请求(删除group及chat信息)
  async ignoreRequest(req, res, next) {
    try {
      const { _id } = req.body
      await GroupModel.findByIdAndDelete(_id)
      await ChatModel.deleteMany({ group: _id })
      res.send({ code: 0, data: 'success' })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 查找好友列表
  async getUserToAdd(req, res, next) {
    try {
      // 搜索手机号
      const { searchText, page, _id } = req.query
      const skip_num = 3 // 每页条数
      // 总数
      const total = await UserModel.find(
        {
          phone: { $regex: searchText },
          _id: { $ne: _id }
        },
        { password: 0 }
      ).countDocuments()
      const users = await UserModel.find(
        {
          phone: { $regex: searchText },
          _id: { $ne: _id }
        },
        { password: 0 }
      ).skip((page - 1) * skip_num).limit(3)
      if (users.length > 0) {
        res.send({ code: 0, data: users, total })
      } else {
        res.send({ code: 1, msg: '未查找到相关用户！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '查找异常, 请重新尝试！' })
    }
  }

  // 发送好友申请
  async sendRequest(req, res, next) {
    try {
      // 好友申请内容
      const { addText, user_id, friend_id } = req.body
      // 查询是否之前发送过好友申请
      const isGroup = await GroupModel.findOne({
        $and: [
          { user_list: { $elemMatch: { $eq: user_id }} },
          { user_list: { $elemMatch: { $eq: friend_id }} }
        ],
        user_list: { $size: 2 }
      })
      if (!isGroup) {
        // 新建group[new]，好友申请作为一条chat
        const group = await GroupModel.create({ type: 'new', user_list: [user_id, friend_id] })
        const group_id = group._id
        await ChatModel.create({ user: user_id, group: group_id, content: addText, unread_list: [ friend_id ] })
      } else {
        const group_id = isGroup._id
        await ChatModel.create({ user: user_id, group: group_id, content: addText, unread_list: [ friend_id ] })
        await GroupModel.findByIdAndUpdate(group_id, { update_at: new Date() })
      }
      res.send({ code: 0, data: isGroup })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 获取新的朋友（好友请求）列表
  async friendRequest(req, res, next) {
    try {
      const { user_id } = req.body
      const newFriendRequests = await ChatModel.aggregate([
        { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'group_info' } },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user_info' } },
        { $unwind: '$group_info' },
        { $unwind: '$user_info' },
        { $match: {
          'group_info.type': 'new',
          'group_info.user_list': { $in: [ mongoose.Types.ObjectId(user_id) ]},
          'user': { $ne: mongoose.Types.ObjectId(user_id) }
        }},
        { $group: 
          {
            _id: '$group_info._id',
            update_at: { $max: '$group_info.update_at' },
            detail: {
              $push: {
                _id: '$user_info._id',
                username: '$user_info.username',
                avatar: '$user_info.avatar',
                phone: '$user_info.phone',
                content: '$content',
                create_at: '$create_at'
              }
            }
          } 
        },
        { $sort: { 'update_at': -1 } }
      ])
      res.send({ code: 0, data: newFriendRequests })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 修改备注名
  async changeNickname(req, res, next) {
    try {
      const { user_id, friend_id, friend_name } = req.body
      const friend = await FriendModel.findOneAndUpdate({ user_id, friend_id }, { friend_name })
      if (friend) {
        res.send({ code: 0, data: friend })
      } else {
        res.send({ code: 1, msg: '未查找到相关信息！' })
      }
    } catch (error) {
      res.send({ code: 2, msg: '请求错误, 请重新尝试！' })
    }
  }

  // 删除好友
  async deleteFriend(req, res, next) {
    try {
      const { user_id, friend_id } = req.body
      await FriendModel.findOneAndDelete({ user_id, friend_id })
      await FriendModel.findOneAndDelete({ user_id: friend_id, friend_id: user_id })
      const group = await GroupModel.findOne({
        $and: [
          { user_list: { $elemMatch: { $eq: user_id }} },
          { user_list: { $elemMatch: { $eq: friend_id }} }
        ],
        user_list: { $size: 2 },
        type: 'single'
      })
      const group_id = group._id
      await GroupModel.findByIdAndDelete(group_id)
      await ChatModel.deleteMany({ group: group_id })
      res.send({ code: 0, msg: '删除好友及相关信息成功！' })
    } catch (error) {
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }
}

export default new friend_controller()

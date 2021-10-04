'use strict';

import FriendModel from '../models/friend.js'
import UserModel from '../models/user.js'
import GroupModel from '../models/group.js'
import ChatModel from '../models/chat.js'

class friend_controller {
  // 获取好友列表

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

  // 添加好友
  async addFriend(req, res, next) {
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
        await ChatModel.create({ user: user_id, group: group_id, content: addText })
      } else {
        const group_id = isGroup._id
        await ChatModel.create({ user: user_id, group: group_id, content: addText, unread_list: [ friend_id ] })
      }
      res.send({ code: 0, data: 'success' })
    } catch (error) {
      console.log(error)
      res.send({ code: 1, msg: '请求错误, 请重新尝试！' })
    }
  }
}

export default new friend_controller()

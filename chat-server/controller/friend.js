'use strict';

import FriendModel from '../models/friend.js'
import UserModel from '../models/user.js'

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
        res.send({ code: 0, data: users, total  })
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
      // 搜索内容 手机号/_id
      const { searchText } = req.query
      const users = await UserModel.find(
        {
          $or: [{ phone: { $regex: searchText }}, { _id: { $regex: searchText }}]
        },
        { password: 0 }
      )
      console.log(users)
    } catch (error) {

    }
  }
}

export default new friend_controller()

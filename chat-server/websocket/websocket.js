import * as socketIo from 'socket.io'
import mongoose from 'mongoose'
import GroupModel from '../models/group.js'
import ChatModel from '../models/chat.js'

const onlineUsers = {}

export function setSocket(app) {
  const io = new socketIo.Server(app,{ allowEIO3: true, cors: { origin: true, credentials: true } })
  // allowEIO3: 解决400问题
  // cors: 解决跨域
  
  io.on('connection', socket => {
    console.log('socket connect success!')
    socket.on('login', async data => {
      // 存储上线用户
      onlineUsers[data._id] = socket.id
      // 获取所有聊天的未读消息个数并按时间排序
      const messageNum = {}

      const unreadMessages = await ChatModel.aggregate([
        { $match: {
          'unread_list': { $in: [ mongoose.Types.ObjectId(data._id) ]}
        }},
        { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'group_info' } },
        { $unwind: '$group_info' },
        { $match: {
          'group_info.type': { $ne: 'new' }
        }},
        { $group: {
          _id: '$group_info._id',
          count: { $sum: 1 },
        }}
      ])
      
      unreadMessages.forEach(i => {
        messageNum[i._id] = i.count
      })

      // 获取新好友申请信息数
      const newFriendGroupIds = await ChatModel.aggregate([
        { $match: {
          'user': { $ne: mongoose.Types.ObjectId(data._id) },
          'unread_list': { $in: [ mongoose.Types.ObjectId(data._id) ]}
        }},
        { $lookup: { from: 'groups', localField: 'group', foreignField: '_id', as: 'group_info' } },
        { $unwind: '$group_info' },
        { $match: {
          'group_info.type': 'new',
          'group_info.user_list': { $in: [ mongoose.Types.ObjectId(data._id) ]}
        }},
        { $group: { _id: '$group_info._id' } }
      ])
      messageNum['new_friend'] = newFriendGroupIds.length

      // 通知未读消息数汇总
      socket.emit('count', messageNum)
    })

    // 退出登录
    socket.on('logout', data => {
      delete onlineUsers[data._id]
    })

    // 添加好友
    socket.on('add_friend', data => {
      const { friend_id } = data
      // 如果被添加用户在线
      if(Object.keys(onlineUsers).some(i => i === friend_id)) {
        io.to(onlineUsers[friend_id]).emit('count_change', { id: 'new_friend', count: 1 })
      }
    })

    // 发送聊天信息
    socket.on('send_chat', async data => {
      console.log('chat!', data)
    })

    socket.on('disconnect', () => {
      // 删除断开连接用户
      Object.keys(onlineUsers).forEach(i => {
        if (onlineUsers[i] === socket.id) {
          delete onlineUsers[i]
        }
      })
    })
  })
}
import * as socketIo from 'socket.io'
import mongoose from 'mongoose'
import GroupModel from '../models/group.js'
import ChatModel from '../models/chat.js'

const onlineUsers = {}
const roomInfo = {}

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

    // 进入房间[group]
    socket.on('join_room', async data => {
      socket.join(data.group_id)
      console.log('join room', data.group_id)
      if (!roomInfo[data.group_id]) {
        roomInfo[data.group_id] = []
      }
      if (!roomInfo[data.group_id].some(i => i === data.user_id)) {
        roomInfo[data.group_id].push(data.user_id)
      }
      await ChatModel.updateMany({ group: data.group_id }, { $pull: { unread_list: data.user_id } })
    })

    // 离开房间
    socket.on('leave_room', data => {
      socket.leave(data.group_id)
      console.log('leave room', data.group_id)
      roomInfo[data.group_id].some((i, index) => {
        if (i === data.user_id) {
          roomInfo[data.group_id].splice(index, 1)
          return true
        }
      })
    })

    // 发送消息
    socket.on('send_msg', async data => {
      try {
        // 根据在房间内人数更新消息未读列表
        const group = await GroupModel.findById(data.group_id)
        const user_list = group.user_list
        const unread_list = []
        if (!roomInfo[data.group_id]) {
          roomInfo[data.group_id] = []
        }
        user_list.forEach(i => {
          if (i.toString() !== data.user_id && roomInfo[data.group_id].indexOf(i.toString()) === -1) {
            unread_list.push(i)
          }
        })
        await ChatModel.findByIdAndUpdate(data.chat_id, { unread_list })
        const chat = await ChatModel.findById(data.chat_id).populate('user', 'username avatar')
        // 若对方在线且在该房间内
        socket.broadcast.to(data.group_id).emit('receive_msg', chat)
        // 若对方在线且不在房间内
        const send_list = []
        unread_list.forEach(i => {
          if (Object.keys(onlineUsers).indexOf(i.toString()) !== -1) {
            send_list.push(onlineUsers[i])
          }
        })
        if (send_list.length > 0) {
          send_list.forEach(k => {
            socket.to(k).emit('count_change', { id: data.group_id, count: 1, create_at: chat.create_at })
          })
        }
      } catch (error) {
        console.log(error)
      }
    })

    // 更新群基本信息
    socket.on('update_group', data => {
      const { group_id, user_ids, type } = data
      if (type === 'delete') {
        socket.broadcast.to(group_id).emit('delete_current_group')
      } else {
        socket.broadcast.to(group_id).emit('update_current_group_info')
      }
      const send_list = []
      Object.keys(onlineUsers).forEach(i => {
        if (user_ids.indexOf(i) !== -1) {
          send_list.push(i)
        }
      })
      if (send_list.length > 0) {
        send_list.forEach(k => {
          socket.to(onlineUsers[k]).emit('refresh_group_list')
        })
      }
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

    socket.on('disconnect', () => {
      // 删除断开连接用户
      Object.keys(onlineUsers).forEach(i => {
        if (onlineUsers[i] === socket.id) {
          delete onlineUsers[i]
        }
      })
      socket.disconnect(0)
    })
  })
}
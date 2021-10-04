'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const chatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 发送人_id
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true }, // 所属聊天
  content: { type: String, required: true },
  unread_list: [{ type: Schema.Types.ObjectId, ref: 'User' }], // 未读列表
  create_at: { type: Date, default: Date.now }
})

const Chat = mongoose.model('Chat', chatSchema)

export default Chat

'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const groupSchema = new Schema({
  type: { type: String, enum: ['group', 'single', 'new'], default: 'new' }, // 类型：群聊、私聊、新好友申请
  user_list: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  group_name: { type: String, default: '' }, // 群聊名称[group]
  group_img: { type: String, default: 'user.jpg' }, // 群聊头像[group]
  group_admin: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // 类型为群聊时使用，群管理员
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
})

const Group = mongoose.model('Group', groupSchema)

export default Group

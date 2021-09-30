'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const friendSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  friend_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  friend_name: { type: String, default: '' }, // 备注名
  create_at: { type: Date, default: Date.now }
})

const Friend = mongoose.model('Chat', friendSchema)

export default Friend

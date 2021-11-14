'use strict';

import express from 'express'
// 上传文件
import multer from 'multer'
import path from 'path'

import chat_controller from '../controller/chat.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/audio')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})
const upload = multer({ storage })

const router = express.Router()

// 上传
router.post('/upload', upload.any(), chat_controller.upload)

export default router
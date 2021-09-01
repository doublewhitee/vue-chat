'use strict';

import mongoose from 'mongoose'
import config from 'config'

mongoose.connect(config.url, { useNewUrlParser: true, useUnifiedTopology: true })
const conn = mongoose.connection

conn.on('open', () => {
  console.log('db connect success!')
})

conn.on('error', error => {
  console.log('error: ' + error)
  mongoose.disconnect()
})

export default conn

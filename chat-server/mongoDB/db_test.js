'use strict';

const md5 = require('blueimp-md5')

// 1.测试连接数据库
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/chat', { useNewUrlParser: true, useUnifiedTopology: true })
const conn = mongoose.connection
conn.on('connected', function() {
    console.log('数据库连接成功。')
})

// 2.得到对应特定集合的Model
// 定义Schema（描述文档结构）
const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String }
})
// 定义Model（与集合对应，可以操作集合）
const UserModel = mongoose.model('user', userSchema)

// 3.通过Model或其实例对集合数据进行CRUD操作
// save()添加数据
function testSave() {
    const userModel = new UserModel({ username: 'a', password: md5('123') })
    userModel.save((error, userDoc) => {
        console.log('save()', error, userDoc)
    })
}
// testSave()

// find()/findOne()查询数据
function testFind() {
    UserModel.find({ username: 'a' }, (error, users) => {
        console.log('find()', error, users)
    })
    UserModel.findOne({ username: 'a' }, (error, user) => {
        console.log('findOne()', error, user)
    })
}
testFind()

// findByIdAndUpdate()更新数据
function testUpdate() {
    UserModel.findByIdAndUpdate({ _id: '603bba9a1925ff407ce7918e' }, {username: 'aa'}, (error, oldDoc) => {
        console.log('update()', error, oldDoc)
    })
}
// testUpdate()

// remove()删除数据
function testDelete() {
    UserModel.remove({ _id: '603bba9a1925ff407ce7918e' }, (error, doc) => {
        console.log('remove()', error, doc)
    })
}
// testDelete()

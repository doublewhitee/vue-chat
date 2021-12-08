# vue-chat

## 项目介绍

该项目是一个基于Electron-vue实现的实时聊天系统，采用模块化、组件化和工程化的模式开发。主要包括用户注册/登录、好友及群聊列表、实时聊天及聊天管理等模块。

## 技术栈

本项目前端使用electron-vue + vue2.0 + vuex + vue-router + axios，后端采用express实现。

- element-ui：基于 Vue 2.0 的桌面端组件库。
- vue-cropper：图片剪裁插件。
- vue-socket.io & socket.io：WebSocket库。
- js-audio-recorder：js录音插件。
- wavesurfer.js：音频播放器和波形可视化插件。
- sass：css开发工具。
- eslint：使得代码风格统一。
- mongoose：操作MongoDB。
- multer：上传文件中间件。
- crypto-js：加解密。

## 主要功能

+ 用户注册&登录

+ 修改个人相关信息及头像

+ 添加好友&新建群聊

+ 好友&群聊管理

+ 实时发送文字&语音消息

## 安装及运行

```
git clone https://github.com/doublewhitee/vue-chat.git

// 进入后端项目目录
cd chat-server
// 安装依赖
yarn
// 运行项目
yarn start

// 进入前端项目目录
cd chat-vue
// 安装依赖
yarn
// 运行项目
yarn dev
```

## 项目截图

登陆界面

<img title="" src="https://raw.githubusercontent.com/doublewhitee/vue-chat/main/screenshot/login.png" alt="login" data-align="inline" width="250">

初始聊天界面

<img title="" src="https://raw.githubusercontent.com/doublewhitee/vue-chat/main/screenshot/chat_1.png" alt="chat1" width="419">

发送语音信息

<img src="https://raw.githubusercontent.com/doublewhitee/vue-chat/main/screenshot/chat_4.png" title="" alt="img" width="420">

群信息及管理

<img src="https://raw.githubusercontent.com/doublewhitee/vue-chat/main/screenshot/chat_2.png" title="" alt="chat_2" width="422">

好友列表及添加好友界面

<img src="https://raw.githubusercontent.com/doublewhitee/vue-chat/main/screenshot/chat_3.png" title="" alt="chat_3" width="423">

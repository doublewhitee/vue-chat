import express from 'express'
import router from './routes/index.js'
import config from 'config'
import conn from './mongoDB/db.js'
import cookieParser from 'cookie-parser'

const app = express()

// 跨域
app.all('*', (req, res, next) => {
  // 设置请求头为允许跨域
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  // 设置服务器支持的所有头信息字段
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, sessionToken');
  // 设置服务器支持的所有跨域请求的方法
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

router(app)

app.server = app.listen(config.port, () => {
  console.log(`server running @ http://${ config.host }:${ config.port }`)
})

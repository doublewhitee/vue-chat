import express from 'express'
import router from './routes/index.js'
import config from 'config'
import conn from './mongoDB/db.js'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
// const createError = require('http-errors')
// const path = require('path')

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

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

router(app)

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.server = app.listen(config.port, () => {
  console.log(`server running @ http://${ config.host }:${ config.port }`)
})

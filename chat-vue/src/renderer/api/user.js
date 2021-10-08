import { request } from './request.js'

export function reqLogin (phone, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { phone, password }
  })
}

export function reqRegister (phone, password) {
  return request({
    url: '/user/register',
    method: 'post',
    data: { phone, password }
  })
}

export function reqUploadAvatar (file) {
  return request({
    url: '/user/upload',
    method: 'post',
    data: file,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function reqUpdateUser (info, _id) {
  return request({
    url: '/user/update',
    method: 'post',
    data: { info, _id }
  })
}

export function reqUserInfo (userId, friendId) {
  return request({
    url: '/user/info',
    params: { user_id: userId, friend_id: friendId }
  })
}

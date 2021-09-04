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

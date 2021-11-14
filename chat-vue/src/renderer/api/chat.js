import { request } from './request.js'

export function reqUploadAudio (file) {
  return request({
    url: '/chat/upload',
    method: 'post',
    data: file,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

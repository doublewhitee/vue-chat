import { request } from './request.js'

export function reqGroupList (_id) {
  return request({
    url: '/group/list',
    method: 'post',
    data: { _id }
  })
}

export function reqGroupDetail (_id) {
  return request({
    url: '/group/detail',
    params: { _id }
  })
}

export function reqChatList (groupId, skip) {
  return request({
    url: '/group/chat',
    method: 'post',
    data: { group_id: groupId, skip }
  })
}

export function reqSendMsg (groupId, userId, content) {
  return request({
    url: '/group/send',
    method: 'post',
    data: { group_id: groupId, user_id: userId, content }
  })
}

export function reqChatHistory (groupId, searchText, page) {
  return request({
    url: '/group/history',
    method: 'post',
    data: { group_id: groupId, searchText, page }
  })
}

export function reqChatHistoryCount (userId, searchText) {
  return request({
    url: '/group/historycount',
    method: 'post',
    data: { user_id: userId, searchText }
  })
}

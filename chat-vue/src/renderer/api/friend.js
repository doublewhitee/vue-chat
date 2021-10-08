import { request } from './request.js'

export function reqFriendList (_id) {
  return request({
    url: '/friend/friendlist',
    params: { _id }
  })
}

export function reqAcceptFriend (userId, friendId, firendName, groupId) {
  return request({
    url: '/friend/add',
    method: 'post',
    data: { user_id: userId, friend_id: friendId, friend_name: firendName, group_id: groupId }
  })
}

export function reqIgnoreRequest (_id) {
  return request({
    url: '/friend/ignore',
    method: 'post',
    data: { _id }
  })
}

export function reqUserToAdd (searchText, page, _id) {
  return request({
    url: '/friend/addlist',
    params: { searchText, page, _id }
  })
}

export function reqAddFriend (addText, userId, friendId) {
  return request({
    url: '/friend/addreq',
    method: 'post',
    data: { addText, user_id: userId, friend_id: friendId }
  })
}

export function reqNewFriendList (userId) {
  return request({
    url: '/friend/newfriends',
    method: 'post',
    data: { user_id: userId }
  })
}

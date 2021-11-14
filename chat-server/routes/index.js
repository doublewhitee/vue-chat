'use strict';

import user from './user.js'
import friend from './friend.js'
import group from './group.js'
import chat from './chat.js'

export default app => {
  app.use('/user', user)
  app.use('/friend', friend)
  app.use('/group', group)
  app.use('/chat', chat)
}

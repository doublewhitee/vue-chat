'use strict';

import user from './user.js'
import friend from './friend.js'

export default app => {
  app.use('/user', user)
  app.use('/friend', friend)
}

'use strict';

import user from './user.js'

export default app => {
  app.use('/user', user)
}

'use strict';

import config from 'config'

class chat_controller {
  async upload (req, res, next) {
    try {
      const file = req.files[0]
      res.send({
        code: 0,
        data: {
          name: file.filename,
          url: config.audio_url + file.filename
        }
      })
    } catch (error) {
      res.send({ code: 1, msg: '上传失败, 请重新尝试！' })
    }
  }
}

export default new chat_controller()

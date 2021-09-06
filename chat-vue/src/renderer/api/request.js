import axios from 'axios'
import Vue from 'vue'

import { BASE_URL } from '../config/constant'

export function request (config) {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true
  })

  instance.interceptors.request.use(config => {
    return config
  }, err => {
    console.log(err)
  })

  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    Vue.prototype.$message.error('网络似乎出了一点问题...')
    console.log(err)
  })

  return instance(config)
}

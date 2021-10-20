export function getTimeInfo (time, type = 'normal') {
  const date = new Date(time)
  const now = new Date()
  const temp = new Date()
  const yesterday = new Date(temp.setDate(temp.getDate() - 1))
  const week = new Date(temp.setDate(temp.getDate() - 6))

  if (date.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
    return formatDate(time, 'hh:mm')
  } else if (date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
    if (type === 'normal') {
      return '昨天'
    } else {
      return '昨天' + ' ' + formatDate(time, 'hh:mm')
    }
  } else if (date.setHours(0, 0, 0, 0) >= week.setHours(0, 0, 0, 0)) {
    const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    if (type === 'normal') {
      return weeks[date.getDay()]
    } else {
      return weeks[date.getDay()] + ' ' + formatDate(time, 'hh:mm')
    }
  } else {
    if (type === 'normal') {
      return formatDate(time, 'yy/MM/dd')
    } else {
      return formatDate(time, 'yy/MM/dd hh:mm')
    }
  }
}

// 时间格式化
export function formatDate (dateData, fmt) {
  const date = new Date(dateData)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero (str) {
  return ('00' + str).substr(str.length)
}

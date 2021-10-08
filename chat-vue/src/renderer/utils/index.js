// 转换BASE64
export function getBase64 (file) {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader()
    let imgResult = ''
    reader.readAsDataURL(file)
    reader.onload = function () {
      imgResult = reader.result
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.onloadend = function () {
      resolve(imgResult)
    }
  })
}

// 防抖
export function debounce (fn, delay) {
  let timer = null
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this)
    }, delay)
  }
}

// 高亮显示的数据过滤
export function highlightText (keyword, text) {
  let html = '<div>' + text + '</div>'
  const regex = new RegExp(String(keyword), 'g')
  html = html.replace(regex, '<span>' + keyword + '</span>')
  return html
}

import CryptoJS from 'crypto-js'

const key = CryptoJS.enc.Utf8.parse('iD4rWW8nXbIU3ZXH')
const iv = CryptoJS.enc.Utf8.parse('5v0Akyt1ikuvYWK2')

export function encryptAES(input) {
  const text = CryptoJS.enc.Utf8.parse(input)
  const res = CryptoJS.AES.encrypt(text, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  return res.ciphertext.toString()
}

export function decryptAES(input) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(input)
  const text = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const res = CryptoJS.AES.decrypt(text, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  return res.toString(CryptoJS.enc.Utf8).toString()
}

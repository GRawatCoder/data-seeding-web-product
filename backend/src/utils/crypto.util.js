import crypto from 'crypto'

const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex')
const IV_LENGTH = 16

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(payload) {
  const [ivHex, encryptedHex] = payload.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encryptedText = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv)
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

// Must be 32 bytes
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.APP_SECRET || 'dev-secret')
  .digest()

export function encrypt(text) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  }
}

export function decrypt(payload) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(payload.iv, 'hex')
  )

  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'))

  let decrypted = decipher.update(payload.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

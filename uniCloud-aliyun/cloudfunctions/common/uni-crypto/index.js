'use strict';
const crypto = require('crypto')

const SECRET_KEY = 'your-secret-key-here'

module.exports = {
  encrypt(password) {
    const hmac = crypto.createHmac('sha256', SECRET_KEY)
    return hmac.update(password).digest('hex')
  },
  
  verify(password, encrypted) {
    return this.encrypt(password) === encrypted
  }
} 
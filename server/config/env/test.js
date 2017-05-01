'use strict'

module.exports = {
  db: process.env.MONGODB_URI || 'mongodb://localhost:27017/fb-test',
  port: 3001,
  app: {
    title: 'Test Environment'
  }
}
  
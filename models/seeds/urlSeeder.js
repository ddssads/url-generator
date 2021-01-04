const Url = require('../url')
const db = require('../../config/mongoose')

db.once('open', () => {
  Url.create({
    targetURL: 'https://www.google.com/',
    shortURL: '3azbC'
  })
  console.log('done')
})
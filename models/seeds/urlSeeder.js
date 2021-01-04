const Url = require('../url')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/url', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
  Url.create({
    targetURL: 'https://www.google.com/',
    shortURL: '3azbC'
  })
  console.log('done')
})
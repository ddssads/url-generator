const mongoose = require('mongoose')
const Schema = mongoose.Schema
const urlSchema = new Schema({
  targetURL: {
    type: String,
    required: true
  },
  shortURL: {
    type: String
  }
})

module.exports = mongoose.model('Url', urlSchema)
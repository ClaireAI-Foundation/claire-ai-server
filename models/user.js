const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('User', new Schema({
  name: String,
  username: String,
  email: String,
  createdAt: String,
  updatedAt: String,
  password: {
    bcrypt: true,
    type: String
  }
}))
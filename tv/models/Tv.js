const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
mongoose.connection.openUri(`${process.env.MONGOURI}`)

const TvCounter = require('./TvCounter')

let TvSchema = new Schema({
  poster_path: String,
  overview: String,
  title: {
    type: String,
    required: true
  },
  popularity: Number,
  tag: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: null
  }
})

TvSchema.pre('save', function(next) {
  TvCounter
    .findOneAndUpdate({
      name: 'tv'
    }, {
      name: 'tv',
      $inc: {version: 1}
    }, {
      new: true,
      upsert: true
    })
    .then(version => {
      next()
    })
    .catch(reason => {
      console.error(reason)
      next(reason)
    })
})

TvSchema.pre('findOneAndUpdate', function(next) {
  this.updateOne({
      _id: this._conditions._id
    }, {
      updatedAt: Date.now()
    })
    .then(() => {
      TvCounter
        .findOneAndUpdate({
          name: 'tv'
        }, {
          name: 'tv',
          $inc: {version: 1}
        }, {
          new: true,
          upsert: true
        })
        .then(version => {
          next()
        })
    })
    .catch(reason => {
      console.error(reason)
      next(reason)
    })
})

TvSchema.pre('findOneAndRemove', function(next) {
  TvCounter
    .findOneAndUpdate({
      name: 'tv'
    }, {
      name: 'tv',
      $inc: {version: 1}
    }, {
      new: true,
      upsert: true
    })
    .then(version => {
      next()
    })
})


module.exports = mongoose.model('Tv', TvSchema)

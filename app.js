const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Url = require('./models/url')
const generatorUrl = require('./generator')

const app = express()
const PORT = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

mongoose.connect('mongodb://localhost/url', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/', (req, res) => {
  const url = req.body.URL
  Url.exists({ targetURL: url }, function (err, doc) {
    if (err) {
      console.log(err)
    } else {
      if (doc) {
        Url.find({ targetURL: url })
          .lean()
          .then(url => {
            let shortURL = `localhost:${PORT}/${url[0].shortURL}`
            res.render('index', { shortURL })
          })
          .catch(error => console.log(error))
      } else {
        //create new URL in DataBase
        let newURL = generatorUrl
        Url.exists({ shortURL: newURL }, function (err, doc) {
          if (err) {
            console.log(err)
          } else {
            if (doc) {
              newURL = generatorUrl
            } else {
              Url.create({
                targetURL: url,
                shortURL: newURL
              })
                .then(() => {
                  let shortURL = `localhost:${PORT}/${newURL}`
                  res.render('index', { shortURL })
                })
                .catch(error => console.log(error))
            }
          }
        })
      }
    }
  })
})

app.get('/:shortURL', (req, res) => {
  shortURL = req.params.shortURL
  console.log(shortURL)
  Url.findOne({ shortURL: shortURL })
    .then(url => res.redirect(`${url.targetURL}`))
    .catch(error => console.log(error))
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost${PORT}`)
})
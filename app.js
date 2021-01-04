const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const Url = require('./models/url')
const generatorUrl = require('./generator')
require('./config/mongoose')

const app = express()
const PORT = process.env.PORT || 3000
const BASE_URL = 'https://infinite-bayou-76959.herokuapp.com'

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')


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
            let shortURL = `${BASE_URL}/${url[0].shortURL}`
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
            //如果短網址存在資料庫，重新生成一個
            if (doc) {
              newURL = generatorUrl
              //沒有的話 將這個短網址存入資料庫
            } else {
              Url.create({
                targetURL: url,
                shortURL: newURL
              })
                .then(() => {
                  let shortURL = `${BASE_URL}/${newURL}`
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
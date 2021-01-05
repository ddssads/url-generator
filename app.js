const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const Url = require('./models/url')
const generatorUrl = require('./generator')
const { readyState } = require('./config/mongoose')
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

app.post('/results', (req, res) => {
  const inputUrl = req.body.URL
  //檢查輸入的網址是否存在資料庫，有的話直接找出對應的短網址，沒有則創建一個新的
  Url.exists({ targetURL: inputUrl }, function (err, doc) {
    if (err) {
      console.log(err)
    } else {
      if (doc) {
        console.log('網址已存在，正在導入頁面..')
        return Url.find({ targetURL: inputUrl })
          .lean()
          .then(urls => {
            const result = urls.find(url => url.targetURL === inputUrl)
            console.log('result', result)
            let shortURL = `${BASE_URL}/${result.shortURL}`
            res.render('result', { shortURL })
          })
          .catch(error => console.log(error))
      }
    }
    console.log('網址不存在...')
    let newURL = generatorUrl()
    console.log('準備創建短網址：', newURL)
    //檢查短網址是否已經存在資料庫，是的話再重新生成一個短網址 再檢查一次，直到沒有重複為止則存入資料庫
    console.log('正在檢查是否重複...')
    return Url.find()
      .lean()
      .then(urls => {
        let isShortUrlExit = urls.find(url => url.shortURL === newURL)
        while (isShortUrlExit) {
          newURL = generatorUrl()
          isShortUrlExit = urls.find(url => url.shortURL === newURL)
        }
      })
      .then(() => {
        Url.create({
          targetURL: inputUrl,
          shortURL: newURL
        })
          .then(() => {
            let shortURL = `${BASE_URL}/${newURL}`
            console.log('創建完畢 正在導入頁面')
            res.render('result', { shortURL })
          })
          .catch(error => console.log(error))
      })
      .catch(error => console.log(error))
  })
})


app.get('/:shortURL', (req, res) => {
  shortURL = req.params.shortURL
  Url.exists({ shortURL: shortURL }, function (err, doc) {
    if (err) {
      console.log(err)
    } else {
      if (doc) {
        return Url.findOne({ shortURL: shortURL })
          .then(url => res.redirect(`${url.targetURL}`))
          .catch(error => console.log(error))
      } else {
        res.render('index', { errorMessage: 'Could not found this URL!' })
      }
    }
  })
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost${PORT}`)
})
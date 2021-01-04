function generatorUrl() {
  console.log('執行generator')
  let chars = '0123456789abcdefghijklmnopqrsutvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let shortURL = ''
  let isExits = []
  //抽取五個隨機數
  for (let i = 0; i <= 4; i++) {
    let randomIndex = Math.floor(Math.random() * chars.length)
    shortURL += chars[randomIndex]
  }
  //回傳
  return shortURL
}

module.exports = generatorUrl


const express = require('express')
const bodyParser  = require('body-parser')
const exFile = require('express-fileupload')
const port = 5000
const formidable = require('formidable')
const funcs = require('./core/functions')
const fs = require('fs')
const db = require('./config/db')
const TokenGenerator = require('uuid-token-generator');
const url = require('url')
// const router = require('./routes/router')

var server = express()

//create connection to mysql
const con = db.createConnection()

con.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message)
  }
})

server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*") // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

server.use(exFile())
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}))

server.use(express.static(__dirname + '/public'))
server.use(express.static(__dirname + '/controllers'))
server.use(express.static(__dirname + '/views'))

server.set('view engine', 'pug')
server.set('views', __dirname + '/views')

server.get('/auth', (req, res) => {
  res.render('auth')
})

server.get('/', (req, res) => {
  res.render('index')
})

var users = []
con.query("select * from users",(err, result, fields) => {
  for(let i = 0; i < result.length; i++) {
    users.push(result[i])
  }
})

var loginnedUser = {
    login: '',
    token: ''
}
server.post('/login', (req, res) => {
  for (i = 0; i < users.length; i++) {
    if ((req.body.username==users[i].login)&&(req.body.password===users[i].password)) {
      var newLog = users[i].login
      const tokgen = new TokenGenerator();
      loginnedUser.login = newLog
      loginnedUser.token = tokgen.generate() // Default is a 128-bit token encoded in base58
    }
  }
  console.log(loginnedUser)
  res.send('ok')
})


server.get('/check-users', (req, res) => {
  if (loginnedUser.token.length > 0 ) {
    res.redirect('/')
  }
})

//table requests
server.post('/fileupload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send('Нет файла');
    }

    var formats = ['xls', 'xlsx', 'csv']
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let excelFile = req.files[0];
    for (let i = 0; i < formats.length; i++) {
      i++
    }
    // se the mv() method to place the file somewhere on your server
    excelFile.mv('./public/excelImports/' + excelFile.name, function(err) {
      if (err)
        return res.send('Неверный формат');
      var sheets = funcs.excelToDB('./public/excelImports/' + excelFile.name)
      var sql = "INSERT INTO uchettable (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES ?";
      con.query(sql, [sheets], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
      // con.query(`insert into tableslist (tabelName, userLogin) values (${excelFile.name}, 'user')`, err => {
      //   console.log(err)
      // })
      res.send('ok')
    });
}) 



//gettable
server.get('/get-table', (req, res) => {
  con.query('SELECT * FROM uchettable', (err, result, fields) => {
      (result.length > 0 || result != undefined) ? res.send(result) : res.send('No rows')
  })
})

server.post('/add-data', (req, res) => {
  var str = ''
  for (let i = 0; i < 22; i++) {
    if (i == 21) {
      str += "'_'"
    } else {
      str +=  "'_',"
    }
  }
  console.log(str)
  var sql = `INSERT INTO uchettable (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES (${str})`;
  con.query(sql,function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
  });
  res.send('ok')
})

server.post('/change-data', (req, res) => {
  for(let i = 0; i < req.body.datas.length; i++) {

    con.query(`UPDATE uchettable SET ${req.body.datas[i].tdClass} = '${req.body.datas[i].spanText}' WHERE id=${req.body.datas[i].tdId}`, (err) => {
      if (err) {
        throw err
      } else{
      }
    })
  }
  res.send('успех')
})

// server.set('10.221.75.57', '10.221.75.93')
server.listen(port, () => console.log('Server start on: ' + port))

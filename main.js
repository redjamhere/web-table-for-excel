const express = require('express')
const session = require('express-session')
const bodyParser  = require('body-parser')
const exFile = require('express-fileupload')
const port = 5000
const funcs = require('./core/functions')
const fs = require('fs')
const db = require('./config/db')
const TokenGenerator = require('uuid-token-generator')

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

server.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

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

server.get('/', (req, res) => {
  if (req.session.loggedin) {
		res.render('index')
	} else {
		res.render('auth')
	}
	res.end();
})

server.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
	  con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
        request.session.userdata = results[0]
        request.session.table = results[0].Permission
        response.redirect('/');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

server.post('/logout', (req,res) => {
  console.log(req.session)
  req.session.destroy()
  res.redirect('/')
})

//table requests
server.post('/fileupload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send('Нет файла');
    }

    var formats = ['xls', 'xlsx', 'csv']
    let excelFile = req.files[0];
    for (let i = 0; i < formats.length; i++) {
      i++
    }
    excelFile.mv('./public/excelImports/' + excelFile.name, function(err) {
      if (err)
        return res.send('Неверный формат');
      var sheets = funcs.excelToDB('./public/excelImports/' + excelFile.name)
      var sql = `INSERT INTO ${req.session.userdata.OtdelName} (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES ?`;
      con.query(sql, [sheets], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
      res.send('ok')
    });
}) 


//gettable
server.get('/get-table', (req, res) => {
  console.log(req.session)
  con.query(`select OtdelSmallName from otdeli where id = ${parseInt(req.session.userdata.OtdelNum)}`,(err, result, fields) => {
    console.log(result[0].OtdelSmallName)
    con.query(`select * from ${result[0].OtdelSmallName}`, (err, result, fields) => {
      res.send(result)
    })
  })
})

server.get('/table-list', (req, res) => {
  con.query(`SELECT Permission FROM users`, (err, result, fields) => {
    let pers = []
    for(let i = 0; i < result.length; i++) {
      if(parseInt(req.session.userdata.Permission) <= parseInt(result[i].Permission)) {
        pers.push(result[i].Permission)
      }
    }
    res.send(pers)
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
  var sql = `INSERT INTO ${req.session.userdata.OtdelName} (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES (${str})`;
  con.query(sql,function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
  });
  res.send('ok')
})

server.post('/change-data', (req, res) => {
  for(let i = 0; i < req.body.datas.length; i++) {
    con.query(`UPDATE ${req.session.userdata.OtdelName} SET ${req.body.datas[i].tdClass} = '${req.body.datas[i].spanText}' WHERE id=${req.body.datas[i].tdId}`, (err) => {
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

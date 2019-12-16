const express = require('express')
const session = require('express-session')
const bodyParser  = require('body-parser')
const exFile = require('express-fileupload')
const port = 80
const funcs = require('./core/functions')
const fs = require('fs')
const db = require('./config/db')
const TokenGenerator = require('uuid-token-generator')
const admRout = require('./routes/adminRoutes')

var server = express()

//Middleware

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
  maxAge: 1000 * 60 * 60,
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

server.use('/admin', admRout)

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


// authenticate
server.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
	  con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
        request.session.userdata = results[0]
        request.session.table = results[0].OtdelNum
        response.redirect('/')
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

//uppload excel
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

      con.query(`call getUserTable(${parseInt(req.session.table)})`, (err, result) => {

        if (err) console.log(err)

        var sheets = funcs.excelToDB('./public/excelImports/' + excelFile.name)
        var sql = `INSERT INTO ${result[0][0].OtdelSmallName} (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES ?`;
        con.query(sql, [sheets], function (err, result) {
          if (err) throw err;
          console.log("Number of records inserted: " + result.affectedRows);
        });

        res.send('ok')
      })
    });
}) 


//gettable
server.post('/get-table', (req, res) => {
  if(req.body.tableId > 0) {
    req.session.table = req.body.tableId
  }
  con.query(`call getUserTable(${req.session.table})`,(err, result) => {
    con.query(`SELECT * FROM ${result[0][0].OtdelSmallName}`, (err, result) => {
      res.send(result)
    })
  })
})

server.get('/table-list', (req, res) => {
  con.query(`SELECT id, OtdelFullName FROM otdeli WHERE Level >= ${req.session.userdata.Permission}`, (err, result) => {
    res.send({
      data: result,
      first: req.session.userdata.OtdelNum})
  })
})

//add new row to table
server.post('/add-data', (req, res) => {
  var str = ''
  for (let i = 0; i < 22; i++) {
    if (i == 21) {
      str += "'_'"
    } else {
      str +=  "'_',"
    }
  }
  con.query(`CALL getUserTable(${req.session.table})`, (err, result) => {
    var sql = `INSERT INTO ${result[0][0].OtdelSmallName} (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES (${str})`;
    con.query(sql,function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
    });
    res.send(req.session.table)
  })
})

// change item in row

server.post('/change-data', (req, res) => {
  console.log(req.session.table)
  for(let i = 0; i < req.body.datas.length; i++) {
    con.query(`CALL getUserTable(${req.session.table})`, (err, result) => {
      con.query(`UPDATE ${result[0][0].OtdelSmallName} SET ${req.body.datas[i].tdClass} = '${req.body.datas[i].spanText}' WHERE id=${req.body.datas[i].tdId}`, (err) => {
        if (err) {
          console.log(err)
        } else{

        }
      })
    })
  }
  res.send()
})

server.post('/change-table', (req, res) => {
  con.query(`SELECT id FROM otdeli WHERE OtdelFullName = '${req.body.tableName}'`, (err, result) => {
    res.send(
      {
      id: result[0].id + '',
      name: req.body.tableName
      }
    )
  })
})

server.post('/delete-row', (req, res) => {
  con.query(`call getUserTable(${req.session.table})`, (err, result) => {
    let rows = req.body.datas
    console.log(rows)
    con.query(`DELETE FROM ${result[0][0].OtdelSmallName} WHERE id IN (?)`, [rows], (err, result) => {
      if (err)
        console.log(err)
      else 
        res.send('ok')
    })
  })
})

server.post('/permission', (req, res) => {
  res.send({
    readwrite : req.session.userdata.readwrite,
    permission : req.session.userdata.Permission
  })
})
// server.set('10.221.75.57', '10.221.75.93')
server.listen(port, () => console.log('Server start on: ' + port))

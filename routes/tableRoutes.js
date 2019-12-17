const express = require('express')
const router = express.Router()
const funcs = require('../core/functions')
const fs = require('fs')
const exFile = require('express-fileupload')
const db = require('../config/db')

const secureAuth = (req, res, next) => {
  if (req.session.userdata == undefined) {
    res.redirect('/')
  } else next()
}

router.use(secureAuth)

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/fileupload', (req, res) => {
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
router.post('/get-table', (req, res) => {
  con.query(`call getUserTable(${req.session.table})`,(err, result) => {
    con.query(`SELECT * FROM ${result[0][0].OtdelSmallName}`, (err, result) => {
      res.send(result)
    })
  })
})

router.get('/table-list', (req, res) => {
con.query(`SELECT id, OtdelFullName FROM otdeli WHERE Level >= ${req.session.userdata.Permission}`, (err, result) => {
  res.send({
    data: result,
    first: req.session.userdata.OtdelNum})
})
})

//add new row to table
router.post('/add-data', (req, res) => {
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

router.post('/change-data', (req, res) => {
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

router.post('/change-table', (req, res) => {
con.query(`SELECT id FROM otdeli WHERE OtdelFullName = '${req.body.tableName}'`, (err, result) => {
  res.send(
    {
    id: result[0].id + '',
    name: req.body.tableName
    }
  )
})
})

router.post('/delete-row', (req, res) => {
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

router.post('/permission', (req, res) => {
res.send({
  readwrite : req.session.userdata.readwrite,
  permission : req.session.userdata.Permission
})
})

module.exports = router
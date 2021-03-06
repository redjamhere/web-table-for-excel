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

router.use(exFile())

const con = db.getDB()

const querys = {
  getUserDepart: (table, id) => {
    return `SELECT * FROM ${table}_departs WHERE id = ${id}`
  },
  getInventData: (table) => {
    return `SELECT * FROM ${table}`
  }
}


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
    var sheets = funcs.excelToDB('./public/excelImports/' + excelFile.name)
    var sql = `INSERT INTO ${req.session.userdata.DepartName} (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES ?`;
    con.query(sql, [sheets]) 
      .then(rows => {
        console.log("Number of records inserted: " + rows.affectedRows);
      })
      .catch(err => {
        console.log(err)
      })
    res.send('ok')
  });
});

//gettable
//select table with inventar data
router.post('/get-table', (req, res) => {
  if(req.body.openTable) {
    con.query(`select id from service_departs where Shortname = '${req.body.openTable}'`)
      .then(rows => {
        if(req.session.userdata.DepartViewPermission.split(', ').indexOf(`${parseInt(rows[0].id)}`) >= 0 || req.session.userdata.GodMode == 1) {
          con.query(`select * from ${req.body.openTable}`)
            .then(rows => {
              res.send(rows)
              req.session.userdata.DepartName = req.body.openTable
              console.log(req.session)
              req.session.save()
            })
            .catch(err => {
              res.send('No rows')
            })
        } else {
          res.send(false)
        }
      })
      .catch(err => {
        res.send('No rows')
      })
  } else {
    con.query(`select * from ${req.session.userdata.DepartName}`)
      .then(rows => {
        res.send(rows)
      })
      .catch(err => {
        res.send('No rows')
      })
  }
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
  let sql = `INSERT INTO ${req.session.userdata.DepartName} (ПоззаявкиСП, НомерзаявкиСП, Материал, КрТекстМатериала, Единицаизмерения, КолвозаявкаСП, ЦенабезНДС, СтоимбезНДС, Годзаявкампании, Статус, Датапоставки, Срокдоставкидн, ДатасогласованиязаявкаСП, ЗаявкаСПОписание, Taбномер, Прайспоставщикнаим, Номердоговора, Заказчик, ГруппаСостояние, Адресразмещения, ФИОпользователяподразделение, Техническиеатребуты)VALUES (${str})`;
  con.query(sql) 
    .then(rows => {
      console.log("Number of records inserted: " + rows.affectedRows);
      res.send('ok')
    })
    .catch(err => {
      res.send(err)
    })
})

// change item in row

router.post('/change-data', (req, res) => {
  for(let i = 0; i < req.body.datas.length; i++) {
      con.query(`UPDATE ${req.session.userdata.DepartName} SET ${req.body.datas[i].tdClass} = '${req.body.datas[i].spanText}' WHERE id=${req.body.datas[i].tdId}`)
        .then(rows => {
          res.send('ok')
        })
        .catch(err => {
          res.send(err)
        })
  }
})

router.post('/delete-row', (req, res) => {
  let rows = req.body.datas
  con.query(`DELETE FROM ${req.session.userdata.DepartName} WHERE id IN (?)`, [rows])
    .then(_ => {
      res.send('ok')
    })
    .catch(err => {
      res.send(err)
    })
})

router.get('/get-services', (req, res) => {
  let nodes = []

  con.query('select * from services')
    .then(rows => {
      rows.forEach(s => {
        const newService = {
          id: s.id+'service',
          text: s.FullName,
          icon: 'img/wrench.png',
          parent: '#',
          children: true,
          short: s.ShortName,
          level: s.Level
        }
        nodes.push(newService)
      })
      res.send(nodes)
    })
})

router.get('/get-departs', (req, res) => {

  let departs =[]
  con.query("select * from service_departs")
    .then(_ => {
      _.forEach(d => {
        const newDepart = {
          id: d.id + 'depart',
          text: d.Fullname,
          icon: 'img/table.png',
          parent: d.Parent + 'service',
          children: false,
          short: d.Shortname,
          level: d.Level
        }
        departs.push(newDepart)
      })
      res.send(departs)
    })
})

router.post('/getperm', (req, res) => {
  res.send({
    departView: req.session.userdata.DepartViewPermission.split(', '),
    serviceView: req.session.userdata.ServiceViewPermission,
    readWrite: req.session.userdata.Readwrite,
    godMode: req.session.userdata.GodMode
  })
})

router.post('/logout', (req,res) => {
  console.log(req.session)
  req.session.destroy()
  res.redirect('/')
})

router.post('/supercheck', (req, res) => {
  con.query(`SELECT GodMode FROM users WHERE username = '${req.session.userdata.username}'`)
    .then(rows => {
      if (rows[0].GodMode == 1) {
        res.send(true)
      } else {
        res.send(false)
      }
    })
    .catch(err => {
      res.send(err)
    })
})

module.exports = router

const express = require('express')
const router = express.Router()
const db = require('../config/db')
const randomizer = require('uuid-token-generator')

const cyrillicToTranslit = require('cyrillic-to-translit-js')

const con = db.getDB()

const checkSecurity = function(req, res, next) {
  if (req.session.userdata !== undefined) {
    let username = req.session.userdata.username
    con.query('SELECT * FROM users WHERE username = ?', [username])
    .then(rows => {
      if (rows[0].username == 'admin') next()
      else res.sendStatus(403)
    })
    .catch(err => {
      res.send(err)
    })
  } else {
    res.sendStatus(403)
  }
}

router.use(checkSecurity)

router.get('/', (req, res, next) => {
  res.render('admin')
})

router.post('/users', (req, res) => {
  con.query('select * from users')
    .then(rows => res.send(rows))
    .catch(err =>  res.send(err))
})

router.post('/services', (req, res) => {
  con.query('select * from services')
    .then(rows => { res.send(rows) })
    .catch(err => res.send(err))
})

router.post('/departs', (req, res) => {

  if(req.body.service) {
    con.query(`SELECT id FROM services WHERE ShortName = '${req.body.service}'`)
    .then(rows => {
      con.query(`SELECT * FROM service_departs WHERE Parent = '${rows[0].id}'`)
      .then(rows => { res.send(rows) })
      .catch(err => res.send(err))
    })
  } else {
    con.query(`SELECT id FROM services WHERE ShortName = '${req.session.userdata.ServiceName}'`)
    .then(rows => {
      con.query(`SELECT * FROM service_departs WHERE Parent = '${rows[0].id}'`)
      .then(rows => { res.send(rows) })
      .catch(err => res.send(err))
    })
  }


})

router.post('/userslist', (req, res) => {
  con.query('select id, Lastname, Firstname, Middlename, Duty, GodMode from users')
    .then(rows => { res.send(rows) })
    .catch(err => res.send(err))
})

router.post('/userdatasave', (req, res) => {
  let saves = req.body.saves
  con.query(`SELECT * FROM users WHERE username = '${saves.username}'`)
    .then(rows => {
      if(rows.length === 0 || rows[0].id == req.body.user_id) {
        con.query(`UPDATE users SET 
          Firstname = '${saves.Firstname}', 
          Lastname = '${saves.Lastname}', 
          Middlename = '${saves.Middlename}', 
          username = '${saves.username}', 
          password = '${saves.password}',
          Readwrite = '${saves.Readwrite}', 
          DepartViewPermission = '${saves.DepartViewList}', 
          DepartName = '${saves.Depart}', 
          ServiceName = '${saves.Service}', 
          Duty = '${saves.Duty}' 
          WHERE id = '${req.body.user_id}'`)
          .then(rows => {
            res.send('Сохранение успешно')
          })
          .catch(err => {
            console.log(err)
            res.send('Ошибка сохранения')
          })
      } else {
        res.send('Имя пользователя занято')
      }
    })
    .catch(err => {
      console.log(err)
      res.send('Ошибка сохранения')
    })
})

router.post('/userdataadd', (req, res) => {
  let adds = req.body.adds

  con.query(`SELECT * FROM users WHERE username = '${adds[3]}'`)
    .then(rows => {
      console.log(rows)
      if(rows.length === 0) {
        con.query(`INSERT INTO users (Firstname, Lastname, Middlename, username, password, Readwrite, DepartViewPermission, DepartName, ServiceName, Duty) VALUES(?)`, [adds])
          .then(rows => {
            res.send('Добавление успешно')
          })
          .catch(err => {
            console.log(err)
            res.send('Ошибка добавления')
          })
      } else {
        res.send('Имя пользователя занято')
      }
    })
    .catch(err => {
      console.log(err)
      res.send('Ошибка добавления')
    })
})

router.post('/deleteuser', (req, res) => {
  con.query(`DELETE FROM users WHERE id = ${req.body.user_id}`)
    .then(rows => {
      res.send('Удаление успешно')
    })
    .catch(err => {
      console.log(err)
      res.send('Ошибка удаления')
    })
})

router.post('/add-service', (req, res) => {
  let serviceName = req.body.serviceName

  let randomName = new randomizer();
  randomName = randomName.generate();


  let serviceShortName = cyrillicToTranslit().transform(serviceName, '_').toLowerCase()
  serviceShortName = serviceShortName.replace(/[^\wа-яё]+/gi, "") + '_' + randomName.slice(0, 6)
  
  con.query(`INSERT INTO services (ShortName, Fullname) VALUES('${serviceShortName}', '${serviceName}')`)
    .then(rows => {
      res.send('Сервис успешно добавлен')
    })
    .catch(err => {
      console.log(err)
      res.send('Ошибка добавления')
    })
  
})

router.post('/add-depart', (req, res) => {
  let serviceName = req.body.serviceName
  let randomName = new randomizer();
  randomName = randomName.generate();

  con.query(`SELECT id FROM services WHERE ShortName = '${serviceName}'`)
    .then(rows => {
      console.log(rows)
      con.query(`INSERT INTO service_departs (Shortname, Fullname, Parent) VALUES('${serviceName + '__' + randomName}', 'Без названия', '${rows[0].id}')`)
        .then(rows => {
          con.query(`CREATE TABLE ${serviceName + '__' + randomName} (id INT AUTO_INCREMENT, ПоззаявкиСП VARCHAR(255), НомерзаявкиСП VARCHAR(255), Материал VARCHAR(255), КрТекстМатериала VARCHAR(255), Единицаизмерения VARCHAR(255),  КолвозаявкаСП VARCHAR(255), ЦенабезНДС VARCHAR(255), СтоимбезНДС VARCHAR(255), Годзаявкампании VARCHAR(255), Статус VARCHAR(255), Датапоставки VARCHAR(255), Срокдоставкидн VARCHAR(255),  ДатасогласованиязаявкаСП VARCHAR(255), ЗаявкаСПОписание VARCHAR(255), Taбномер VARCHAR(255), Прайспоставщикнаим VARCHAR(255), Номердоговора VARCHAR(255), Заказчик VARCHAR(255), ГруппаСостояние VARCHAR(255),  Адресразмещения VARCHAR(255), ФИОпользователяподразделение VARCHAR(255), Техническиеатребуты VARCHAR(255), PRIMARY KEY (id))`)
          .then(rows => {
            res.send('Служба успешно добавлена! Дайте ей название')
          })
        })
        .catch(err => {
          console.log(err)
          res.send('Ошибка добавления')
        })
    })
    .catch(err => {
      console.log(err) 
      res.send('Ошибка сервера')
    })
})

router.post('/save-depart', (req, res) => {
  let depId = req.body.depId
  let newName = req.body.newName

  con.query(`UPDATE service_departs SET Fullname = '${newName}' WHERE id = '${depId}'`)
    .then(rows => {
      res.send('Имя успешно изменено')
    })
    .catch(err => {
      console.log(err)
      res.send('Ошибка сервера')
    })
})

router.post('/delete-depart', (req, res) => {
  let depId = req.body.depId
  let departName = req.body.departName

  con.query(`DELETE FROM service_departs WHERE id = '${depId}'`)
    .then(rows => { 
      con.query(`DROP TABLE ${departName}`)
        .then(rows => {
          res.send('Служба успешно удалена')
        })
        .catch(err => {
          res.send('Ошибка сервера')
        })
    })
    .catch(err => {
      res.send('Ошибка сервера')
    })
})

router.post('/delete-service', (req, res) => {
  let serviceId = req.body.serviceId

  con.query(`DELETE FROM service_departs WHERE Parent = '${serviceId}'`)
    .then(rows => {
      con.query(`DELETE FROM services WHERE id = '${serviceId}'`)
        .then(rows => {
          res.send('Сервис успешно удален')
        })
        .catch(err => {
          console.log(err)
          res.send('Ошибка сервера')
        })
    })
    .catch(err => {
      console.log(err)
      res.send('Ошибка сервера')
    })
})

router.post('/logout', (req,res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router
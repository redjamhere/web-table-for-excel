const express = require('express')
const router = express.Router()
const db = require('../config/db')

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

// router.use(checkSecurity)

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

router.post('/logout', (req,res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router
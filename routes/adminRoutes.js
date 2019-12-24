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
  con.query('select id, Lastname, Firstname, Middlename, Duty from users')
    .then(rows => { res.send(rows) })
    .catch(err => res.send(err))
})

module.exports = router
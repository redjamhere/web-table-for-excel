const express = require('express')
const router = express.Router()
const db = require('../config/db')

// const con = db.createConnection()

const checkSecurity = function(req, res, next) {
  if (req.session.userdata !== undefined) {
    let username = req.session.userdata.username
    con.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
      if (result[0].username == 'admin') {
        next()
      }
      else (
        res.sendStatus(403)
      )
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
  con.query('select * from users', (err, result) => {
    res.send(result)
  })
})

router.post('/services', (req, res) => {
  con.query('select * from services', (err, result) => {
    res.send(result)
  })
})

router.post('/departs', (req, res) => {
  con.query('select * from otdeli', (err, result) => {
    res.send(result)
  })
})

router.post('/userslist', (req, res) => {
  con.query('select id, Lastname, Firstname, Middlename, duty from users',(err, result) => {
    res.send(result)
  })
})

module.exports = router
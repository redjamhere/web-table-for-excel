const express = require('express')
const router = express.Router()
const db = require('../config/db')

const con = db.createConnection()

router.get('/', (req, res) => {
  res.render('admin')
  // if (req.session.userdata !== undefined) {
  //   let username = req.session.userdata.username
  //   con.query('SELECT Permission FROM users WHERE username = ?', [username], (err, result) => {
  //     if (result[0].Permission == 0) {
  //       res.render('admin')
  //     }
  //     else (
  //       res.sendStatus(403)
  //     )
  //   })

  // } else {
  //   res.sendStatus(403)
  // }

})


module.exports = router
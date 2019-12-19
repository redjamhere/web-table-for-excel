const express = require('express')
const router = express.Router()
const db = require('../config/db')

const con = db.getDB()

//Middleware

const secureAuth = (req, res, next) => {
  if (req.session.userdata !== undefined) {
    res.redirect('/')
  } else next()
}

router.use(secureAuth)

router.get('/', (req, res) => {
  res.render('auth')
})

router.post('/login', function(req, res) {
	var username = req.body.username;
  var password = req.body.password;
  
	if (username && password) {
    con.query('SELECT * FROM USERS WHERE username = ? AND password = ?', [username, password])
      .then(rows => {
        if(rows.length > 0 ) {
          req.session.loggedin = true
          req.session.userdata = rows[0]
          console.log(req.session)
          res.redirect('/')
        } else {
          res.send('Incorrecy Username and/or Password')
        }
       })
  } else {
    res.send('Please enter Username and Password')
    res.end()
  }
});

router.post('/logout', (req,res) => {
  console.log(req.session)
  req.session.destroy()
  res.redirect('/')
})

module.exports = router

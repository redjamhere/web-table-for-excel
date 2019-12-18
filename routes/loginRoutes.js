const express = require('express')
const router = express.Router()
const db = require('../config/db')

// const con = db.createConnection()

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

router.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
	  con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
        request.session.userdata = results[0]
        response.redirect('/')
        console.log(request.session)
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

router.post('/logout', (req,res) => {
  console.log(req.session)
  req.session.destroy()
  res.redirect('/')
})

module.exports = router

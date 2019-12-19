const express = require('express')
const session = require('express-session')
const bodyParser  = require('body-parser')
const {PORT} = require('./config/config')
const db = require('./config/db')
const token = require('uuid-token-generator')

const authRoute = require('./routes/loginRoutes')
const tblRoute = require('./routes/tableRoutes')
const admRout = require('./routes/adminRoutes')


var server = express()

//Middleware

const secureAuth = (req, res, next) => {
  if (req.session.userdata == undefined) {
    res.redirect('/login')
  } else {
    next()
  }
}

server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*") // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// const token = new token()


server.use(session({
	secret: 'kscsqlzlz555555kscsqlzlzyamy',
  resave: true,
  maxAge: 1000 * 60 * 60,
	saveUninitialized: true
}));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}))

server.use(express.static(__dirname + '/public'))
server.use(express.static(__dirname + '/controllers'))
server.use(express.static(__dirname + '/views'))

server.set('view engine', 'pug')
server.set('views', __dirname + '/views')

//admin panel
server.use('/admin', admRout)
//workspace
server.use('/table', tblRoute)
//authenticate
server.use('/login', authRoute)

server.use(secureAuth)

server.get('/', (req, res) => {
  res.redirect('/table')
})

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`)
})


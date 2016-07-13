var express = require('express')
var app     = express()
var ejs     = require('ejs')
var multer  = require('multer')
var upload  = multer({dest:'uploads/'})
var mongo   = require('mongodb').MongoClient
var crypto  = require('crypto')
var fs      = require('fs')
var granted = [ ]

app.engine('html', ejs.renderFile)
app.listen(8000)
app.use(check)
app.use(express.static('uploads'))
app.use(express.static('public'))
app.get('/', home)
app.get('/profile', profile)
app.get('/login', login)
app.post('/login', upload.single(), loginUser)
app.get('/register', register)
app.post('/register', upload.single(), registerUser)
app.get('/logout', logout)
app.post('/upload-profile', upload.single('photo'), saveProfile)

function saveProfile(req, res) {
	var name = req.file.path + '.png'
	fs.rename(req.file.path, name)
	var u = granted[req.token]
	u.photo = name
	granted[req.token] = u
	mongo.connect('mongodb://127.0.0.1/demo',
		(error, db) => db.collection('user')
			.update({email: u.email}, u)
	)
	res.redirect('/profile')
}

function registerUser(req, res) {
	mongo.connect('mongodb://127.0.0.1/demo',
		(error, db) => db.collection('user')
						.find({email: req.body.email})
						.toArray(
			(error, data) => {
				if (data.length == 1) {
					res.redirect('/register')
				} else {
					var u = {}
					u.first = req.body.first
					u.last  = req.body.last
					u.email = req.body.email
					u.password = encrypt(req.body.password)
					db.collection('user').insert(u)
					res.redirect('/login')
				}
			}
		)
	)
}

function register(req, res) {
	res.render('register.html')
}

function check(req, res, next) {
	req.token = null
	var cookie = req.headers.cookie
	if (cookie != null) {
		var p = cookie.indexOf('token=')
		var start = p + 6
		var stop = cookie.indexOf(';', p)
		req.token = cookie.substring(start, stop)
	}

	if (req.token == null) {
		var a = parseInt(Math.random() * 100000000)
		var b = parseInt(Math.random() * 100000000)
		var t = a + '-' + b
		req.token = t
		res.set('Set-Cookie', 'token=' + t)
	}
	next()
}

function home(req, res) {
	res.render('index.html')
}

function profile(req, res) {
	var loggedIn = granted[req.token];

	if (loggedIn) {
		var u = granted[req.token]
		res.render('profile.html', {user: u} )
	} else {
		res.redirect('/login')
	}
}

function login(req, res) {
	res.render('login.html')
}

function loginUser(req, res) {
	var p = encrypt(req.body.password)
	mongo.connect('mongodb://127.0.0.1/demo',
		(error, db) => db.collection('user')
			.find({email: req.body.user})
			.toArray(
				(error, data) => {
					if (p == data[0].password) {
						granted[req.token] = data[0]
						res.redirect('/profile')
					} else {
						res.redirect('/login')
					}
				}
		)
	)
}

function logout(req, res) {
	delete granted[req.token]
	res.render('logout.html')
}

function encrypt(s) {
	return crypto.createHmac('sha512', s).digest('hex')
}
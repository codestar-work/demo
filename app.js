var express = require('express')
var app     = express()
var ejs     = require('ejs')
var multer  = require('multer')
var upload  = multer({dest:'uploads/'})
var mongo   = require('mongodb').MongoClient
var crypto  = require('crypto')
var granted = [ ]

app.engine('html', ejs.renderFile)
app.listen(8000)
app.use(check)
app.get('/', home)
app.get('/profile', profile)
app.get('/login', login)
app.get('/register', register)
app.post('/register', upload.single(), registerUser)

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
		var data = cookie.split(';')
		for (var i = 0; i < data.length; i++) {
			var pair = data[i].split('=')
			if (pair[0] == 'token') {
				req.token = pair[1]
			}
		}
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
		res.render('profile.html')
	} else {
		res.redirect('/login')
	}
}

function login(req, res) {
	if (req.query.user == null) {
		res.render('login.html')
	} else {
		if (req.query.user == 'james' &&
			req.query.password == 'bond') {
			granted[req.token] = true
			res.redirect('/profile')
		} else {
			res.redirect('/login')
		}
	}
}

function encrypt(s) {
	return crypto.createHmac('sha512', s).digest('hex')
}
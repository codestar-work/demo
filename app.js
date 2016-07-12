var express = require('express')
var app     = express()
var ejs     = require('ejs')

app.engine('html', ejs.renderFile)
app.listen(8000)
app.use(check)
app.get('/', home)
app.get('/profile', profile)


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
		res.headers('Set-Cookie', 'token=' + t)
	}
	next()
}

function home(req, res) {
	res.render('index.html')
}

function profile(req, res) {
	var loggedIn = false;

	if (loggedIn) {
		res.render('profile.html')
	} else {
		res.redirect('/login')
	}
}

// npm install express ejs
var express = require('express')
var app     = express()
var ejs     = require('ejs')

app.engine('html', ejs.renderFile)
app.listen(8000)

app.get('/', home)

function home(req, res) {
	res.render('index.html')
}

// npm install express ejs
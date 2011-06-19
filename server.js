var app = require('express').createServer();

app.configure(function() {
	app.set('view engine', 'jade');
});

app.get('/', function(req,res) {
	res.render('layout.jade');
});

app.listen(3000);

/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PomodoroRepository = require('./pomodoro-repository.js').PomodoroRepository;

var app = module.exports = express.createServer();

mongoose.connect('mongodb://localhost/devodoro');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Devodoro'
  });
});

// define the pomodoro model
var pomodoroSchema = new Schema({
  description: { type: String, required: true },
  started: { type: Date, required: true },
  completed: Date
});

mongoose.model('Pomodoro', pomodoroSchema);
var Pomodoro = mongoose.model('Pomodoro');

app.post('/pomodoros', function(req, res){
  var pomodoro = new Pomodoro(req.body);
  pomodoro.save(function(err, pomo) {
    res.redirect('/');
  });
});

app.get('/pomodoros', function (req, res) {
  var today = new Date();
  var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  Pomodoro.find({started: {$gte: todayStart, $lt: todayEnd}}, function (err, pomodoros) {
    res.send(pomodoros.map(function(p) {
      return p.toJSON();
    }));
  });
});

app.listen(3000);
console.log("Devodoro server listening on port %d in %s mode", app.address().port, app.settings.env);


/**
 * Module dependencies.
 */

var express = require('express')
    , stylus = require('stylus')
    , mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var app = module.exports = express.createServer();

mongoose.connect('mongodb://localhost/devodoro');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // stylus
  app.use(stylus.middleware({
    src: __dirname + '/views' // .styl files are located in `views/stylesheets`
    , debug: true
    , dest: __dirname + '/public' // .styl resources are compiled `/stylesheets/*.css`
    , compile: function (str, path) { // optional, but recommended
        return stylus(str)
          .set('filename', path)
          .set('warn', true)
          .set('compress', true)
    }
  }));
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
  ended: Date,
  status: { type: String, required: true }
});

mongoose.model('Pomodoro', pomodoroSchema);
var Pomodoro = mongoose.model('Pomodoro');

// CREATE
app.post('/pomodoros', function(req, res){
  var pomodoro = new Pomodoro(req.body);
  console.log('creating new pomodoro ' + pomodoro.description);
  pomodoro.save(function(err, pomo) {
    res.send(pomo.toJSON());
  });
});

// UPDATE
app.put('/pomodoros/:id', function(req, res) {
  console.log('put pomodoro ' + req.params.id);
  Pomodoro.findOne({ _id: req.params.id}, function (err, p) {
    p.ended = new Date(req.body.ended);
    p.status = req.body.status;
    p.save(function (err) {
      res.send(p.toObject());
    })
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

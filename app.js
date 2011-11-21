var express = require('express')
    , app = module.exports = express.createServer()
    , stylus = require('stylus')
    , mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , mongoStore = require('connect-mongodb')
    , models = require('./models')
    , db

// Configuration

app.configure('development', function() {
    app.set('db-uri', 'mongodb://localhost/devodoro-dev');
    app.use(express.errorHandler({ dumpExceptions: true }));
});

app.configure('production', function() {
    app.set('db-uri', 'mongodb://localhost/devodoro');
    app.use(express.errorHandler({ dumpExceptions: true }));
});

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
  app.use(express.cookieParser());
  app.use(express.session({store: mongoStore(db), secret: 'shhhh'}));
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

// configure mongoose models
models.defineModels(mongoose, function() {
  app.Pomodoro = Pomodoro = mongoose.model('Pomodoro');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('db-uri'));
});

// require routes
require('./routes/user');
require('./routes/pomodoro')(app);

app.listen(3000);
console.log("Devodoro server listening on port %d in %s mode", app.address().port, app.settings.env);

module.exports = function(app) {

  // login form route
  app.get('/login', function(req, res) {
    res.render('user/login', {
      locals: {
        user: new User()
      }
    });
  });

  // login route
  app.post('/login', function(req, res) {
    User.findOne({ email: req.body.user.email }, function(err, user) {
      if (user && user.authenticate(req.body.user.password)) {
        req.session.user_id = user.id;

        if (req.body.remember_me) {
          var loginToken = new LoginToken({ email: user.email });
          loginToken.save(function() {
            res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          });
        }
        res.redirect('/');
      } else {
        req.flash('error', 'Login failed');
        res.redirect('/login');
      }
    });
  });

  // register form route
  app.get('/register', function(req, res) {
    console.log('register');
    res.render('user/register', {
      locals: {
        register: new User()
      }
    });
  });

  // create user route
  app.post('/register', function(req, res) {
    var newUser = new User(req.body.register);
    newUser.save(function(err) {
      if (err) {
        req.flash('error', 'Error registering!');
        res.render('user/register', {
          locals: { register: newUser }
        });
      }
      req.flash('info', 'Registration successful');
      res.redirect('/');
    });
  });

}

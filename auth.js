exports.AuthHelper = {
  authFromLoginToken: function(req, res, next) {
    var cookie = JSON.parse(req.cookies.logintoken);
    LoginToken.findOne({ email: cookie.email, token: cookie.token, series: cookie.series }, function(err, token) {
      if (!token) {
        res.redirect('/');
        return;
      }

      User.findOne({ email: token.email }, function(err, user) {
        if (user) {
          req.session.user_id = user.id;
          req.currentUser = user;

          token.token = token.randomToken();
          token.save(function(){
            res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
            next();
          });
        } else {
          res.redirect('/login');
        }
      });
    });
  },

  loadUser: function(req, res, next) {
    if (req.session.user_id) {
      User.findById(req.session.user_id, function(err, user) {
        if (user) {
          req.currentUser = user;
          next();
        } else {
          res.redirect('/login');
        }
      });
    } else if (req.cookies.logintoken) {
      authFromLoginToken(req, res, next);
    } else {
      res.redirect('/login');
    }
  }
};

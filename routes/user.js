module.exports = function(app) {

  app.get('/register', function(req, res) {
    console.log('register');
    res.render('user/register', {
      locals: {
        register: new User()
      }
    });
  });

}

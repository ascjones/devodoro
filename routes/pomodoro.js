var auth = require('../auth.js').AuthHelper;

module.exports = function(app) {
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
}

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    vows = require('vows');
    assert = require('assert');

mongoose.connect('mongodb://localhost/devodoro_test');
mongoose.connection.collection('pomodoros').drop();

// define the pomodoro model
var pomodoroSchema = new Schema({
  description: { type: String, required: true },
  started: { type: Date, required: true },
  completed: Date
});

mongoose.model('Pomodoro', pomodoroSchema);
var Pomodoro = mongoose.model('Pomodoro');

vows.describe('Spiking Mongoose').addBatch({
  'Saving a Pomodoro': {
    topic: function() {
      pomodoro = new Pomodoro({description: 'Test Pomo', started: new Date()});
      pomodoro.save(this.callback);
    },
    'No error should occur': function(err, pomo) {
      assert.isNull(err);
    }
  }
}).export(module);





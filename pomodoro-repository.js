PomodoroRepository = function() {};
PomodoroRepository.prototype.dummyData = [];

PomodoroRepository.prototype.findAll = function(callback) {
  callback(null, dummyData);
};

PomodoroRepository.prototype.save = function(pomodoro, callback) {
  dummyData.push(pomodoro);
  console.log('saving pomodoro: ' + pomodoro.description);
  callback(null, pomodoro);
}

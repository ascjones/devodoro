(function() {
  var timer, currentTask, loggedPomodoros;

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  CurrentTask = Backbone.Model.extend({
    defaults: {
      totalPomos: 0
    },

    startPomodoro: function() {
      var that = this;
      this.set({started: new Date()});
      timer.bind('completed', function() {
        that.set({finished: new Date()});
        that.set({totalPomos: that.get('totalPomos') + 1});
        loggedPomodoros.add(new LoggedPomodoro({description: that.get('description')}));
      });
      timer.start();
    }
  });

  LoggedPomodoro = Backbone.Model.extend({
  });

  LoggedPomodoroList = Backbone.Collection.extend({
    model: LoggedPomodoro
  });

  loggedPomodoros = new LoggedPomodoroList();

  Timer = Backbone.Model.extend({
    defaults: {
      minutes: 25,
      seconds: 0
    },

    start: function() {
      var secondsLeft = 60 * 25;
      var that = this;
      var interval = setInterval(function() {
        secondsLeft = secondsLeft - 1;
        if (secondsLeft == 0) {
          clearInterval(interval);
          that.trigger('completed');
        }
        that.set({minutes: Math.floor(secondsLeft / 60)});
        that.set({seconds: secondsLeft % 60});
      }, 1);
    }

  });

  TimerView = Backbone.View.extend({
    el: '#timer-view',

    initialize: function() {
      _.bindAll(this, 'render', 'start');
      this.template = _.template($('#timer-template').html());
      this.model.bind('change', this.render);
      this.render();
    },  
   
    events: {
      "click a.js-start-timer": "start"
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    start: function() {
      this.model.start();
    }
  });

  NewTaskView = Backbone.View.extend({
    el: '#new-task-view',

    initialize: function() {
      _.bindAll(this, 'addNewTask');
      this.$('#new-task').focus();
    },

    events: {
      "submit #new-task-form" : "addNewTask",
      "click .js-add-new-task" : "addNewTask" 
    },

    addNewTask: function() {
      var input = this.$('input');
      var desc = input.val();
      var currentTask = new CurrentTask({description: desc});
      var taskView = new CurrentTaskView({model: currentTask});
      input.val(""); // clears the input
      input.hide();
      currentTask.startPomodoro();
      event.preventDefault(); // prevents the form from submitting
    }
  });

  CurrentTaskView = Backbone.View.extend({
    el: '#current-task-view',

    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#current-task-template').html());
      this.model.bind('change', this.render);
      this.render();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  LoggedPomodoroView = Backbone.View.extend({
    tagName: 'li',

    initialize: function() {
      this.template = _.template($('#logged-pomodoro-template').html());
      this.render();
    },

    render: function() {
      var html = this.template(this.model.toJSON());
      $(this.el).append(html);
    }
  });

  LoggedPomodoroListView = Backbone.View.extend({
    el: '#logged-pomodoro',

    initialize: function() {
      _.bindAll(this, 'renderItem');
      loggedPomodoros.bind('add', this.renderItem);
    },

    renderItem: function(model) {
      var loggedPomodoroView = new LoggedPomodoroView({model: model});
      this.$('ul').append(loggedPomodoroView.el);
    }
  });

  Devodoro = Backbone.Router.extend({
    routes: {
      '': 'home'
    },

    initialize: function() {
      timer = new Timer();
      new TimerView({model: timer});
      new NewTaskView();
      new LoggedPomodoroListView();
    },

    home: function() {
    }
  });

  $(function() {
    window.App = new Devodoro();
    Backbone.history.start();
  });
})();

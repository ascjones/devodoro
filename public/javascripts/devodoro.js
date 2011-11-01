(function () {
  var timer, currentPomodoro, loggedPomodoros;

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  Pomodoro = Backbone.Model.extend({
    defaults: {
      totalPomos: 0
    },

    start: function () {
      var that = this;
      this.set({started: new Date()});
      timer.bind('completed', function () {
        that.set({completed: new Date()});
        loggedPomodoros.add(that);
      });
      timer.start();
    }
  });

  LoggedPomodoroList = Backbone.Collection.extend({
    model: Pomodoro
  });

  loggedPomodoros = new LoggedPomodoroList();

  Timer = Backbone.Model.extend({
    defaults: {
      minutes: 25,
      seconds: 0
    },

    start: function () {
      var secondsLeft = 60 * 25;
      var that = this;
      var interval = setInterval(function () {
        secondsLeft = secondsLeft - 1;
        if (secondsLeft === 0) {
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

    initialize: function () {
      _.bindAll(this, 'render', 'start');
      this.template = _.template($('#timer-template').html());
      this.model.bind('change', this.render);
      this.render();
    },  
   
    events: {
      "click a.js-start-timer": "start"
    },

    render: function () {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    start: function () {
      this.model.start();
    }
  });

  NewTaskView = Backbone.View.extend({
    el: '#new-task-view',

    initialize: function () {
      _.bindAll(this, 'addNewTask');
      this.$('#new-task').focus();
    },

    events: {
      "submit #new-task-form" : "addNewTask",
    },

    addNewTask: function () {
      var input = this.$('input');
      var currentPomodoro = new Pomodoro({description: input.val()});
      var taskView = new PomodoroView({model: currentPomodoro});
      currentPomodoro.bind('change:completed', function () {
        input.show();
      });
      currentPomodoro.start();
      input.hide();
      event.preventDefault(); // prevents the form from submitting
    }
  });

  PomodoroView = Backbone.View.extend({
    el: '#pomodoro-view',

    initialize: function () {
      _.bindAll(this, 'render', 'hide');
      this.template = _.template($('#pomodoro-template').html());
      this.model.bind('change:completed', this.hide);
      this.render();
    },

    render: function () {
      this.$('#current-pomodoro').html(this.template(this.model.toJSON()));
      return this;
    },

    hide: function () {
      $(this.el).hide();
    }
  });

  LoggedPomodoroView = Backbone.View.extend({
    tagName: 'li',

    initialize: function () {
      this.template = _.template($('#logged-pomodoro-template').html());
      this.render();
    },

    render: function () {
      var html = this.template(this.model.toJSON());
      $(this.el).append(html);
    }
  });

  LoggedPomodoroListView = Backbone.View.extend({
    el: '#logged-pomodoro',

    initialize: function () {
      _.bindAll(this, 'renderItem');
      loggedPomodoros.bind('add', this.renderItem);
    },

    renderItem: function (model) {
      var loggedPomodoroView = new LoggedPomodoroView({model: model});
      this.$('ul').append(loggedPomodoroView.el);
    }
  });

  Devodoro = Backbone.Router.extend({
    routes: {
      '': 'home'
    },

    initialize: function () {
      timer = new Timer();
      new TimerView({model: timer});
      new NewTaskView();
      new LoggedPomodoroListView();
    },

    home: function () {
    }
  });

  $(function () {
    window.App = new Devodoro();
    Backbone.history.start();
  });
})();

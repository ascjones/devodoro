(function() {
  var CurrentTask, Timer, NewTaskView, CurrentTaskView, Devodoro;

  CurrentTask = Backbone.Model.extend({
    defaults: {
      totalPomos: 0
    },

    startPomodoro: function(timer) {
      this.set({started: new Date()});
      timer.bind('completed', function() {
        this.set({finished: new Date()});
        this.set({totalPomos: this.get('totalPomos') + 1});
      });
      timer.start();
    }
  });

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

    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#timer-template').html());
      this.model.bind('change', this.render);
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  NewTaskView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render', 'addNewTask');
      this.template = _.template($('#new-task-template').html());
      this.timer = this.options.timer;
    },

    events: {
      "submit #new-task-form" : "addNewTask"
    },

    render: function() {
      $(this.el).html(this.template($('#new-task-template').html()));
      return this;  
    },

    addNewTask: function() {
      var input = this.$('input');
      var desc = input.val();
      var currentTask = new CurrentTask({description: desc});
      var taskView = new CurrentTaskView({model: currentTask});
      $('#container').append(taskView.render().el);
      input.val(""); // clears the input
      currentTask.startPomodoro(this.timer);
      event.preventDefault(); // prevents the form from submitting
    }
  });

  CurrentTaskView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#current-task-template').html());
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  Devodoro = Backbone.Router.extend({
    routes: {
      '': 'home'
    },

    initialize: function() {
      this.timer = new Timer();
      this.timerView = new TimerView({model: this.timer});
      this.newTaskView = new NewTaskView({timer: this.timer});
    },

    home: function() {
      var $container = $('#container');
      $container.empty();
      $container.append(this.timerView.render().el);
      $container.append(this.newTaskView.render().el);
    }
  });

  $(function() {
    window.App = new Devodoro();
    Backbone.history.start();
    $('#new-task').focus();
  });
})();

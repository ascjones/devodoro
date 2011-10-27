(function() {
  var CurrentTask, LoggedTask, Timer, NewTaskView, CurrentTaskView, Devodoro;

  CurrentTask = Backbone.Model.extend({
    defaults: {
      totalPomos: 0
    },

    startPomodoro: function(timer) {
      var that = this;
      this.set({started: new Date()});
      timer.bind('completed', function() {
        that.set({finished: new Date()});
        that.set({totalPomos: that.get('totalPomos') + 1});
        loggedTasks.add(new LoggedTask({description: that.get('description')}));
      });
      timer.start();
    }
  });

  LoggedTask = Backbone.Model.extend({
  });

  LoggedTaskList = Backbone.Collection.extend({
    model: LoggedTask
  });

  loggedTasks = new LoggedTaskList();

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
      _.bindAll(this, 'render', 'start');
      this.template = _.template($('#timer-template').html());
      this.model.bind('change', this.render);
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
    initialize: function() {
      _.bindAll(this, 'render', 'addNewTask');
      this.template = _.template($('#new-task-template').html());
    },

    events: {
      "submit #new-task-form" : "addNewTask",
      "click .js-add-new-task" : "addNewTask" 
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
      input.hide();
      currentTask.startPomodoro(Timer);
      event.preventDefault(); // prevents the form from submitting
    }
  });

  CurrentTaskView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render');
      this.template = _.template($('#current-task-template').html());
      this.model.bind('change', this.render);
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  LoggedTaskView = Backbone.View.extend({
    tagName: 'li',

    initialize: function() {
      this.template = _.template($('#logged-task-template').html());
      this.render();
    },

    render: function() {
      var html = this.template(this.model.toJSON());
      $(this.el).append(html);
    }
  });

  LoggedTaskListView = Backbone.View.extend({
    el: '#logged-task',

    initialize: function() {
      _.bindAll(this, 'renderItem');
      loggedTasks.bind('add', this.renderItem);
    },

    renderItem: function(model) {
      var loggedTaskView = new LoggedTaskView({model: model});
      this.$('ul').append(loggedTaskView.el);
    }
  });

  Devodoro = Backbone.Router.extend({
    routes: {
      '': 'home'
    },

    initialize: function() {
      Timer = new Timer();
      this.timerView = new TimerView({model: Timer});
      this.newTaskView = new NewTaskView();
      new LoggedTaskListView();
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

(function() {
  var Task, Timer, NewTaskView, CurrentTaskView, Devodoro;

  Task = Backbone.Model.extend({
  });

  Timer = Backbone.Model.extend({
    defaults: {
      minutes: 25,
      seconds: 0
    },

    start: function() {
      var secondsLeft = 60 * 25;

      var that = this;
      setInterval(function() {
        secondsLeft = secondsLeft - 1;
        that.set({minutes: Math.floor(secondsLeft / 60)});
        that.set({seconds: secondsLeft % 60});
      }, 1000);
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
      var taskView = new CurrentTaskView({model: new Task({description: desc})});
      $('#container').append(taskView.render().el);
      input.val(""); // clears the input
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
      this.newTaskView = new NewTaskView();
    },

    home: function() {
      var $container = $('#container');
      $container.empty();
      $container.append(this.newTaskView.render().el);
      $container.append(this.timerView.render().el);
      
      this.timer.start();
    }
  });

  $(function() {
    window.App = new Devodoro();
    Backbone.history.start();
    $('#new-task').focus();
  });
})();

(function() {
  var Task, NewTaskView, CurrentTaskView, Devodoro;

  Task = Backbone.Model.extend({
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
      this.newTaskView = new NewTaskView();
    },

    home: function() {
      var $container = $('#container');
      $container.empty();
      $container.append(this.newTaskView.render().el);
    }
  });

  $(function() {
    console.log('initialising');
    window.App = new Devodoro();
    Backbone.history.start();
    $('#new-task').focus();
  });
})();

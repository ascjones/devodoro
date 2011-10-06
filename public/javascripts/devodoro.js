(function() {
  var Task, NewTaskView, CurrentTaskView, Devodoro;

  Task = Backbone.Model.extend({
  });

  NewTaskView = Backbone.View.extend({
    el: $('#new-task-form'),

    initialize: function() {
      _.bindAll(this, 'render', 'addNewTask');
    },

    events: {
      "submit #new-task-form" : "addNewTask"
    },

    addNewTask: function() {
      var desc = this.$('input').val();
      //var taskView = new CurrentTaskView({model: new Task({description: desc})});
      //taskView.render();
    }

  });

  CurrentTaskView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render');
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

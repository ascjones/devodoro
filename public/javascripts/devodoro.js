(function () {
  var timer, currentPomodoro, loggedPomodoros;

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  // tell backbone to use the default mongodb indetifier name _id
  Backbone.Model.prototype.idAttribute = "_id";

  function pad2(number) {
    return (number < 10 ? '0' : '') + number;
  }

  Pomodoro = Backbone.Model.extend({
    urlRoot: '/pomodoros',

    initialize: function () {
      _.bindAll(this, 'complete');
    },

    start: function () {
      timer.bind('completed', this.complete);
      timer.start();
      this.save({started: new Date(), status: 'started'}, {
        success: function (model, response) {
          console.log('pomodoro saved to server');
        },
        error: function() {
          console.log('error saving pomodoro');
        }
      });
    },

    complete: function () {     
      this.finish('completed');
    },

    cancel: function () {
      timer.reset();
      this.finish('cancelled');
    },

    finish: function (status) {
      console.log('Pomodoro ' + status);
      this.set({ended: new Date(), status: status});
      loggedPomodoros.add(this.toJSON());
      this.save();
      timer.unbind('completed');
    }
  });

  LoggedPomodoroList = Backbone.Collection.extend({
    model: Pomodoro,
    url: '/pomodoros'
  });

  Timer = Backbone.Model.extend({
    defaults: {
      minutes: '25',
      seconds: '00'
    },

    initialize: function() {
      this.buzzer = $('#buzzer');
    },

    start: function () {
      var secondsLeft = 60 * 25;
      var that = this;
      this.interval = setInterval(function () {
        secondsLeft = secondsLeft - 1;
        if (secondsLeft === 0) {
          clearInterval(that.interval);
          that.trigger('completed');
          this.buzzer.play();
        }
        that.set({minutes: pad2(Math.floor(secondsLeft / 60))});
        that.set({seconds: pad2(secondsLeft % 60)});
      }, 1000);
    },

    reset: function () {
      clearInterval(this.interval);
      this.set(this.defaults)
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

  PomodoroView = Backbone.View.extend({
    el: '#pomodoro-view',

    initialize: function () {
      _.bindAll(this, 'render', 'hide', 'documentKeyUp', 'startNewPomodoro');
      this.template = _.template($('#pomodoro-template').html());
      //this.model.bind('change:ended', this.hide);
      $(document).bind('keyup', this.documentKeyUp);
      this.$('#new-pomodoro').focus();
    },
    
    events: {
      "submit #new-pomodoro-form" : "startNewPomodoro",
    },

    render: function () {
      this.$('#current-pomodoro').html(this.template(this.model.toJSON()));
      return this;
    },

    startNewPomodoro: function () {
      var input = this.$('input');
      this.model = new Pomodoro({description: input.val()});
      this.model.bind('change:ended', function () {
        input.show();
      });
      this.model.start();
      this.render();
      input.hide();
      event.preventDefault() // stop the form from submitting
    },

    hide: function () {
      $(this.el).hide();
    },

    documentKeyUp: function(e) {
      if (e.keyCode === 27) { // escape key
        this.model.cancel();
      }
    }
  });

  LoggedPomodoroView = Backbone.View.extend({
    tagName: 'tr',

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
      _.bindAll(this, 'render', 'renderPomodoro');
      this.collection.bind('add', this.renderPomodoro);
      this.collection.bind('reset', this.render);
    },

    render: function() {
      this.collection.each(this.renderPomodoro);
    },

    renderPomodoro: function (model) {
      var loggedPomodoroView = new LoggedPomodoroView({model: model});
      this.$('table').prepend(loggedPomodoroView.el);
    }
  });

  Devodoro = Backbone.Router.extend({
    routes: {
      '': 'home'
    },

    initialize: function () {
      timer = new Timer();
      new TimerView({model: timer});
      new PomodoroView();
      loggedPomodoros = new LoggedPomodoroList();
      new LoggedPomodoroListView({collection: loggedPomodoros});
      loggedPomodoros.fetch();
    },

    home: function () {
    }
  });

  $(function () {
    window.App = new Devodoro();
    Backbone.history.start();
  });
})();

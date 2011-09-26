(function() {

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  Task = Backbone.Model.extend({
  });

  window.TaskView = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#task-row-template').html()),

    initialize: function() {
      _.bindAll(this, 'render');
    },

    render: function() {
      var renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    } 
})();

import Ember from 'ember';

export default Ember.Route.extend({
  resetController: function (controller, isExiting) {
    if (isExiting) {
      controller.reset();
    }
  },
  renderTemplate: function() {
    this.render({ outlet: 'login' });
  },

});

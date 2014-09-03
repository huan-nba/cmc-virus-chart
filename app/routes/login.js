import Ember from 'ember';

export default Ember.Route.extend({
  resetController: function (controller, isExiting) {
    console.log('reset controller login');
    if (isExiting) {
      controller.reset();
    }
  }
});

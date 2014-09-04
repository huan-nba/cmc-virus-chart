/**
 * Created by nightshade on 27/08/2014.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function (transition) {
    var token = this.controllerFor('login').get('token');
    if(!token) {
      this.redirectToLogin(transition);
    }
  },
  redirectToLogin: function (transition) {
    this.controllerFor('login').set('pendingTransition', transition.targetName);
    this.transitionTo('login');
  },
  renderTemplate: function() {
    this.render({ outlet: 'main' });
  },
  actions: {
    error: function(error, transition) {
      // Assuming we got here due to the error in `beforeModel`,
      // we can expect that error === "bad things!",
      // but a promise model rejecting would also
      // call this hook, as would any errors encountered
      // in `afterModel`.

      // The `error` hook is also provided the failed
      // `transition`, which can be stored and later
      // `.retry()`d if desired.
      this.redirectToLogin(transition);
    },
    didTransition: function() {
      this.controllerFor('application').set('isLogin', false);
    }
  }
});

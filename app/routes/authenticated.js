/**
 * Created by nightshade on 27/08/2014.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function (transition) {
    var token = this.controllerFor('login').get('token');
    if(!token) {
    console.dir(this);
      this.redirectToLogin(transition);
    }
  },
  redirectToLogin: function (transition) {
    this.controllerFor('login').set('pendingTransition', transition.targetName);
    this.transitionTo('login');
  }
});

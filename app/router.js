import Ember from 'ember';

var Router = Ember.Router.extend({
  location: CmcVirusChartENV.locationType
});

Router.map(function() {
  this.route('login');
  this.route('user');
  this.route('virusinfo');
});

export default Router;

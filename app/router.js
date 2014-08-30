import Ember from 'ember';

var Router = Ember.Router.extend({
  location: CmcVirusChartENV.locationType
});

Router.map(function() {
  this.route('login', {path: '/'});
  this.route('login', {path: '/login'});
  this.route('user');
  this.route('virusinfo');
//  this.route('authenticated');
});

export default Router;

import Ember from 'ember';

var Router = Ember.Router.extend({
  location: CmcVirusChartENV.locationType
});

Router.map(function() {
  this.route('virusinfo', {path: '/'});
  this.route('login', {path: '/login'});
  this.route('user');
  this.route('virusinfo');
//  this.route('authenticated');
  this.route('virusreport');
});

export default Router;

import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: 'cmc-virus-chart', // TODO: loaded via config
  Resolver: Resolver,
  ready: function() {
    console.log("Ember.TEMPLATES: ", Ember.TEMPLATES);
  }
});

loadInitializers(App, 'cmc-virus-chart');
//
//App.ApplicationAdapter = DS.FixtureAdapter;
//
//
//App.User.FIXTURES = [
//  {
//    id: 1,
//    name: 'Joe User',
//    username: 'joe',
//    email: 'joe@email.com',
//    passwordDigest: '$2a$10$wJTPdvpGgzDvkXChrcPyqOQrFFawzGu89B1rZze/lVIcJKWiNeAqS'
//  },
//  {
//    id: 2,
//    name: 'John User',
//    username: 'john',
//    email: 'john smt',
//    passwordDigest: '"$2a$10$wJTPdvpGgzDvkXChrcPyqOQrFFawzGu89B1rZze/lVIcJKWiNeAqS'
//  }
//];
export default App;

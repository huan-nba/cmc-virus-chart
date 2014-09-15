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

export default App;

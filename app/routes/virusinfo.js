import AuthenticatedRoute from './authenticated';
import Ember from 'ember';

export default AuthenticatedRoute.extend({

  beforeModel: function (transition) {
    this._super(transition);
    var token = this.controllerFor('login').get('token');
    var model = {};
    var self = this;

    var promise = $.when(
      $.post('http://192.168.225.101:8080/api/server-clients-count.json',
        {token: token},
        function (res) {
          res.map(function (aServer) {
            res["'" + aServer.ServerID + "'"] = aServer;
            return aServer;
          });
          model.serversData = res;
        }
      ),
      $.post('http://192.168.225.101:8080/api/server-infected-clients-lastest.json',
        {token: token},
        function (res) {
          model.serverInfectedClients = res;
        }
      ),
      $.post('http://192.168.225.101:8080/api/top-10-infected-clients-lastest.json',
        {token: token},
        function (res) {
          model.topInfectedClients = res;
        }
      ),
      $.post('http://192.168.225.101:8080/api/top-10-infected-lastest.json',
        {token: token},
        function (res) {
          model.topMalware = res;
        }
      )
    ).done(function () {
        self.set('preparedModel', model);
      });
    return promise;
  },
  model: function () {
    return this.get('preparedModel');

  },
  setupController: function (controller, model) {
    this._super(controller, model);
    console.log('virus route setup controller');
    Ember.run.schedule('afterRender', this, function () {
      this.controller.drawChartOnTemplate();
    });
  },

  renderTemplate: function(controller, model) {
    this._super(controller, model);
    console.log('rendering template onto virus info');
  }
});

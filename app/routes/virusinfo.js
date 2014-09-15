import AuthenticatedRoute from './authenticated';
import Ember from 'ember';

export default AuthenticatedRoute.extend({

  beforeModel: function (transition) {
    this._super(transition);
    console.log('calling virusinfo');
    var token = this.controllerFor('login').get('token');
    var model = {};
    var self = this;
    var serverUrl = this.controllerFor('application').get('serverUrl1');

    var promise = $.when(
      $.post(serverUrl+'api/server-clients-count.json',
        {token: token},
        function (res) {
          res.map(function (aServer) {
            res["'" + aServer.ServerID + "'"] = aServer;
            return aServer;
          });
          console.dir(res);
          model.serversData = res;
        }
      ),
      $.post(serverUrl+'api/server-infected-clients-lastest.json',
        {token: token},
        function (res) {
          console.dir(res);
          model.serverInfectedClients = res;
        }
      ),
      $.post(serverUrl+'api/top-10-infected-clients-lastest.json',
        {token: token},
        function (res) {
          model.topInfectedClients = res;
        }
      ),
      $.post(serverUrl+'api/top-10-infected-lastest.json',
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
    Ember.run.schedule('afterRender', this, function () {
      this.controller.drawChartOnTemplate();
    });
  },

});

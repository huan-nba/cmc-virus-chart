import AuthenticatedRoute from './authenticated';
import Ember from 'ember';

export default AuthenticatedRoute.extend({

  beforeModel: function (transition) {
    this._super(transition);
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
          model.serversData = res;
        }
      ),
      $.post(serverUrl+'api/get-clients.json',
        {token: token},
        function (res) {
          model.clients = res;
        }
      ),
      $.post(serverUrl+'api/server-infected-clients-lastest.json',
        {token: token},
        function (res) {
          model.serverInfectedClients = res;
        }
      ),
      $.post(serverUrl+'api/restrictedareas-latest.json',
        {token: token},
        function (res) {

          model.restrictedareas = res;

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
//        val.timeInfected = moment({ year :year, month :parseInt(val.MonthVio)-1, day :val.DayVio}).format('L') + ' ' + numeral(val.TimeVio).format('00:00:00');
        // cook data for chart
        var violatingClients = Lazy(model.restrictedareas)
          .groupBy(function (val) {
            return val.ClientID;
          })
          .map(function (val) {
            return {
              clientID: val[0].ClientID,
              clientName: val[0].CName.slice(0, 33), //limit length of label field to prevent amcharts bug
              violateCount: val.length,
              serverName: Lazy(model.serversData).find({ServerID: val[0].ServerID}).Name,
              groupName: Lazy(model.clients).find({ClientID: val[0].ClientID}).GroupName,
              mac: val[0].MACAddr,
              ip: val[0].PublicIP,
              logStr: val[0].LogStr,
            };
          })
          .sortBy(function (val) {
            return -val.violateCount;
          })
          .map(function (val, i) {
            return $.extend(val, {isPulled: i === 0});
          })
          .toArray();
        model.violatingClients = violatingClients;

        var serverInfectedRatio = model.serversData.map(function (val) {
          var numOfInfectedClients = Lazy(model.serverInfectedClients)
            .find({serverid: val.ServerID}).infected_clients || 0;
          return {
            id: val.ServerID,
            name: val.Name.slice(0, 33),
            numOfClients: val.NumOfClients,
            numOfInfectedClients: numOfInfectedClients,
            ratio: parseFloat(numOfInfectedClients / val.NumOfClients),
            ratioPercent: numeral(parseFloat(numOfInfectedClients / val.NumOfClients)).format('0.00%'),
            mac: val.MACAddress,
            ip: "192.168.1.???",
            serverDescription: val.Description,
            isPulled: false
          };
        });
        serverInfectedRatio.sortBy('numOfInfectedClients');
        serverInfectedRatio[0].isPulled = true;
        model.serverInfectedRatio = serverInfectedRatio;

        model.topInfectedClients = model.topInfectedClients.map(function (val) {
          return $.extend(val,
            {
              computername: val.computername.slice(0, 33),
              serverName: Lazy(model.serversData).find({ServerID: val.serverid}).Name,
              groupName: Lazy(model.clients).find({ClientID: val.clientid}).GroupName,
              isPulled: false
            }
          );
        });
        model.topInfectedClients[0].isPulled = true;
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
  renderTemplate: function() {
    this.render({ outlet: 'info' });
  }

});

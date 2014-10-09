import AuthenticatedRoute from './authenticated';
import Ember from 'ember';

export default AuthenticatedRoute.extend({

  beforeModel: function (transition) {
    this._super(transition);
    return this.requestToServer(this);
  },
  model: function () {
    return this.get('preparedModel');
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.route = this;
    Ember.run.schedule('afterRender', this, function () {
      this.controller.drawChartOnTemplate();
    });
  },
  renderTemplate: function() {
    this.render({ outlet: 'info' });
  },
  requestToServer: function (_caller) {
    var token = this.controllerFor('login').get('token');
    var model = {};
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
      $.post(serverUrl+'api/infected-latest.json',
        {token: token},
        function (res) {
          model.infectedLatest = res;
        }
      ),
      $.post(serverUrl+'api/top-10-infected-clients-lastest.json',
        {token: token},
        function (res) {
          model.topInfectedClients = res;
        }
      ),
      $.post(serverUrl+'api/all-restrictedareas-tables.json',
        {token: token},
        function (res) {
          model.restrictedYear = [];

          res.forEach(function (row) {
            var data = row.TABLE_NAME.split('_');
            var year = data[1];
            model.restrictedYear.push(year);
          });
        }),
      $.post(serverUrl+'api/top-10-infected-lastest.json',
        {token: token},
        function (res) {
          model.topMalware = res.map(function (aMalware, i) {
            return {
              virusName: aMalware.virusname.slice(0, 33),
              infectedCount: aMalware.infected_count,
              isPulled: i === 0
            };
          });
        }
      )
    ).done(function () {
//        val.timeInfected = moment({ year :year, month :parseInt(val.MonthVio)-1, day :val.DayVio}).format('L') + ' ' + numeral(val.TimeVio).format('00:00:00');
        // cook data for headine
        moment.locale('vi');
        var latestViolationByTime = model.restrictedareas.map(function (val) {
          val.serverName = Lazy(model.serversData).find({ServerID: val.ServerID}).Name;
          val.clientDetail = Lazy(model.clients).find({ClientID: val.ClientID});
          val.timeInfected = moment({ year :model.restrictedYear[0], month :parseInt(val.MonthVio)-1, day :val.DayVio}).format('L') + ' ' + numeral(val.TimeVio).format('00:00:00');
          val.timeUnix = moment({ year :model.restrictedYear[0], month :parseInt(val.MonthVio)-1, day :val.DayVio}).valueOf() + parseInt(val.TimeVio)*1000;
          val.isFirstViolated = false;
          return val;
        });
        latestViolationByTime = latestViolationByTime.sortBy('timeUnix');
        model.latestViolation = latestViolationByTime.get('lastObject');

        var tempYear = parseInt(model.infectedLatest[0]['table_name'].split('_')[1]),
            tempMonth = parseInt(model.infectedLatest[0]['table_name'].split('_')[2]);
        model.infectedLatest.forEach(function (val) {
          val.serverName = Lazy(model.serversData).find({ServerID: val.ServerID}).Name;
          val.clientDetail = Lazy(model.clients).find({ClientID: val.ClientID});
          val.timeUnix = moment([tempYear, tempMonth - 1, (val.OnWeek - 1) * 7 + val.OnDay, val.OnHour, val.OnMinute]).valueOf();
        });
        model.infectedLatest = model.infectedLatest.sortBy('timeUnix');
        model.latest1Infected = model.infectedLatest.get('lastObject');
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
            ip: val.IP,
            serverDescription: val.Description,
            isPulled: false
          };
        });
        serverInfectedRatio.sortBy('numOfInfectedClients');
        serverInfectedRatio[0].isPulled = true;
        model.serverInfectedRatio = serverInfectedRatio;
        var num2dot = function(num) {
          var d = num%256;
          for (var i = 3; i > 0; i--) {
            num = Math.floor(num/256);
            d = d + '.' + num%256;}
          return d;};
        model.topInfectedClients = model.topInfectedClients.map(function (val) {
          return $.extend(val,
            {
              computername: val.computername.slice(0, 33),
              serverName: Lazy(model.serversData).find({ServerID: val.serverid}).Name,
              groupName: Lazy(model.clients).find({ClientID: val.clientid}).GroupName,
              isPulled: false,
              ipDotNotation: num2dot(val.ip)
            }
          );
        });
        model.topInfectedClients[0].isPulled = true;
        _caller.preparedModel = model;
      });
    return promise;
  }

});

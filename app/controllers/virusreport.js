import Ember from 'ember';

export default Ember.ObjectController.extend({

  currentServerChanged: function () {
    var serverID = this.get('currentServerID'),
        servers = this.get('currentMonth.servers');

    if (!serverID || !Lazy(servers).findWhere({id: serverID}) && serverID !== 'all') {
      return;
    }
    var currentInfected = this.model.currentInfectedData,
        serversData = this.model.serversData,
        serverName,
        virusNames,
        currentServer = {},
        serverInfectedRatio = [];

    if (serverID === 'all') {
      virusNames = Lazy(currentInfected).uniq('VirusName')
        .map('VirusName').toArray();
      serverName = 'all';
      serverInfectedRatio = serversData.map(function (val) {
        var numOfInfectedClients = Lazy(currentInfected)
          .where({ServerID: val.ServerID})
          .uniq('ClientID').toArray().length;
        return {
          id: val.ServerID,
          name: val.Name,
          numOfClients: val.NumOfClients,
          numOfInfectedClients: numOfInfectedClients,
          ratio: (numOfInfectedClients / val.NumOfClients * 100).toFixed(2) +'%',
        };
      });
    }
    else {
      virusNames = Lazy(currentInfected).uniq('VirusName')
        .filter({ServerID: serverID})
        .map('VirusName').toArray();
      serverName = Lazy(serversData).find({ServerID: serverID}).Name;
    }
    currentServer = {};
    currentServer.server = serverName;
    currentServer.viruses = virusNames;
    this.set('currentServer', currentServer);
    this.set('currentVirus', {});
    this.set('currentVirusname', '');
    this.set('serverInfectedRatio', serverInfectedRatio);
  }.observes('currentServerID'),

  currentYearChanged: function () {
    this.set('currentServerID', '');
    this.set('currentVirusname', '');
  }.observes('currentYear'),

  currentVirusnameChanged: function () {
    var virusName = this.get('currentVirusname');
    if (!virusName) {
      return;
    }
    var currentInfected = this.model.currentInfectedData;
    var serverID = this.get('currentServerID');

    var clientsData;
    if (virusName === 'all') {
      if (serverID === 'all') {
        clientsData = Lazy(currentInfected)
          .uniq('ClientID');
      } else {
        clientsData = Lazy(currentInfected)
          .where({ServerID: serverID})
          .uniq('ClientID');
      }
    } else {
      if (serverID === 'all') {
        clientsData = Lazy(currentInfected)
          .where({ VirusName: virusName})
          .uniq('ClientID');
      } else {
        clientsData = Lazy(currentInfected)
          .where({ServerID: serverID, VirusName: virusName})
          .uniq('ClientID');
      }
    }
    var clientsID = clientsData.map('ClientID').toArray();


    var clients = Lazy(this.model.clients)
      .filter(function (val) {
        return clientsID.indexOf(val.ClientID) > -1;
      }).toArray();
    Lazy(clientsData).each(function (val, i) {
      clients[i].OnWeek = val.OnWeek;
      clients[i].OnDay = val.OnDay;
      clients[i].OnHour = val.OnHour;
    });
    var currentVirus = {};
    currentVirus.virus = virusName;
    currentVirus.clients = clients;
    this.set('currentVirus', currentVirus);
  }.observes('currentVirusname'),

  actions: {
    selectYear: function (index) {
      this.set('currentYear', this.get('years')[index]);
    },
    selectMonth: function (index) {
      var self = this;
      var serverUrl = this.get('controllers.application.serverUrl1');
      $.post(serverUrl+'api/infected-in-month-year.json',
        {
          token: this.get('controllers.login.token'),
          month: this.get('currentYear').months[index],
          year: this.get('currentYear').year
        },
        function (data) {
          var serverIDs = new Ember.Set();
          data.forEach(function (val) {
            serverIDs.push(val.ServerID);
          });
          var servers = serverIDs.map(function (val) {
            return {
              name: self.model.serversData["'"+val+"'"].Name,
              id: self.model.serversData["'"+val+"'"].ServerID
            };
          });

          self.model.currentInfectedData = data;
          
          var currentMonth = {};
          currentMonth.month = self.get('currentYear').months[index];
          currentMonth.servers = servers;

          self.set('currentMonth', currentMonth);
          self.set('currentServer', {});
          self.set('currentVirus', {});
          self.set('currentServerID', '');
          self.set('currentVirusname', '');
        }
      );
    },
    selectServer: function (serverID) {
      this.set('currentServerID', serverID);
    },
    selectAllServer: function() {
      this.set('currentServerID', 'all');
    },
    selectVirus: function (virusName) {
      this.set('currentVirusname', virusName);
    },
    selectAllVirus: function () {
      this.set('currentVirusname', 'all');
    }

  },
  needs: ['login', 'application']
});

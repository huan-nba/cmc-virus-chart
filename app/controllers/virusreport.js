import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    selectYear: function (index) {
      this.set('currentYear', this.get('years')[index]);
    },
    selectMonth: function (index) {
      var self = this;
      $.post('http://192.168.225.101:8080/api/infected-in-month-year.json',
        {
          token: this.get('controllers.login.token'),
          month: this.get('currentYear').months[index],
          year: this.get('currentYear').year
        },
        function (data) {
          var servers = new Ember.Set();
          data.forEach(function (val) {
            servers.push(val.ServerID);
          });
          var serverNames = servers.map(function (val) {
            return self.model.serversData["'"+val+"'"].Name;
          });
          self.model.currentInfectedData = data;
          
          var currentMonth = {};
          currentMonth.month = self.get('currentYear').months[index];
          currentMonth.servers = serverNames;
          self.set('currentMonth', currentMonth);
          self.set('currentServer', {});
          self.set('currentVirus', {});
        }
      );
    },

    selectServer: function (index) {
      var currentInfected = this.model.currentInfectedData;
      var serverName = this.get('currentMonth').servers[index];
      var serversData = this.model.serversData;

      var serverID = Lazy(serversData).find({Name: serverName}).ServerID;
      var virusNames = Lazy(currentInfected).uniq('VirusName')
        .filter({ServerID: serverID})
        .map('VirusName').toArray();

      var currentServer = {};
      currentServer.server = serverName;
      currentServer.viruses = virusNames;
      this.set('currentServer', currentServer);
      this.set('currentServerID', serverID);
      this.set('currentVirus', {});
    },
    selectVirus: function (index) {
      var currentInfected = this.model.currentInfectedData;
      var serverID = this.get('currentServerID');
      var serverName = this.get('currentMonth').servers[index];
      var virusName = this.get('currentServer').viruses[index];

      var clientsID = Lazy(currentInfected)
        .where({ServerID: serverID, VirusName: virusName})
        .uniq('ClientID')
        .map('ClientID').toArray();

      var clients = Lazy(this.model.clients)
        .filter(function (val) {
          return clientsID.indexOf(val.ClientID) > -1;
        }).toArray();
      console.dir(clients);
      var currentVirus = {};
      currentVirus.virus = virusName;
      currentVirus.clients = clients;
      this.set('currentVirus', currentVirus);
    }

  },
  needs: ['login']
});

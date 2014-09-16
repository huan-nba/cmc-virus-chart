import Ember from 'ember';

export default Ember.ObjectController.extend({

  currentServerRestrictedAreas: function () {
    var currentRestrictedAreas = this.get('currentRestrictedAreas'),
      currentServerID = this.get('currentServerID');
    if (currentRestrictedAreas) {
      if (currentServerID && currentServerID !== 'all') {
        return currentRestrictedAreas.filterBy('ServerID', currentServerID);
      } else {
        return currentRestrictedAreas;
      }
    }
  }.property('currentRestrictedAreas', 'currentServerID'),

  currentServerName: function () {
    var name = this.get('currentServer.server');
    return name === 'all' ? 'Tất cả' : name;
  }.property('currentServer'),
  currentTime: function () {
    moment.locale('vi');
    return moment().format('LLLL').capitalize();
  }.property().volatile(),

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
          ratio: parseFloat(numOfInfectedClients / val.NumOfClients),
          mac: val.MACAddress,
          ip: val.IP,
          description: val.Description
        };
      });
    }
    else {
      virusNames = Lazy(currentInfected).uniq('VirusName')
        .filter({ServerID: serverID})
        .map('VirusName').toArray();
      serverName = Lazy(serversData).find({ServerID: serverID}).Name;

      var numOfInfectedClients = Lazy(currentInfected)
        .where({ServerID: serverID})
        .uniq('ClientID').toArray().length;
      var val = serversData["'"+serverID+"'"];
      serverInfectedRatio.push({
        id: val.ServerID,
        name: val.Name,
        numOfClients: val.NumOfClients,
        numOfInfectedClients: numOfInfectedClients,
        ratio: parseFloat(numOfInfectedClients / val.NumOfClients),
        mac: val.MACAddress,
        ip: val.IP,
        description: val.Description
      });
    }
    currentServer = {};
    currentServer.server = serverName;
    currentServer.viruses = virusNames;
    this.set('currentServer', currentServer);
    this.set('currentVirus', {});
    this.set('currentVirusname', 'all');
    this.set('serverInfectedRatio', serverInfectedRatio);
    this.currentVirusnameChanged();

    this.send('sortDataBy', 'serverInfectedRatio', 'ratio');
  }.observes('currentServerID'),

  currentYearChanged: function () {
    if (!this.get('currentYear')) {
      return;
    }
    this.set('currentMonthID', 0);
    this.set('currentServerID', '');
    this.set('currentVirusname', '');
    this.set('currentRestrictedAreas', []);
    this.currentMonthIDChanged();
    var self = this,
        serverUrl = this.get('controllers.application.serverUrl1'),
        year = this.get('currentYear').year;
    if (this.get('restrictedYear').contains(year)) {
      $.post(serverUrl+'api/restrictedareas-in-year.json',
        {
          token: this.get('controllers.login.token'),
          year: year
        },
        function (data) {
          data = data.map(function (val) {
            val.serverName = Lazy(self.model.serversData).find({ServerID: val.ServerID}).Name;
            val.clientDetail = Lazy(self.model.clients).find({ClientID: val.ClientID});
            val.timeInfected = moment({ year :year, month :parseInt(val.MonthVio)-1, day :val.DayVio}).format('L') + ' ' + numeral(val.TimeVio).format('00:00:00');
            val.isFirstViolated = false;
            return val;
          });

          data = data.sortBy('timeInfected');
          data[0].isFirstViolated = true;
          self.model.currentRestrictedAreas = data;

          self.send('sortDataBy', 'currentRestrictedAreas', 'timeInfected');
        }
      );
    }

  }.observes('currentYear'),

  currentMonthIDChanged: function () {
    if (!this.get('currentYear')) {
      this.set('currentMonthID', '');
      return;
    }
    var self = this;
    var serverUrl = this.get('controllers.application.serverUrl1');
    var index = self.get('currentMonthID');
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


        self.set('currentServer', {});
        self.set('currentVirus', {});
        self.set('currentMonth', currentMonth);
        self.set('currentServerID', 'all');
        self.set('currentVirusname', 'all');
        self.currentServerChanged();
      }
    );
  }.observes('currentMonthID'),

  currentVirusnameChanged: function () {
    var self = this;
    var virusName = this.get('currentVirusname');
    if (!virusName) {
      return;
    }
    var currentInfected = this.model.currentInfectedData,
        serverID = this.get('currentServerID');

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
    var clientsID = clientsData.map('ClientID').toArray(),
        year = this.get('currentYear').year,
        month = this.get('currentMonth').month;

    //get all clients which has ClientID contained with clientsID
    var clients = [],
        arrClientsData = clientsData.toArray();
    clientsID.forEach(function (val, index) {
      for (var j = 0; j < self.model.clients.length; j++) {
        var obj = self.model.clients[j];
        if (obj.ClientID === val) {
          clients[index] = obj;
          var data = arrClientsData[index];
          clients[index].virusName = data.VirusName;
          clients[index].OnWeek = data.OnWeek;
          clients[index].OnDay = data.OnDay;
          clients[index].OnHour = data.OnHour;
          clients[index].isFirstInfected = false;
          clients[index].pathCRC64 = data.PathCRC64;
          clients[index].serverName = Lazy(self.model.serversData).find({ServerID: data.ServerID}).Name;
          clients[index].timeInfected = moment({year: year, month: parseInt(month)-1, week:data.OnWeek, day:data.OnDay, hour: data.OnHour, minute: data.OnMinute}).format('DD/MM/YYYY hh:mm:ss');
        }
      }
    });

    //set first infected flag on clients
    clients = clients.sortBy('timeInfected');
    clients[0].isFirstInfected = true;

    var currentVirus = {};
    currentVirus.virus = virusName;
    currentVirus.clients = clients;
    this.set('currentVirus', currentVirus);

    this.send('sortDataBy', 'currentVirus.clients', 'timeInfected');
  }.observes('currentVirusname'),

  actions: {
    selectYear: function (index) {
      this.set('currentYear', this.get('years')[index]);
    },
    selectMonth: function (index) {
      this.set('currentMonthID', index);
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
    },
    sortDataBy: function (dataName, field) {
      var data = this.get(dataName);
      var camelizedField = field.camelize();
      // inject __sorting__ into data if not exist
      if (!data['__sorting__']) {
        data['__sorting__'] = {};
      }

      var sorting = data['__sorting__'];
      // if field is the last sorting field then clear out 'sorting'
      // and reverse order
      if (sorting[camelizedField]) {
        var sortingAscending = data['__sorting__']['ascending'];

        sorting = {};
        sorting[camelizedField] = true;
        sorting['ascending'] = !sortingAscending;
      }
      // else default to descending order
      else {
        sorting = {};
        sorting[camelizedField] = true;
        sorting['ascending'] = false;
      }

      var sortedSeq = Lazy(data).sortBy(field);
      if (!sorting['ascending']) {
        sortedSeq = sortedSeq.reverse();
      }
      data = sortedSeq.toArray();
      //set __sorting__ back to data as toArray() wipe hidden properpties
      data['__sorting__'] = sorting;

      this.set(dataName, data);
    }

  },
  needs: ['login', 'application']
});

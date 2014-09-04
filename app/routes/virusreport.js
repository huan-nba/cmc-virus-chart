import AuthenticatedRoute from './authenticated';

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
      $.post('http://192.168.225.101:8080/api/get-clients.json',
        {token: token},
        function (res) {
          model.clients = res;
        }
      ),
      $.post('http://192.168.225.101:8080/api/all-infected-tables.json',
        {
          token: token
        },
        function (res) {
          model.years = [];
          res.map(function (row) {
            var data = row.TABLE_NAME.split('_');
            var year = data[1];
            var month = data[2];
            var yearExisted = false;
            for (var i = 0; i < model.years.length; i++) {
              var aYear = model.years[i];
              if (aYear.year === year) {
                yearExisted = true;
                aYear.months.push(month);
                break;
              }
            }
            if (!yearExisted) {
              model.years.push({
                year: year,
                months: [month]
              });
            }
          });
          model.currentYear = model.years[0];
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
//  setupController: function (controller, model) {
//    this._super(controller, model);
//    Ember.run.schedule('afterRender', this, function () {
//      this.controller.drawChartOnTemplate();
//    });
//  },

});

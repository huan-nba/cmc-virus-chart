import Ember from 'ember';

export default Ember.ObjectController.extend({
  init: function () {
    Chart.defaults.global.scaleIntegersOnly = true;
    this.lastUpdate = 1000;
  },
  servers: function () {
    var serverInfectedClients = this.get('serverInfectedClients');
    var servers = this.get('serversData').map(function (val, index) {
      return $.extend(val, serverInfectedClients[index]);
    });
    return servers;
  }.property('serversData', 'serverInfectedClients'),
  drawAmChart: function (chartID, options) {
    var settings = {
      "type": "pie",
      "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
      "labelRadius": 15,
      "labelText": "[[percents]]%",
      "innerRadius": "50%",
      "startAngle": 100.8,
      "depth3D": 10,
      "angle": 15,
      "brightnessStep": 10.2,
      "pullOutDuration": 0.65,
      "pullOutOnlyOne": false,
//      "startDuration": 0.65,
//      "startEffect": "easeOutSine",
      "startEffect": "bounce",
      "startDuration": 2,
      "color": "#E7E7E7",
      "fontFamily": "lato",
      "fontSize": 13,
      "theme": "dark",
      "allLabels": [],
      "balloon": {},
      "pulledField": "isPulled",
      "legend": {
        "textClickEnabled": true,
        "markerType": "circle",
        "position": "left",
        "align": "center",
        "valueAlign": "right",
        "autoMargins": true,
        "valueWidth": 30,
      }
    };
    $.extend(settings, options);

    var chart = AmCharts.makeChart(chartID, settings);
    this[chartID] = chart;
  },
  drawChartOnTemplate: function () {

    /*
    Draw the first chart
     */

    this.drawAmChart("chart-server-status",
      {
        "titles": [{
          "text": "Tình trạng máy nhiễm trên Server (máy nhiễm)",
          "size": 16
        }],
        "titleField": "name",
        "valueField": "numOfInfectedClients",
        "dataProvider": this.get('serverInfectedRatio'),
        "balloonText": "[[title]]" +
          "<br><span style='font-size:14px'><b>[[value]]</b> máy nhiễm ([[percents]]%)</span>" +
          "<br><span style='font-size:14px'><b>Mô tả:</b> [[serverDescription]]</span>" +
          "<br><span style='font-size:14px'><b>MAC:</b> [[mac]]</span>" +
          "<br><span style='font-size:14px'><b>IP:</b> [[ip]]</span>" +
          "<br><span style='font-size:14px'><b>Tổng số máy:</b> [[numOfClients]]</span>" +
          "<br><span style='font-size:14px'><b>Tỉ lệ nhiễm:</b> [[ratioPercent]]</span>",
      }
    );
//    /*
//    Draw second chart
//     */
    this.drawAmChart("chart-top-infectedclients",
      {
        "titles": [{
          "text": "Top 10 máy tính bi nhiễm virus trong tháng (lần nhiễm)",
          "size": 16
        }],
        "titleField": "computername",
        "valueField": "viruscount",
        "dataProvider":  this.get('model.topInfectedClients'),
        "balloonText": "[[title]]" +
          "<br><span style='font-size:14px'><b>[[value]]</b> lần nhiễm ([[percents]]%)</span>" +
          "<br><span style='font-size:14px'><b>Server:</b> [[serverName]]</span>" +
          "<br><span style='font-size:14px'><b>Nhóm:</b> [[groupName]]</span>" +
          "<br><span style='font-size:14px'><b>Hệ Điều Hành:</b> [[osname]]</span>" +
          "<br><span style='font-size:14px'><b>CPU:</b> [[cpuname]]</span>" +
          "<br><span style='font-size:14px'><b>IP:</b> [[ip]]</span>",
      }
    );
    /*
    Draw third chart
     */

    this.drawAmChart("chart-top-malware",
      {
        "titles": [{
          "text": "Top 10 malware trong tháng (lần nhiễm)",
          "size": 16
        }],
        "titleField": "virusName",
        "valueField": "infectedCount",
        "dataProvider": this.get('model.topMalware')
      }
    );

    /*
    Draw 4th chart
     */
    this.drawAmChart("chart-violating-clients",
      {
        "titles": [{
          "text": "Các máy truy cập trái phép (lần vi phạm)",
          "size": 16
        }],
        "balloonText": "[[title]]" +
          "<br><span style='font-size:14px'><b>[[value]]</b> lần ([[percents]]%)</span>" +
          "<br><span style='font-size:14px'><b>Server:</b> [[serverName]]</span>" +
          "<br><span style='font-size:14px'><b>Nhóm:</b> [[groupName]]</span>" +
          "<br><span style='font-size:14px'><b>MAC:</b> [[mac]]</span>" +
          "<br><span style='font-size:14px'><b>IP:</b> [[ip]]</span>" +
          "<br><span style='font-size:14px'><b>LogStr:</b> [[logStr]]</span>",
        "titleField": "clientName",
        "valueField": "violateCount",
        "dataProvider": this.get('model.violatingClients')
      }
    );

    //Start Update Loop

    this.nearRealTimeUpdate(this);
  },
  nearRealTimeUpdate: function (controller) {
    var chartTopClients = controller['chart-top-infectedclients'],
        chartTopMalware = controller['chart-top-malware'],
        chartServer = controller['chart-server-status'],
        chartViolatingClients = controller['chart-violating-clients'],
        serverUrl = controller.get('controllers.application.serverUrl1'),
        token = controller.get('controllers.login.token');

    $.post(serverUrl+'api/server-status.json',
      {
        token: token
      },
      function (res) {
        if (res.any(function (val) {
          if (val.last_user_update && controller.lastUpdate &&
            moment(val.last_user_update).valueOf() > moment(controller.lastUpdate).valueOf()) {
            controller.lastUpdate = val.last_user_update;
            return true;
          } else {
            return false;
          }
        })) {
          controller.get('route').requestToServer(controller).done(function () {
//            var violatingClientChanged = Ember.isEqual();
            var oldViolation = controller.get('model').latestViolation,
                newViolation = controller.get('preparedModel').latestViolation;

            if (JSON.stringify(controller.get('model').topInfectedClients) !== JSON.stringify(controller.get('preparedModel').topInfectedClients)) {
              chartTopClients.dataProvider = controller.get('preparedModel').topInfectedClients;
              chartTopClients.validateData();
              chartTopClients.animateAgain();
            }

            if (JSON.stringify(controller.get('model').topMalware) !== JSON.stringify(controller.get('preparedModel').topMalware)) {
              chartTopMalware.dataProvider = controller.get('preparedModel').topMalware;
              chartTopMalware.validateData();
              chartTopMalware.animateAgain();
            }

            if (JSON.stringify(controller.get('model').serverInfectedRatio) !== JSON.stringify(controller.get('preparedModel').serverInfectedRatio)) {
              chartServer.dataProvider = controller.get('preparedModel').serverInfectedRatio;
              chartServer.validateData();
              chartServer.animateAgain();
            }

            if (JSON.stringify(controller.get('model').violatingClients) !== JSON.stringify(controller.get('preparedModel').violatingClients)) {
              chartViolatingClients.dataProvider = controller.get('preparedModel').violatingClients;
              chartViolatingClients.validateData();
              chartViolatingClients.animateAgain();
            }



            controller.set('model', controller.get('preparedModel'));
            if (oldViolation.timeUnix !== newViolation.timeUnix) {
              controller.setHeadline('violation');
            } else {
              controller.setHeadline('virus');
            }


            $('#headline').replaceWith($('#headline').clone(true));
            console.log('fetched new data');

          });
        }
      })
      .always(function() {
        if('virusinfo' === controller.get('controllers.application.currentRouteName')) {
          setTimeout(controller.nearRealTimeUpdate, 5000, controller);
        }
      });

  },
  setHeadline: function (type) {
    var time = this.lastUpdate;
    if (time) {
      //prepare data for headline and save to LogController data
      moment.locale('vi');
      var latestViolation = this.get('latestViolation');
      var latest1Infected = this.get('latest1Infected');
      if (type === 'violation') {
        this.setProperties({
          hlTitleViolation: 'Phát hiện truy cập trái phép',
          hlTime: moment(latestViolation.timeUnix).format('hh:mm:ss DD/MM'),
//        hlMac: latestViolation.clientDetail.MACAddr,
          hlClientname: latestViolation.CName,
          hlIP: latestViolation.PublicIP,
          hlLogStr: latestViolation.LogStr,
          hlServername: latestViolation.serverName,
          hlGroupname: latestViolation.clientDetail.GroupName,
        });
      } else {
        this.setProperties({
          hlTitleVirus: 'Phát hiện mã độc',
          hlTime: moment(latest1Infected.timeUnix).format('hh:mm:ss DD/MM'),
          hlVirusname: latest1Infected.VirusName,
          hlClientname: latest1Infected.clientDetail.ComputerName,
          hlServername: latest1Infected.serverName,
          hlGroupname: latest1Infected.clientDetail.GroupName
        });
      }
    }
  },
  needs: ['application', 'login', 'log']

});

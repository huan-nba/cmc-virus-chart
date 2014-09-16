import Ember from 'ember';

export default Ember.ObjectController.extend({
  init: function () {
    Chart.defaults.global.scaleIntegersOnly = true;
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
    this.set(chartID, chart);
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
    console.dir(this.get('model.topInfectedClients'));
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
    var topMalware = this.get('model.topMalware');
    var data3 = topMalware.map(function (aMalware, i) {
      return {
        virusName: aMalware.virusname.slice(0, 33),
        infectedCount: aMalware.infected_count,
        isPulled: i === 0
      };
    });

    this.drawAmChart("chart-top-malware",
      {
        "titles": [{
          "text": "Top 10 malware trong tháng (lần nhiễm)",
          "size": 16
        }],
        "titleField": "virusName",
        "valueField": "infectedCount",
        "dataProvider": data3
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

//    this.nearRealTimeUpdate(this);
  },
  nearRealTimeUpdate: function (controller) {
    var chart = controller.get('chart-top-malware');
    var serverUrl = controller.get('controllers.application.serverUrl1');
    var token = controller.get('controllers.login.token');
    console.log('this getting print each 2000');
    chart.animateAgain();

    $.post(serverUrl+'api/server-status.json',
      {
        token: token
      },
      function (res) {
        console.dir(res);
      })
      .always(function() {
        console.log( "finished" );
        if('virusinfo' === controller.get('controllers.application.currentRouteName')) {
          setTimeout(controller.nearRealTimeUpdate, 2000, controller);
        }
      });

  },
  needs: ['application', 'login']

});

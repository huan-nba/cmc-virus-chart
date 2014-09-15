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
  drawChart: function (labels, data, chartId, options, chartType) {
    var settings = {
      scaleShowLabels : true,
    };
    $.extend(settings, options);

    var chartData = {
      labels: labels,
      datasets: [
        {
          fillColor: "rgba(151,187,205,0.5)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          data: data,
        }
      ]
    };
    var context = new Chart(document.getElementById(chartId)
      .getContext("2d"));
    switch (chartType) {
      case 'radar' :
        context.Radar(chartData, settings);
        break;
      default :
        context.Radar(chartData, settings);
        break;
    }
  },
  
  drawChartOnTemplate: function () {
    /*
    Draw the first chart
     */
    var serversData = this.get('model.serversData');
    var serverInfectedClients = this.get('model.serverInfectedClients');
    var infectedServerNames = serverInfectedClients.map(function (aServer) {
      return 'Server ' + serversData["'" + aServer.serverid + "'"].Name;
    });
    var numOfInfectedClients = serverInfectedClients.map(function (aServer) {
      return aServer.infected_clients;
    });
    this.drawChart(infectedServerNames,
      numOfInfectedClients,
      'first-chart',
      {
        scaleLabel: "<%if (value == " + numOfInfectedClients[0] + "){%>Số máy nhiễm <%}%> <%= value%>",
        tooltipTemplate: "<%= value %> máy nhiễm"
      }
    );
//    /*
//    Draw second chart
//     */
    var topInfectedClients = this.get('model.topInfectedClients');
    var computerNames = topInfectedClients.map(
      function (aClient) {
        return aClient.computername;
      });
    var virusCounts = topInfectedClients.map(
      function (aClient) {
        return aClient.viruscount;
      });
    this.drawChart(
      computerNames,
      virusCounts,
      'second-chart',
      {
        scaleLabel: "<%if (value == " + virusCounts[0] + "){%>Số virus nhiễm <%}%> <%= value%>"
      }
    );
    /*
    Draw third chart
     */
    var topMalware = this.get('model.topMalware');
    var virusNames = topMalware.map(
      function (aMalware) {
        return aMalware.virusname;
      });
    var infectedCounts = topMalware.map(
      function (aMalware) {
        return aMalware.infected_count;
      });
    this.drawChart(
      virusNames,
      infectedCounts,
      'third-chart',
      {
        scaleLabel: "<%if (value == " + infectedCounts[0] + "){%>Số lần nhiễm <%}%> <%= value%>"
      });
  }
});

import Ember from 'ember';

export default Ember.ObjectController.extend({
  init: function () {
    Chart.defaults.global.scaleIntegersOnly = true;
    Chart.defaults.global.width
    this.setProperties({
//      serversData: [],
//      topInfectedClients: [],
//      topMalware: []
      chartWidth: 750
    });
    console.log('init virusinfo controller');
  },
  drawBarChart: function (labels, data, chartId, options) {
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
    new Chart(document.getElementById(chartId)
      .getContext("2d"))
      .Bar(chartData, options);
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
    console.dir(serversData);
    console.dir(serverInfectedClients);
    console.dir(infectedServerNames);
    console.dir(numOfInfectedClients);
    this.drawBarChart(infectedServerNames,
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
    this.drawBarChart(
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
    this.drawBarChart(
      virusNames,
      infectedCounts,
      'third-chart',
      {
        scaleLabel: "<%if (value == " + infectedCounts[0] + "){%>Số lần nhiễm <%}%> <%= value%>"
      });
  }
});

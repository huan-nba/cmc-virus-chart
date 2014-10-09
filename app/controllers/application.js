import Ember from 'ember';

export default Ember.Controller.extend({
  routeNameChanged: function () {

    this.setProperties({
      isLogin: false,
      isVirusinfo: false,
      isVirusreport: false
    });

    switch (this.get('currentRouteName')) {
      case 'login':
        this.set('isLogin', true);
        break;
      case 'virusinfo':
        this.set('isVirusinfo', true);
        break;
      case 'virusreport':
        this.set('isVirusreport', true);
        break;
    }
  }.observes('currentRouteName'),

  //  serverUrl1: 'http://192.168.225.101:8080/'
//  serverUrl1: 'http://subnet2.noip.me:8080/'
//    serverUrl1: 'http://192.168.225.53:8080/'
//  serverUrl1: 'http://192.168.2.105:8080/'
//  serverUrl1: 'http://183.91.4.68:8081/'
  serverUrl1: 'http://%@:8080/'.fmt(document.domain)
});

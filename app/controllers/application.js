import Ember from 'ember';

export default Ember.Controller.extend({
  routeNameChanged: function () {

    this.setProperties({
      isLogin2: false,
      virusinfo2: false,
      virusreport2: false
    });

    switch (this.get('currentRouteName')) {
      case 'login':
        this.set('isLogin2', true);
        break;
      case 'virusinfo':
        this.set('virusinfo2', true);
        break;
      case 'virusreport':
        this.set('virusreport2', true);
        break;
    }
  }.observes('currentRouteName'),

  //  serverUrl1: 'http://192.168.225.101:8080/'
  serverUrl1: 'http://subnet2.noip.me:8080/'
//    serverUrl1: 'http://192.168.225.53:8080/'
//  serverUrl1: 'http://192.168.2.105:8080/'
//  serverUrl1: 'http://localhost:8080/'
});

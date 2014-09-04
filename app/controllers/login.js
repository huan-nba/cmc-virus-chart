import Ember from 'ember';
export default Ember.Controller.extend({

  init: function () {
    this.setProperties({
      token: localStorage.token,
    });
    this.reset();
  },
  reset: function () {
    // reset animation
    this.setProperties({
      presentLogin: true,
      isLoginFailed: false,
      pendingTransition: 'virusinfo',
      username: '',
      password: '',
    });
  },
  tokenChanged: function () {
    localStorage.token = this.get('token');
  }.observes('token'),
  actions: {
    login: function () {
      var self = this;
      this.set('presentLogin', false);

      /* authenticate with server and get a token back
       * expected response data
       * { token: 'somesortoftoken' }
       */
      var authData = this.getProperties('username', 'password');

      Ember.$.post('http://192.168.225.101:8080/auth.json', authData)
        .done(function (res) {
//          console.dir(res);
          if (res.token) {
            self.set('token', res.token);
            self.transitionToRoute(self.get('pendingTransition'));
          }
        })
        .fail(function (res) {
          // fail in case of wrong credendial
          if (res.status === 401) {
            self.set('isLoginFailed', true);
            Ember.$('#loginSection').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
              function () {
                self.set('isLoginFailed', false);
              });
          }
          else {
            alert('Có lỗi hệ thống, hãy thử lại sau!');
          }
        });
    }
  },

});

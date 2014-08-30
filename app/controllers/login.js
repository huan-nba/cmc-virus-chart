import Ember from 'ember';
export default Ember.Controller.extend({
  init: function () {
  },
  actions: {
    login: function () {
      var self = this;
      var user = this.get('user');
      var pass = this.get('pass');
      this.set('presentLogin', false);
      if (user === 'huan' && pass === '123') {
        alert('correct');
      }
      else {
        this.set('isLoginFailed', true);
      }

      Ember.$.post('http://192.168.225.101:8080/auth.json',
        {username: 'huan', password: '1234'})
        .then(function (res) {
          self.set('errorMessage', res.message);
          console.log(res.message);
          if (res.success) {
            self.set('token', res.token);
          }
        });
    }
  },

  token: localStorage.token,
  tokenChanged: function () {
    localStorage.token = this.get('token');
  }.observes('token'),

  presentLogin: true,
  user: '',
  pass: '',
  isLoginFailed: false,
});

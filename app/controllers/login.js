import Ember from 'ember';
export default Ember.Controller.extend({
  init: function(){
    console.log(Chart);
    console.log('hello');
  },
  actions: {
    login:function (){
      var user = this.get('user');
      var pass = this.get('pass');
      this.set('presentLogin', false);
      if (user === 'huan' && pass === '123'){
        alert('correct');
      }
      else{
        this.set('isLoginFailed', true);
      }
    }
  },

  token: localStorage.token,
  tokenChanged: function(){
    localStorage.token = this.get('token');
  }.observes('token'),

  presentLogin: true,
  user: '',
  pass: '',
  isLoginFailed: false,
});

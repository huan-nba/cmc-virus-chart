import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    this.store.push('user', {
      id: 1,
      name: 'Joe User',
      username: 'joe',
      email: 'joe@email.com',
      passwordDigest: '$2a$10$wJTPdvpGgzDvkXChrcPyqOQrFFawzGu89B1rZze/lVIcJKWiNeAqS'
    });

    this.store.push('user', {
      id: 2,
      name: 'John User',
      username: 'john',
      email: 'john smt',
      passwordDigest: '"$2a$10$wJTPdvpGgzDvkXChrcPyqOQrFFawzGu89B1rZze/lVIcJKWiNeAqS'
    });
    return this.store.all('user');
  }
});

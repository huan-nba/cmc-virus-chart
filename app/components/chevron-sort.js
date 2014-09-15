import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNameBindings: ['isAscending:fa-chevron-up:fa-chevron-down', 'isVisible::invisible'],
  classNames: ['fa', 'pull-right', '_color-royalblue' ]
});

import Ember from 'ember';

function xNumeral(value, formatString) {
  return numeral(value).format(formatString);
}

export {
  xNumeral
};

export default Ember.Handlebars.makeBoundHelper(xNumeral);
import Ember from 'ember';

function xRandom(type) {
  var value;
  switch (type) {
    case 'ip':
      var part1, part2, part3, part4;
      part1 = getRandomInt(0, 255);
      part2 = getRandomInt(0, 255);
      part3 = getRandomInt(0, 255);
      part4 = getRandomInt(0, 255);
      value = '%@.%@.%@.%@'.fmt(part1, part2, part3, part4);
      break;
  }
  return value;
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export {
  xRandom
};

export default Ember.Handlebars.makeBoundHelper(xRandom);

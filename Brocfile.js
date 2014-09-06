/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  fingerprint: {
    enabled: false
  }
});

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.
app.import('vendor/normalize.css/normalize.css');
app.import('vendor/lazy.js/lazy.js');
/*
Partial Animate.css
 */
app.import('vendor/animate.css/source/_base.css');
app.import('vendor/animate.css/source/attention_seekers/shake.css');
app.import('vendor/animate.css/source/fading_entrances/fadeInDown.css');

app.import('vendor/font-awesome/css/font-awesome.css');
app.import('vendor/bootstrap/dist/js/bootstrap.min.js');
app.import('vendor/bootstrap/dist/css/bootstrap.min.css');
app.import('vendor/bootstrap/dist/css/bootstrap-theme.min.css');
app.import('vendor/chartjs/Chart.js');
app.import('vendor/prefixfree/prefixfree.min.js');
var tree = app.toTree();
//var autoprefixer = require('broccoli-autoprefixer');
//tree = autoprefixer(tree, null);
//var gzipFiles = require('broccoli-gzip');
//var tree = gzipFiles(tree, {
//  extensions: ['js', 'css'],
//  appendSuffix: false
//});


module.exports = tree;

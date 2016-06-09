require('angular/angular.min');
require('angular-animate/angular-animate.min');
require('angular-ui-bootstrap/dist/ui-bootstrap-tpls');

var app = angular.module('playsLotto', [
    'ui.bootstrap',
    'ngAnimate'
])
.factory('socket', require('./js/socketservice.js'))
.controller('main', require('./js/main.js'))
.filter('keepNewLine', require('./js/keepNewLines.js'))
;
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
require('angular/angular.min');
require('angular-animate/angular-animate.min');
require('angular-ui-bootstrap/dist/ui-bootstrap-tpls');

var app = angular.module('playsLotto', [
    'ui.bootstrap',
    'ngAnimate'
])
.factory('socket', require('./js/socketService.js'))
.controller('main', require('./js/main.js'))
.filter('keepNewLine', require('./js/keepNewLines.js'))
;
}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_a3904804.js","/")
},{"./js/keepNewLines.js":2,"./js/main.js":3,"./js/socketService.js":4,"angular-animate/angular-animate.min":5,"angular-ui-bootstrap/dist/ui-bootstrap-tpls":6,"angular/angular.min":7,"buffer":9,"pBGvAp":11}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// @ngInject
module.exports = ['$sce', function ($sce) {
	return function(val) {
    	return $sce.trustAsHtml(val.replace(/\n/g, "<br>"));
    };
}];

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/js/keepNewLines.js","/js")
},{"buffer":9,"pBGvAp":11}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//@ngInject
var _ = require('underscore');
module.exports = ['$scope', '$window','socket', function($scope, $window, socket) {

  var cards = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 34, 55, 89, 144];
  $scope.cardoptions = cards;
  $scope.fibonacci = '0, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144';
  $scope.cardchoices = [];
  $scope.currentUsers = [];
  $scope.params = {
    toggleStart: true,
    scaleChoice: false,
    leader: false,
    leaderChosen: false,
    cardAvg: 0.0,
    sliderKey: 0,
    currentTask: 'None',
    scaleSelection: 'default',
    currentLeader: ''
  };
  $scope.plays = {
    link: 'http://peteplays.com/',
    logoSrc: 'images/playslogo.png',
    logoAlt: 'PetePlays'
  };

  var screenWidth = function (sw) {
    if ( sw > 992 ){
      return 'max';
    } else if ( sw <= 993 && sw > 768 ) {
      return 'lg';
    } else if ( sw <= 768 && sw > 573 ) {
      return 'md';
    } else if ( sw <= 573 && sw > 352 ) {
      return 'sm';
    } else if ( sw <= 352 ) {
      return 'min';
    }
  }

  var showScale = function (sw) {
    if ( ( $scope.params.scaleSelection != 'fibonacci' && sw == 'max' ) ||
         ( $scope.params.scaleSelection == 'fibonacci' && (sw == 'max' || sw == 'lg' || sw == 'md') ) ) {
      $scope.scaleOption = {
        tile: true,
        slider: false,
        input: false
      }
    } else if ( ( $scope.params.scaleSelection != 'fibonacci' && sw != 'max' ) ||
                ( $scope.params.scaleSelection == 'fibonacci' && (sw == 'sm' || sw == 'min') ) ) {
      $scope.params.sliderKey = 0;
      $scope.scaleOption = {
        tile: false,
        slider: true,
        input: true
      }
    }
  }

  var setWindowWidth = function () {
    showScale(screenWidth(document.body.offsetWidth));
  }

  //-- incoming
  socket.on('onCardCreated', function (data) {
    $scope.cardchoices.push(data);
  });

  socket.on('onCardsDeleted', function () {
    $scope.cardchoices = [];
    $scope.params.cardAvg = 0.0;
    $scope.showMessage = false;
  });

  socket.on('onToggle', function (val) {
    $scope.params.toggleStart = val;

    if (!val) {
      $scope.params.cardAvg = $scope.calcAvg();
    }
  });

  socket.on('onTaskChanged', function (val) {
    $scope.params.currentTask = val;
  });

  socket.on('onCardsChanged', function (data) {
    $scope.cardoptions = $scope.parseCards(data);
  });

  socket.on('onLeaderSet', function (data) {
    $scope.params.leaderChosen = true;
    $scope.params.currentLeader = data;
  });

  socket.on('onLeaderReset', function () {
    $scope.params.leaderChosen = false;
    $scope.params.currentLeader = null;
  });

  socket.on('onUserAdded', function (data) {
    if (!_.contains($scope.currentUsers, data)) {
      $scope.currentUsers.push(data);
    }
  });

  //-- outgoing
  $scope.createCard = function (data) {
    $scope.cardchoices.push(data);
    $scope.showMessage = true;
    socket.emit('createCard', data);
  };

  $scope.createCardOnlyVote = function (data, val) {
    _.extend(data, { card: val });
    $scope.createCard(data);
  };

  $scope.deleteCards = function () {
    $scope.cardchoices = [];
    $scope.params.cardAvg = 0.0;
    $scope.showMessage = false;
    socket.emit('deleteCards');
  };

  $scope.toggle = function (val) {
    $scope.params.toggleStart = val;

    if (!val) {
      $scope.params.cardAvg = $scope.calcAvg();
    }

    socket.emit('onToggle', val);
  };

  $scope.changeTask = function (data) {
    $scope.params.currentTask = data;
    socket.emit('onTaskChanged', data);
  };

  $scope.changeCards = function (data) {
    $scope.cardoptions = $scope.parseCards(data);
    socket.emit('onCardsChanged', data);
  };

  $scope.setLeader = function (data) {
    $scope.params.leader = true;
    $scope.params.leaderChosen = true;
    socket.emit('setLeader', data);
  };

  $scope.resetLeader = function () {
    $scope.params.leader = false;
    $scope.params.leaderChosen = false;
    socket.emit('resetLeader');
  };

  $scope.addUser = function (data) {
    if (!_.contains($scope.currentUsers, data)) {
      $scope.currentUsers.push(data);
    }
    socket.emit('addUser', data);
  };

  $scope.calcAvg = function (data) {
    var count = 0,
        total = 0;

    _.each($scope.cardchoices, function(choice) {
      if (_.isNumber(choice.card)) {
        count += 1;
        total += choice.card;
      }
    });

    return (total / count);
  };

  $scope.parseCards = function (data) {
    var cardarray = [],
        re = /\s*,\s*/;

    if (!_.isUndefined(data) && _.isString(data)) {
      values = data.toLowerCase().split(re);
      _.each(values, function (val) {
        if (parseInt(val)) {
          cardarray.push(parseInt(val));
        } else {
          cardarray.push(val);
        }
      });
      $scope.scaleMessage = 'Scale Changed Successfully';
      return cardarray;
    } else if (!_.isUndefined(data) && data === cards) {
      $scope.scaleMessage = 'Using Default Scale';
      return cards;
    } else {
      $scope.scaleMessage = 'Invalid Entry';
      return cards;
    }
  };

  $scope.showCustomScaleInput = function (val) {
    $scope.params.scaleChoice = val;
    setWindowWidth();
  };

  $scope.inputClickScale = function (action) {
    if( action == 'add' ) { $scope.params.sliderKey++; } else { $scope.params.sliderKey--; }
  };

  $window.onresize = function () { setWindowWidth(); $scope.$apply(); };

  setWindowWidth();

}];
}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/js/main.js","/js")
},{"buffer":9,"pBGvAp":11,"underscore":12}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//@ngInject
module.exports = ['$rootScope', function($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}];
}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/js/socketService.js","/js")
},{"buffer":9,"pBGvAp":11}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 AngularJS v1.5.7
 (c) 2010-2016 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(R,C){'use strict';function Aa(a,b,c){if(!a)throw Ma("areq",b||"?",c||"required");return a}function Ba(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;ca(a)&&(a=a.join(" "));ca(b)&&(b=b.join(" "));return a+" "+b}function Na(a){var b={};a&&(a.to||a.from)&&(b.to=a.to,b.from=a.from);return b}function Y(a,b,c){var d="";a=ca(a)?a:a&&O(a)&&a.length?a.split(/\s+/):[];s(a,function(a,l){a&&0<a.length&&(d+=0<l?" ":"",d+=c?b+a:a+b)});return d}function Oa(a){if(a instanceof G)switch(a.length){case 0:return a;
case 1:if(1===a[0].nodeType)return a;break;default:return G(da(a))}if(1===a.nodeType)return G(a)}function da(a){if(!a[0])return a;for(var b=0;b<a.length;b++){var c=a[b];if(1==c.nodeType)return c}}function Pa(a,b,c){s(b,function(b){a.addClass(b,c)})}function Qa(a,b,c){s(b,function(b){a.removeClass(b,c)})}function V(a){return function(b,c){c.addClass&&(Pa(a,b,c.addClass),c.addClass=null);c.removeClass&&(Qa(a,b,c.removeClass),c.removeClass=null)}}function oa(a){a=a||{};if(!a.$$prepared){var b=a.domOperation||
Q;a.domOperation=function(){a.$$domOperationFired=!0;b();b=Q};a.$$prepared=!0}return a}function ha(a,b){Ca(a,b);Da(a,b)}function Ca(a,b){b.from&&(a.css(b.from),b.from=null)}function Da(a,b){b.to&&(a.css(b.to),b.to=null)}function W(a,b,c){var d=b.options||{};c=c.options||{};var e=(d.addClass||"")+" "+(c.addClass||""),l=(d.removeClass||"")+" "+(c.removeClass||"");a=Ra(a.attr("class"),e,l);c.preparationClasses&&(d.preparationClasses=Z(c.preparationClasses,d.preparationClasses),delete c.preparationClasses);
e=d.domOperation!==Q?d.domOperation:null;Ea(d,c);e&&(d.domOperation=e);d.addClass=a.addClass?a.addClass:null;d.removeClass=a.removeClass?a.removeClass:null;b.addClass=d.addClass;b.removeClass=d.removeClass;return d}function Ra(a,b,c){function d(a){O(a)&&(a=a.split(" "));var b={};s(a,function(a){a.length&&(b[a]=!0)});return b}var e={};a=d(a);b=d(b);s(b,function(a,b){e[b]=1});c=d(c);s(c,function(a,b){e[b]=1===e[b]?null:-1});var l={addClass:"",removeClass:""};s(e,function(b,c){var d,e;1===b?(d="addClass",
e=!a[c]):-1===b&&(d="removeClass",e=a[c]);e&&(l[d].length&&(l[d]+=" "),l[d]+=c)});return l}function z(a){return a instanceof C.element?a[0]:a}function Sa(a,b,c){var d="";b&&(d=Y(b,"ng-",!0));c.addClass&&(d=Z(d,Y(c.addClass,"-add")));c.removeClass&&(d=Z(d,Y(c.removeClass,"-remove")));d.length&&(c.preparationClasses=d,a.addClass(d))}function pa(a,b){var c=b?"-"+b+"s":"";la(a,[ma,c]);return[ma,c]}function ta(a,b){var c=b?"paused":"",d=$+"PlayState";la(a,[d,c]);return[d,c]}function la(a,b){a.style[b[0]]=
b[1]}function Z(a,b){return a?b?a+" "+b:a:b}function Fa(a,b,c){var d=Object.create(null),e=a.getComputedStyle(b)||{};s(c,function(a,b){var c=e[a];if(c){var g=c.charAt(0);if("-"===g||"+"===g||0<=g)c=Ta(c);0===c&&(c=null);d[b]=c}});return d}function Ta(a){var b=0;a=a.split(/\s*,\s*/);s(a,function(a){"s"==a.charAt(a.length-1)&&(a=a.substring(0,a.length-1));a=parseFloat(a)||0;b=b?Math.max(a,b):a});return b}function ua(a){return 0===a||null!=a}function Ga(a,b){var c=S,d=a+"s";b?c+="Duration":d+=" linear all";
return[c,d]}function Ha(){var a=Object.create(null);return{flush:function(){a=Object.create(null)},count:function(b){return(b=a[b])?b.total:0},get:function(b){return(b=a[b])&&b.value},put:function(b,c){a[b]?a[b].total++:a[b]={total:1,value:c}}}}function Ia(a,b,c){s(c,function(c){a[c]=ea(a[c])?a[c]:b.style.getPropertyValue(c)})}var Q=C.noop,Ja=C.copy,Ea=C.extend,G=C.element,s=C.forEach,ca=C.isArray,O=C.isString,va=C.isObject,I=C.isUndefined,ea=C.isDefined,Ka=C.isFunction,wa=C.isElement,S,xa,$,ya;I(R.ontransitionend)&&
ea(R.onwebkittransitionend)?(S="WebkitTransition",xa="webkitTransitionEnd transitionend"):(S="transition",xa="transitionend");I(R.onanimationend)&&ea(R.onwebkitanimationend)?($="WebkitAnimation",ya="webkitAnimationEnd animationend"):($="animation",ya="animationend");var qa=$+"Delay",za=$+"Duration",ma=S+"Delay",La=S+"Duration",Ma=C.$$minErr("ng"),Ua={transitionDuration:La,transitionDelay:ma,transitionProperty:S+"Property",animationDuration:za,animationDelay:qa,animationIterationCount:$+"IterationCount"},
Va={transitionDuration:La,transitionDelay:ma,animationDuration:za,animationDelay:qa};C.module("ngAnimate",[]).directive("ngAnimateSwap",["$animate","$rootScope",function(a,b){return{restrict:"A",transclude:"element",terminal:!0,priority:600,link:function(b,d,e,l,n){var H,g;b.$watchCollection(e.ngAnimateSwap||e["for"],function(e){H&&a.leave(H);g&&(g.$destroy(),g=null);if(e||0===e)g=b.$new(),n(g,function(b){H=b;a.enter(b,null,d)})})}}}]).directive("ngAnimateChildren",["$interpolate",function(a){return{link:function(b,
c,d){function e(a){c.data("$$ngAnimateChildren","on"===a||"true"===a)}var l=d.ngAnimateChildren;C.isString(l)&&0===l.length?c.data("$$ngAnimateChildren",!0):(e(a(l)(b)),d.$observe("ngAnimateChildren",e))}}}]).factory("$$rAFScheduler",["$$rAF",function(a){function b(a){d=d.concat(a);c()}function c(){if(d.length){for(var b=d.shift(),n=0;n<b.length;n++)b[n]();e||a(function(){e||c()})}}var d,e;d=b.queue=[];b.waitUntilQuiet=function(b){e&&e();e=a(function(){e=null;b();c()})};return b}]).provider("$$animateQueue",
["$animateProvider",function(a){function b(a){if(!a)return null;a=a.split(" ");var b=Object.create(null);s(a,function(a){b[a]=!0});return b}function c(a,c){if(a&&c){var d=b(c);return a.split(" ").some(function(a){return d[a]})}}function d(a,b,c,d){return l[a].some(function(a){return a(b,c,d)})}function e(a,b){var c=0<(a.addClass||"").length,d=0<(a.removeClass||"").length;return b?c&&d:c||d}var l=this.rules={skip:[],cancel:[],join:[]};l.join.push(function(a,b,c){return!b.structural&&e(b)});l.skip.push(function(a,
b,c){return!b.structural&&!e(b)});l.skip.push(function(a,b,c){return"leave"==c.event&&b.structural});l.skip.push(function(a,b,c){return c.structural&&2===c.state&&!b.structural});l.cancel.push(function(a,b,c){return c.structural&&b.structural});l.cancel.push(function(a,b,c){return 2===c.state&&b.structural});l.cancel.push(function(a,b,d){if(d.structural)return!1;a=b.addClass;b=b.removeClass;var e=d.addClass;d=d.removeClass;return I(a)&&I(b)||I(e)&&I(d)?!1:c(a,d)||c(b,e)});this.$get=["$$rAF","$rootScope",
"$rootElement","$document","$$HashMap","$$animation","$$AnimateRunner","$templateRequest","$$jqLite","$$forceReflow",function(b,c,g,l,v,Wa,P,t,F,T){function J(){var a=!1;return function(b){a?b():c.$$postDigest(function(){a=!0;b()})}}function y(a,b,c){var f=z(b),d=z(a),N=[];(a=h[c])&&s(a,function(a){x.call(a.node,f)?N.push(a.callback):"leave"===c&&x.call(a.node,d)&&N.push(a.callback)});return N}function r(a,b,c){var f=da(b);return a.filter(function(a){return!(a.node===f&&(!c||a.callback===c))})}function p(a,
h,w){function r(c,f,d,h){sa(function(){var c=y(T,a,f);c.length?b(function(){s(c,function(b){b(a,d,h)});"close"!==d||a[0].parentNode||ra.off(a)}):"close"!==d||a[0].parentNode||ra.off(a)});c.progress(f,d,h)}function k(b){var c=a,f=m;f.preparationClasses&&(c.removeClass(f.preparationClasses),f.preparationClasses=null);f.activeClasses&&(c.removeClass(f.activeClasses),f.activeClasses=null);E(a,m);ha(a,m);m.domOperation();B.complete(!b)}var m=Ja(w),p,T;if(a=Oa(a))p=z(a),T=a.parent();var m=oa(m),B=new P,
sa=J();ca(m.addClass)&&(m.addClass=m.addClass.join(" "));m.addClass&&!O(m.addClass)&&(m.addClass=null);ca(m.removeClass)&&(m.removeClass=m.removeClass.join(" "));m.removeClass&&!O(m.removeClass)&&(m.removeClass=null);m.from&&!va(m.from)&&(m.from=null);m.to&&!va(m.to)&&(m.to=null);if(!p)return k(),B;w=[p.className,m.addClass,m.removeClass].join(" ");if(!Xa(w))return k(),B;var g=0<=["enter","move","leave"].indexOf(h),x=l[0].hidden,t=!f||x||N.get(p);w=!t&&A.get(p)||{};var F=!!w.state;t||F&&1==w.state||
(t=!M(a,T,h));if(t)return x&&r(B,h,"start"),k(),x&&r(B,h,"close"),B;g&&K(a);x={structural:g,element:a,event:h,addClass:m.addClass,removeClass:m.removeClass,close:k,options:m,runner:B};if(F){if(d("skip",a,x,w)){if(2===w.state)return k(),B;W(a,w,x);return w.runner}if(d("cancel",a,x,w))if(2===w.state)w.runner.end();else if(w.structural)w.close();else return W(a,w,x),w.runner;else if(d("join",a,x,w))if(2===w.state)W(a,x,{});else return Sa(a,g?h:null,m),h=x.event=w.event,m=W(a,w,x),w.runner}else W(a,x,
{});(F=x.structural)||(F="animate"===x.event&&0<Object.keys(x.options.to||{}).length||e(x));if(!F)return k(),ka(a),B;var v=(w.counter||0)+1;x.counter=v;L(a,1,x);c.$$postDigest(function(){var b=A.get(p),c=!b,b=b||{},f=0<(a.parent()||[]).length&&("animate"===b.event||b.structural||e(b));if(c||b.counter!==v||!f){c&&(E(a,m),ha(a,m));if(c||g&&b.event!==h)m.domOperation(),B.end();f||ka(a)}else h=!b.structural&&e(b,!0)?"setClass":b.event,L(a,2),b=Wa(a,h,b.options),B.setHost(b),r(B,h,"start",{}),b.done(function(b){k(!b);
(b=A.get(p))&&b.counter===v&&ka(z(a));r(B,h,"close",{})})});return B}function K(a){a=z(a).querySelectorAll("[data-ng-animate]");s(a,function(a){var b=parseInt(a.getAttribute("data-ng-animate")),c=A.get(a);if(c)switch(b){case 2:c.runner.end();case 1:A.remove(a)}})}function ka(a){a=z(a);a.removeAttribute("data-ng-animate");A.remove(a)}function k(a,b){return z(a)===z(b)}function M(a,b,c){c=G(l[0].body);var f=k(a,c)||"HTML"===a[0].nodeName,d=k(a,g),h=!1,r,e=N.get(z(a));(a=G.data(a[0],"$ngAnimatePin"))&&
(b=a);for(b=z(b);b;){d||(d=k(b,g));if(1!==b.nodeType)break;a=A.get(b)||{};if(!h){var p=N.get(b);if(!0===p&&!1!==e){e=!0;break}else!1===p&&(e=!1);h=a.structural}if(I(r)||!0===r)a=G.data(b,"$$ngAnimateChildren"),ea(a)&&(r=a);if(h&&!1===r)break;f||(f=k(b,c));if(f&&d)break;if(!d&&(a=G.data(b,"$ngAnimatePin"))){b=z(a);continue}b=b.parentNode}return(!h||r)&&!0!==e&&d&&f}function L(a,b,c){c=c||{};c.state=b;a=z(a);a.setAttribute("data-ng-animate",b);c=(b=A.get(a))?Ea(b,c):c;A.put(a,c)}var A=new v,N=new v,
f=null,B=c.$watch(function(){return 0===t.totalPendingRequests},function(a){a&&(B(),c.$$postDigest(function(){c.$$postDigest(function(){null===f&&(f=!0)})}))}),h={},sa=a.classNameFilter(),Xa=sa?function(a){return sa.test(a)}:function(){return!0},E=V(F),x=R.Node.prototype.contains||function(a){return this===a||!!(this.compareDocumentPosition(a)&16)},ra={on:function(a,b,c){var f=da(b);h[a]=h[a]||[];h[a].push({node:f,callback:c});G(b).on("$destroy",function(){A.get(f)||ra.off(a,b,c)})},off:function(a,
b,c){if(1!==arguments.length||C.isString(arguments[0])){var f=h[a];f&&(h[a]=1===arguments.length?null:r(f,b,c))}else for(f in b=arguments[0],h)h[f]=r(h[f],b)},pin:function(a,b){Aa(wa(a),"element","not an element");Aa(wa(b),"parentElement","not an element");a.data("$ngAnimatePin",b)},push:function(a,b,c,f){c=c||{};c.domOperation=f;return p(a,b,c)},enabled:function(a,b){var c=arguments.length;if(0===c)b=!!f;else if(wa(a)){var d=z(a),h=N.get(d);1===c?b=!h:N.put(d,!b)}else b=f=!!a;return b}};return ra}]}]).provider("$$animation",
["$animateProvider",function(a){var b=this.drivers=[];this.$get=["$$jqLite","$rootScope","$injector","$$AnimateRunner","$$HashMap","$$rAFScheduler",function(a,d,e,l,n,H){function g(a){function b(a){if(a.processed)return a;a.processed=!0;var d=a.domNode,p=d.parentNode;e.put(d,a);for(var K;p;){if(K=e.get(p)){K.processed||(K=b(K));break}p=p.parentNode}(K||c).children.push(a);return a}var c={children:[]},d,e=new n;for(d=0;d<a.length;d++){var g=a[d];e.put(g.domNode,a[d]={domNode:g.domNode,fn:g.fn,children:[]})}for(d=
0;d<a.length;d++)b(a[d]);return function(a){var b=[],c=[],d;for(d=0;d<a.children.length;d++)c.push(a.children[d]);a=c.length;var e=0,k=[];for(d=0;d<c.length;d++){var g=c[d];0>=a&&(a=e,e=0,b.push(k),k=[]);k.push(g.fn);g.children.forEach(function(a){e++;c.push(a)});a--}k.length&&b.push(k);return b}(c)}var u=[],v=V(a);return function(n,P,t){function F(a){a=a.hasAttribute("ng-animate-ref")?[a]:a.querySelectorAll("[ng-animate-ref]");var b=[];s(a,function(a){var c=a.getAttribute("ng-animate-ref");c&&c.length&&
b.push(a)});return b}function T(a){var b=[],c={};s(a,function(a,d){var h=z(a.element),e=0<=["enter","move"].indexOf(a.event),h=a.structural?F(h):[];if(h.length){var k=e?"to":"from";s(h,function(a){var b=a.getAttribute("ng-animate-ref");c[b]=c[b]||{};c[b][k]={animationID:d,element:G(a)}})}else b.push(a)});var d={},e={};s(c,function(c,k){var r=c.from,p=c.to;if(r&&p){var A=a[r.animationID],g=a[p.animationID],B=r.animationID.toString();if(!e[B]){var n=e[B]={structural:!0,beforeStart:function(){A.beforeStart();
g.beforeStart()},close:function(){A.close();g.close()},classes:J(A.classes,g.classes),from:A,to:g,anchors:[]};n.classes.length?b.push(n):(b.push(A),b.push(g))}e[B].anchors.push({out:r.element,"in":p.element})}else r=r?r.animationID:p.animationID,p=r.toString(),d[p]||(d[p]=!0,b.push(a[r]))});return b}function J(a,b){a=a.split(" ");b=b.split(" ");for(var c=[],d=0;d<a.length;d++){var e=a[d];if("ng-"!==e.substring(0,3))for(var r=0;r<b.length;r++)if(e===b[r]){c.push(e);break}}return c.join(" ")}function y(a){for(var c=
b.length-1;0<=c;c--){var d=e.get(b[c])(a);if(d)return d}}function r(a,b){function c(a){(a=a.data("$$animationRunner"))&&a.setHost(b)}a.from&&a.to?(c(a.from.element),c(a.to.element)):c(a.element)}function p(){var a=n.data("$$animationRunner");!a||"leave"===P&&t.$$domOperationFired||a.end()}function K(b){n.off("$destroy",p);n.removeData("$$animationRunner");v(n,t);ha(n,t);t.domOperation();L&&a.removeClass(n,L);n.removeClass("ng-animate");k.complete(!b)}t=oa(t);var ka=0<=["enter","move","leave"].indexOf(P),
k=new l({end:function(){K()},cancel:function(){K(!0)}});if(!b.length)return K(),k;n.data("$$animationRunner",k);var M=Ba(n.attr("class"),Ba(t.addClass,t.removeClass)),L=t.tempClasses;L&&(M+=" "+L,t.tempClasses=null);var A;ka&&(A="ng-"+P+"-prepare",a.addClass(n,A));u.push({element:n,classes:M,event:P,structural:ka,options:t,beforeStart:function(){n.addClass("ng-animate");L&&a.addClass(n,L);A&&(a.removeClass(n,A),A=null)},close:K});n.on("$destroy",p);if(1<u.length)return k;d.$$postDigest(function(){var a=
[];s(u,function(b){b.element.data("$$animationRunner")?a.push(b):b.close()});u.length=0;var b=T(a),c=[];s(b,function(a){c.push({domNode:z(a.from?a.from.element:a.element),fn:function(){a.beforeStart();var b,c=a.close;if((a.anchors?a.from.element||a.to.element:a.element).data("$$animationRunner")){var d=y(a);d&&(b=d.start)}b?(b=b(),b.done(function(a){c(!a)}),r(a,b)):c()}})});H(g(c))});return k}}]}]).provider("$animateCss",["$animateProvider",function(a){var b=Ha(),c=Ha();this.$get=["$window","$$jqLite",
"$$AnimateRunner","$timeout","$$forceReflow","$sniffer","$$rAFScheduler","$$animateQueue",function(a,e,l,n,H,g,u,v){function C(a,b){var c=a.parentNode;return(c.$$ngAnimateParentKey||(c.$$ngAnimateParentKey=++J))+"-"+a.getAttribute("class")+"-"+b}function P(r,p,g,n){var k;0<b.count(g)&&(k=c.get(g),k||(p=Y(p,"-stagger"),e.addClass(r,p),k=Fa(a,r,n),k.animationDuration=Math.max(k.animationDuration,0),k.transitionDuration=Math.max(k.transitionDuration,0),e.removeClass(r,p),c.put(g,k)));return k||{}}function t(a){y.push(a);
u.waitUntilQuiet(function(){b.flush();c.flush();for(var a=H(),d=0;d<y.length;d++)y[d](a);y.length=0})}function F(c,e,g){e=b.get(g);e||(e=Fa(a,c,Ua),"infinite"===e.animationIterationCount&&(e.animationIterationCount=1));b.put(g,e);c=e;g=c.animationDelay;e=c.transitionDelay;c.maxDelay=g&&e?Math.max(g,e):g||e;c.maxDuration=Math.max(c.animationDuration*c.animationIterationCount,c.transitionDuration);return c}var T=V(e),J=0,y=[];return function(a,c){function d(){k()}function u(){k(!0)}function k(b){if(!(x||
G&&J)){x=!0;J=!1;f.$$skipPreparationClasses||e.removeClass(a,ga);e.removeClass(a,ea);ta(h,!1);pa(h,!1);s(y,function(a){h.style[a[0]]=""});T(a,f);ha(a,f);Object.keys(B).length&&s(B,function(a,b){a?h.style.setProperty(b,a):h.style.removeProperty(b)});if(f.onDone)f.onDone();fa&&fa.length&&a.off(fa.join(" "),A);var c=a.data("$$animateCss");c&&(n.cancel(c[0].timer),a.removeData("$$animateCss"));I&&I.complete(!b)}}function M(a){q.blockTransition&&pa(h,a);q.blockKeyframeAnimation&&ta(h,!!a)}function L(){I=
new l({end:d,cancel:u});t(Q);k();return{$$willAnimate:!1,start:function(){return I},end:d}}function A(a){a.stopPropagation();var b=a.originalEvent||a;a=b.$manualTimeStamp||Date.now();b=parseFloat(b.elapsedTime.toFixed(3));Math.max(a-W,0)>=R&&b>=m&&(G=!0,k())}function N(){function b(){if(!x){M(!1);s(y,function(a){h.style[a[0]]=a[1]});T(a,f);e.addClass(a,ea);if(q.recalculateTimingStyles){na=h.className+" "+ga;ia=C(h,na);D=F(h,na,ia);aa=D.maxDelay;O=Math.max(aa,0);m=D.maxDuration;if(0===m){k();return}q.hasTransitions=
0<D.transitionDuration;q.hasAnimations=0<D.animationDuration}q.applyAnimationDelay&&(aa="boolean"!==typeof f.delay&&ua(f.delay)?parseFloat(f.delay):aa,O=Math.max(aa,0),D.animationDelay=aa,ba=[qa,aa+"s"],y.push(ba),h.style[ba[0]]=ba[1]);R=1E3*O;V=1E3*m;if(f.easing){var d,g=f.easing;q.hasTransitions&&(d=S+"TimingFunction",y.push([d,g]),h.style[d]=g);q.hasAnimations&&(d=$+"TimingFunction",y.push([d,g]),h.style[d]=g)}D.transitionDuration&&fa.push(xa);D.animationDuration&&fa.push(ya);W=Date.now();var p=
R+1.5*V;d=W+p;var g=a.data("$$animateCss")||[],N=!0;if(g.length){var l=g[0];(N=d>l.expectedEndTime)?n.cancel(l.timer):g.push(k)}N&&(p=n(c,p,!1),g[0]={timer:p,expectedEndTime:d},g.push(k),a.data("$$animateCss",g));if(fa.length)a.on(fa.join(" "),A);f.to&&(f.cleanupStyles&&Ia(B,h,Object.keys(f.to)),Da(a,f))}}function c(){var b=a.data("$$animateCss");if(b){for(var d=1;d<b.length;d++)b[d]();a.removeData("$$animateCss")}}if(!x)if(h.parentNode){var d=function(a){if(G)J&&a&&(J=!1,k());else if(J=!a,D.animationDuration)if(a=
ta(h,J),J)y.push(a);else{var b=y,c=b.indexOf(a);0<=a&&b.splice(c,1)}},g=0<da&&(D.transitionDuration&&0===X.transitionDuration||D.animationDuration&&0===X.animationDuration)&&Math.max(X.animationDelay,X.transitionDelay);g?n(b,Math.floor(g*da*1E3),!1):b();w.resume=function(){d(!0)};w.pause=function(){d(!1)}}else k()}var f=c||{};f.$$prepared||(f=oa(Ja(f)));var B={},h=z(a);if(!h||!h.parentNode||!v.enabled())return L();var y=[],H=a.attr("class"),E=Na(f),x,J,G,I,w,O,R,m,V,W,fa=[];if(0===f.duration||!g.animations&&
!g.transitions)return L();var ja=f.event&&ca(f.event)?f.event.join(" "):f.event,Z="",U="";ja&&f.structural?Z=Y(ja,"ng-",!0):ja&&(Z=ja);f.addClass&&(U+=Y(f.addClass,"-add"));f.removeClass&&(U.length&&(U+=" "),U+=Y(f.removeClass,"-remove"));f.applyClassesEarly&&U.length&&T(a,f);var ga=[Z,U].join(" ").trim(),na=H+" "+ga,ea=Y(ga,"-active"),H=E.to&&0<Object.keys(E.to).length;if(!(0<(f.keyframeStyle||"").length||H||ga))return L();var ia,X;0<f.stagger?(E=parseFloat(f.stagger),X={transitionDelay:E,animationDelay:E,
transitionDuration:0,animationDuration:0}):(ia=C(h,na),X=P(h,ga,ia,Va));f.$$skipPreparationClasses||e.addClass(a,ga);f.transitionStyle&&(E=[S,f.transitionStyle],la(h,E),y.push(E));0<=f.duration&&(E=0<h.style[S].length,E=Ga(f.duration,E),la(h,E),y.push(E));f.keyframeStyle&&(E=[$,f.keyframeStyle],la(h,E),y.push(E));var da=X?0<=f.staggerIndex?f.staggerIndex:b.count(ia):0;(ja=0===da)&&!f.skipBlocking&&pa(h,9999);var D=F(h,na,ia),aa=D.maxDelay;O=Math.max(aa,0);m=D.maxDuration;var q={};q.hasTransitions=
0<D.transitionDuration;q.hasAnimations=0<D.animationDuration;q.hasTransitionAll=q.hasTransitions&&"all"==D.transitionProperty;q.applyTransitionDuration=H&&(q.hasTransitions&&!q.hasTransitionAll||q.hasAnimations&&!q.hasTransitions);q.applyAnimationDuration=f.duration&&q.hasAnimations;q.applyTransitionDelay=ua(f.delay)&&(q.applyTransitionDuration||q.hasTransitions);q.applyAnimationDelay=ua(f.delay)&&q.hasAnimations;q.recalculateTimingStyles=0<U.length;if(q.applyTransitionDuration||q.applyAnimationDuration)m=
f.duration?parseFloat(f.duration):m,q.applyTransitionDuration&&(q.hasTransitions=!0,D.transitionDuration=m,E=0<h.style[S+"Property"].length,y.push(Ga(m,E))),q.applyAnimationDuration&&(q.hasAnimations=!0,D.animationDuration=m,y.push([za,m+"s"]));if(0===m&&!q.recalculateTimingStyles)return L();if(null!=f.delay){var ba;"boolean"!==typeof f.delay&&(ba=parseFloat(f.delay),O=Math.max(ba,0));q.applyTransitionDelay&&y.push([ma,ba+"s"]);q.applyAnimationDelay&&y.push([qa,ba+"s"])}null==f.duration&&0<D.transitionDuration&&
(q.recalculateTimingStyles=q.recalculateTimingStyles||ja);R=1E3*O;V=1E3*m;f.skipBlocking||(q.blockTransition=0<D.transitionDuration,q.blockKeyframeAnimation=0<D.animationDuration&&0<X.animationDelay&&0===X.animationDuration);f.from&&(f.cleanupStyles&&Ia(B,h,Object.keys(f.from)),Ca(a,f));q.blockTransition||q.blockKeyframeAnimation?M(m):f.skipBlocking||pa(h,!1);return{$$willAnimate:!0,end:d,start:function(){if(!x)return w={end:d,cancel:u,resume:null,pause:null},I=new l(w),t(N),I}}}}]}]).provider("$$animateCssDriver",
["$$animationProvider",function(a){a.drivers.push("$$animateCssDriver");this.$get=["$animateCss","$rootScope","$$AnimateRunner","$rootElement","$sniffer","$$jqLite","$document",function(a,c,d,e,l,n,H){function g(a){return a.replace(/\bng-\S+\b/g,"")}function u(a,b){O(a)&&(a=a.split(" "));O(b)&&(b=b.split(" "));return a.filter(function(a){return-1===b.indexOf(a)}).join(" ")}function v(c,e,n){function l(a){var b={},c=z(a).getBoundingClientRect();s(["width","height","top","left"],function(a){var d=c[a];
switch(a){case "top":d+=t.scrollTop;break;case "left":d+=t.scrollLeft}b[a]=Math.floor(d)+"px"});return b}function p(){var c=g(n.attr("class")||""),d=u(c,k),c=u(k,c),d=a(v,{to:l(n),addClass:"ng-anchor-in "+d,removeClass:"ng-anchor-out "+c,delay:!0});return d.$$willAnimate?d:null}function H(){v.remove();e.removeClass("ng-animate-shim");n.removeClass("ng-animate-shim")}var v=G(z(e).cloneNode(!0)),k=g(v.attr("class")||"");e.addClass("ng-animate-shim");n.addClass("ng-animate-shim");v.addClass("ng-anchor");
F.append(v);var M;c=function(){var c=a(v,{addClass:"ng-anchor-out",delay:!0,from:l(e)});return c.$$willAnimate?c:null}();if(!c&&(M=p(),!M))return H();var L=c||M;return{start:function(){function a(){c&&c.end()}var b,c=L.start();c.done(function(){c=null;if(!M&&(M=p()))return c=M.start(),c.done(function(){c=null;H();b.complete()}),c;H();b.complete()});return b=new d({end:a,cancel:a})}}}function C(a,b,c,e){var g=P(a,Q),n=P(b,Q),l=[];s(e,function(a){(a=v(c,a.out,a["in"]))&&l.push(a)});if(g||n||0!==l.length)return{start:function(){function a(){s(b,
function(a){a.end()})}var b=[];g&&b.push(g.start());n&&b.push(n.start());s(l,function(a){b.push(a.start())});var c=new d({end:a,cancel:a});d.all(b,function(a){c.complete(a)});return c}}}function P(c){var d=c.element,e=c.options||{};c.structural&&(e.event=c.event,e.structural=!0,e.applyClassesEarly=!0,"leave"===c.event&&(e.onDone=e.domOperation));e.preparationClasses&&(e.event=Z(e.event,e.preparationClasses));c=a(d,e);return c.$$willAnimate?c:null}if(!l.animations&&!l.transitions)return Q;var t=H[0].body;
c=z(e);var F=G(c.parentNode&&11===c.parentNode.nodeType||t.contains(c)?c:t);V(n);return function(a){return a.from&&a.to?C(a.from,a.to,a.classes,a.anchors):P(a)}}]}]).provider("$$animateJs",["$animateProvider",function(a){this.$get=["$injector","$$AnimateRunner","$$jqLite",function(b,c,d){function e(c){c=ca(c)?c:c.split(" ");for(var d=[],e={},l=0;l<c.length;l++){var v=c[l],s=a.$$registeredAnimations[v];s&&!e[v]&&(d.push(b.get(s)),e[v]=!0)}return d}var l=V(d);return function(a,b,d,u){function v(){u.domOperation();
l(a,u)}function C(a,b,d,e,f){switch(d){case "animate":b=[b,e.from,e.to,f];break;case "setClass":b=[b,G,J,f];break;case "addClass":b=[b,G,f];break;case "removeClass":b=[b,J,f];break;default:b=[b,f]}b.push(e);if(a=a.apply(a,b))if(Ka(a.start)&&(a=a.start()),a instanceof c)a.done(f);else if(Ka(a))return a;return Q}function z(a,b,d,e,f){var g=[];s(e,function(e){var k=e[f];k&&g.push(function(){var e,f,g=!1,h=function(a){g||(g=!0,(f||Q)(a),e.complete(!a))};e=new c({end:function(){h()},cancel:function(){h(!0)}});
f=C(k,a,b,d,function(a){h(!1===a)});return e})});return g}function t(a,b,d,e,f){var g=z(a,b,d,e,f);if(0===g.length){var h,k;"beforeSetClass"===f?(h=z(a,"removeClass",d,e,"beforeRemoveClass"),k=z(a,"addClass",d,e,"beforeAddClass")):"setClass"===f&&(h=z(a,"removeClass",d,e,"removeClass"),k=z(a,"addClass",d,e,"addClass"));h&&(g=g.concat(h));k&&(g=g.concat(k))}if(0!==g.length)return function(a){var b=[];g.length&&s(g,function(a){b.push(a())});b.length?c.all(b,a):a();return function(a){s(b,function(b){a?
b.cancel():b.end()})}}}var F=!1;3===arguments.length&&va(d)&&(u=d,d=null);u=oa(u);d||(d=a.attr("class")||"",u.addClass&&(d+=" "+u.addClass),u.removeClass&&(d+=" "+u.removeClass));var G=u.addClass,J=u.removeClass,y=e(d),r,p;if(y.length){var K,I;"leave"==b?(I="leave",K="afterLeave"):(I="before"+b.charAt(0).toUpperCase()+b.substr(1),K=b);"enter"!==b&&"move"!==b&&(r=t(a,b,u,y,I));p=t(a,b,u,y,K)}if(r||p){var k;return{$$willAnimate:!0,end:function(){k?k.end():(F=!0,v(),ha(a,u),k=new c,k.complete(!0));return k},
start:function(){function b(c){F=!0;v();ha(a,u);k.complete(c)}if(k)return k;k=new c;var d,e=[];r&&e.push(function(a){d=r(a)});e.length?e.push(function(a){v();a(!0)}):v();p&&e.push(function(a){d=p(a)});k.setHost({end:function(){F||((d||Q)(void 0),b(void 0))},cancel:function(){F||((d||Q)(!0),b(!0))}});c.chain(e,b);return k}}}}}]}]).provider("$$animateJsDriver",["$$animationProvider",function(a){a.drivers.push("$$animateJsDriver");this.$get=["$$animateJs","$$AnimateRunner",function(a,c){function d(c){return a(c.element,
c.event,c.classes,c.options)}return function(a){if(a.from&&a.to){var b=d(a.from),n=d(a.to);if(b||n)return{start:function(){function a(){return function(){s(d,function(a){a.end()})}}var d=[];b&&d.push(b.start());n&&d.push(n.start());c.all(d,function(a){e.complete(a)});var e=new c({end:a(),cancel:a()});return e}}}else return d(a)}}]}])})(window,window.angular);
//# sourceMappingURL=angular-animate.min.js.map

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/angular-animate/angular-animate.min.js","/../node_modules/angular-animate")
},{"buffer":9,"pBGvAp":11}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 1.3.3 - 2016-05-22
 * License: MIT
 */angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.isClass","ui.bootstrap.datepicker","ui.bootstrap.position","ui.bootstrap.datepickerPopup","ui.bootstrap.debounce","ui.bootstrap.dropdown","ui.bootstrap.stackedMap","ui.bootstrap.modal","ui.bootstrap.paging","ui.bootstrap.pager","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["uib/template/accordion/accordion-group.html","uib/template/accordion/accordion.html","uib/template/alert/alert.html","uib/template/carousel/carousel.html","uib/template/carousel/slide.html","uib/template/datepicker/datepicker.html","uib/template/datepicker/day.html","uib/template/datepicker/month.html","uib/template/datepicker/year.html","uib/template/datepickerPopup/popup.html","uib/template/modal/backdrop.html","uib/template/modal/window.html","uib/template/pager/pager.html","uib/template/pagination/pagination.html","uib/template/tooltip/tooltip-html-popup.html","uib/template/tooltip/tooltip-popup.html","uib/template/tooltip/tooltip-template-popup.html","uib/template/popover/popover-html.html","uib/template/popover/popover-template.html","uib/template/popover/popover.html","uib/template/progressbar/bar.html","uib/template/progressbar/progress.html","uib/template/progressbar/progressbar.html","uib/template/rating/rating.html","uib/template/tabs/tab.html","uib/template/tabs/tabset.html","uib/template/timepicker/timepicker.html","uib/template/typeahead/typeahead-match.html","uib/template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.collapse', [])

  .directive('uibCollapse', ['$animate', '$q', '$parse', '$injector', function($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
      link: function(scope, element, attrs) {
        var expandingExpr = $parse(attrs.expanding),
            expandedExpr = $parse(attrs.expanded),
            collapsingExpr = $parse(attrs.collapsing),
            collapsedExpr = $parse(attrs.collapsed);

        if (!scope.$eval(attrs.uibCollapse)) {
          element.addClass('in')
            .addClass('collapse')
            .attr('aria-expanded', true)
            .attr('aria-hidden', false)
            .css({height: 'auto'});
        }

        function expand() {
          if (element.hasClass('collapse') && element.hasClass('in')) {
            return;
          }

          $q.resolve(expandingExpr(scope))
            .then(function() {
              element.removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', true)
                .attr('aria-hidden', false);

              if ($animateCss) {
                $animateCss(element, {
                  addClass: 'in',
                  easing: 'ease',
                  to: { height: element[0].scrollHeight + 'px' }
                }).start()['finally'](expandDone);
              } else {
                $animate.addClass(element, 'in', {
                  to: { height: element[0].scrollHeight + 'px' }
                }).then(expandDone);
              }
            });
        }

        function expandDone() {
          element.removeClass('collapsing')
            .addClass('collapse')
            .css({height: 'auto'});
          expandedExpr(scope);
        }

        function collapse() {
          if (!element.hasClass('collapse') && !element.hasClass('in')) {
            return collapseDone();
          }

          $q.resolve(collapsingExpr(scope))
            .then(function() {
              element
                // IMPORTANT: The height must be set before adding "collapsing" class.
                // Otherwise, the browser attempts to animate from height 0 (in
                // collapsing class) to the given height here.
                .css({height: element[0].scrollHeight + 'px'})
                // initially all panel collapse have the collapse class, this removal
                // prevents the animation from jumping to collapsed state
                .removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', false)
                .attr('aria-hidden', true);

              if ($animateCss) {
                $animateCss(element, {
                  removeClass: 'in',
                  to: {height: '0'}
                }).start()['finally'](collapseDone);
              } else {
                $animate.removeClass(element, 'in', {
                  to: {height: '0'}
                }).then(collapseDone);
              }
            });
        }

        function collapseDone() {
          element.css({height: '0'}); // Required so that collapse works when animation is disabled
          element.removeClass('collapsing')
            .addClass('collapse');
          collapsedExpr(scope);
        }

        scope.$watch(attrs.uibCollapse, function(shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

.constant('uibAccordionConfig', {
  closeOthers: true
})

.controller('UibAccordionController', ['$scope', '$attrs', 'uibAccordionConfig', function($scope, $attrs, accordionConfig) {
  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ?
      $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if (closeOthers) {
      angular.forEach(this.groups, function(group) {
        if (group !== openGroup) {
          group.isOpen = false;
        }
      });
    }
  };

  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function(event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if (index !== -1) {
      this.groups.splice(index, 1);
    }
  };
}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('uibAccordion', function() {
  return {
    controller: 'UibAccordionController',
    controllerAs: 'accordion',
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/accordion/accordion.html';
    }
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('uibAccordionGroup', function() {
  return {
    require: '^uibAccordion',         // We need this directive to be inside an accordion
    transclude: true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/accordion/accordion-group.html';
    },
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      panelClass: '@?',           // Ditto with panelClass
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
    link: function(scope, element, attrs, accordionCtrl) {
      accordionCtrl.addGroup(scope);

      scope.openClass = attrs.openClass || 'panel-open';
      scope.panelClass = attrs.panelClass || 'panel-default';
      scope.$watch('isOpen', function(value) {
        element.toggleClass(scope.openClass, !!value);
        if (value) {
          accordionCtrl.closeOthers(scope);
        }
      });

      scope.toggleOpen = function($event) {
        if (!scope.isDisabled) {
          if (!$event || $event.which === 32) {
            scope.isOpen = !scope.isOpen;
          }
        }
      };

      var id = 'accordiongroup-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
      scope.headingId = id + '-tab';
      scope.panelId = id + '-panel';
    }
  };
})

// Use accordion-heading below an accordion-group to provide a heading containing HTML
.directive('uibAccordionHeading', function() {
  return {
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^uibAccordionGroup',
    link: function(scope, element, attrs, accordionGroupCtrl, transclude) {
      // Pass the heading to the accordion-group controller
      // so that it can be transcluded into the right place in the template
      // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
      accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
.directive('uibAccordionTransclude', function() {
  return {
    require: '^uibAccordionGroup',
    link: function(scope, element, attrs, controller) {
      scope.$watch(function() { return controller[attrs.uibAccordionTransclude]; }, function(heading) {
        if (heading) {
          var elem = angular.element(element[0].querySelector(getHeaderSelectors()));
          elem.html('');
          elem.append(heading);
        }
      });
    }
  };

  function getHeaderSelectors() {
      return 'uib-accordion-header,' +
          'data-uib-accordion-header,' +
          'x-uib-accordion-header,' +
          'uib\\:accordion-header,' +
          '[uib-accordion-header],' +
          '[data-uib-accordion-header],' +
          '[x-uib-accordion-header]';
  }
});

angular.module('ui.bootstrap.alert', [])

.controller('UibAlertController', ['$scope', '$attrs', '$interpolate', '$timeout', function($scope, $attrs, $interpolate, $timeout) {
  $scope.closeable = !!$attrs.close;

  var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
    $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;

  if (dismissOnTimeout) {
    $timeout(function() {
      $scope.close();
    }, parseInt(dismissOnTimeout, 10));
  }
}])

.directive('uibAlert', function() {
  return {
    controller: 'UibAlertController',
    controllerAs: 'alert',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/alert/alert.html';
    },
    transclude: true,
    replace: true,
    scope: {
      type: '@',
      close: '&'
    }
  };
});

angular.module('ui.bootstrap.buttons', [])

.constant('uibButtonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
})

.controller('UibButtonsController', ['uibButtonConfig', function(buttonConfig) {
  this.activeClass = buttonConfig.activeClass || 'active';
  this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('uibBtnRadio', ['$parse', function($parse) {
  return {
    require: ['uibBtnRadio', 'ngModel'],
    controller: 'UibButtonsController',
    controllerAs: 'buttons',
    link: function(scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
      var uncheckableExpr = $parse(attrs.uibUncheckable);

      element.find('input').css({display: 'none'});

      //model -> UI
      ngModelCtrl.$render = function() {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.uibBtnRadio)));
      };

      //ui->model
      element.on(buttonsCtrl.toggleEvent, function() {
        if (attrs.disabled) {
          return;
        }

        var isActive = element.hasClass(buttonsCtrl.activeClass);

        if (!isActive || angular.isDefined(attrs.uncheckable)) {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.uibBtnRadio));
            ngModelCtrl.$render();
          });
        }
      });

      if (attrs.uibUncheckable) {
        scope.$watch(uncheckableExpr, function(uncheckable) {
          attrs.$set('uncheckable', uncheckable ? '' : undefined);
        });
      }
    }
  };
}])

.directive('uibBtnCheckbox', function() {
  return {
    require: ['uibBtnCheckbox', 'ngModel'],
    controller: 'UibButtonsController',
    controllerAs: 'button',
    link: function(scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      element.find('input').css({display: 'none'});

      function getTrueValue() {
        return getCheckboxValue(attrs.btnCheckboxTrue, true);
      }

      function getFalseValue() {
        return getCheckboxValue(attrs.btnCheckboxFalse, false);
      }

      function getCheckboxValue(attribute, defaultValue) {
        return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
      }

      //model -> UI
      ngModelCtrl.$render = function() {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
      };

      //ui->model
      element.on(buttonsCtrl.toggleEvent, function() {
        if (attrs.disabled) {
          return;
        }

        scope.$apply(function() {
          ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
          ngModelCtrl.$render();
        });
      });
    }
  };
});

angular.module('ui.bootstrap.carousel', [])

.controller('UibCarouselController', ['$scope', '$element', '$interval', '$timeout', '$animate', function($scope, $element, $interval, $timeout, $animate) {
  var self = this,
    slides = self.slides = $scope.slides = [],
    SLIDE_DIRECTION = 'uib-slideDirection',
    currentIndex = $scope.active,
    currentInterval, isPlaying, bufferedTransitions = [];

  var destroyed = false;

  self.addSlide = function(slide, element) {
    slides.push({
      slide: slide,
      element: element
    });
    slides.sort(function(a, b) {
      return +a.slide.index - +b.slide.index;
    });
    //if this is the first slide or the slide is set to active, select it
    if (slide.index === $scope.active || slides.length === 1 && !angular.isNumber($scope.active)) {
      if ($scope.$currentTransition) {
        $scope.$currentTransition = null;
      }

      currentIndex = slide.index;
      $scope.active = slide.index;
      setActive(currentIndex);
      self.select(slides[findSlideIndex(slide)]);
      if (slides.length === 1) {
        $scope.play();
      }
    }
  };

  self.getCurrentIndex = function() {
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].slide.index === currentIndex) {
        return i;
      }
    }
  };

  self.next = $scope.next = function() {
    var newIndex = (self.getCurrentIndex() + 1) % slides.length;

    if (newIndex === 0 && $scope.noWrap()) {
      $scope.pause();
      return;
    }

    return self.select(slides[newIndex], 'next');
  };

  self.prev = $scope.prev = function() {
    var newIndex = self.getCurrentIndex() - 1 < 0 ? slides.length - 1 : self.getCurrentIndex() - 1;

    if ($scope.noWrap() && newIndex === slides.length - 1) {
      $scope.pause();
      return;
    }

    return self.select(slides[newIndex], 'prev');
  };

  self.removeSlide = function(slide) {
    var index = findSlideIndex(slide);

    var bufferedIndex = bufferedTransitions.indexOf(slides[index]);
    if (bufferedIndex !== -1) {
      bufferedTransitions.splice(bufferedIndex, 1);
    }

    //get the index of the slide inside the carousel
    slides.splice(index, 1);
    if (slides.length > 0 && currentIndex === index) {
      if (index >= slides.length) {
        currentIndex = slides.length - 1;
        $scope.active = currentIndex;
        setActive(currentIndex);
        self.select(slides[slides.length - 1]);
      } else {
        currentIndex = index;
        $scope.active = currentIndex;
        setActive(currentIndex);
        self.select(slides[index]);
      }
    } else if (currentIndex > index) {
      currentIndex--;
      $scope.active = currentIndex;
    }

    //clean the active value when no more slide
    if (slides.length === 0) {
      currentIndex = null;
      $scope.active = null;
      clearBufferedTransitions();
    }
  };

  /* direction: "prev" or "next" */
  self.select = $scope.select = function(nextSlide, direction) {
    var nextIndex = findSlideIndex(nextSlide.slide);
    //Decide direction if it's not given
    if (direction === undefined) {
      direction = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
    }
    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (nextSlide.slide.index !== currentIndex &&
      !$scope.$currentTransition) {
      goNext(nextSlide.slide, nextIndex, direction);
    } else if (nextSlide && nextSlide.slide.index !== currentIndex && $scope.$currentTransition) {
      bufferedTransitions.push(slides[nextIndex]);
    }
  };

  /* Allow outside people to call indexOf on slides array */
  $scope.indexOfSlide = function(slide) {
    return +slide.slide.index;
  };

  $scope.isActive = function(slide) {
    return $scope.active === slide.slide.index;
  };

  $scope.isPrevDisabled = function() {
    return $scope.active === 0 && $scope.noWrap();
  };

  $scope.isNextDisabled = function() {
    return $scope.active === slides.length - 1 && $scope.noWrap();
  };

  $scope.pause = function() {
    if (!$scope.noPause) {
      isPlaying = false;
      resetTimer();
    }
  };

  $scope.play = function() {
    if (!isPlaying) {
      isPlaying = true;
      restartTimer();
    }
  };

  $scope.$on('$destroy', function() {
    destroyed = true;
    resetTimer();
  });

  $scope.$watch('noTransition', function(noTransition) {
    $animate.enabled($element, !noTransition);
  });

  $scope.$watch('interval', restartTimer);

  $scope.$watchCollection('slides', resetTransition);

  $scope.$watch('active', function(index) {
    if (angular.isNumber(index) && currentIndex !== index) {
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].slide.index === index) {
          index = i;
          break;
        }
      }

      var slide = slides[index];
      if (slide) {
        setActive(index);
        self.select(slides[index]);
        currentIndex = index;
      }
    }
  });

  function clearBufferedTransitions() {
    while (bufferedTransitions.length) {
      bufferedTransitions.shift();
    }
  }

  function getSlideByIndex(index) {
    for (var i = 0, l = slides.length; i < l; ++i) {
      if (slides[i].index === index) {
        return slides[i];
      }
    }
  }

  function setActive(index) {
    for (var i = 0; i < slides.length; i++) {
      slides[i].slide.active = i === index;
    }
  }

  function goNext(slide, index, direction) {
    if (destroyed) {
      return;
    }

    angular.extend(slide, {direction: direction});
    angular.extend(slides[currentIndex].slide || {}, {direction: direction});
    if ($animate.enabled($element) && !$scope.$currentTransition &&
      slides[index].element && self.slides.length > 1) {
      slides[index].element.data(SLIDE_DIRECTION, slide.direction);
      var currentIdx = self.getCurrentIndex();

      if (angular.isNumber(currentIdx) && slides[currentIdx].element) {
        slides[currentIdx].element.data(SLIDE_DIRECTION, slide.direction);
      }

      $scope.$currentTransition = true;
      $animate.on('addClass', slides[index].element, function(element, phase) {
        if (phase === 'close') {
          $scope.$currentTransition = null;
          $animate.off('addClass', element);
          if (bufferedTransitions.length) {
            var nextSlide = bufferedTransitions.pop().slide;
            var nextIndex = nextSlide.index;
            var nextDirection = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
            clearBufferedTransitions();

            goNext(nextSlide, nextIndex, nextDirection);
          }
        }
      });
    }

    $scope.active = slide.index;
    currentIndex = slide.index;
    setActive(index);

    //every time you change slides, reset the timer
    restartTimer();
  }

  function findSlideIndex(slide) {
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].slide === slide) {
        return i;
      }
    }
  }

  function resetTimer() {
    if (currentInterval) {
      $interval.cancel(currentInterval);
      currentInterval = null;
    }
  }

  function resetTransition(slides) {
    if (!slides.length) {
      $scope.$currentTransition = null;
      clearBufferedTransitions();
    }
  }

  function restartTimer() {
    resetTimer();
    var interval = +$scope.interval;
    if (!isNaN(interval) && interval > 0) {
      currentInterval = $interval(timerFn, interval);
    }
  }

  function timerFn() {
    var interval = +$scope.interval;
    if (isPlaying && !isNaN(interval) && interval > 0 && slides.length) {
      $scope.next();
    } else {
      $scope.pause();
    }
  }
}])

.directive('uibCarousel', function() {
  return {
    transclude: true,
    replace: true,
    controller: 'UibCarouselController',
    controllerAs: 'carousel',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/carousel/carousel.html';
    },
    scope: {
      active: '=',
      interval: '=',
      noTransition: '=',
      noPause: '=',
      noWrap: '&'
    }
  };
})

.directive('uibSlide', function() {
  return {
    require: '^uibCarousel',
    transclude: true,
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/carousel/slide.html';
    },
    scope: {
      actual: '=?',
      index: '=?'
    },
    link: function (scope, element, attrs, carouselCtrl) {
      carouselCtrl.addSlide(scope, element);
      //when the scope is destroyed then remove the slide from the current slides array
      scope.$on('$destroy', function() {
        carouselCtrl.removeSlide(scope);
      });
    }
  };
})

.animation('.item', ['$animateCss',
function($animateCss) {
  var SLIDE_DIRECTION = 'uib-slideDirection';

  function removeClass(element, className, callback) {
    element.removeClass(className);
    if (callback) {
      callback();
    }
  }

  return {
    beforeAddClass: function(element, className, done) {
      if (className === 'active') {
        var stopped = false;
        var direction = element.data(SLIDE_DIRECTION);
        var directionClass = direction === 'next' ? 'left' : 'right';
        var removeClassFn = removeClass.bind(this, element,
          directionClass + ' ' + direction, done);
        element.addClass(direction);

        $animateCss(element, {addClass: directionClass})
          .start()
          .done(removeClassFn);

        return function() {
          stopped = true;
        };
      }
      done();
    },
    beforeRemoveClass: function (element, className, done) {
      if (className === 'active') {
        var stopped = false;
        var direction = element.data(SLIDE_DIRECTION);
        var directionClass = direction === 'next' ? 'left' : 'right';
        var removeClassFn = removeClass.bind(this, element, directionClass, done);

        $animateCss(element, {addClass: directionClass})
          .start()
          .done(removeClassFn);

        return function() {
          stopped = true;
        };
      }
      done();
    }
  };
}]);

angular.module('ui.bootstrap.dateparser', [])

.service('uibDateParser', ['$log', '$locale', 'dateFilter', 'orderByFilter', function($log, $locale, dateFilter, orderByFilter) {
  // Pulled from https://github.com/mbostock/d3/blob/master/src/format/requote.js
  var SPECIAL_CHARACTERS_REGEXP = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

  var localeId;
  var formatCodeToRegex;

  this.init = function() {
    localeId = $locale.id;

    this.parsers = {};
    this.formatters = {};

    formatCodeToRegex = [
      {
        key: 'yyyy',
        regex: '\\d{4}',
        apply: function(value) { this.year = +value; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'yyyy');
        }
      },
      {
        key: 'yy',
        regex: '\\d{2}',
        apply: function(value) { value = +value; this.year = value < 69 ? value + 2000 : value + 1900; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'yy');
        }
      },
      {
        key: 'y',
        regex: '\\d{1,4}',
        apply: function(value) { this.year = +value; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'y');
        }
      },
      {
        key: 'M!',
        regex: '0?[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) {
          var value = date.getMonth();
          if (/^[0-9]$/.test(value)) {
            return dateFilter(date, 'MM');
          }

          return dateFilter(date, 'M');
        }
      },
      {
        key: 'MMMM',
        regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
        apply: function(value) { this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value); },
        formatter: function(date) { return dateFilter(date, 'MMMM'); }
      },
      {
        key: 'MMM',
        regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
        apply: function(value) { this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value); },
        formatter: function(date) { return dateFilter(date, 'MMM'); }
      },
      {
        key: 'MM',
        regex: '0[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) { return dateFilter(date, 'MM'); }
      },
      {
        key: 'M',
        regex: '[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) { return dateFilter(date, 'M'); }
      },
      {
        key: 'd!',
        regex: '[0-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) {
          var value = date.getDate();
          if (/^[1-9]$/.test(value)) {
            return dateFilter(date, 'dd');
          }

          return dateFilter(date, 'd');
        }
      },
      {
        key: 'dd',
        regex: '[0-2][0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) { return dateFilter(date, 'dd'); }
      },
      {
        key: 'd',
        regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) { return dateFilter(date, 'd'); }
      },
      {
        key: 'EEEE',
        regex: $locale.DATETIME_FORMATS.DAY.join('|'),
        formatter: function(date) { return dateFilter(date, 'EEEE'); }
      },
      {
        key: 'EEE',
        regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
        formatter: function(date) { return dateFilter(date, 'EEE'); }
      },
      {
        key: 'HH',
        regex: '(?:0|1)[0-9]|2[0-3]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'HH'); }
      },
      {
        key: 'hh',
        regex: '0[0-9]|1[0-2]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'hh'); }
      },
      {
        key: 'H',
        regex: '1?[0-9]|2[0-3]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'H'); }
      },
      {
        key: 'h',
        regex: '[0-9]|1[0-2]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'h'); }
      },
      {
        key: 'mm',
        regex: '[0-5][0-9]',
        apply: function(value) { this.minutes = +value; },
        formatter: function(date) { return dateFilter(date, 'mm'); }
      },
      {
        key: 'm',
        regex: '[0-9]|[1-5][0-9]',
        apply: function(value) { this.minutes = +value; },
        formatter: function(date) { return dateFilter(date, 'm'); }
      },
      {
        key: 'sss',
        regex: '[0-9][0-9][0-9]',
        apply: function(value) { this.milliseconds = +value; },
        formatter: function(date) { return dateFilter(date, 'sss'); }
      },
      {
        key: 'ss',
        regex: '[0-5][0-9]',
        apply: function(value) { this.seconds = +value; },
        formatter: function(date) { return dateFilter(date, 'ss'); }
      },
      {
        key: 's',
        regex: '[0-9]|[1-5][0-9]',
        apply: function(value) { this.seconds = +value; },
        formatter: function(date) { return dateFilter(date, 's'); }
      },
      {
        key: 'a',
        regex: $locale.DATETIME_FORMATS.AMPMS.join('|'),
        apply: function(value) {
          if (this.hours === 12) {
            this.hours = 0;
          }

          if (value === 'PM') {
            this.hours += 12;
          }
        },
        formatter: function(date) { return dateFilter(date, 'a'); }
      },
      {
        key: 'Z',
        regex: '[+-]\\d{4}',
        apply: function(value) {
          var matches = value.match(/([+-])(\d{2})(\d{2})/),
            sign = matches[1],
            hours = matches[2],
            minutes = matches[3];
          this.hours += toInt(sign + hours);
          this.minutes += toInt(sign + minutes);
        },
        formatter: function(date) {
          return dateFilter(date, 'Z');
        }
      },
      {
        key: 'ww',
        regex: '[0-4][0-9]|5[0-3]',
        formatter: function(date) { return dateFilter(date, 'ww'); }
      },
      {
        key: 'w',
        regex: '[0-9]|[1-4][0-9]|5[0-3]',
        formatter: function(date) { return dateFilter(date, 'w'); }
      },
      {
        key: 'GGGG',
        regex: $locale.DATETIME_FORMATS.ERANAMES.join('|').replace(/\s/g, '\\s'),
        formatter: function(date) { return dateFilter(date, 'GGGG'); }
      },
      {
        key: 'GGG',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'GGG'); }
      },
      {
        key: 'GG',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'GG'); }
      },
      {
        key: 'G',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'G'); }
      }
    ];
  };

  this.init();

  function createParser(format, func) {
    var map = [], regex = format.split('');

    // check for literal values
    var quoteIndex = format.indexOf('\'');
    if (quoteIndex > -1) {
      var inLiteral = false;
      format = format.split('');
      for (var i = quoteIndex; i < format.length; i++) {
        if (inLiteral) {
          if (format[i] === '\'') {
            if (i + 1 < format.length && format[i+1] === '\'') { // escaped single quote
              format[i+1] = '$';
              regex[i+1] = '';
            } else { // end of literal
              regex[i] = '';
              inLiteral = false;
            }
          }
          format[i] = '$';
        } else {
          if (format[i] === '\'') { // start of literal
            format[i] = '$';
            regex[i] = '';
            inLiteral = true;
          }
        }
      }

      format = format.join('');
    }

    angular.forEach(formatCodeToRegex, function(data) {
      var index = format.indexOf(data.key);

      if (index > -1) {
        format = format.split('');

        regex[index] = '(' + data.regex + ')';
        format[index] = '$'; // Custom symbol to define consumed part of format
        for (var i = index + 1, n = index + data.key.length; i < n; i++) {
          regex[i] = '';
          format[i] = '$';
        }
        format = format.join('');

        map.push({
          index: index,
          key: data.key,
          apply: data[func],
          matcher: data.regex
        });
      }
    });

    return {
      regex: new RegExp('^' + regex.join('') + '$'),
      map: orderByFilter(map, 'index')
    };
  }

  this.filter = function(date, format) {
    if (!angular.isDate(date) || isNaN(date) || !format) {
      return '';
    }

    format = $locale.DATETIME_FORMATS[format] || format;

    if ($locale.id !== localeId) {
      this.init();
    }

    if (!this.formatters[format]) {
      this.formatters[format] = createParser(format, 'formatter');
    }

    var parser = this.formatters[format],
      map = parser.map;

    var _format = format;

    return map.reduce(function(str, mapper, i) {
      var match = _format.match(new RegExp('(.*)' + mapper.key));
      if (match && angular.isString(match[1])) {
        str += match[1];
        _format = _format.replace(match[1] + mapper.key, '');
      }

      var endStr = i === map.length - 1 ? _format : '';

      if (mapper.apply) {
        return str + mapper.apply.call(null, date) + endStr;
      }

      return str + endStr;
    }, '');
  };

  this.parse = function(input, format, baseDate) {
    if (!angular.isString(input) || !format) {
      return input;
    }

    format = $locale.DATETIME_FORMATS[format] || format;
    format = format.replace(SPECIAL_CHARACTERS_REGEXP, '\\$&');

    if ($locale.id !== localeId) {
      this.init();
    }

    if (!this.parsers[format]) {
      this.parsers[format] = createParser(format, 'apply');
    }

    var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex),
        tzOffset = false;
    if (results && results.length) {
      var fields, dt;
      if (angular.isDate(baseDate) && !isNaN(baseDate.getTime())) {
        fields = {
          year: baseDate.getFullYear(),
          month: baseDate.getMonth(),
          date: baseDate.getDate(),
          hours: baseDate.getHours(),
          minutes: baseDate.getMinutes(),
          seconds: baseDate.getSeconds(),
          milliseconds: baseDate.getMilliseconds()
        };
      } else {
        if (baseDate) {
          $log.warn('dateparser:', 'baseDate is not a valid date');
        }
        fields = { year: 1900, month: 0, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      for (var i = 1, n = results.length; i < n; i++) {
        var mapper = map[i - 1];
        if (mapper.matcher === 'Z') {
          tzOffset = true;
        }

        if (mapper.apply) {
          mapper.apply.call(fields, results[i]);
        }
      }

      var datesetter = tzOffset ? Date.prototype.setUTCFullYear :
        Date.prototype.setFullYear;
      var timesetter = tzOffset ? Date.prototype.setUTCHours :
        Date.prototype.setHours;

      if (isValid(fields.year, fields.month, fields.date)) {
        if (angular.isDate(baseDate) && !isNaN(baseDate.getTime()) && !tzOffset) {
          dt = new Date(baseDate);
          datesetter.call(dt, fields.year, fields.month, fields.date);
          timesetter.call(dt, fields.hours, fields.minutes,
            fields.seconds, fields.milliseconds);
        } else {
          dt = new Date(0);
          datesetter.call(dt, fields.year, fields.month, fields.date);
          timesetter.call(dt, fields.hours || 0, fields.minutes || 0,
            fields.seconds || 0, fields.milliseconds || 0);
        }
      }

      return dt;
    }
  };

  // Check if date is valid for specific month (and year for February).
  // Month: 0 = Jan, 1 = Feb, etc
  function isValid(year, month, date) {
    if (date < 1) {
      return false;
    }

    if (month === 1 && date > 28) {
      return date === 29 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0);
    }

    if (month === 3 || month === 5 || month === 8 || month === 10) {
      return date < 31;
    }

    return true;
  }

  function toInt(str) {
    return parseInt(str, 10);
  }

  this.toTimezone = toTimezone;
  this.fromTimezone = fromTimezone;
  this.timezoneToOffset = timezoneToOffset;
  this.addDateMinutes = addDateMinutes;
  this.convertTimezoneToLocal = convertTimezoneToLocal;

  function toTimezone(date, timezone) {
    return date && timezone ? convertTimezoneToLocal(date, timezone) : date;
  }

  function fromTimezone(date, timezone) {
    return date && timezone ? convertTimezoneToLocal(date, timezone, true) : date;
  }

  //https://github.com/angular/angular.js/blob/622c42169699ec07fc6daaa19fe6d224e5d2f70e/src/Angular.js#L1207
  function timezoneToOffset(timezone, fallback) {
    timezone = timezone.replace(/:/g, '');
    var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
  }

  function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  function convertTimezoneToLocal(date, timezone, reverse) {
    reverse = reverse ? -1 : 1;
    var dateTimezoneOffset = date.getTimezoneOffset();
    var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
  }
}]);

// Avoiding use of ng-class as it creates a lot of watchers when a class is to be applied to
// at most one element.
angular.module('ui.bootstrap.isClass', [])
.directive('uibIsClass', [
         '$animate',
function ($animate) {
  //                    11111111          22222222
  var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/;
  //                    11111111           22222222
  var IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;

  var dataPerTracked = {};

  return {
    restrict: 'A',
    compile: function(tElement, tAttrs) {
      var linkedScopes = [];
      var instances = [];
      var expToData = {};
      var lastActivated = null;
      var onExpMatches = tAttrs.uibIsClass.match(ON_REGEXP);
      var onExp = onExpMatches[2];
      var expsStr = onExpMatches[1];
      var exps = expsStr.split(',');

      return linkFn;

      function linkFn(scope, element, attrs) {
        linkedScopes.push(scope);
        instances.push({
          scope: scope,
          element: element
        });

        exps.forEach(function(exp, k) {
          addForExp(exp, scope);
        });

        scope.$on('$destroy', removeScope);
      }

      function addForExp(exp, scope) {
        var matches = exp.match(IS_REGEXP);
        var clazz = scope.$eval(matches[1]);
        var compareWithExp = matches[2];
        var data = expToData[exp];
        if (!data) {
          var watchFn = function(compareWithVal) {
            var newActivated = null;
            instances.some(function(instance) {
              var thisVal = instance.scope.$eval(onExp);
              if (thisVal === compareWithVal) {
                newActivated = instance;
                return true;
              }
            });
            if (data.lastActivated !== newActivated) {
              if (data.lastActivated) {
                $animate.removeClass(data.lastActivated.element, clazz);
              }
              if (newActivated) {
                $animate.addClass(newActivated.element, clazz);
              }
              data.lastActivated = newActivated;
            }
          };
          expToData[exp] = data = {
            lastActivated: null,
            scope: scope,
            watchFn: watchFn,
            compareWithExp: compareWithExp,
            watcher: scope.$watch(compareWithExp, watchFn)
          };
        }
        data.watchFn(scope.$eval(compareWithExp));
      }

      function removeScope(e) {
        var removedScope = e.targetScope;
        var index = linkedScopes.indexOf(removedScope);
        linkedScopes.splice(index, 1);
        instances.splice(index, 1);
        if (linkedScopes.length) {
          var newWatchScope = linkedScopes[0];
          angular.forEach(expToData, function(data) {
            if (data.scope === removedScope) {
              data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
              data.scope = newWatchScope;
            }
          });
        } else {
          expToData = {};
        }
      }
    }
  };
}]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.isClass'])

.value('$datepickerSuppressError', false)

.value('$datepickerLiteralWarning', true)

.constant('uibDatepickerConfig', {
  datepickerMode: 'day',
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  maxDate: null,
  maxMode: 'year',
  minDate: null,
  minMode: 'day',
  ngModelOptions: {},
  shortcutPropagation: false,
  showWeeks: true,
  yearColumns: 5,
  yearRows: 4
})

.controller('UibDatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$locale', '$log', 'dateFilter', 'uibDatepickerConfig', '$datepickerLiteralWarning', '$datepickerSuppressError', 'uibDateParser',
  function($scope, $attrs, $parse, $interpolate, $locale, $log, dateFilter, datepickerConfig, $datepickerLiteralWarning, $datepickerSuppressError, dateParser) {
  var self = this,
      ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl;
      ngModelOptions = {},
      watchListeners = [],
      optionsUsed = !!$attrs.datepickerOptions;

  if (!$scope.datepickerOptions) {
    $scope.datepickerOptions = {};
  }

  // Modes chain
  this.modes = ['day', 'month', 'year'];

  [
    'customClass',
    'dateDisabled',
    'datepickerMode',
    'formatDay',
    'formatDayHeader',
    'formatDayTitle',
    'formatMonth',
    'formatMonthTitle',
    'formatYear',
    'maxDate',
    'maxMode',
    'minDate',
    'minMode',
    'showWeeks',
    'shortcutPropagation',
    'startingDay',
    'yearColumns',
    'yearRows'
  ].forEach(function(key) {
    switch (key) {
      case 'customClass':
      case 'dateDisabled':
        $scope[key] = $scope.datepickerOptions[key] || angular.noop;
        break;
      case 'datepickerMode':
        $scope.datepickerMode = angular.isDefined($scope.datepickerOptions.datepickerMode) ?
          $scope.datepickerOptions.datepickerMode : datepickerConfig.datepickerMode;
        break;
      case 'formatDay':
      case 'formatDayHeader':
      case 'formatDayTitle':
      case 'formatMonth':
      case 'formatMonthTitle':
      case 'formatYear':
        self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
          $interpolate($scope.datepickerOptions[key])($scope.$parent) :
          datepickerConfig[key];
        break;
      case 'showWeeks':
      case 'shortcutPropagation':
      case 'yearColumns':
      case 'yearRows':
        self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
          $scope.datepickerOptions[key] : datepickerConfig[key];
        break;
      case 'startingDay':
        if (angular.isDefined($scope.datepickerOptions.startingDay)) {
          self.startingDay = $scope.datepickerOptions.startingDay;
        } else if (angular.isNumber(datepickerConfig.startingDay)) {
          self.startingDay = datepickerConfig.startingDay;
        } else {
          self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
        }

        break;
      case 'maxDate':
      case 'minDate':
        $scope.$watch('datepickerOptions.' + key, function(value) {
          if (value) {
            if (angular.isDate(value)) {
              self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
            } else {
              if ($datepickerLiteralWarning) {
                $log.warn('Literal date support has been deprecated, please switch to date object usage');
              }

              self[key] = new Date(dateFilter(value, 'medium'));
            }
          } else {
            self[key] = datepickerConfig[key] ?
              dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) :
              null;
          }

          self.refreshView();
        });

        break;
      case 'maxMode':
      case 'minMode':
        if ($scope.datepickerOptions[key]) {
          $scope.$watch(function() { return $scope.datepickerOptions[key]; }, function(value) {
            self[key] = $scope[key] = angular.isDefined(value) ? value : datepickerOptions[key];
            if (key === 'minMode' && self.modes.indexOf($scope.datepickerOptions.datepickerMode) < self.modes.indexOf(self[key]) ||
              key === 'maxMode' && self.modes.indexOf($scope.datepickerOptions.datepickerMode) > self.modes.indexOf(self[key])) {
              $scope.datepickerMode = self[key];
              $scope.datepickerOptions.datepickerMode = self[key];
            }
          });
        } else {
          self[key] = $scope[key] = datepickerConfig[key] || null;
        }

        break;
    }
  });

  $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);

  $scope.disabled = angular.isDefined($attrs.disabled) || false;
  if (angular.isDefined($attrs.ngDisabled)) {
    watchListeners.push($scope.$parent.$watch($attrs.ngDisabled, function(disabled) {
      $scope.disabled = disabled;
      self.refreshView();
    }));
  }

  $scope.isActive = function(dateObject) {
    if (self.compare(dateObject.date, self.activeDate) === 0) {
      $scope.activeDateId = dateObject.uid;
      return true;
    }
    return false;
  };

  this.init = function(ngModelCtrl_) {
    ngModelCtrl = ngModelCtrl_;
    ngModelOptions = ngModelCtrl_.$options || datepickerConfig.ngModelOptions;
    if ($scope.datepickerOptions.initDate) {
      self.activeDate = dateParser.fromTimezone($scope.datepickerOptions.initDate, ngModelOptions.timezone) || new Date();
      $scope.$watch('datepickerOptions.initDate', function(initDate) {
        if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
          self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
          self.refreshView();
        }
      });
    } else {
      self.activeDate = new Date();
    }

    var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date();
    this.activeDate = !isNaN(date) ?
      dateParser.fromTimezone(date, ngModelOptions.timezone) :
      dateParser.fromTimezone(new Date(), ngModelOptions.timezone);

    ngModelCtrl.$render = function() {
      self.render();
    };
  };

  this.render = function() {
    if (ngModelCtrl.$viewValue) {
      var date = new Date(ngModelCtrl.$viewValue),
          isValid = !isNaN(date);

      if (isValid) {
        this.activeDate = dateParser.fromTimezone(date, ngModelOptions.timezone);
      } else if (!$datepickerSuppressError) {
        $log.error('Datepicker directive: "ng-model" value must be a Date object');
      }
    }
    this.refreshView();
  };

  this.refreshView = function() {
    if (this.element) {
      $scope.selectedDt = null;
      this._refreshView();
      if ($scope.activeDt) {
        $scope.activeDateId = $scope.activeDt.uid;
      }

      var date = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
      date = dateParser.fromTimezone(date, ngModelOptions.timezone);
      ngModelCtrl.$setValidity('dateDisabled', !date ||
        this.element && !this.isDisabled(date));
    }
  };

  this.createDateObject = function(date, format) {
    var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
    model = dateParser.fromTimezone(model, ngModelOptions.timezone);
    var today = new Date();
    today = dateParser.fromTimezone(today, ngModelOptions.timezone);
    var time = this.compare(date, today);
    var dt = {
      date: date,
      label: dateParser.filter(date, format),
      selected: model && this.compare(date, model) === 0,
      disabled: this.isDisabled(date),
      past: time < 0,
      current: time === 0,
      future: time > 0,
      customClass: this.customClass(date) || null
    };

    if (model && this.compare(date, model) === 0) {
      $scope.selectedDt = dt;
    }

    if (self.activeDate && this.compare(dt.date, self.activeDate) === 0) {
      $scope.activeDt = dt;
    }

    return dt;
  };

  this.isDisabled = function(date) {
    return $scope.disabled ||
      this.minDate && this.compare(date, this.minDate) < 0 ||
      this.maxDate && this.compare(date, this.maxDate) > 0 ||
      $scope.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode});
  };

  this.customClass = function(date) {
    return $scope.customClass({date: date, mode: $scope.datepickerMode});
  };

  // Split array into smaller arrays
  this.split = function(arr, size) {
    var arrays = [];
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  };

  $scope.select = function(date) {
    if ($scope.datepickerMode === self.minMode) {
      var dt = ngModelCtrl.$viewValue ? dateParser.fromTimezone(new Date(ngModelCtrl.$viewValue), ngModelOptions.timezone) : new Date(0, 0, 0, 0, 0, 0, 0);
      dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      dt = dateParser.toTimezone(dt, ngModelOptions.timezone);
      ngModelCtrl.$setViewValue(dt);
      ngModelCtrl.$render();
    } else {
      self.activeDate = date;
      setMode(self.modes[self.modes.indexOf($scope.datepickerMode) - 1]);

      $scope.$emit('uib:datepicker.mode');
    }

    $scope.$broadcast('uib:datepicker.focus');
  };

  $scope.move = function(direction) {
    var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
    self.activeDate.setFullYear(year, month, 1);
    self.refreshView();
  };

  $scope.toggleMode = function(direction) {
    direction = direction || 1;

    if ($scope.datepickerMode === self.maxMode && direction === 1 ||
      $scope.datepickerMode === self.minMode && direction === -1) {
      return;
    }

    setMode(self.modes[self.modes.indexOf($scope.datepickerMode) + direction]);

    $scope.$emit('uib:datepicker.mode');
  };

  // Key event mapper
  $scope.keys = { 13: 'enter', 32: 'space', 33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

  var focusElement = function() {
    self.element[0].focus();
  };

  // Listen for focus requests from popup directive
  $scope.$on('uib:datepicker.focus', focusElement);

  $scope.keydown = function(evt) {
    var key = $scope.keys[evt.which];

    if (!key || evt.shiftKey || evt.altKey || $scope.disabled) {
      return;
    }

    evt.preventDefault();
    if (!self.shortcutPropagation) {
      evt.stopPropagation();
    }

    if (key === 'enter' || key === 'space') {
      if (self.isDisabled(self.activeDate)) {
        return; // do nothing
      }
      $scope.select(self.activeDate);
    } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
      $scope.toggleMode(key === 'up' ? 1 : -1);
    } else {
      self.handleKeyDown(key, evt);
      self.refreshView();
    }
  };

  $scope.$on('$destroy', function() {
    //Clear all watch listeners on destroy
    while (watchListeners.length) {
      watchListeners.shift()();
    }
  });

  function setMode(mode) {
    $scope.datepickerMode = mode;
    $scope.datepickerOptions.datepickerMode = mode;
  }
}])

.controller('UibDaypickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  this.step = { months: 1 };
  this.element = $element;
  function getDaysInMonth(year, month) {
    return month === 1 && year % 4 === 0 &&
      (year % 100 !== 0 || year % 400 === 0) ? 29 : DAYS_IN_MONTH[month];
  }

  this.init = function(ctrl) {
    angular.extend(ctrl, this);
    scope.showWeeks = ctrl.showWeeks;
    ctrl.refreshView();
  };

  this.getDates = function(startDate, n) {
    var dates = new Array(n), current = new Date(startDate), i = 0, date;
    while (i < n) {
      date = new Date(current);
      dates[i++] = date;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  this._refreshView = function() {
    var year = this.activeDate.getFullYear(),
      month = this.activeDate.getMonth(),
      firstDayOfMonth = new Date(this.activeDate);

    firstDayOfMonth.setFullYear(year, month, 1);

    var difference = this.startingDay - firstDayOfMonth.getDay(),
      numDisplayedFromPreviousMonth = difference > 0 ?
        7 - difference : - difference,
      firstDate = new Date(firstDayOfMonth);

    if (numDisplayedFromPreviousMonth > 0) {
      firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
    }

    // 42 is the number of days on a six-week calendar
    var days = this.getDates(firstDate, 42);
    for (var i = 0; i < 42; i ++) {
      days[i] = angular.extend(this.createDateObject(days[i], this.formatDay), {
        secondary: days[i].getMonth() !== month,
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.labels = new Array(7);
    for (var j = 0; j < 7; j++) {
      scope.labels[j] = {
        abbr: dateFilter(days[j].date, this.formatDayHeader),
        full: dateFilter(days[j].date, 'EEEE')
      };
    }

    scope.title = dateFilter(this.activeDate, this.formatDayTitle);
    scope.rows = this.split(days, 7);

    if (scope.showWeeks) {
      scope.weekNumbers = [];
      var thursdayIndex = (4 + 7 - this.startingDay) % 7,
          numWeeks = scope.rows.length;
      for (var curWeek = 0; curWeek < numWeeks; curWeek++) {
        scope.weekNumbers.push(
          getISO8601WeekNumber(scope.rows[curWeek][thursdayIndex].date));
      }
    }
  };

  this.compare = function(date1, date2) {
    var _date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var _date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    _date1.setFullYear(date1.getFullYear());
    _date2.setFullYear(date2.getFullYear());
    return _date1 - _date2;
  };

  function getISO8601WeekNumber(date) {
    var checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
    var time = checkDate.getTime();
    checkDate.setMonth(0); // Compare with Jan 1
    checkDate.setDate(1);
    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
  }

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getDate();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - 7;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + 7;
    } else if (key === 'pageup' || key === 'pagedown') {
      var month = this.activeDate.getMonth() + (key === 'pageup' ? - 1 : 1);
      this.activeDate.setMonth(month, 1);
      date = Math.min(getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth()), date);
    } else if (key === 'home') {
      date = 1;
    } else if (key === 'end') {
      date = getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth());
    }
    this.activeDate.setDate(date);
  };
}])

.controller('UibMonthpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  this.step = { years: 1 };
  this.element = $element;

  this.init = function(ctrl) {
    angular.extend(ctrl, this);
    ctrl.refreshView();
  };

  this._refreshView = function() {
    var months = new Array(12),
        year = this.activeDate.getFullYear(),
        date;

    for (var i = 0; i < 12; i++) {
      date = new Date(this.activeDate);
      date.setFullYear(year, i, 1);
      months[i] = angular.extend(this.createDateObject(date, this.formatMonth), {
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.title = dateFilter(this.activeDate, this.formatMonthTitle);
    scope.rows = this.split(months, 3);
  };

  this.compare = function(date1, date2) {
    var _date1 = new Date(date1.getFullYear(), date1.getMonth());
    var _date2 = new Date(date2.getFullYear(), date2.getMonth());
    _date1.setFullYear(date1.getFullYear());
    _date2.setFullYear(date2.getFullYear());
    return _date1 - _date2;
  };

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getMonth();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - 3;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + 3;
    } else if (key === 'pageup' || key === 'pagedown') {
      var year = this.activeDate.getFullYear() + (key === 'pageup' ? - 1 : 1);
      this.activeDate.setFullYear(year);
    } else if (key === 'home') {
      date = 0;
    } else if (key === 'end') {
      date = 11;
    }
    this.activeDate.setMonth(date);
  };
}])

.controller('UibYearpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  var columns, range;
  this.element = $element;

  function getStartingYear(year) {
    return parseInt((year - 1) / range, 10) * range + 1;
  }

  this.yearpickerInit = function() {
    columns = this.yearColumns;
    range = this.yearRows * columns;
    this.step = { years: range };
  };

  this._refreshView = function() {
    var years = new Array(range), date;

    for (var i = 0, start = getStartingYear(this.activeDate.getFullYear()); i < range; i++) {
      date = new Date(this.activeDate);
      date.setFullYear(start + i, 0, 1);
      years[i] = angular.extend(this.createDateObject(date, this.formatYear), {
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.title = [years[0].label, years[range - 1].label].join(' - ');
    scope.rows = this.split(years, columns);
    scope.columns = columns;
  };

  this.compare = function(date1, date2) {
    return date1.getFullYear() - date2.getFullYear();
  };

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getFullYear();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - columns;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + columns;
    } else if (key === 'pageup' || key === 'pagedown') {
      date += (key === 'pageup' ? - 1 : 1) * range;
    } else if (key === 'home') {
      date = getStartingYear(this.activeDate.getFullYear());
    } else if (key === 'end') {
      date = getStartingYear(this.activeDate.getFullYear()) + range - 1;
    }
    this.activeDate.setFullYear(date);
  };
}])

.directive('uibDatepicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/datepicker.html';
    },
    scope: {
      datepickerOptions: '=?'
    },
    require: ['uibDatepicker', '^ngModel'],
    controller: 'UibDatepickerController',
    controllerAs: 'datepicker',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      datepickerCtrl.init(ngModelCtrl);
    }
  };
})

.directive('uibDaypicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/day.html';
    },
    require: ['^uibDatepicker', 'uibDaypicker'],
    controller: 'UibDaypickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0],
        daypickerCtrl = ctrls[1];

      daypickerCtrl.init(datepickerCtrl);
    }
  };
})

.directive('uibMonthpicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/month.html';
    },
    require: ['^uibDatepicker', 'uibMonthpicker'],
    controller: 'UibMonthpickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0],
        monthpickerCtrl = ctrls[1];

      monthpickerCtrl.init(datepickerCtrl);
    }
  };
})

.directive('uibYearpicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/year.html';
    },
    require: ['^uibDatepicker', 'uibYearpicker'],
    controller: 'UibYearpickerController',
    link: function(scope, element, attrs, ctrls) {
      var ctrl = ctrls[0];
      angular.extend(ctrl, ctrls[1]);
      ctrl.yearpickerInit();

      ctrl.refreshView();
    }
  };
});

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods for working with the DOM.
 * It is meant to be used where we need to absolute-position elements in
 * relation to another element (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$uibPosition', ['$document', '$window', function($document, $window) {
    /**
     * Used by scrollbarWidth() function to cache scrollbar's width.
     * Do not access this variable directly, use scrollbarWidth() instead.
     */
    var SCROLLBAR_WIDTH;
    /**
     * scrollbar on body and html element in IE and Edge overlay
     * content and should be considered 0 width.
     */
    var BODY_SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
      normal: /(auto|scroll)/,
      hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
      auto: /\s?auto?\s?/i,
      primary: /^(top|bottom|left|right)$/,
      secondary: /^(top|bottom|left|right|center)$/,
      vertical: /^(top|bottom)$/
    };
    var BODY_REGEX = /(HTML|BODY)/;

    return {

      /**
       * Provides a raw DOM element from a jQuery/jQLite element.
       *
       * @param {element} elem - The element to convert.
       *
       * @returns {element} A HTML element.
       */
      getRawNode: function(elem) {
        return elem.nodeName ? elem : elem[0] || elem;
      },

      /**
       * Provides a parsed number for a style property.  Strips
       * units and casts invalid numbers to 0.
       *
       * @param {string} value - The style value to parse.
       *
       * @returns {number} A valid number.
       */
      parseStyle: function(value) {
        value = parseFloat(value);
        return isFinite(value) ? value : 0;
      },

      /**
       * Provides the closest positioned ancestor.
       *
       * @param {element} element - The element to get the offest parent for.
       *
       * @returns {element} The closest positioned ancestor.
       */
      offsetParent: function(elem) {
        elem = this.getRawNode(elem);

        var offsetParent = elem.offsetParent || $document[0].documentElement;

        function isStaticPositioned(el) {
          return ($window.getComputedStyle(el).position || 'static') === 'static';
        }

        while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent || $document[0].documentElement;
      },

      /**
       * Provides the scrollbar width, concept from TWBS measureScrollbar()
       * function in https://github.com/twbs/bootstrap/blob/master/js/modal.js
       * In IE and Edge, scollbar on body and html element overlay and should
       * return a width of 0.
       *
       * @returns {number} The width of the browser scollbar.
       */
      scrollbarWidth: function(isBody) {
        if (isBody) {
          if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
            var bodyElem = $document.find('body');
            bodyElem.addClass('uib-position-body-scrollbar-measure');
            BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
            BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
            bodyElem.removeClass('uib-position-body-scrollbar-measure');
          }
          return BODY_SCROLLBAR_WIDTH;
        }

        if (angular.isUndefined(SCROLLBAR_WIDTH)) {
          var scrollElem = angular.element('<div class="uib-position-scrollbar-measure"></div>');
          $document.find('body').append(scrollElem);
          SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
          SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
          scrollElem.remove();
        }

        return SCROLLBAR_WIDTH;
      },

      /**
       * Provides the padding required on an element to replace the scrollbar.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**scrollbarWidth**: the width of the scrollbar</li>
       *     <li>**widthOverflow**: whether the the width is overflowing</li>
       *     <li>**right**: the amount of right padding on the element needed to replace the scrollbar</li>
       *     <li>**rightOriginal**: the amount of right padding currently on the element</li>
       *     <li>**heightOverflow**: whether the the height is overflowing</li>
       *     <li>**bottom**: the amount of bottom padding on the element needed to replace the scrollbar</li>
       *     <li>**bottomOriginal**: the amount of bottom padding currently on the element</li>
       *   </ul>
       */
      scrollbarPadding: function(elem) {
        elem = this.getRawNode(elem);

        var elemStyle = $window.getComputedStyle(elem);
        var paddingRight = this.parseStyle(elemStyle.paddingRight);
        var paddingBottom = this.parseStyle(elemStyle.paddingBottom);
        var scrollParent = this.scrollParent(elem, false, true);
        var scrollbarWidth = this.scrollbarWidth(scrollParent, BODY_REGEX.test(scrollParent.tagName));

        return {
          scrollbarWidth: scrollbarWidth,
          widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
          right: paddingRight + scrollbarWidth,
          originalRight: paddingRight,
          heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
          bottom: paddingBottom + scrollbarWidth,
          originalBottom: paddingBottom
         };
      },

      /**
       * Checks to see if the element is scrollable.
       *
       * @param {element} elem - The element to check.
       * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
       *   default is false.
       *
       * @returns {boolean} Whether the element is scrollable.
       */
      isScrollable: function(elem, includeHidden) {
        elem = this.getRawNode(elem);

        var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
        var elemStyle = $window.getComputedStyle(elem);
        return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
      },

      /**
       * Provides the closest scrollable ancestor.
       * A port of the jQuery UI scrollParent method:
       * https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
       *
       * @param {element} elem - The element to find the scroll parent of.
       * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
       *   default is false.
       * @param {boolean=} [includeSelf=false] - Should the element being passed be
       * included in the scrollable llokup.
       *
       * @returns {element} A HTML element.
       */
      scrollParent: function(elem, includeHidden, includeSelf) {
        elem = this.getRawNode(elem);

        var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
        var documentEl = $document[0].documentElement;
        var elemStyle = $window.getComputedStyle(elem);
        if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
          return elem;
        }
        var excludeStatic = elemStyle.position === 'absolute';
        var scrollParent = elem.parentElement || documentEl;

        if (scrollParent === documentEl || elemStyle.position === 'fixed') {
          return documentEl;
        }

        while (scrollParent.parentElement && scrollParent !== documentEl) {
          var spStyle = $window.getComputedStyle(scrollParent);
          if (excludeStatic && spStyle.position !== 'static') {
            excludeStatic = false;
          }

          if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
            break;
          }
          scrollParent = scrollParent.parentElement;
        }

        return scrollParent;
      },

      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/ - distance to closest positioned
       * ancestor.  Does not account for margins by default like jQuery position.
       *
       * @param {element} elem - The element to caclulate the position on.
       * @param {boolean=} [includeMargins=false] - Should margins be accounted
       * for, default is false.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**width**: the width of the element</li>
       *     <li>**height**: the height of the element</li>
       *     <li>**top**: distance to top edge of offset parent</li>
       *     <li>**left**: distance to left edge of offset parent</li>
       *   </ul>
       */
      position: function(elem, includeMagins) {
        elem = this.getRawNode(elem);

        var elemOffset = this.offset(elem);
        if (includeMagins) {
          var elemStyle = $window.getComputedStyle(elem);
          elemOffset.top -= this.parseStyle(elemStyle.marginTop);
          elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
        }
        var parent = this.offsetParent(elem);
        var parentOffset = {top: 0, left: 0};

        if (parent !== $document[0].documentElement) {
          parentOffset = this.offset(parent);
          parentOffset.top += parent.clientTop - parent.scrollTop;
          parentOffset.left += parent.clientLeft - parent.scrollLeft;
        }

        return {
          width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
          height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
          top: Math.round(elemOffset.top - parentOffset.top),
          left: Math.round(elemOffset.left - parentOffset.left)
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/ - distance to viewport.  Does
       * not account for borders, margins, or padding on the body
       * element.
       *
       * @param {element} elem - The element to calculate the offset on.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**width**: the width of the element</li>
       *     <li>**height**: the height of the element</li>
       *     <li>**top**: distance to top edge of viewport</li>
       *     <li>**right**: distance to bottom edge of viewport</li>
       *   </ul>
       */
      offset: function(elem) {
        elem = this.getRawNode(elem);

        var elemBCR = elem.getBoundingClientRect();
        return {
          width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
          height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
          top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
          left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
        };
      },

      /**
       * Provides offset distance to the closest scrollable ancestor
       * or viewport.  Accounts for border and scrollbar width.
       *
       * Right and bottom dimensions represent the distance to the
       * respective edge of the viewport element.  If the element
       * edge extends beyond the viewport, a negative value will be
       * reported.
       *
       * @param {element} elem - The element to get the viewport offset for.
       * @param {boolean=} [useDocument=false] - Should the viewport be the document element instead
       * of the first scrollable element, default is false.
       * @param {boolean=} [includePadding=true] - Should the padding on the offset parent element
       * be accounted for, default is true.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**top**: distance to the top content edge of viewport element</li>
       *     <li>**bottom**: distance to the bottom content edge of viewport element</li>
       *     <li>**left**: distance to the left content edge of viewport element</li>
       *     <li>**right**: distance to the right content edge of viewport element</li>
       *   </ul>
       */
      viewportOffset: function(elem, useDocument, includePadding) {
        elem = this.getRawNode(elem);
        includePadding = includePadding !== false ? true : false;

        var elemBCR = elem.getBoundingClientRect();
        var offsetBCR = {top: 0, left: 0, bottom: 0, right: 0};

        var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
        var offsetParentBCR = offsetParent.getBoundingClientRect();

        offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
        offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
        if (offsetParent === $document[0].documentElement) {
          offsetBCR.top += $window.pageYOffset;
          offsetBCR.left += $window.pageXOffset;
        }
        offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
        offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

        if (includePadding) {
          var offsetParentStyle = $window.getComputedStyle(offsetParent);
          offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
          offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
          offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
          offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
        }

        return {
          top: Math.round(elemBCR.top - offsetBCR.top),
          bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
          left: Math.round(elemBCR.left - offsetBCR.left),
          right: Math.round(offsetBCR.right - elemBCR.right)
        };
      },

      /**
       * Provides an array of placement values parsed from a placement string.
       * Along with the 'auto' indicator, supported placement strings are:
       *   <ul>
       *     <li>top: element on top, horizontally centered on host element.</li>
       *     <li>top-left: element on top, left edge aligned with host element left edge.</li>
       *     <li>top-right: element on top, lerightft edge aligned with host element right edge.</li>
       *     <li>bottom: element on bottom, horizontally centered on host element.</li>
       *     <li>bottom-left: element on bottom, left edge aligned with host element left edge.</li>
       *     <li>bottom-right: element on bottom, right edge aligned with host element right edge.</li>
       *     <li>left: element on left, vertically centered on host element.</li>
       *     <li>left-top: element on left, top edge aligned with host element top edge.</li>
       *     <li>left-bottom: element on left, bottom edge aligned with host element bottom edge.</li>
       *     <li>right: element on right, vertically centered on host element.</li>
       *     <li>right-top: element on right, top edge aligned with host element top edge.</li>
       *     <li>right-bottom: element on right, bottom edge aligned with host element bottom edge.</li>
       *   </ul>
       * A placement string with an 'auto' indicator is expected to be
       * space separated from the placement, i.e: 'auto bottom-left'  If
       * the primary and secondary placement values do not match 'top,
       * bottom, left, right' then 'top' will be the primary placement and
       * 'center' will be the secondary placement.  If 'auto' is passed, true
       * will be returned as the 3rd value of the array.
       *
       * @param {string} placement - The placement string to parse.
       *
       * @returns {array} An array with the following values
       * <ul>
       *   <li>**[0]**: The primary placement.</li>
       *   <li>**[1]**: The secondary placement.</li>
       *   <li>**[2]**: If auto is passed: true, else undefined.</li>
       * </ul>
       */
      parsePlacement: function(placement) {
        var autoPlace = PLACEMENT_REGEX.auto.test(placement);
        if (autoPlace) {
          placement = placement.replace(PLACEMENT_REGEX.auto, '');
        }

        placement = placement.split('-');

        placement[0] = placement[0] || 'top';
        if (!PLACEMENT_REGEX.primary.test(placement[0])) {
          placement[0] = 'top';
        }

        placement[1] = placement[1] || 'center';
        if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
          placement[1] = 'center';
        }

        if (autoPlace) {
          placement[2] = true;
        } else {
          placement[2] = false;
        }

        return placement;
      },

      /**
       * Provides coordinates for an element to be positioned relative to
       * another element.  Passing 'auto' as part of the placement parameter
       * will enable smart placement - where the element fits. i.e:
       * 'auto left-top' will check to see if there is enough space to the left
       * of the hostElem to fit the targetElem, if not place right (same for secondary
       * top placement).  Available space is calculated using the viewportOffset
       * function.
       *
       * @param {element} hostElem - The element to position against.
       * @param {element} targetElem - The element to position.
       * @param {string=} [placement=top] - The placement for the targetElem,
       *   default is 'top'. 'center' is assumed as secondary placement for
       *   'top', 'left', 'right', and 'bottom' placements.  Available placements are:
       *   <ul>
       *     <li>top</li>
       *     <li>top-right</li>
       *     <li>top-left</li>
       *     <li>bottom</li>
       *     <li>bottom-left</li>
       *     <li>bottom-right</li>
       *     <li>left</li>
       *     <li>left-top</li>
       *     <li>left-bottom</li>
       *     <li>right</li>
       *     <li>right-top</li>
       *     <li>right-bottom</li>
       *   </ul>
       * @param {boolean=} [appendToBody=false] - Should the top and left values returned
       *   be calculated from the body element, default is false.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**top**: Value for targetElem top.</li>
       *     <li>**left**: Value for targetElem left.</li>
       *     <li>**placement**: The resolved placement.</li>
       *   </ul>
       */
      positionElements: function(hostElem, targetElem, placement, appendToBody) {
        hostElem = this.getRawNode(hostElem);
        targetElem = this.getRawNode(targetElem);

        // need to read from prop to support tests.
        var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
        var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

        placement = this.parsePlacement(placement);

        var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
        var targetElemPos = {top: 0, left: 0, placement: ''};

        if (placement[2]) {
          var viewportOffset = this.viewportOffset(hostElem, appendToBody);

          var targetElemStyle = $window.getComputedStyle(targetElem);
          var adjustedSize = {
            width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
            height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
          };

          placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                         placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                         placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                         placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                         placement[0];

          placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                         placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                         placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                         placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                         placement[1];

          if (placement[1] === 'center') {
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
              var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
              if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                placement[1] = 'left';
              } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                placement[1] = 'right';
              }
            } else {
              var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
              if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                placement[1] = 'top';
              } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                placement[1] = 'bottom';
              }
            }
          }
        }

        switch (placement[0]) {
          case 'top':
            targetElemPos.top = hostElemPos.top - targetHeight;
            break;
          case 'bottom':
            targetElemPos.top = hostElemPos.top + hostElemPos.height;
            break;
          case 'left':
            targetElemPos.left = hostElemPos.left - targetWidth;
            break;
          case 'right':
            targetElemPos.left = hostElemPos.left + hostElemPos.width;
            break;
        }

        switch (placement[1]) {
          case 'top':
            targetElemPos.top = hostElemPos.top;
            break;
          case 'bottom':
            targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
            break;
          case 'left':
            targetElemPos.left = hostElemPos.left;
            break;
          case 'right':
            targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
            break;
          case 'center':
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
              targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
            } else {
              targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
            }
            break;
        }

        targetElemPos.top = Math.round(targetElemPos.top);
        targetElemPos.left = Math.round(targetElemPos.left);
        targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

        return targetElemPos;
      },

      /**
      * Provides a way for positioning tooltip & dropdown
      * arrows when using placement options beyond the standard
      * left, right, top, or bottom.
      *
      * @param {element} elem - The tooltip/dropdown element.
      * @param {string} placement - The placement for the elem.
      */
      positionArrow: function(elem, placement) {
        elem = this.getRawNode(elem);

        var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
        if (!innerElem) {
          return;
        }

        var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

        var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
        if (!arrowElem) {
          return;
        }

        var arrowCss = {
          top: '',
          bottom: '',
          left: '',
          right: ''
        };

        placement = this.parsePlacement(placement);
        if (placement[1] === 'center') {
          // no adjustment necessary - just reset styles
          angular.element(arrowElem).css(arrowCss);
          return;
        }

        var borderProp = 'border-' + placement[0] + '-width';
        var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

        var borderRadiusProp = 'border-';
        if (PLACEMENT_REGEX.vertical.test(placement[0])) {
          borderRadiusProp += placement[0] + '-' + placement[1];
        } else {
          borderRadiusProp += placement[1] + '-' + placement[0];
        }
        borderRadiusProp += '-radius';
        var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

        switch (placement[0]) {
          case 'top':
            arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'bottom':
            arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'left':
            arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'right':
            arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
            break;
        }

        arrowCss[placement[1]] = borderRadius;

        angular.element(arrowElem).css(arrowCss);
      }
    };
  }]);

angular.module('ui.bootstrap.datepickerPopup', ['ui.bootstrap.datepicker', 'ui.bootstrap.position'])

.value('$datepickerPopupLiteralWarning', true)

.constant('uibDatepickerPopupConfig', {
  altInputFormats: [],
  appendToBody: false,
  clearText: 'Clear',
  closeOnDateSelection: true,
  closeText: 'Done',
  currentText: 'Today',
  datepickerPopup: 'yyyy-MM-dd',
  datepickerPopupTemplateUrl: 'uib/template/datepickerPopup/popup.html',
  datepickerTemplateUrl: 'uib/template/datepicker/datepicker.html',
  html5Types: {
    date: 'yyyy-MM-dd',
    'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
    'month': 'yyyy-MM'
  },
  onOpenFocus: true,
  showButtonBar: true,
  placement: 'auto bottom-left'
})

.controller('UibDatepickerPopupController', ['$scope', '$element', '$attrs', '$compile', '$log', '$parse', '$window', '$document', '$rootScope', '$uibPosition', 'dateFilter', 'uibDateParser', 'uibDatepickerPopupConfig', '$timeout', 'uibDatepickerConfig', '$datepickerPopupLiteralWarning',
function($scope, $element, $attrs, $compile, $log, $parse, $window, $document, $rootScope, $position, dateFilter, dateParser, datepickerPopupConfig, $timeout, datepickerConfig, $datepickerPopupLiteralWarning) {
  var cache = {},
    isHtml5DateInput = false;
  var dateFormat, closeOnDateSelection, appendToBody, onOpenFocus,
    datepickerPopupTemplateUrl, datepickerTemplateUrl, popupEl, datepickerEl, scrollParentEl,
    ngModel, ngModelOptions, $popup, altInputFormats, watchListeners = [],
    timezone;

  this.init = function(_ngModel_) {
    ngModel = _ngModel_;
    ngModelOptions = _ngModel_.$options;
    closeOnDateSelection = angular.isDefined($attrs.closeOnDateSelection) ?
      $scope.$parent.$eval($attrs.closeOnDateSelection) :
      datepickerPopupConfig.closeOnDateSelection;
    appendToBody = angular.isDefined($attrs.datepickerAppendToBody) ?
      $scope.$parent.$eval($attrs.datepickerAppendToBody) :
      datepickerPopupConfig.appendToBody;
    onOpenFocus = angular.isDefined($attrs.onOpenFocus) ?
      $scope.$parent.$eval($attrs.onOpenFocus) : datepickerPopupConfig.onOpenFocus;
    datepickerPopupTemplateUrl = angular.isDefined($attrs.datepickerPopupTemplateUrl) ?
      $attrs.datepickerPopupTemplateUrl :
      datepickerPopupConfig.datepickerPopupTemplateUrl;
    datepickerTemplateUrl = angular.isDefined($attrs.datepickerTemplateUrl) ?
      $attrs.datepickerTemplateUrl : datepickerPopupConfig.datepickerTemplateUrl;
    altInputFormats = angular.isDefined($attrs.altInputFormats) ?
      $scope.$parent.$eval($attrs.altInputFormats) :
      datepickerPopupConfig.altInputFormats;

    $scope.showButtonBar = angular.isDefined($attrs.showButtonBar) ?
      $scope.$parent.$eval($attrs.showButtonBar) :
      datepickerPopupConfig.showButtonBar;

    if (datepickerPopupConfig.html5Types[$attrs.type]) {
      dateFormat = datepickerPopupConfig.html5Types[$attrs.type];
      isHtml5DateInput = true;
    } else {
      dateFormat = $attrs.uibDatepickerPopup || datepickerPopupConfig.datepickerPopup;
      $attrs.$observe('uibDatepickerPopup', function(value, oldValue) {
        var newDateFormat = value || datepickerPopupConfig.datepickerPopup;
        // Invalidate the $modelValue to ensure that formatters re-run
        // FIXME: Refactor when PR is merged: https://github.com/angular/angular.js/pull/10764
        if (newDateFormat !== dateFormat) {
          dateFormat = newDateFormat;
          ngModel.$modelValue = null;

          if (!dateFormat) {
            throw new Error('uibDatepickerPopup must have a date format specified.');
          }
        }
      });
    }

    if (!dateFormat) {
      throw new Error('uibDatepickerPopup must have a date format specified.');
    }

    if (isHtml5DateInput && $attrs.uibDatepickerPopup) {
      throw new Error('HTML5 date input types do not support custom formats.');
    }

    // popup element used to display calendar
    popupEl = angular.element('<div uib-datepicker-popup-wrap><div uib-datepicker></div></div>');
    if (ngModelOptions) {
      timezone = ngModelOptions.timezone;
      $scope.ngModelOptions = angular.copy(ngModelOptions);
      $scope.ngModelOptions.timezone = null;
      if ($scope.ngModelOptions.updateOnDefault === true) {
        $scope.ngModelOptions.updateOn = $scope.ngModelOptions.updateOn ?
          $scope.ngModelOptions.updateOn + ' default' : 'default';
      }

      popupEl.attr('ng-model-options', 'ngModelOptions');
    } else {
      timezone = null;
    }

    popupEl.attr({
      'ng-model': 'date',
      'ng-change': 'dateSelection(date)',
      'template-url': datepickerPopupTemplateUrl
    });

    // datepicker element
    datepickerEl = angular.element(popupEl.children()[0]);
    datepickerEl.attr('template-url', datepickerTemplateUrl);

    if (!$scope.datepickerOptions) {
      $scope.datepickerOptions = {};
    }

    if (isHtml5DateInput) {
      if ($attrs.type === 'month') {
        $scope.datepickerOptions.datepickerMode = 'month';
        $scope.datepickerOptions.minMode = 'month';
      }
    }

    datepickerEl.attr('datepicker-options', 'datepickerOptions');

    if (!isHtml5DateInput) {
      // Internal API to maintain the correct ng-invalid-[key] class
      ngModel.$$parserName = 'date';
      ngModel.$validators.date = validator;
      ngModel.$parsers.unshift(parseDate);
      ngModel.$formatters.push(function(value) {
        if (ngModel.$isEmpty(value)) {
          $scope.date = value;
          return value;
        }

        if (angular.isNumber(value)) {
          value = new Date(value);
        }

        $scope.date = dateParser.fromTimezone(value, timezone);

        return dateParser.filter($scope.date, dateFormat);
      });
    } else {
      ngModel.$formatters.push(function(value) {
        $scope.date = dateParser.fromTimezone(value, timezone);
        return value;
      });
    }

    // Detect changes in the view from the text box
    ngModel.$viewChangeListeners.push(function() {
      $scope.date = parseDateString(ngModel.$viewValue);
    });

    $element.on('keydown', inputKeydownBind);

    $popup = $compile(popupEl)($scope);
    // Prevent jQuery cache memory leak (template is now redundant after linking)
    popupEl.remove();

    if (appendToBody) {
      $document.find('body').append($popup);
    } else {
      $element.after($popup);
    }

    $scope.$on('$destroy', function() {
      if ($scope.isOpen === true) {
        if (!$rootScope.$$phase) {
          $scope.$apply(function() {
            $scope.isOpen = false;
          });
        }
      }

      $popup.remove();
      $element.off('keydown', inputKeydownBind);
      $document.off('click', documentClickBind);
      if (scrollParentEl) {
        scrollParentEl.off('scroll', positionPopup);
      }
      angular.element($window).off('resize', positionPopup);

      //Clear all watch listeners on destroy
      while (watchListeners.length) {
        watchListeners.shift()();
      }
    });
  };

  $scope.getText = function(key) {
    return $scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
  };

  $scope.isDisabled = function(date) {
    if (date === 'today') {
      date = dateParser.fromTimezone(new Date(), timezone);
    }

    var dates = {};
    angular.forEach(['minDate', 'maxDate'], function(key) {
      if (!$scope.datepickerOptions[key]) {
        dates[key] = null;
      } else if (angular.isDate($scope.datepickerOptions[key])) {
        dates[key] = dateParser.fromTimezone(new Date($scope.datepickerOptions[key]), timezone);
      } else {
        if ($datepickerPopupLiteralWarning) {
          $log.warn('Literal date support has been deprecated, please switch to date object usage');
        }

        dates[key] = new Date(dateFilter($scope.datepickerOptions[key], 'medium'));
      }
    });

    return $scope.datepickerOptions &&
      dates.minDate && $scope.compare(date, dates.minDate) < 0 ||
      dates.maxDate && $scope.compare(date, dates.maxDate) > 0;
  };

  $scope.compare = function(date1, date2) {
    return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  };

  // Inner change
  $scope.dateSelection = function(dt) {
    if (angular.isDefined(dt)) {
      $scope.date = dt;
    }
    var date = $scope.date ? dateParser.filter($scope.date, dateFormat) : null; // Setting to NULL is necessary for form validators to function
    $element.val(date);
    ngModel.$setViewValue(date);

    if (closeOnDateSelection) {
      $scope.isOpen = false;
      $element[0].focus();
    }
  };

  $scope.keydown = function(evt) {
    if (evt.which === 27) {
      evt.stopPropagation();
      $scope.isOpen = false;
      $element[0].focus();
    }
  };

  $scope.select = function(date, evt) {
    evt.stopPropagation();

    if (date === 'today') {
      var today = new Date();
      if (angular.isDate($scope.date)) {
        date = new Date($scope.date);
        date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      } else {
        date = new Date(today.setHours(0, 0, 0, 0));
      }
    }
    $scope.dateSelection(date);
  };

  $scope.close = function(evt) {
    evt.stopPropagation();

    $scope.isOpen = false;
    $element[0].focus();
  };

  $scope.disabled = angular.isDefined($attrs.disabled) || false;
  if ($attrs.ngDisabled) {
    watchListeners.push($scope.$parent.$watch($parse($attrs.ngDisabled), function(disabled) {
      $scope.disabled = disabled;
    }));
  }

  $scope.$watch('isOpen', function(value) {
    if (value) {
      if (!$scope.disabled) {
        $timeout(function() {
          positionPopup();

          if (onOpenFocus) {
            $scope.$broadcast('uib:datepicker.focus');
          }

          $document.on('click', documentClickBind);

          var placement = $attrs.popupPlacement ? $attrs.popupPlacement : datepickerPopupConfig.placement;
          if (appendToBody || $position.parsePlacement(placement)[2]) {
            scrollParentEl = scrollParentEl || angular.element($position.scrollParent($element));
            if (scrollParentEl) {
              scrollParentEl.on('scroll', positionPopup);
            }
          } else {
            scrollParentEl = null;
          }

          angular.element($window).on('resize', positionPopup);
        }, 0, false);
      } else {
        $scope.isOpen = false;
      }
    } else {
      $document.off('click', documentClickBind);
      if (scrollParentEl) {
        scrollParentEl.off('scroll', positionPopup);
      }
      angular.element($window).off('resize', positionPopup);
    }
  });

  function cameltoDash(string) {
    return string.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
  }

  function parseDateString(viewValue) {
    var date = dateParser.parse(viewValue, dateFormat, $scope.date);
    if (isNaN(date)) {
      for (var i = 0; i < altInputFormats.length; i++) {
        date = dateParser.parse(viewValue, altInputFormats[i], $scope.date);
        if (!isNaN(date)) {
          return date;
        }
      }
    }
    return date;
  }

  function parseDate(viewValue) {
    if (angular.isNumber(viewValue)) {
      // presumably timestamp to date object
      viewValue = new Date(viewValue);
    }

    if (!viewValue) {
      return null;
    }

    if (angular.isDate(viewValue) && !isNaN(viewValue)) {
      return viewValue;
    }

    if (angular.isString(viewValue)) {
      var date = parseDateString(viewValue);
      if (!isNaN(date)) {
        return dateParser.toTimezone(date, timezone);
      }
    }

    return ngModel.$options && ngModel.$options.allowInvalid ? viewValue : undefined;
  }

  function validator(modelValue, viewValue) {
    var value = modelValue || viewValue;

    if (!$attrs.ngRequired && !value) {
      return true;
    }

    if (angular.isNumber(value)) {
      value = new Date(value);
    }

    if (!value) {
      return true;
    }

    if (angular.isDate(value) && !isNaN(value)) {
      return true;
    }

    if (angular.isString(value)) {
      return !isNaN(parseDateString(viewValue));
    }

    return false;
  }

  function documentClickBind(event) {
    if (!$scope.isOpen && $scope.disabled) {
      return;
    }

    var popup = $popup[0];
    var dpContainsTarget = $element[0].contains(event.target);
    // The popup node may not be an element node
    // In some browsers (IE) only element nodes have the 'contains' function
    var popupContainsTarget = popup.contains !== undefined && popup.contains(event.target);
    if ($scope.isOpen && !(dpContainsTarget || popupContainsTarget)) {
      $scope.$apply(function() {
        $scope.isOpen = false;
      });
    }
  }

  function inputKeydownBind(evt) {
    if (evt.which === 27 && $scope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.$apply(function() {
        $scope.isOpen = false;
      });
      $element[0].focus();
    } else if (evt.which === 40 && !$scope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.$apply(function() {
        $scope.isOpen = true;
      });
    }
  }

  function positionPopup() {
    if ($scope.isOpen) {
      var dpElement = angular.element($popup[0].querySelector('.uib-datepicker-popup'));
      var placement = $attrs.popupPlacement ? $attrs.popupPlacement : datepickerPopupConfig.placement;
      var position = $position.positionElements($element, dpElement, placement, appendToBody);
      dpElement.css({top: position.top + 'px', left: position.left + 'px'});
      if (dpElement.hasClass('uib-position-measure')) {
        dpElement.removeClass('uib-position-measure');
      }
    }
  }

  $scope.$on('uib:datepicker.mode', function() {
    $timeout(positionPopup, 0, false);
  });
}])

.directive('uibDatepickerPopup', function() {
  return {
    require: ['ngModel', 'uibDatepickerPopup'],
    controller: 'UibDatepickerPopupController',
    scope: {
      datepickerOptions: '=?',
      isOpen: '=?',
      currentText: '@',
      clearText: '@',
      closeText: '@'
    },
    link: function(scope, element, attrs, ctrls) {
      var ngModel = ctrls[0],
        ctrl = ctrls[1];

      ctrl.init(ngModel);
    }
  };
})

.directive('uibDatepickerPopupWrap', function() {
  return {
    replace: true,
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepickerPopup/popup.html';
    }
  };
});

angular.module('ui.bootstrap.debounce', [])
/**
 * A helper, internal service that debounces a function
 */
  .factory('$$debounce', ['$timeout', function($timeout) {
    return function(callback, debounceTime) {
      var timeoutPromise;

      return function() {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }

        timeoutPromise = $timeout(function() {
          callback.apply(self, args);
        }, debounceTime);
      };
    };
  }]);

angular.module('ui.bootstrap.dropdown', ['ui.bootstrap.position'])

.constant('uibDropdownConfig', {
  appendToOpenClass: 'uib-dropdown-open',
  openClass: 'open'
})

.service('uibDropdownService', ['$document', '$rootScope', function($document, $rootScope) {
  var openScope = null;

  this.open = function(dropdownScope, element) {
    if (!openScope) {
      $document.on('click', closeDropdown);
      element.on('keydown', keybindFilter);
    }

    if (openScope && openScope !== dropdownScope) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function(dropdownScope, element) {
    if (openScope === dropdownScope) {
      openScope = null;
      $document.off('click', closeDropdown);
      element.off('keydown', keybindFilter);
    }
  };

  var closeDropdown = function(evt) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    if (evt && openScope.getAutoClose() === 'disabled') { return; }

    if (evt && evt.which === 3) { return; }

    var toggleElement = openScope.getToggleElement();
    if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
      return;
    }

    var dropdownElement = openScope.getDropdownElement();
    if (evt && openScope.getAutoClose() === 'outsideClick' &&
      dropdownElement && dropdownElement[0].contains(evt.target)) {
      return;
    }

    openScope.isOpen = false;

    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
  };

  var keybindFilter = function(evt) {
    if (evt.which === 27) {
      evt.stopPropagation();
      openScope.focusToggleElement();
      closeDropdown();
    } else if (openScope.isKeynavEnabled() && [38, 40].indexOf(evt.which) !== -1 && openScope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      openScope.focusDropdownEntry(evt.which);
    }
  };
}])

.controller('UibDropdownController', ['$scope', '$element', '$attrs', '$parse', 'uibDropdownConfig', 'uibDropdownService', '$animate', '$uibPosition', '$document', '$compile', '$templateRequest', function($scope, $element, $attrs, $parse, dropdownConfig, uibDropdownService, $animate, $position, $document, $compile, $templateRequest) {
  var self = this,
    scope = $scope.$new(), // create a child scope so we are not polluting original one
    templateScope,
    appendToOpenClass = dropdownConfig.appendToOpenClass,
    openClass = dropdownConfig.openClass,
    getIsOpen,
    setIsOpen = angular.noop,
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
    appendToBody = false,
    appendTo = null,
    keynavEnabled = false,
    selectedOption = null,
    body = $document.find('body');

  $element.addClass('dropdown');

  this.init = function() {
    if ($attrs.isOpen) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }

    if (angular.isDefined($attrs.dropdownAppendTo)) {
      var appendToEl = $parse($attrs.dropdownAppendTo)(scope);
      if (appendToEl) {
        appendTo = angular.element(appendToEl);
      }
    }

    appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
    keynavEnabled = angular.isDefined($attrs.keyboardNav);

    if (appendToBody && !appendTo) {
      appendTo = body;
    }

    if (appendTo && self.dropdownMenu) {
      appendTo.append(self.dropdownMenu);
      $element.on('$destroy', function handleDestroyEvent() {
        self.dropdownMenu.remove();
      });
    }
  };

  this.toggle = function(open) {
    scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    if (angular.isFunction(setIsOpen)) {
      setIsOpen(scope, scope.isOpen);
    }

    return scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.getToggleElement = function() {
    return self.toggleElement;
  };

  scope.getAutoClose = function() {
    return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
  };

  scope.getElement = function() {
    return $element;
  };

  scope.isKeynavEnabled = function() {
    return keynavEnabled;
  };

  scope.focusDropdownEntry = function(keyCode) {
    var elems = self.dropdownMenu ? //If append to body is used.
      angular.element(self.dropdownMenu).find('a') :
      $element.find('ul').eq(0).find('a');

    switch (keyCode) {
      case 40: {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = 0;
        } else {
          self.selectedOption = self.selectedOption === elems.length - 1 ?
            self.selectedOption :
            self.selectedOption + 1;
        }
        break;
      }
      case 38: {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = elems.length - 1;
        } else {
          self.selectedOption = self.selectedOption === 0 ?
            0 : self.selectedOption - 1;
        }
        break;
      }
    }
    elems[self.selectedOption].focus();
  };

  scope.getDropdownElement = function() {
    return self.dropdownMenu;
  };

  scope.focusToggleElement = function() {
    if (self.toggleElement) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function(isOpen, wasOpen) {
    if (appendTo && self.dropdownMenu) {
      var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true),
        css,
        rightalign,
        scrollbarWidth;

      css = {
        top: pos.top + 'px',
        display: isOpen ? 'block' : 'none'
      };

      rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
      if (!rightalign) {
        css.left = pos.left + 'px';
        css.right = 'auto';
      } else {
        css.left = 'auto';
        scrollbarWidth = $position.scrollbarWidth(true);
        css.right = window.innerWidth - scrollbarWidth -
          (pos.left + $element.prop('offsetWidth')) + 'px';
      }

      // Need to adjust our positioning to be relative to the appendTo container
      // if it's not the body element
      if (!appendToBody) {
        var appendOffset = $position.offset(appendTo);

        css.top = pos.top - appendOffset.top + 'px';

        if (!rightalign) {
          css.left = pos.left - appendOffset.left + 'px';
        } else {
          css.right = window.innerWidth -
            (pos.left - appendOffset.left + $element.prop('offsetWidth')) + 'px';
        }
      }

      self.dropdownMenu.css(css);
    }

    var openContainer = appendTo ? appendTo : $element;
    var hasOpenClass = openContainer.hasClass(appendTo ? appendToOpenClass : openClass);

    if (hasOpenClass === !isOpen) {
      $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, appendTo ? appendToOpenClass : openClass).then(function() {
        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
          toggleInvoker($scope, { open: !!isOpen });
        }
      });
    }

    if (isOpen) {
      if (self.dropdownMenuTemplateUrl) {
        $templateRequest(self.dropdownMenuTemplateUrl).then(function(tplContent) {
          templateScope = scope.$new();
          $compile(tplContent.trim())(templateScope, function(dropdownElement) {
            var newEl = dropdownElement;
            self.dropdownMenu.replaceWith(newEl);
            self.dropdownMenu = newEl;
          });
        });
      }

      scope.focusToggleElement();
      uibDropdownService.open(scope, $element);
    } else {
      if (self.dropdownMenuTemplateUrl) {
        if (templateScope) {
          templateScope.$destroy();
        }
        var newEl = angular.element('<ul class="dropdown-menu"></ul>');
        self.dropdownMenu.replaceWith(newEl);
        self.dropdownMenu = newEl;
      }

      uibDropdownService.close(scope, $element);
      self.selectedOption = null;
    }

    if (angular.isFunction(setIsOpen)) {
      setIsOpen($scope, isOpen);
    }
  });
}])

.directive('uibDropdown', function() {
  return {
    controller: 'UibDropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init();
    }
  };
})

.directive('uibDropdownMenu', function() {
  return {
    restrict: 'A',
    require: '?^uibDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
        return;
      }

      element.addClass('dropdown-menu');

      var tplUrl = attrs.templateUrl;
      if (tplUrl) {
        dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
      }

      if (!dropdownCtrl.dropdownMenu) {
        dropdownCtrl.dropdownMenu = element;
      }
    }
  };
})

.directive('uibDropdownToggle', function() {
  return {
    require: '?^uibDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl) {
        return;
      }

      element.addClass('dropdown-toggle');

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if (!element.hasClass('disabled') && !attrs.disabled) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});

angular.module('ui.bootstrap.stackedMap', [])
/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function() {
    return {
      createNew: function() {
        var stack = [];

        return {
          add: function(key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function(key) {
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function() {
            return stack[stack.length - 1];
          },
          remove: function(key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function() {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function() {
            return stack.length;
          }
        };
      }
    };
  });
angular.module('ui.bootstrap.modal', ['ui.bootstrap.stackedMap', 'ui.bootstrap.position'])
/**
 * A helper, internal data structure that stores all references attached to key
 */
  .factory('$$multiMap', function() {
    return {
      createNew: function() {
        var map = {};

        return {
          entries: function() {
            return Object.keys(map).map(function(key) {
              return {
                key: key,
                value: map[key]
              };
            });
          },
          get: function(key) {
            return map[key];
          },
          hasKey: function(key) {
            return !!map[key];
          },
          keys: function() {
            return Object.keys(map);
          },
          put: function(key, value) {
            if (!map[key]) {
              map[key] = [];
            }

            map[key].push(value);
          },
          remove: function(key, value) {
            var values = map[key];

            if (!values) {
              return;
            }

            var idx = values.indexOf(value);

            if (idx !== -1) {
              values.splice(idx, 1);
            }

            if (!values.length) {
              delete map[key];
            }
          }
        };
      }
    };
  })

/**
 * Pluggable resolve mechanism for the modal resolve resolution
 * Supports UI Router's $resolve service
 */
  .provider('$uibResolve', function() {
    var resolve = this;
    this.resolver = null;

    this.setResolver = function(resolver) {
      this.resolver = resolver;
    };

    this.$get = ['$injector', '$q', function($injector, $q) {
      var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
      return {
        resolve: function(invocables, locals, parent, self) {
          if (resolver) {
            return resolver.resolve(invocables, locals, parent, self);
          }

          var promises = [];

          angular.forEach(invocables, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promises.push($q.resolve($injector.invoke(value)));
            } else if (angular.isString(value)) {
              promises.push($q.resolve($injector.get(value)));
            } else {
              promises.push($q.resolve(value));
            }
          });

          return $q.all(promises).then(function(resolves) {
            var resolveObj = {};
            var resolveIter = 0;
            angular.forEach(invocables, function(value, key) {
              resolveObj[key] = resolves[resolveIter++];
            });

            return resolveObj;
          });
        }
      };
    }];
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('uibModalBackdrop', ['$animate', '$injector', '$uibModalStack',
  function($animate, $injector, $modalStack) {
    return {
      replace: true,
      templateUrl: 'uib/template/modal/backdrop.html',
      compile: function(tElement, tAttrs) {
        tElement.addClass(tAttrs.backdropClass);
        return linkFn;
      }
    };

    function linkFn(scope, element, attrs) {
      if (attrs.modalInClass) {
        $animate.addClass(element, attrs.modalInClass);

        scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
          var done = setIsAsync();
          if (scope.modalOptions.animation) {
            $animate.removeClass(element, attrs.modalInClass).then(done);
          } else {
            done();
          }
        });
      }
    }
  }])

  .directive('uibModalWindow', ['$uibModalStack', '$q', '$animateCss', '$document',
  function($modalStack, $q, $animateCss, $document) {
    return {
      scope: {
        index: '@'
      },
      replace: true,
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
        return tAttrs.templateUrl || 'uib/template/modal/window.html';
      },
      link: function(scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        element.addClass(attrs.windowTopClass || '');
        scope.size = attrs.size;

        scope.close = function(evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop &&
            modal.value.backdrop !== 'static' &&
            evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };

        // moved from template to fix issue #2280
        element.on('click', scope.close);

        // This property is only added to the scope for the purpose of detecting when this directive is rendered.
        // We can detect that by using this property in the template associated with this directive and then use
        // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
        scope.$isRendered = true;

        // Deferred object that will be resolved when this modal is render.
        var modalRenderDeferObj = $q.defer();
        // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
        // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in modal's template.
        attrs.$observe('modalRender', function(value) {
          if (value === 'true') {
            modalRenderDeferObj.resolve();
          }
        });

        modalRenderDeferObj.promise.then(function() {
          var animationPromise = null;

          if (attrs.modalInClass) {
            animationPromise = $animateCss(element, {
              addClass: attrs.modalInClass
            }).start();

            scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
              var done = setIsAsync();
              $animateCss(element, {
                removeClass: attrs.modalInClass
              }).start().then(done);
            });
          }


          $q.when(animationPromise).then(function() {
            // Notify {@link $modalStack} that modal is rendered.
            var modal = $modalStack.getTop();
            if (modal) {
              $modalStack.modalRendered(modal.key);
            }

            /**
             * If something within the freshly-opened modal already has focus (perhaps via a
             * directive that causes focus). then no need to try and focus anything.
             */
            if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
              var inputWithAutofocus = element[0].querySelector('[autofocus]');
              /**
               * Auto-focusing of a freshly-opened modal element causes any child elements
               * with the autofocus attribute to lose focus. This is an issue on touch
               * based devices which will show and then hide the onscreen keyboard.
               * Attempts to refocus the autofocus element via JavaScript will not reopen
               * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
               * the modal element if the modal does not contain an autofocus element.
               */
              if (inputWithAutofocus) {
                inputWithAutofocus.focus();
              } else {
                element[0].focus();
              }
            }
          });
        });
      }
    };
  }])

  .directive('uibModalAnimationClass', function() {
    return {
      compile: function(tElement, tAttrs) {
        if (tAttrs.modalAnimation) {
          tElement.addClass(tAttrs.uibModalAnimationClass);
        }
      }
    };
  })

  .directive('uibModalTransclude', function() {
    return {
      link: function(scope, element, attrs, controller, transclude) {
        transclude(scope.$parent, function(clone) {
          element.empty();
          element.append(clone);
        });
      }
    };
  })

  .factory('$uibModalStack', ['$animate', '$animateCss', '$document',
    '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap', '$uibPosition',
    function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap, $uibPosition) {
      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var openedClasses = $$multiMap.createNew();
      var $modalStack = {
        NOW_CLOSING_EVENT: 'modal.stack.now-closing'
      };
      var topModalIndex = 0;
      var previousTopOpenedModal = null;

      //Modal focus behavior
      var tabableSelector = 'a[href], area[href], input:not([disabled]), ' +
        'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
        'iframe, object, embed, *[tabindex], *[contenteditable=true]';
      var scrollbarPadding;

      function isVisible(element) {
        return !!(element.offsetWidth ||
          element.offsetHeight ||
          element.getClientRects().length);
      }

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }

        // If any backdrop exist, ensure that it's index is always
        // right below the top modal
        if (topBackdropIndex > -1 && topBackdropIndex < topModalIndex) {
          topBackdropIndex = topModalIndex;
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance, elementToReceiveFocus) {
        var modalWindow = openedWindows.get(modalInstance).value;
        var appendToElement = modalWindow.appendTo;

        //clean up the stack
        openedWindows.remove(modalInstance);
        previousTopOpenedModal = openedWindows.top();
        if (previousTopOpenedModal) {
          topModalIndex = parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10);
        }

        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
          var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
          openedClasses.remove(modalBodyClass, modalInstance);
          var areAnyOpen = openedClasses.hasKey(modalBodyClass);
          appendToElement.toggleClass(modalBodyClass, areAnyOpen);
          if (!areAnyOpen && scrollbarPadding && scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
            if (scrollbarPadding.originalRight) {
              appendToElement.css({paddingRight: scrollbarPadding.originalRight + 'px'});
            } else {
              appendToElement.css({paddingRight: ''});
            }
            scrollbarPadding = null;
          }
          toggleTopWindowClass(true);
        }, modalWindow.closedDeferred);
        checkRemoveBackdrop();

        //move focus to specified element if available, or else to body
        if (elementToReceiveFocus && elementToReceiveFocus.focus) {
          elementToReceiveFocus.focus();
        } else if (appendToElement.focus) {
          appendToElement.focus();
        }
      }

      // Add or remove "windowTopClass" from the top window in the stack
      function toggleTopWindowClass(toggleSwitch) {
        var modalWindow;

        if (openedWindows.length() > 0) {
          modalWindow = openedWindows.top().value;
          modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
        }
      }

      function checkRemoveBackdrop() {
        //remove backdrop if no longer needed
        if (backdropDomEl && backdropIndex() === -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, function() {
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, done, closedDeferred) {
        var asyncDeferred;
        var asyncPromise = null;
        var setIsAsync = function() {
          if (!asyncDeferred) {
            asyncDeferred = $q.defer();
            asyncPromise = asyncDeferred.promise;
          }

          return function asyncDone() {
            asyncDeferred.resolve();
          };
        };
        scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

        // Note that it's intentional that asyncPromise might be null.
        // That's when setIsAsync has not been called during the
        // NOW_CLOSING_EVENT broadcast.
        return $q.when(asyncPromise).then(afterAnimating);

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          $animate.leave(domEl).then(function() {
            domEl.remove();
            if (closedDeferred) {
              closedDeferred.resolve();
            }
          });

          scope.$destroy();
          if (done) {
            done();
          }
        }
      }

      $document.on('keydown', keydownListener);

      $rootScope.$on('$destroy', function() {
        $document.off('keydown', keydownListener);
      });

      function keydownListener(evt) {
        if (evt.isDefaultPrevented()) {
          return evt;
        }

        var modal = openedWindows.top();
        if (modal) {
          switch (evt.which) {
            case 27: {
              if (modal.value.keyboard) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                  $modalStack.dismiss(modal.key, 'escape key press');
                });
              }
              break;
            }
            case 9: {
              var list = $modalStack.loadFocusElementList(modal);
              var focusChanged = false;
              if (evt.shiftKey) {
                if ($modalStack.isFocusInFirstItem(evt, list) || $modalStack.isModalFocused(evt, modal)) {
                  focusChanged = $modalStack.focusLastFocusableElement(list);
                }
              } else {
                if ($modalStack.isFocusInLastItem(evt, list)) {
                  focusChanged = $modalStack.focusFirstFocusableElement(list);
                }
              }

              if (focusChanged) {
                evt.preventDefault();
                evt.stopPropagation();
              }

              break;
            }
          }
        }
      }

      $modalStack.open = function(modalInstance, modal) {
        var modalOpener = $document[0].activeElement,
          modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

        toggleTopWindowClass(false);

        // Store the current top first, to determine what index we ought to use
        // for the current top modal
        previousTopOpenedModal = openedWindows.top();

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          renderDeferred: modal.renderDeferred,
          closedDeferred: modal.closedDeferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard,
          openedClass: modal.openedClass,
          windowTopClass: modal.windowTopClass,
          animation: modal.animation,
          appendTo: modal.appendTo
        });

        openedClasses.put(modalBodyClass, modalInstance);

        var appendToElement = modal.appendTo,
            currBackdropIndex = backdropIndex();

        if (!appendToElement.length) {
          throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
        }

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.modalOptions = modal;
          backdropScope.index = currBackdropIndex;
          backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
          backdropDomEl.attr('backdrop-class', modal.backdropClass);
          if (modal.animation) {
            backdropDomEl.attr('modal-animation', 'true');
          }
          $compile(backdropDomEl)(backdropScope);
          $animate.enter(backdropDomEl, appendToElement);
          scrollbarPadding = $uibPosition.scrollbarPadding(appendToElement);
          if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
            appendToElement.css({paddingRight: scrollbarPadding.right + 'px'});
          }
        }

        // Set the top modal index based on the index of the previous top modal
        topModalIndex = previousTopOpenedModal ? parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10) + 1 : 0;
        var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'window-top-class': modal.windowTopClass,
          'size': modal.size,
          'index': topModalIndex,
          'animate': 'animate'
        }).html(modal.content);
        if (modal.animation) {
          angularDomEl.attr('modal-animation', 'true');
        }

        appendToElement.addClass(modalBodyClass);
        $animate.enter($compile(angularDomEl)(modal.scope), appendToElement);

        openedWindows.top().value.modalDomEl = angularDomEl;
        openedWindows.top().value.modalOpener = modalOpener;
      };

      function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
      }

      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, result, true)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal && this.dismiss(topModal.key, reason)) {
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function() {
        return openedWindows.top();
      };

      $modalStack.modalRendered = function(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.renderDeferred.resolve();
        }
      };

      $modalStack.focusFirstFocusableElement = function(list) {
        if (list.length > 0) {
          list[0].focus();
          return true;
        }
        return false;
      };

      $modalStack.focusLastFocusableElement = function(list) {
        if (list.length > 0) {
          list[list.length - 1].focus();
          return true;
        }
        return false;
      };

      $modalStack.isModalFocused = function(evt, modalWindow) {
        if (evt && modalWindow) {
          var modalDomEl = modalWindow.value.modalDomEl;
          if (modalDomEl && modalDomEl.length) {
            return (evt.target || evt.srcElement) === modalDomEl[0];
          }
        }
        return false;
      };

      $modalStack.isFocusInFirstItem = function(evt, list) {
        if (list.length > 0) {
          return (evt.target || evt.srcElement) === list[0];
        }
        return false;
      };

      $modalStack.isFocusInLastItem = function(evt, list) {
        if (list.length > 0) {
          return (evt.target || evt.srcElement) === list[list.length - 1];
        }
        return false;
      };

      $modalStack.loadFocusElementList = function(modalWindow) {
        if (modalWindow) {
          var modalDomE1 = modalWindow.value.modalDomEl;
          if (modalDomE1 && modalDomE1.length) {
            var elements = modalDomE1[0].querySelectorAll(tabableSelector);
            return elements ?
              Array.prototype.filter.call(elements, function(element) {
                return isVisible(element);
              }) : elements;
          }
        }
      };

      return $modalStack;
    }])

  .provider('$uibModal', function() {
    var $modalProvider = {
      options: {
        animation: true,
        backdrop: true, //can also be false or 'static'
        keyboard: true
      },
      $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
        function ($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $templateRequest(angular.isFunction(options.templateUrl) ?
                options.templateUrl() : options.templateUrl);
          }

          var promiseChain = null;
          $modal.getPromiseChain = function() {
            return promiseChain;
          };

          $modal.open = function(modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalClosedDeferred = $q.defer();
            var modalRenderDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              closed: modalClosedDeferred.promise,
              rendered: modalRenderDeferred.promise,
              close: function (result) {
                return $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                return $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]);

            function resolveWithTemplate() {
              return templateAndResolvePromise;
            }

            // Wait for the resolution of the existing promise chain.
            // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
            // Then add to $modalStack and resolve opened.
            // Finally clean up the chain variable if no subsequent modal has overwritten it.
            var samePromise;
            samePromise = promiseChain = $q.all([promiseChain])
              .then(resolveWithTemplate, resolveWithTemplate)
              .then(function resolveSuccess(tplAndVars) {
                var providedScope = modalOptions.scope || $rootScope;

                var modalScope = providedScope.$new();
                modalScope.$close = modalInstance.close;
                modalScope.$dismiss = modalInstance.dismiss;

                modalScope.$on('$destroy', function() {
                  if (!modalScope.$$uibDestructionScheduled) {
                    modalScope.$dismiss('$uibUnscheduledDestruction');
                  }
                });

                var ctrlInstance, ctrlInstantiate, ctrlLocals = {};

                //controllers
                if (modalOptions.controller) {
                  ctrlLocals.$scope = modalScope;
                  ctrlLocals.$scope.$resolve = {};
                  ctrlLocals.$uibModalInstance = modalInstance;
                  angular.forEach(tplAndVars[1], function(value, key) {
                    ctrlLocals[key] = value;
                    ctrlLocals.$scope.$resolve[key] = value;
                  });

                  // the third param will make the controller instantiate later,private api
                  // @see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L126
                  ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true, modalOptions.controllerAs);
                  if (modalOptions.controllerAs && modalOptions.bindToController) {
                    ctrlInstance = ctrlInstantiate.instance;
                    ctrlInstance.$close = modalScope.$close;
                    ctrlInstance.$dismiss = modalScope.$dismiss;
                    angular.extend(ctrlInstance, {
                      $resolve: ctrlLocals.$scope.$resolve
                    }, providedScope);
                  }

                  ctrlInstance = ctrlInstantiate();

                  if (angular.isFunction(ctrlInstance.$onInit)) {
                    ctrlInstance.$onInit();
                  }
                }

                $modalStack.open(modalInstance, {
                  scope: modalScope,
                  deferred: modalResultDeferred,
                  renderDeferred: modalRenderDeferred,
                  closedDeferred: modalClosedDeferred,
                  content: tplAndVars[0],
                  animation: modalOptions.animation,
                  backdrop: modalOptions.backdrop,
                  keyboard: modalOptions.keyboard,
                  backdropClass: modalOptions.backdropClass,
                  windowTopClass: modalOptions.windowTopClass,
                  windowClass: modalOptions.windowClass,
                  windowTemplateUrl: modalOptions.windowTemplateUrl,
                  size: modalOptions.size,
                  openedClass: modalOptions.openedClass,
                  appendTo: modalOptions.appendTo
                });
                modalOpenedDeferred.resolve(true);

            }, function resolveError(reason) {
              modalOpenedDeferred.reject(reason);
              modalResultDeferred.reject(reason);
            })['finally'](function() {
              if (promiseChain === samePromise) {
                promiseChain = null;
              }
            });

            return modalInstance;
          };

          return $modal;
        }
      ]
    };

    return $modalProvider;
  });

angular.module('ui.bootstrap.paging', [])
/**
 * Helper internal service for generating common controller code between the
 * pager and pagination components
 */
.factory('uibPaging', ['$parse', function($parse) {
  return {
    create: function(ctrl, $scope, $attrs) {
      ctrl.setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
      ctrl.ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl
      ctrl._watchers = [];

      ctrl.init = function(ngModelCtrl, config) {
        ctrl.ngModelCtrl = ngModelCtrl;
        ctrl.config = config;

        ngModelCtrl.$render = function() {
          ctrl.render();
        };

        if ($attrs.itemsPerPage) {
          ctrl._watchers.push($scope.$parent.$watch($attrs.itemsPerPage, function(value) {
            ctrl.itemsPerPage = parseInt(value, 10);
            $scope.totalPages = ctrl.calculateTotalPages();
            ctrl.updatePage();
          }));
        } else {
          ctrl.itemsPerPage = config.itemsPerPage;
        }

        $scope.$watch('totalItems', function(newTotal, oldTotal) {
          if (angular.isDefined(newTotal) || newTotal !== oldTotal) {
            $scope.totalPages = ctrl.calculateTotalPages();
            ctrl.updatePage();
          }
        });
      };

      ctrl.calculateTotalPages = function() {
        var totalPages = ctrl.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / ctrl.itemsPerPage);
        return Math.max(totalPages || 0, 1);
      };

      ctrl.render = function() {
        $scope.page = parseInt(ctrl.ngModelCtrl.$viewValue, 10) || 1;
      };

      $scope.selectPage = function(page, evt) {
        if (evt) {
          evt.preventDefault();
        }

        var clickAllowed = !$scope.ngDisabled || !evt;
        if (clickAllowed && $scope.page !== page && page > 0 && page <= $scope.totalPages) {
          if (evt && evt.target) {
            evt.target.blur();
          }
          ctrl.ngModelCtrl.$setViewValue(page);
          ctrl.ngModelCtrl.$render();
        }
      };

      $scope.getText = function(key) {
        return $scope[key + 'Text'] || ctrl.config[key + 'Text'];
      };

      $scope.noPrevious = function() {
        return $scope.page === 1;
      };

      $scope.noNext = function() {
        return $scope.page === $scope.totalPages;
      };

      ctrl.updatePage = function() {
        ctrl.setNumPages($scope.$parent, $scope.totalPages); // Readonly variable

        if ($scope.page > $scope.totalPages) {
          $scope.selectPage($scope.totalPages);
        } else {
          ctrl.ngModelCtrl.$render();
        }
      };

      $scope.$on('$destroy', function() {
        while (ctrl._watchers.length) {
          ctrl._watchers.shift()();
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.pager', ['ui.bootstrap.paging'])

.controller('UibPagerController', ['$scope', '$attrs', 'uibPaging', 'uibPagerConfig', function($scope, $attrs, uibPaging, uibPagerConfig) {
  $scope.align = angular.isDefined($attrs.align) ? $scope.$parent.$eval($attrs.align) : uibPagerConfig.align;

  uibPaging.create(this, $scope, $attrs);
}])

.constant('uibPagerConfig', {
  itemsPerPage: 10,
  previousText: '« Previous',
  nextText: 'Next »',
  align: true
})

.directive('uibPager', ['uibPagerConfig', function(uibPagerConfig) {
  return {
    scope: {
      totalItems: '=',
      previousText: '@',
      nextText: '@',
      ngDisabled: '='
    },
    require: ['uibPager', '?ngModel'],
    controller: 'UibPagerController',
    controllerAs: 'pager',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/pager/pager.html';
    },
    replace: true,
    link: function(scope, element, attrs, ctrls) {
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (!ngModelCtrl) {
        return; // do nothing if no ng-model
      }

      paginationCtrl.init(ngModelCtrl, uibPagerConfig);
    }
  };
}]);

angular.module('ui.bootstrap.pagination', ['ui.bootstrap.paging'])
.controller('UibPaginationController', ['$scope', '$attrs', '$parse', 'uibPaging', 'uibPaginationConfig', function($scope, $attrs, $parse, uibPaging, uibPaginationConfig) {
  var ctrl = this;
  // Setup configuration parameters
  var maxSize = angular.isDefined($attrs.maxSize) ? $scope.$parent.$eval($attrs.maxSize) : uibPaginationConfig.maxSize,
    rotate = angular.isDefined($attrs.rotate) ? $scope.$parent.$eval($attrs.rotate) : uibPaginationConfig.rotate,
    forceEllipses = angular.isDefined($attrs.forceEllipses) ? $scope.$parent.$eval($attrs.forceEllipses) : uibPaginationConfig.forceEllipses,
    boundaryLinkNumbers = angular.isDefined($attrs.boundaryLinkNumbers) ? $scope.$parent.$eval($attrs.boundaryLinkNumbers) : uibPaginationConfig.boundaryLinkNumbers,
    pageLabel = angular.isDefined($attrs.pageLabel) ? function(idx) { return $scope.$parent.$eval($attrs.pageLabel, {$page: idx}); } : angular.identity;
  $scope.boundaryLinks = angular.isDefined($attrs.boundaryLinks) ? $scope.$parent.$eval($attrs.boundaryLinks) : uibPaginationConfig.boundaryLinks;
  $scope.directionLinks = angular.isDefined($attrs.directionLinks) ? $scope.$parent.$eval($attrs.directionLinks) : uibPaginationConfig.directionLinks;

  uibPaging.create(this, $scope, $attrs);

  if ($attrs.maxSize) {
    ctrl._watchers.push($scope.$parent.$watch($parse($attrs.maxSize), function(value) {
      maxSize = parseInt(value, 10);
      ctrl.render();
    }));
  }

  // Create page object used in template
  function makePage(number, text, isActive) {
    return {
      number: number,
      text: text,
      active: isActive
    };
  }

  function getPages(currentPage, totalPages) {
    var pages = [];

    // Default page limits
    var startPage = 1, endPage = totalPages;
    var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;

    // recompute if maxSize
    if (isMaxSized) {
      if (rotate) {
        // Current page is displayed in the middle of the visible ones
        startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
        endPage = startPage + maxSize - 1;

        // Adjust if limit is exceeded
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - maxSize + 1;
        }
      } else {
        // Visible pages are paginated with maxSize
        startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1;

        // Adjust last page if limit is exceeded
        endPage = Math.min(startPage + maxSize - 1, totalPages);
      }
    }

    // Add page number links
    for (var number = startPage; number <= endPage; number++) {
      var page = makePage(number, pageLabel(number), number === currentPage);
      pages.push(page);
    }

    // Add links to move between page sets
    if (isMaxSized && maxSize > 0 && (!rotate || forceEllipses || boundaryLinkNumbers)) {
      if (startPage > 1) {
        if (!boundaryLinkNumbers || startPage > 3) { //need ellipsis for all options unless range is too close to beginning
        var previousPageSet = makePage(startPage - 1, '...', false);
        pages.unshift(previousPageSet);
      }
        if (boundaryLinkNumbers) {
          if (startPage === 3) { //need to replace ellipsis when the buttons would be sequential
            var secondPageLink = makePage(2, '2', false);
            pages.unshift(secondPageLink);
          }
          //add the first page
          var firstPageLink = makePage(1, '1', false);
          pages.unshift(firstPageLink);
        }
      }

      if (endPage < totalPages) {
        if (!boundaryLinkNumbers || endPage < totalPages - 2) { //need ellipsis for all options unless range is too close to end
        var nextPageSet = makePage(endPage + 1, '...', false);
        pages.push(nextPageSet);
      }
        if (boundaryLinkNumbers) {
          if (endPage === totalPages - 2) { //need to replace ellipsis when the buttons would be sequential
            var secondToLastPageLink = makePage(totalPages - 1, totalPages - 1, false);
            pages.push(secondToLastPageLink);
          }
          //add the last page
          var lastPageLink = makePage(totalPages, totalPages, false);
          pages.push(lastPageLink);
        }
      }
    }
    return pages;
  }

  var originalRender = this.render;
  this.render = function() {
    originalRender();
    if ($scope.page > 0 && $scope.page <= $scope.totalPages) {
      $scope.pages = getPages($scope.page, $scope.totalPages);
    }
  };
}])

.constant('uibPaginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: false,
  boundaryLinkNumbers: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true,
  forceEllipses: false
})

.directive('uibPagination', ['$parse', 'uibPaginationConfig', function($parse, uibPaginationConfig) {
  return {
    scope: {
      totalItems: '=',
      firstText: '@',
      previousText: '@',
      nextText: '@',
      lastText: '@',
      ngDisabled:'='
    },
    require: ['uibPagination', '?ngModel'],
    controller: 'UibPaginationController',
    controllerAs: 'pagination',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/pagination/pagination.html';
    },
    replace: true,
    link: function(scope, element, attrs, ctrls) {
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (!ngModelCtrl) {
         return; // do nothing if no ng-model
      }

      paginationCtrl.init(ngModelCtrl, uibPaginationConfig);
    }
  };
}]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position', 'ui.bootstrap.stackedMap'])

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider('$uibTooltip', function() {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    placementClassPrefix: '',
    animation: true,
    popupDelay: 0,
    popupCloseDelay: 0,
    useContentExp: false
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'outsideClick': 'outsideClick',
    'focus': 'blur',
    'none': ''
  };

  // The options specified to the provider globally.
  var globalOptions = {};

  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function(value) {
		angular.extend(globalOptions, value);
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( { 'openTrigger': 'closeTrigger' } );
   */
  this.setTriggers = function setTriggers(triggers) {
    angular.extend(triggerMap, triggers);
  };

  /**
   * This is a helper function for translating camel-case to snake_case.
   */
  function snake_case(name) {
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = ['$window', '$compile', '$timeout', '$document', '$uibPosition', '$interpolate', '$rootScope', '$parse', '$$stackedMap', function($window, $compile, $timeout, $document, $position, $interpolate, $rootScope, $parse, $$stackedMap) {
    var openedTooltips = $$stackedMap.createNew();
    $document.on('keypress', keypressListener);

    $rootScope.$on('$destroy', function() {
      $document.off('keypress', keypressListener);
    });

    function keypressListener(e) {
      if (e.which === 27) {
        var last = openedTooltips.top();
        if (last) {
          last.value.close();
          openedTooltips.removeTop();
          last = null;
        }
      }
    }

    return function $tooltip(ttType, prefix, defaultTriggerShow, options) {
      options = angular.extend({}, defaultOptions, globalOptions, options);

      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers(trigger) {
        var show = (trigger || options.trigger || defaultTriggerShow).split(' ');
        var hide = show.map(function(trigger) {
          return triggerMap[trigger] || trigger;
        });
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case(ttType);

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template =
        '<div '+ directiveName + '-popup ' +
          'uib-title="' + startSym + 'title' + endSym + '" ' +
          (options.useContentExp ?
            'content-exp="contentExp()" ' :
            'content="' + startSym + 'content' + endSym + '" ') +
          'placement="' + startSym + 'placement' + endSym + '" ' +
          'popup-class="' + startSym + 'popupClass' + endSym + '" ' +
          'animation="animation" ' +
          'is-open="isOpen" ' +
          'origin-scope="origScope" ' +
          'class="uib-position-measure"' +
          '>' +
        '</div>';

      return {
        compile: function(tElem, tAttrs) {
          var tooltipLinker = $compile(template);

          return function link(scope, element, attrs, tooltipCtrl) {
            var tooltip;
            var tooltipLinkedScope;
            var transitionTimeout;
            var showTimeout;
            var hideTimeout;
            var positionTimeout;
            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
            var triggers = getTriggers(undefined);
            var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
            var ttScope = scope.$new(true);
            var repositionScheduled = false;
            var isOpenParse = angular.isDefined(attrs[prefix + 'IsOpen']) ? $parse(attrs[prefix + 'IsOpen']) : false;
            var contentParse = options.useContentExp ? $parse(attrs[ttType]) : false;
            var observers = [];
            var lastPlacement;

            var positionTooltip = function() {
              // check if tooltip exists and is not empty
              if (!tooltip || !tooltip.html()) { return; }

              if (!positionTimeout) {
                positionTimeout = $timeout(function() {
                  var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                  tooltip.css({ top: ttPosition.top + 'px', left: ttPosition.left + 'px' });

                  if (!tooltip.hasClass(ttPosition.placement.split('-')[0])) {
                    tooltip.removeClass(lastPlacement.split('-')[0]);
                    tooltip.addClass(ttPosition.placement.split('-')[0]);
                  }

                  if (!tooltip.hasClass(options.placementClassPrefix + ttPosition.placement)) {
                    tooltip.removeClass(options.placementClassPrefix + lastPlacement);
                    tooltip.addClass(options.placementClassPrefix + ttPosition.placement);
                  }

                  // first time through tt element will have the
                  // uib-position-measure class or if the placement
                  // has changed we need to position the arrow.
                  if (tooltip.hasClass('uib-position-measure')) {
                    $position.positionArrow(tooltip, ttPosition.placement);
                    tooltip.removeClass('uib-position-measure');
                  } else if (lastPlacement !== ttPosition.placement) {
                    $position.positionArrow(tooltip, ttPosition.placement);
                  }
                  lastPlacement = ttPosition.placement;

                  positionTimeout = null;
                }, 0, false);
              }
            };

            // Set up the correct scope to allow transclusion later
            ttScope.origScope = scope;

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            ttScope.isOpen = false;
            openedTooltips.add(ttScope, {
              close: hide
            });

            function toggleTooltipBind() {
              if (!ttScope.isOpen) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                return;
              }

              cancelHide();
              prepareTooltip();

              if (ttScope.popupDelay) {
                // Do nothing if the tooltip was already scheduled to pop-up.
                // This happens if show is triggered multiple times before any hide is triggered.
                if (!showTimeout) {
                  showTimeout = $timeout(show, ttScope.popupDelay, false);
                }
              } else {
                show();
              }
            }

            function hideTooltipBind() {
              cancelShow();

              if (ttScope.popupCloseDelay) {
                if (!hideTimeout) {
                  hideTimeout = $timeout(hide, ttScope.popupCloseDelay, false);
                }
              } else {
                hide();
              }
            }

            // Show the tooltip popup element.
            function show() {
              cancelShow();
              cancelHide();

              // Don't show empty tooltips.
              if (!ttScope.content) {
                return angular.noop;
              }

              createTooltip();

              // And show the tooltip.
              ttScope.$evalAsync(function() {
                ttScope.isOpen = true;
                assignIsOpen(true);
                positionTooltip();
              });
            }

            function cancelShow() {
              if (showTimeout) {
                $timeout.cancel(showTimeout);
                showTimeout = null;
              }

              if (positionTimeout) {
                $timeout.cancel(positionTimeout);
                positionTimeout = null;
              }
            }

            // Hide the tooltip popup element.
            function hide() {
              if (!ttScope) {
                return;
              }

              // First things first: we don't show it anymore.
              ttScope.$evalAsync(function() {
                if (ttScope) {
                  ttScope.isOpen = false;
                  assignIsOpen(false);
                  // And now we remove it from the DOM. However, if we have animation, we
                  // need to wait for it to expire beforehand.
                  // FIXME: this is a placeholder for a port of the transitions library.
                  // The fade transition in TWBS is 150ms.
                  if (ttScope.animation) {
                    if (!transitionTimeout) {
                      transitionTimeout = $timeout(removeTooltip, 150, false);
                    }
                  } else {
                    removeTooltip();
                  }
                }
              });
            }

            function cancelHide() {
              if (hideTimeout) {
                $timeout.cancel(hideTimeout);
                hideTimeout = null;
              }

              if (transitionTimeout) {
                $timeout.cancel(transitionTimeout);
                transitionTimeout = null;
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                return;
              }

              tooltipLinkedScope = ttScope.$new();
              tooltip = tooltipLinker(tooltipLinkedScope, function(tooltip) {
                if (appendToBody) {
                  $document.find('body').append(tooltip);
                } else {
                  element.after(tooltip);
                }
              });

              prepObservers();
            }

            function removeTooltip() {
              cancelShow();
              cancelHide();
              unregisterObservers();

              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
              if (tooltipLinkedScope) {
                tooltipLinkedScope.$destroy();
                tooltipLinkedScope = null;
              }
            }

            /**
             * Set the initial scope values. Once
             * the tooltip is created, the observers
             * will be added to keep things in sync.
             */
            function prepareTooltip() {
              ttScope.title = attrs[prefix + 'Title'];
              if (contentParse) {
                ttScope.content = contentParse(scope);
              } else {
                ttScope.content = attrs[ttType];
              }

              ttScope.popupClass = attrs[prefix + 'Class'];
              ttScope.placement = angular.isDefined(attrs[prefix + 'Placement']) ? attrs[prefix + 'Placement'] : options.placement;
              var placement = $position.parsePlacement(ttScope.placement);
              lastPlacement = placement[1] ? placement[0] + '-' + placement[1] : placement[0];

              var delay = parseInt(attrs[prefix + 'PopupDelay'], 10);
              var closeDelay = parseInt(attrs[prefix + 'PopupCloseDelay'], 10);
              ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
              ttScope.popupCloseDelay = !isNaN(closeDelay) ? closeDelay : options.popupCloseDelay;
            }

            function assignIsOpen(isOpen) {
              if (isOpenParse && angular.isFunction(isOpenParse.assign)) {
                isOpenParse.assign(scope, isOpen);
              }
            }

            ttScope.contentExp = function() {
              return ttScope.content;
            };

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe('disabled', function(val) {
              if (val) {
                cancelShow();
              }

              if (val && ttScope.isOpen) {
                hide();
              }
            });

            if (isOpenParse) {
              scope.$watch(isOpenParse, function(val) {
                if (ttScope && !val === ttScope.isOpen) {
                  toggleTooltipBind();
                }
              });
            }

            function prepObservers() {
              observers.length = 0;

              if (contentParse) {
                observers.push(
                  scope.$watch(contentParse, function(val) {
                    ttScope.content = val;
                    if (!val && ttScope.isOpen) {
                      hide();
                    }
                  })
                );

                observers.push(
                  tooltipLinkedScope.$watch(function() {
                    if (!repositionScheduled) {
                      repositionScheduled = true;
                      tooltipLinkedScope.$$postDigest(function() {
                        repositionScheduled = false;
                        if (ttScope && ttScope.isOpen) {
                          positionTooltip();
                        }
                      });
                    }
                  })
                );
              } else {
                observers.push(
                  attrs.$observe(ttType, function(val) {
                    ttScope.content = val;
                    if (!val && ttScope.isOpen) {
                      hide();
                    } else {
                      positionTooltip();
                    }
                  })
                );
              }

              observers.push(
                attrs.$observe(prefix + 'Title', function(val) {
                  ttScope.title = val;
                  if (ttScope.isOpen) {
                    positionTooltip();
                  }
                })
              );

              observers.push(
                attrs.$observe(prefix + 'Placement', function(val) {
                  ttScope.placement = val ? val : options.placement;
                  if (ttScope.isOpen) {
                    positionTooltip();
                  }
                })
              );
            }

            function unregisterObservers() {
              if (observers.length) {
                angular.forEach(observers, function(observer) {
                  observer();
                });
                observers.length = 0;
              }
            }

            // hide tooltips/popovers for outsideClick trigger
            function bodyHideTooltipBind(e) {
              if (!ttScope || !ttScope.isOpen || !tooltip) {
                return;
              }
              // make sure the tooltip/popover link or tool tooltip/popover itself were not clicked
              if (!element[0].contains(e.target) && !tooltip[0].contains(e.target)) {
                hideTooltipBind();
              }
            }

            var unregisterTriggers = function() {
              triggers.show.forEach(function(trigger) {
                if (trigger === 'outsideClick') {
                  element.off('click', toggleTooltipBind);
                } else {
                  element.off(trigger, showTooltipBind);
                  element.off(trigger, toggleTooltipBind);
                }
              });
              triggers.hide.forEach(function(trigger) {
                if (trigger === 'outsideClick') {
                  $document.off('click', bodyHideTooltipBind);
                } else {
                  element.off(trigger, hideTooltipBind);
                }
              });
            };

            function prepTriggers() {
              var val = attrs[prefix + 'Trigger'];
              unregisterTriggers();

              triggers = getTriggers(val);

              if (triggers.show !== 'none') {
                triggers.show.forEach(function(trigger, idx) {
                  if (trigger === 'outsideClick') {
                    element.on('click', toggleTooltipBind);
                    $document.on('click', bodyHideTooltipBind);
                  } else if (trigger === triggers.hide[idx]) {
                    element.on(trigger, toggleTooltipBind);
                  } else if (trigger) {
                    element.on(trigger, showTooltipBind);
                    element.on(triggers.hide[idx], hideTooltipBind);
                  }

                  element.on('keypress', function(e) {
                    if (e.which === 27) {
                      hideTooltipBind();
                    }
                  });
                });
              }
            }

            prepTriggers();

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

            var appendToBodyVal;
            var appendKey = prefix + 'AppendToBody';
            if (appendKey in attrs && attrs[appendKey] === undefined) {
              appendToBodyVal = true;
            } else {
              appendToBodyVal = scope.$eval(attrs[appendKey]);
            }

            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              unregisterTriggers();
              removeTooltip();
              openedTooltips.remove(ttScope);
              ttScope = null;
            });
          };
        }
      };
    };
  }];
})

// This is mostly ngInclude code but with a custom scope
.directive('uibTooltipTemplateTransclude', [
         '$animate', '$sce', '$compile', '$templateRequest',
function ($animate, $sce, $compile, $templateRequest) {
  return {
    link: function(scope, elem, attrs) {
      var origScope = scope.$eval(attrs.tooltipTemplateTranscludeScope);

      var changeCounter = 0,
        currentScope,
        previousElement,
        currentElement;

      var cleanupLastIncludeContent = function() {
        if (previousElement) {
          previousElement.remove();
          previousElement = null;
        }

        if (currentScope) {
          currentScope.$destroy();
          currentScope = null;
        }

        if (currentElement) {
          $animate.leave(currentElement).then(function() {
            previousElement = null;
          });
          previousElement = currentElement;
          currentElement = null;
        }
      };

      scope.$watch($sce.parseAsResourceUrl(attrs.uibTooltipTemplateTransclude), function(src) {
        var thisChangeId = ++changeCounter;

        if (src) {
          //set the 2nd param to true to ignore the template request error so that the inner
          //contents and scope can be cleaned up.
          $templateRequest(src, true).then(function(response) {
            if (thisChangeId !== changeCounter) { return; }
            var newScope = origScope.$new();
            var template = response;

            var clone = $compile(template)(newScope, function(clone) {
              cleanupLastIncludeContent();
              $animate.enter(clone, elem);
            });

            currentScope = newScope;
            currentElement = clone;

            currentScope.$emit('$includeContentLoaded', src);
          }, function() {
            if (thisChangeId === changeCounter) {
              cleanupLastIncludeContent();
              scope.$emit('$includeContentError', src);
            }
          });
          scope.$emit('$includeContentRequested', src);
        } else {
          cleanupLastIncludeContent();
        }
      });

      scope.$on('$destroy', cleanupLastIncludeContent);
    }
  };
}])

/**
 * Note that it's intentional that these classes are *not* applied through $animate.
 * They must not be animated as they're expected to be present on the tooltip on
 * initialization.
 */
.directive('uibTooltipClasses', ['$uibPosition', function($uibPosition) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // need to set the primary position so the
      // arrow has space during position measure.
      // tooltip.positionTooltip()
      if (scope.placement) {
        // // There are no top-left etc... classes
        // // in TWBS, so we need the primary position.
        var position = $uibPosition.parsePlacement(scope.placement);
        element.addClass(position[0]);
      }

      if (scope.popupClass) {
        element.addClass(scope.popupClass);
      }

      if (scope.animation()) {
        element.addClass(attrs.tooltipAnimationClass);
      }
    }
  };
}])

.directive('uibTooltipPopup', function() {
  return {
    replace: true,
    scope: { content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
    templateUrl: 'uib/template/tooltip/tooltip-popup.html'
  };
})

.directive('uibTooltip', [ '$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibTooltip', 'tooltip', 'mouseenter');
}])

.directive('uibTooltipTemplatePopup', function() {
  return {
    replace: true,
    scope: { contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
      originScope: '&' },
    templateUrl: 'uib/template/tooltip/tooltip-template-popup.html'
  };
})

.directive('uibTooltipTemplate', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibTooltipTemplate', 'tooltip', 'mouseenter', {
    useContentExp: true
  });
}])

.directive('uibTooltipHtmlPopup', function() {
  return {
    replace: true,
    scope: { contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
    templateUrl: 'uib/template/tooltip/tooltip-html-popup.html'
  };
})

.directive('uibTooltipHtml', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibTooltipHtml', 'tooltip', 'mouseenter', {
    useContentExp: true
  });
}]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, and selector delegatation.
 */
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip'])

.directive('uibPopoverTemplatePopup', function() {
  return {
    replace: true,
    scope: { uibTitle: '@', contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
      originScope: '&' },
    templateUrl: 'uib/template/popover/popover-template.html'
  };
})

.directive('uibPopoverTemplate', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibPopoverTemplate', 'popover', 'click', {
    useContentExp: true
  });
}])

.directive('uibPopoverHtmlPopup', function() {
  return {
    replace: true,
    scope: { contentExp: '&', uibTitle: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
    templateUrl: 'uib/template/popover/popover-html.html'
  };
})

.directive('uibPopoverHtml', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibPopoverHtml', 'popover', 'click', {
    useContentExp: true
  });
}])

.directive('uibPopoverPopup', function() {
  return {
    replace: true,
    scope: { uibTitle: '@', content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
    templateUrl: 'uib/template/popover/popover.html'
  };
})

.directive('uibPopover', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibPopover', 'popover', 'click');
}]);

angular.module('ui.bootstrap.progressbar', [])

.constant('uibProgressConfig', {
  animate: true,
  max: 100
})

.controller('UibProgressController', ['$scope', '$attrs', 'uibProgressConfig', function($scope, $attrs, progressConfig) {
  var self = this,
      animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

  this.bars = [];
  $scope.max = getMaxOrDefault();

  this.addBar = function(bar, element, attrs) {
    if (!animate) {
      element.css({'transition': 'none'});
    }

    this.bars.push(bar);

    bar.max = getMaxOrDefault();
    bar.title = attrs && angular.isDefined(attrs.title) ? attrs.title : 'progressbar';

    bar.$watch('value', function(value) {
      bar.recalculatePercentage();
    });

    bar.recalculatePercentage = function() {
      var totalPercentage = self.bars.reduce(function(total, bar) {
        bar.percent = +(100 * bar.value / bar.max).toFixed(2);
        return total + bar.percent;
      }, 0);

      if (totalPercentage > 100) {
        bar.percent -= totalPercentage - 100;
      }
    };

    bar.$on('$destroy', function() {
      element = null;
      self.removeBar(bar);
    });
  };

  this.removeBar = function(bar) {
    this.bars.splice(this.bars.indexOf(bar), 1);
    this.bars.forEach(function (bar) {
      bar.recalculatePercentage();
    });
  };

  //$attrs.$observe('maxParam', function(maxParam) {
  $scope.$watch('maxParam', function(maxParam) {
    self.bars.forEach(function(bar) {
      bar.max = getMaxOrDefault();
      bar.recalculatePercentage();
    });
  });

  function getMaxOrDefault () {
    return angular.isDefined($scope.maxParam) ? $scope.maxParam : progressConfig.max;
  }
}])

.directive('uibProgress', function() {
  return {
    replace: true,
    transclude: true,
    controller: 'UibProgressController',
    require: 'uibProgress',
    scope: {
      maxParam: '=?max'
    },
    templateUrl: 'uib/template/progressbar/progress.html'
  };
})

.directive('uibBar', function() {
  return {
    replace: true,
    transclude: true,
    require: '^uibProgress',
    scope: {
      value: '=',
      type: '@'
    },
    templateUrl: 'uib/template/progressbar/bar.html',
    link: function(scope, element, attrs, progressCtrl) {
      progressCtrl.addBar(scope, element, attrs);
    }
  };
})

.directive('uibProgressbar', function() {
  return {
    replace: true,
    transclude: true,
    controller: 'UibProgressController',
    scope: {
      value: '=',
      maxParam: '=?max',
      type: '@'
    },
    templateUrl: 'uib/template/progressbar/progressbar.html',
    link: function(scope, element, attrs, progressCtrl) {
      progressCtrl.addBar(scope, angular.element(element.children()[0]), {title: attrs.title});
    }
  };
});

angular.module('ui.bootstrap.rating', [])

.constant('uibRatingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null,
  enableReset: true,
  titles : ['one', 'two', 'three', 'four', 'five']
})

.controller('UibRatingController', ['$scope', '$attrs', 'uibRatingConfig', function($scope, $attrs, ratingConfig) {
  var ngModelCtrl = { $setViewValue: angular.noop },
    self = this;

  this.init = function(ngModelCtrl_) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    ngModelCtrl.$formatters.push(function(value) {
      if (angular.isNumber(value) && value << 0 !== value) {
        value = Math.round(value);
      }

      return value;
    });

    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
    this.enableReset = angular.isDefined($attrs.enableReset) ?
      $scope.$parent.$eval($attrs.enableReset) : ratingConfig.enableReset;
    var tmpTitles = angular.isDefined($attrs.titles) ? $scope.$parent.$eval($attrs.titles) : ratingConfig.titles;
    this.titles = angular.isArray(tmpTitles) && tmpTitles.length > 0 ?
      tmpTitles : ratingConfig.titles;

    var ratingStates = angular.isDefined($attrs.ratingStates) ?
      $scope.$parent.$eval($attrs.ratingStates) :
      new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
    $scope.range = this.buildTemplateObjects(ratingStates);
  };

  this.buildTemplateObjects = function(states) {
    for (var i = 0, n = states.length; i < n; i++) {
      states[i] = angular.extend({ index: i }, { stateOn: this.stateOn, stateOff: this.stateOff, title: this.getTitle(i) }, states[i]);
    }
    return states;
  };

  this.getTitle = function(index) {
    if (index >= this.titles.length) {
      return index + 1;
    }

    return this.titles[index];
  };

  $scope.rate = function(value) {
    if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
      var newViewValue = self.enableReset && ngModelCtrl.$viewValue === value ? 0 : value;
      ngModelCtrl.$setViewValue(newViewValue);
      ngModelCtrl.$render();
    }
  };

  $scope.enter = function(value) {
    if (!$scope.readonly) {
      $scope.value = value;
    }
    $scope.onHover({value: value});
  };

  $scope.reset = function() {
    $scope.value = ngModelCtrl.$viewValue;
    $scope.onLeave();
  };

  $scope.onKeydown = function(evt) {
    if (/(37|38|39|40)/.test(evt.which)) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1));
    }
  };

  this.render = function() {
    $scope.value = ngModelCtrl.$viewValue;
    $scope.title = self.getTitle($scope.value - 1);
  };
}])

.directive('uibRating', function() {
  return {
    require: ['uibRating', 'ngModel'],
    scope: {
      readonly: '=?readOnly',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'UibRatingController',
    templateUrl: 'uib/template/rating/rating.html',
    replace: true,
    link: function(scope, element, attrs, ctrls) {
      var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
      ratingCtrl.init(ngModelCtrl);
    }
  };
});

angular.module('ui.bootstrap.tabs', [])

.controller('UibTabsetController', ['$scope', function ($scope) {
  var ctrl = this,
    oldIndex;
  ctrl.tabs = [];

  ctrl.select = function(index, evt) {
    if (!destroyed) {
      var previousIndex = findTabIndex(oldIndex);
      var previousSelected = ctrl.tabs[previousIndex];
      if (previousSelected) {
        previousSelected.tab.onDeselect({
          $event: evt,
          $selectedIndex: index
        });
        if (evt && evt.isDefaultPrevented()) {
          return;
        }
        previousSelected.tab.active = false;
      }

      var selected = ctrl.tabs[index];
      if (selected) {
        selected.tab.onSelect({
          $event: evt
        });
        selected.tab.active = true;
        ctrl.active = selected.index;
        oldIndex = selected.index;
      } else if (!selected && angular.isDefined(oldIndex)) {
        ctrl.active = null;
        oldIndex = null;
      }
    }
  };

  ctrl.addTab = function addTab(tab) {
    ctrl.tabs.push({
      tab: tab,
      index: tab.index
    });
    ctrl.tabs.sort(function(t1, t2) {
      if (t1.index > t2.index) {
        return 1;
      }

      if (t1.index < t2.index) {
        return -1;
      }

      return 0;
    });

    if (tab.index === ctrl.active || !angular.isDefined(ctrl.active) && ctrl.tabs.length === 1) {
      var newActiveIndex = findTabIndex(tab.index);
      ctrl.select(newActiveIndex);
    }
  };

  ctrl.removeTab = function removeTab(tab) {
    var index;
    for (var i = 0; i < ctrl.tabs.length; i++) {
      if (ctrl.tabs[i].tab === tab) {
        index = i;
        break;
      }
    }

    if (ctrl.tabs[index].index === ctrl.active) {
      var newActiveTabIndex = index === ctrl.tabs.length - 1 ?
        index - 1 : index + 1 % ctrl.tabs.length;
      ctrl.select(newActiveTabIndex);
    }

    ctrl.tabs.splice(index, 1);
  };

  $scope.$watch('tabset.active', function(val) {
    if (angular.isDefined(val) && val !== oldIndex) {
      ctrl.select(findTabIndex(val));
    }
  });

  var destroyed;
  $scope.$on('$destroy', function() {
    destroyed = true;
  });

  function findTabIndex(index) {
    for (var i = 0; i < ctrl.tabs.length; i++) {
      if (ctrl.tabs[i].index === index) {
        return i;
      }
    }
  }
}])

.directive('uibTabset', function() {
  return {
    transclude: true,
    replace: true,
    scope: {},
    bindToController: {
      active: '=?',
      type: '@'
    },
    controller: 'UibTabsetController',
    controllerAs: 'tabset',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/tabs/tabset.html';
    },
    link: function(scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ?
        scope.$parent.$eval(attrs.vertical) : false;
      scope.justified = angular.isDefined(attrs.justified) ?
        scope.$parent.$eval(attrs.justified) : false;
    }
  };
})

.directive('uibTab', ['$parse', function($parse) {
  return {
    require: '^uibTabset',
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/tabs/tab.html';
    },
    transclude: true,
    scope: {
      heading: '@',
      index: '=?',
      classes: '@?',
      onSelect: '&select', //This callback is called in contentHeadingTransclude
                          //once it inserts the tab's content into the dom
      onDeselect: '&deselect'
    },
    controller: function() {
      //Empty controller so other directives can require being 'under' a tab
    },
    controllerAs: 'tab',
    link: function(scope, elm, attrs, tabsetCtrl, transclude) {
      scope.disabled = false;
      if (attrs.disable) {
        scope.$parent.$watch($parse(attrs.disable), function(value) {
          scope.disabled = !! value;
        });
      }

      if (angular.isUndefined(attrs.index)) {
        if (tabsetCtrl.tabs && tabsetCtrl.tabs.length) {
          scope.index = Math.max.apply(null, tabsetCtrl.tabs.map(function(t) { return t.index; })) + 1;
        } else {
          scope.index = 0;
        }
      }

      if (angular.isUndefined(attrs.classes)) {
        scope.classes = '';
      }

      scope.select = function(evt) {
        if (!scope.disabled) {
          var index;
          for (var i = 0; i < tabsetCtrl.tabs.length; i++) {
            if (tabsetCtrl.tabs[i].tab === scope) {
              index = i;
              break;
            }
          }

          tabsetCtrl.select(index, evt);
        }
      };

      tabsetCtrl.addTab(scope);
      scope.$on('$destroy', function() {
        tabsetCtrl.removeTab(scope);
      });

      //We need to transclude later, once the content container is ready.
      //when this link happens, we're inside a tab heading.
      scope.$transcludeFn = transclude;
    }
  };
}])

.directive('uibTabHeadingTransclude', function() {
  return {
    restrict: 'A',
    require: '^uibTab',
    link: function(scope, elm) {
      scope.$watch('headingElement', function updateHeadingElement(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
})

.directive('uibTabContentTransclude', function() {
  return {
    restrict: 'A',
    require: '^uibTabset',
    link: function(scope, elm, attrs) {
      var tab = scope.$eval(attrs.uibTabContentTransclude).tab;

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      tab.$transcludeFn(tab.$parent, function(contents) {
        angular.forEach(contents, function(node) {
          if (isTabHeading(node)) {
            //Let tabHeadingTransclude know.
            tab.headingElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };

  function isTabHeading(node) {
    return node.tagName && (
      node.hasAttribute('uib-tab-heading') ||
      node.hasAttribute('data-uib-tab-heading') ||
      node.hasAttribute('x-uib-tab-heading') ||
      node.tagName.toLowerCase() === 'uib-tab-heading' ||
      node.tagName.toLowerCase() === 'data-uib-tab-heading' ||
      node.tagName.toLowerCase() === 'x-uib-tab-heading' ||
      node.tagName.toLowerCase() === 'uib:tab-heading'
    );
  }
});

angular.module('ui.bootstrap.timepicker', [])

.constant('uibTimepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  showMeridian: true,
  showSeconds: false,
  meridians: null,
  readonlyInput: false,
  mousewheel: true,
  arrowkeys: true,
  showSpinners: true,
  templateUrl: 'uib/template/timepicker/timepicker.html'
})

.controller('UibTimepickerController', ['$scope', '$element', '$attrs', '$parse', '$log', '$locale', 'uibTimepickerConfig', function($scope, $element, $attrs, $parse, $log, $locale, timepickerConfig) {
  var selected = new Date(),
    watchers = [],
    ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
    meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS,
    padHours = angular.isDefined($attrs.padHours) ? $scope.$parent.$eval($attrs.padHours) : true;

  $scope.tabindex = angular.isDefined($attrs.tabindex) ? $attrs.tabindex : 0;
  $element.removeAttr('tabindex');

  this.init = function(ngModelCtrl_, inputs) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    ngModelCtrl.$formatters.unshift(function(modelValue) {
      return modelValue ? new Date(modelValue) : null;
    });

    var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1),
        secondsInputEl = inputs.eq(2);

    var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;

    if (mousewheel) {
      this.setupMousewheelEvents(hoursInputEl, minutesInputEl, secondsInputEl);
    }

    var arrowkeys = angular.isDefined($attrs.arrowkeys) ? $scope.$parent.$eval($attrs.arrowkeys) : timepickerConfig.arrowkeys;
    if (arrowkeys) {
      this.setupArrowkeyEvents(hoursInputEl, minutesInputEl, secondsInputEl);
    }

    $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
    this.setupInputEvents(hoursInputEl, minutesInputEl, secondsInputEl);
  };

  var hourStep = timepickerConfig.hourStep;
  if ($attrs.hourStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.hourStep), function(value) {
      hourStep = +value;
    }));
  }

  var minuteStep = timepickerConfig.minuteStep;
  if ($attrs.minuteStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.minuteStep), function(value) {
      minuteStep = +value;
    }));
  }

  var min;
  watchers.push($scope.$parent.$watch($parse($attrs.min), function(value) {
    var dt = new Date(value);
    min = isNaN(dt) ? undefined : dt;
  }));

  var max;
  watchers.push($scope.$parent.$watch($parse($attrs.max), function(value) {
    var dt = new Date(value);
    max = isNaN(dt) ? undefined : dt;
  }));

  var disabled = false;
  if ($attrs.ngDisabled) {
    watchers.push($scope.$parent.$watch($parse($attrs.ngDisabled), function(value) {
      disabled = value;
    }));
  }

  $scope.noIncrementHours = function() {
    var incrementedSelected = addMinutes(selected, hourStep * 60);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementHours = function() {
    var decrementedSelected = addMinutes(selected, -hourStep * 60);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noIncrementMinutes = function() {
    var incrementedSelected = addMinutes(selected, minuteStep);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementMinutes = function() {
    var decrementedSelected = addMinutes(selected, -minuteStep);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noIncrementSeconds = function() {
    var incrementedSelected = addSeconds(selected, secondStep);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementSeconds = function() {
    var decrementedSelected = addSeconds(selected, -secondStep);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noToggleMeridian = function() {
    if (selected.getHours() < 12) {
      return disabled || addMinutes(selected, 12 * 60) > max;
    }

    return disabled || addMinutes(selected, -12 * 60) < min;
  };

  var secondStep = timepickerConfig.secondStep;
  if ($attrs.secondStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.secondStep), function(value) {
      secondStep = +value;
    }));
  }

  $scope.showSeconds = timepickerConfig.showSeconds;
  if ($attrs.showSeconds) {
    watchers.push($scope.$parent.$watch($parse($attrs.showSeconds), function(value) {
      $scope.showSeconds = !!value;
    }));
  }

  // 12H / 24H mode
  $scope.showMeridian = timepickerConfig.showMeridian;
  if ($attrs.showMeridian) {
    watchers.push($scope.$parent.$watch($parse($attrs.showMeridian), function(value) {
      $scope.showMeridian = !!value;

      if (ngModelCtrl.$error.time) {
        // Evaluate from template
        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
        if (angular.isDefined(hours) && angular.isDefined(minutes)) {
          selected.setHours(hours);
          refresh();
        }
      } else {
        updateTemplate();
      }
    }));
  }

  // Get $scope.hours in 24H mode if valid
  function getHoursFromTemplate() {
    var hours = +$scope.hours;
    var valid = $scope.showMeridian ? hours > 0 && hours < 13 :
      hours >= 0 && hours < 24;
    if (!valid || $scope.hours === '') {
      return undefined;
    }

    if ($scope.showMeridian) {
      if (hours === 12) {
        hours = 0;
      }
      if ($scope.meridian === meridians[1]) {
        hours = hours + 12;
      }
    }
    return hours;
  }

  function getMinutesFromTemplate() {
    var minutes = +$scope.minutes;
    var valid = minutes >= 0 && minutes < 60;
    if (!valid || $scope.minutes === '') {
      return undefined;
    }
    return minutes;
  }

  function getSecondsFromTemplate() {
    var seconds = +$scope.seconds;
    return seconds >= 0 && seconds < 60 ? seconds : undefined;
  }

  function pad(value, noPad) {
    if (value === null) {
      return '';
    }

    return angular.isDefined(value) && value.toString().length < 2 && !noPad ?
      '0' + value : value.toString();
  }

  // Respond on mousewheel spin
  this.setupMousewheelEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    var isScrollingUp = function(e) {
      if (e.originalEvent) {
        e = e.originalEvent;
      }
      //pick correct delta variable depending on event
      var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
      return e.detail || delta > 0;
    };

    hoursInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours());
      }
      e.preventDefault();
    });

    minutesInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes());
      }
      e.preventDefault();
    });

     secondsInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementSeconds() : $scope.decrementSeconds());
      }
      e.preventDefault();
    });
  };

  // Respond on up/down arrowkeys
  this.setupArrowkeyEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    hoursInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementHours();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementHours();
          $scope.$apply();
        }
      }
    });

    minutesInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementMinutes();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementMinutes();
          $scope.$apply();
        }
      }
    });

    secondsInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementSeconds();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementSeconds();
          $scope.$apply();
        }
      }
    });
  };

  this.setupInputEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    if ($scope.readonlyInput) {
      $scope.updateHours = angular.noop;
      $scope.updateMinutes = angular.noop;
      $scope.updateSeconds = angular.noop;
      return;
    }

    var invalidate = function(invalidHours, invalidMinutes, invalidSeconds) {
      ngModelCtrl.$setViewValue(null);
      ngModelCtrl.$setValidity('time', false);
      if (angular.isDefined(invalidHours)) {
        $scope.invalidHours = invalidHours;
      }

      if (angular.isDefined(invalidMinutes)) {
        $scope.invalidMinutes = invalidMinutes;
      }

      if (angular.isDefined(invalidSeconds)) {
        $scope.invalidSeconds = invalidSeconds;
      }
    };

    $scope.updateHours = function() {
      var hours = getHoursFromTemplate(),
        minutes = getMinutesFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(hours) && angular.isDefined(minutes)) {
        selected.setHours(hours);
        selected.setMinutes(minutes);
        if (selected < min || selected > max) {
          invalidate(true);
        } else {
          refresh('h');
        }
      } else {
        invalidate(true);
      }
    };

    hoursInputEl.bind('blur', function(e) {
      ngModelCtrl.$setTouched();
      if (modelIsEmpty()) {
        makeValid();
      } else if ($scope.hours === null || $scope.hours === '') {
        invalidate(true);
      } else if (!$scope.invalidHours && $scope.hours < 10) {
        $scope.$apply(function() {
          $scope.hours = pad($scope.hours, !padHours);
        });
      }
    });

    $scope.updateMinutes = function() {
      var minutes = getMinutesFromTemplate(),
        hours = getHoursFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(minutes) && angular.isDefined(hours)) {
        selected.setHours(hours);
        selected.setMinutes(minutes);
        if (selected < min || selected > max) {
          invalidate(undefined, true);
        } else {
          refresh('m');
        }
      } else {
        invalidate(undefined, true);
      }
    };

    minutesInputEl.bind('blur', function(e) {
      ngModelCtrl.$setTouched();
      if (modelIsEmpty()) {
        makeValid();
      } else if ($scope.minutes === null) {
        invalidate(undefined, true);
      } else if (!$scope.invalidMinutes && $scope.minutes < 10) {
        $scope.$apply(function() {
          $scope.minutes = pad($scope.minutes);
        });
      }
    });

    $scope.updateSeconds = function() {
      var seconds = getSecondsFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(seconds)) {
        selected.setSeconds(seconds);
        refresh('s');
      } else {
        invalidate(undefined, undefined, true);
      }
    };

    secondsInputEl.bind('blur', function(e) {
      if (modelIsEmpty()) {
        makeValid();
      } else if (!$scope.invalidSeconds && $scope.seconds < 10) {
        $scope.$apply( function() {
          $scope.seconds = pad($scope.seconds);
        });
      }
    });

  };

  this.render = function() {
    var date = ngModelCtrl.$viewValue;

    if (isNaN(date)) {
      ngModelCtrl.$setValidity('time', false);
      $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
    } else {
      if (date) {
        selected = date;
      }

      if (selected < min || selected > max) {
        ngModelCtrl.$setValidity('time', false);
        $scope.invalidHours = true;
        $scope.invalidMinutes = true;
      } else {
        makeValid();
      }
      updateTemplate();
    }
  };

  // Call internally when we know that model is valid.
  function refresh(keyboardChange) {
    makeValid();
    ngModelCtrl.$setViewValue(new Date(selected));
    updateTemplate(keyboardChange);
  }

  function makeValid() {
    ngModelCtrl.$setValidity('time', true);
    $scope.invalidHours = false;
    $scope.invalidMinutes = false;
    $scope.invalidSeconds = false;
  }

  function updateTemplate(keyboardChange) {
    if (!ngModelCtrl.$modelValue) {
      $scope.hours = null;
      $scope.minutes = null;
      $scope.seconds = null;
      $scope.meridian = meridians[0];
    } else {
      var hours = selected.getHours(),
        minutes = selected.getMinutes(),
        seconds = selected.getSeconds();

      if ($scope.showMeridian) {
        hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
      }

      $scope.hours = keyboardChange === 'h' ? hours : pad(hours, !padHours);
      if (keyboardChange !== 'm') {
        $scope.minutes = pad(minutes);
      }
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];

      if (keyboardChange !== 's') {
        $scope.seconds = pad(seconds);
      }
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
    }
  }

  function addSecondsToSelected(seconds) {
    selected = addSeconds(selected, seconds);
    refresh();
  }

  function addMinutes(selected, minutes) {
    return addSeconds(selected, minutes*60);
  }

  function addSeconds(date, seconds) {
    var dt = new Date(date.getTime() + seconds * 1000);
    var newDate = new Date(date);
    newDate.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds());
    return newDate;
  }

  function modelIsEmpty() {
    return ($scope.hours === null || $scope.hours === '') &&
      ($scope.minutes === null || $scope.minutes === '') &&
      (!$scope.showSeconds || $scope.showSeconds && ($scope.seconds === null || $scope.seconds === ''));
  }

  $scope.showSpinners = angular.isDefined($attrs.showSpinners) ?
    $scope.$parent.$eval($attrs.showSpinners) : timepickerConfig.showSpinners;

  $scope.incrementHours = function() {
    if (!$scope.noIncrementHours()) {
      addSecondsToSelected(hourStep * 60 * 60);
    }
  };

  $scope.decrementHours = function() {
    if (!$scope.noDecrementHours()) {
      addSecondsToSelected(-hourStep * 60 * 60);
    }
  };

  $scope.incrementMinutes = function() {
    if (!$scope.noIncrementMinutes()) {
      addSecondsToSelected(minuteStep * 60);
    }
  };

  $scope.decrementMinutes = function() {
    if (!$scope.noDecrementMinutes()) {
      addSecondsToSelected(-minuteStep * 60);
    }
  };

  $scope.incrementSeconds = function() {
    if (!$scope.noIncrementSeconds()) {
      addSecondsToSelected(secondStep);
    }
  };

  $scope.decrementSeconds = function() {
    if (!$scope.noDecrementSeconds()) {
      addSecondsToSelected(-secondStep);
    }
  };

  $scope.toggleMeridian = function() {
    var minutes = getMinutesFromTemplate(),
        hours = getHoursFromTemplate();

    if (!$scope.noToggleMeridian()) {
      if (angular.isDefined(minutes) && angular.isDefined(hours)) {
        addSecondsToSelected(12 * 60 * (selected.getHours() < 12 ? 60 : -60));
      } else {
        $scope.meridian = $scope.meridian === meridians[0] ? meridians[1] : meridians[0];
      }
    }
  };

  $scope.blur = function() {
    ngModelCtrl.$setTouched();
  };

  $scope.$on('$destroy', function() {
    while (watchers.length) {
      watchers.shift()();
    }
  });
}])

.directive('uibTimepicker', ['uibTimepickerConfig', function(uibTimepickerConfig) {
  return {
    require: ['uibTimepicker', '?^ngModel'],
    controller: 'UibTimepickerController',
    controllerAs: 'timepicker',
    replace: true,
    scope: {},
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || uibTimepickerConfig.templateUrl;
    },
    link: function(scope, element, attrs, ctrls) {
      var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (ngModelCtrl) {
        timepickerCtrl.init(ngModelCtrl, element.find('input'));
      }
    }
  };
}]);

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.debounce', 'ui.bootstrap.position'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('uibTypeaheadParser', ['$parse', function($parse) {
    //                      00000111000000000000022200000000000000003333333333333330000000000044000
    var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function(input) {
        var match = input.match(TYPEAHEAD_REGEXP);
        if (!match) {
          throw new Error(
            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
              ' but got "' + input + '".');
        }

        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }])

  .controller('UibTypeaheadController', ['$scope', '$element', '$attrs', '$compile', '$parse', '$q', '$timeout', '$document', '$window', '$rootScope', '$$debounce', '$uibPosition', 'uibTypeaheadParser',
    function(originalScope, element, attrs, $compile, $parse, $q, $timeout, $document, $window, $rootScope, $$debounce, $position, typeaheadParser) {
    var HOT_KEYS = [9, 13, 27, 38, 40];
    var eventDebounceTime = 200;
    var modelCtrl, ngModelOptions;
    //SUPPORTED ATTRIBUTES (OPTIONS)

    //minimal no of characters that needs to be entered before typeahead kicks-in
    var minLength = originalScope.$eval(attrs.typeaheadMinLength);
    if (!minLength && minLength !== 0) {
      minLength = 1;
    }

    originalScope.$watch(attrs.typeaheadMinLength, function (newVal) {
        minLength = !newVal && newVal !== 0 ? 1 : newVal;
    });

    //minimal wait time after last character typed before typeahead kicks-in
    var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

    //should it restrict model values to the ones selected from the popup only?
    var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
    originalScope.$watch(attrs.typeaheadEditable, function (newVal) {
      isEditable = newVal !== false;
    });

    //binding to a variable that indicates if matches are being retrieved asynchronously
    var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

    //a function to determine if an event should cause selection
    var isSelectEvent = attrs.typeaheadShouldSelect ? $parse(attrs.typeaheadShouldSelect) : function(scope, vals) {
      var evt = vals.$event;
      return evt.which === 13 || evt.which === 9;
    };

    //a callback executed when a match is selected
    var onSelectCallback = $parse(attrs.typeaheadOnSelect);

    //should it select highlighted popup value when losing focus?
    var isSelectOnBlur = angular.isDefined(attrs.typeaheadSelectOnBlur) ? originalScope.$eval(attrs.typeaheadSelectOnBlur) : false;

    //binding to a variable that indicates if there were no results after the query is completed
    var isNoResultsSetter = $parse(attrs.typeaheadNoResults).assign || angular.noop;

    var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

    var appendToBody = attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;

    var appendTo = attrs.typeaheadAppendTo ?
      originalScope.$eval(attrs.typeaheadAppendTo) : null;

    var focusFirst = originalScope.$eval(attrs.typeaheadFocusFirst) !== false;

    //If input matches an item of the list exactly, select it automatically
    var selectOnExact = attrs.typeaheadSelectOnExact ? originalScope.$eval(attrs.typeaheadSelectOnExact) : false;

    //binding to a variable that indicates if dropdown is open
    var isOpenSetter = $parse(attrs.typeaheadIsOpen).assign || angular.noop;

    var showHint = originalScope.$eval(attrs.typeaheadShowHint) || false;

    //INTERNAL VARIABLES

    //model setter executed upon match selection
    var parsedModel = $parse(attrs.ngModel);
    var invokeModelSetter = $parse(attrs.ngModel + '($$$p)');
    var $setModelValue = function(scope, newValue) {
      if (angular.isFunction(parsedModel(originalScope)) &&
        ngModelOptions && ngModelOptions.$options && ngModelOptions.$options.getterSetter) {
        return invokeModelSetter(scope, {$$$p: newValue});
      }

      return parsedModel.assign(scope, newValue);
    };

    //expressions used by typeahead
    var parserResult = typeaheadParser.parse(attrs.uibTypeahead);

    var hasFocus;

    //Used to avoid bug in iOS webview where iOS keyboard does not fire
    //mousedown & mouseup events
    //Issue #3699
    var selected;

    //create a child scope for the typeahead directive so we are not polluting original scope
    //with typeahead-specific data (matches, query etc.)
    var scope = originalScope.$new();
    var offDestroy = originalScope.$on('$destroy', function() {
      scope.$destroy();
    });
    scope.$on('$destroy', offDestroy);

    // WAI-ARIA
    var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
    element.attr({
      'aria-autocomplete': 'list',
      'aria-expanded': false,
      'aria-owns': popupId
    });

    var inputsContainer, hintInputElem;
    //add read-only input to show hint
    if (showHint) {
      inputsContainer = angular.element('<div></div>');
      inputsContainer.css('position', 'relative');
      element.after(inputsContainer);
      hintInputElem = element.clone();
      hintInputElem.attr('placeholder', '');
      hintInputElem.attr('tabindex', '-1');
      hintInputElem.val('');
      hintInputElem.css({
        'position': 'absolute',
        'top': '0px',
        'left': '0px',
        'border-color': 'transparent',
        'box-shadow': 'none',
        'opacity': 1,
        'background': 'none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255)',
        'color': '#999'
      });
      element.css({
        'position': 'relative',
        'vertical-align': 'top',
        'background-color': 'transparent'
      });
      inputsContainer.append(hintInputElem);
      hintInputElem.after(element);
    }

    //pop-up element used to display matches
    var popUpEl = angular.element('<div uib-typeahead-popup></div>');
    popUpEl.attr({
      id: popupId,
      matches: 'matches',
      active: 'activeIdx',
      select: 'select(activeIdx, evt)',
      'move-in-progress': 'moveInProgress',
      query: 'query',
      position: 'position',
      'assign-is-open': 'assignIsOpen(isOpen)',
      debounce: 'debounceUpdate'
    });
    //custom item template
    if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
      popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
    }

    if (angular.isDefined(attrs.typeaheadPopupTemplateUrl)) {
      popUpEl.attr('popup-template-url', attrs.typeaheadPopupTemplateUrl);
    }

    var resetHint = function() {
      if (showHint) {
        hintInputElem.val('');
      }
    };

    var resetMatches = function() {
      scope.matches = [];
      scope.activeIdx = -1;
      element.attr('aria-expanded', false);
      resetHint();
    };

    var getMatchId = function(index) {
      return popupId + '-option-' + index;
    };

    // Indicate that the specified match is the active (pre-selected) item in the list owned by this typeahead.
    // This attribute is added or removed automatically when the `activeIdx` changes.
    scope.$watch('activeIdx', function(index) {
      if (index < 0) {
        element.removeAttr('aria-activedescendant');
      } else {
        element.attr('aria-activedescendant', getMatchId(index));
      }
    });

    var inputIsExactMatch = function(inputValue, index) {
      if (scope.matches.length > index && inputValue) {
        return inputValue.toUpperCase() === scope.matches[index].label.toUpperCase();
      }

      return false;
    };

    var getMatchesAsync = function(inputValue, evt) {
      var locals = {$viewValue: inputValue};
      isLoadingSetter(originalScope, true);
      isNoResultsSetter(originalScope, false);
      $q.when(parserResult.source(originalScope, locals)).then(function(matches) {
        //it might happen that several async queries were in progress if a user were typing fast
        //but we are interested only in responses that correspond to the current view value
        var onCurrentRequest = inputValue === modelCtrl.$viewValue;
        if (onCurrentRequest && hasFocus) {
          if (matches && matches.length > 0) {
            scope.activeIdx = focusFirst ? 0 : -1;
            isNoResultsSetter(originalScope, false);
            scope.matches.length = 0;

            //transform labels
            for (var i = 0; i < matches.length; i++) {
              locals[parserResult.itemName] = matches[i];
              scope.matches.push({
                id: getMatchId(i),
                label: parserResult.viewMapper(scope, locals),
                model: matches[i]
              });
            }

            scope.query = inputValue;
            //position pop-up with matches - we need to re-calculate its position each time we are opening a window
            //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
            //due to other elements being rendered
            recalculatePosition();

            element.attr('aria-expanded', true);

            //Select the single remaining option if user input matches
            if (selectOnExact && scope.matches.length === 1 && inputIsExactMatch(inputValue, 0)) {
              if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                $$debounce(function() {
                  scope.select(0, evt);
                }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
              } else {
                scope.select(0, evt);
              }
            }

            if (showHint) {
              var firstLabel = scope.matches[0].label;
              if (angular.isString(inputValue) &&
                inputValue.length > 0 &&
                firstLabel.slice(0, inputValue.length).toUpperCase() === inputValue.toUpperCase()) {
                hintInputElem.val(inputValue + firstLabel.slice(inputValue.length));
              } else {
                hintInputElem.val('');
              }
            }
          } else {
            resetMatches();
            isNoResultsSetter(originalScope, true);
          }
        }
        if (onCurrentRequest) {
          isLoadingSetter(originalScope, false);
        }
      }, function() {
        resetMatches();
        isLoadingSetter(originalScope, false);
        isNoResultsSetter(originalScope, true);
      });
    };

    // bind events only if appendToBody params exist - performance feature
    if (appendToBody) {
      angular.element($window).on('resize', fireRecalculating);
      $document.find('body').on('scroll', fireRecalculating);
    }

    // Declare the debounced function outside recalculating for
    // proper debouncing
    var debouncedRecalculate = $$debounce(function() {
      // if popup is visible
      if (scope.matches.length) {
        recalculatePosition();
      }

      scope.moveInProgress = false;
    }, eventDebounceTime);

    // Default progress type
    scope.moveInProgress = false;

    function fireRecalculating() {
      if (!scope.moveInProgress) {
        scope.moveInProgress = true;
        scope.$digest();
      }

      debouncedRecalculate();
    }

    // recalculate actual position and set new values to scope
    // after digest loop is popup in right position
    function recalculatePosition() {
      scope.position = appendToBody ? $position.offset(element) : $position.position(element);
      scope.position.top += element.prop('offsetHeight');
    }

    //we need to propagate user's query so we can higlight matches
    scope.query = undefined;

    //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
    var timeoutPromise;

    var scheduleSearchWithTimeout = function(inputValue) {
      timeoutPromise = $timeout(function() {
        getMatchesAsync(inputValue);
      }, waitTime);
    };

    var cancelPreviousTimeout = function() {
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }
    };

    resetMatches();

    scope.assignIsOpen = function (isOpen) {
      isOpenSetter(originalScope, isOpen);
    };

    scope.select = function(activeIdx, evt) {
      //called from within the $digest() cycle
      var locals = {};
      var model, item;

      selected = true;
      locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
      model = parserResult.modelMapper(originalScope, locals);
      $setModelValue(originalScope, model);
      modelCtrl.$setValidity('editable', true);
      modelCtrl.$setValidity('parse', true);

      onSelectCallback(originalScope, {
        $item: item,
        $model: model,
        $label: parserResult.viewMapper(originalScope, locals),
        $event: evt
      });

      resetMatches();

      //return focus to the input element if a match was selected via a mouse click event
      // use timeout to avoid $rootScope:inprog error
      if (scope.$eval(attrs.typeaheadFocusOnSelect) !== false) {
        $timeout(function() { element[0].focus(); }, 0, false);
      }
    };

    //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
    element.on('keydown', function(evt) {
      //typeahead is open and an "interesting" key was pressed
      if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
        return;
      }

      var shouldSelect = isSelectEvent(originalScope, {$event: evt});

      /**
       * if there's nothing selected (i.e. focusFirst) and enter or tab is hit
       * or
       * shift + tab is pressed to bring focus to the previous element
       * then clear the results
       */
      if (scope.activeIdx === -1 && shouldSelect || evt.which === 9 && !!evt.shiftKey) {
        resetMatches();
        scope.$digest();
        return;
      }

      evt.preventDefault();
      var target;
      switch (evt.which) {
        case 27: // escape
          evt.stopPropagation();

          resetMatches();
          originalScope.$digest();
          break;
        case 38: // up arrow
          scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.matches.length) - 1;
          scope.$digest();
          target = popUpEl.find('li')[scope.activeIdx];
          target.parentNode.scrollTop = target.offsetTop;
          break;
        case 40: // down arrow
          scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
          scope.$digest();
          target = popUpEl.find('li')[scope.activeIdx];
          target.parentNode.scrollTop = target.offsetTop;
          break;
        default:
          if (shouldSelect) {
            scope.$apply(function() {
              if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                $$debounce(function() {
                  scope.select(scope.activeIdx, evt);
                }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
              } else {
                scope.select(scope.activeIdx, evt);
              }
            });
          }
      }
    });

    element.bind('focus', function (evt) {
      hasFocus = true;
      if (minLength === 0 && !modelCtrl.$viewValue) {
        $timeout(function() {
          getMatchesAsync(modelCtrl.$viewValue, evt);
        }, 0);
      }
    });

    element.bind('blur', function(evt) {
      if (isSelectOnBlur && scope.matches.length && scope.activeIdx !== -1 && !selected) {
        selected = true;
        scope.$apply(function() {
          if (angular.isObject(scope.debounceUpdate) && angular.isNumber(scope.debounceUpdate.blur)) {
            $$debounce(function() {
              scope.select(scope.activeIdx, evt);
            }, scope.debounceUpdate.blur);
          } else {
            scope.select(scope.activeIdx, evt);
          }
        });
      }
      if (!isEditable && modelCtrl.$error.editable) {
        modelCtrl.$setViewValue();
        // Reset validity as we are clearing
        modelCtrl.$setValidity('editable', true);
        modelCtrl.$setValidity('parse', true);
        element.val('');
      }
      hasFocus = false;
      selected = false;
    });

    // Keep reference to click handler to unbind it.
    var dismissClickHandler = function(evt) {
      // Issue #3973
      // Firefox treats right click as a click on document
      if (element[0] !== evt.target && evt.which !== 3 && scope.matches.length !== 0) {
        resetMatches();
        if (!$rootScope.$$phase) {
          originalScope.$digest();
        }
      }
    };

    $document.on('click', dismissClickHandler);

    originalScope.$on('$destroy', function() {
      $document.off('click', dismissClickHandler);
      if (appendToBody || appendTo) {
        $popup.remove();
      }

      if (appendToBody) {
        angular.element($window).off('resize', fireRecalculating);
        $document.find('body').off('scroll', fireRecalculating);
      }
      // Prevent jQuery cache memory leak
      popUpEl.remove();

      if (showHint) {
          inputsContainer.remove();
      }
    });

    var $popup = $compile(popUpEl)(scope);

    if (appendToBody) {
      $document.find('body').append($popup);
    } else if (appendTo) {
      angular.element(appendTo).eq(0).append($popup);
    } else {
      element.after($popup);
    }

    this.init = function(_modelCtrl, _ngModelOptions) {
      modelCtrl = _modelCtrl;
      ngModelOptions = _ngModelOptions;

      scope.debounceUpdate = modelCtrl.$options && $parse(modelCtrl.$options.debounce)(originalScope);

      //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
      //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
      modelCtrl.$parsers.unshift(function(inputValue) {
        hasFocus = true;

        if (minLength === 0 || inputValue && inputValue.length >= minLength) {
          if (waitTime > 0) {
            cancelPreviousTimeout();
            scheduleSearchWithTimeout(inputValue);
          } else {
            getMatchesAsync(inputValue);
          }
        } else {
          isLoadingSetter(originalScope, false);
          cancelPreviousTimeout();
          resetMatches();
        }

        if (isEditable) {
          return inputValue;
        }

        if (!inputValue) {
          // Reset in case user had typed something previously.
          modelCtrl.$setValidity('editable', true);
          return null;
        }

        modelCtrl.$setValidity('editable', false);
        return undefined;
      });

      modelCtrl.$formatters.push(function(modelValue) {
        var candidateViewValue, emptyViewValue;
        var locals = {};

        // The validity may be set to false via $parsers (see above) if
        // the model is restricted to selected values. If the model
        // is set manually it is considered to be valid.
        if (!isEditable) {
          modelCtrl.$setValidity('editable', true);
        }

        if (inputFormatter) {
          locals.$model = modelValue;
          return inputFormatter(originalScope, locals);
        }

        //it might happen that we don't have enough info to properly render input value
        //we need to check for this situation and simply return model value if we can't apply custom formatting
        locals[parserResult.itemName] = modelValue;
        candidateViewValue = parserResult.viewMapper(originalScope, locals);
        locals[parserResult.itemName] = undefined;
        emptyViewValue = parserResult.viewMapper(originalScope, locals);

        return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
      });
    };
  }])

  .directive('uibTypeahead', function() {
    return {
      controller: 'UibTypeaheadController',
      require: ['ngModel', '^?ngModelOptions', 'uibTypeahead'],
      link: function(originalScope, element, attrs, ctrls) {
        ctrls[2].init(ctrls[0], ctrls[1]);
      }
    };
  })

  .directive('uibTypeaheadPopup', ['$$debounce', function($$debounce) {
    return {
      scope: {
        matches: '=',
        query: '=',
        active: '=',
        position: '&',
        moveInProgress: '=',
        select: '&',
        assignIsOpen: '&',
        debounce: '&'
      },
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.popupTemplateUrl || 'uib/template/typeahead/typeahead-popup.html';
      },
      link: function(scope, element, attrs) {
        scope.templateUrl = attrs.templateUrl;

        scope.isOpen = function() {
          var isDropdownOpen = scope.matches.length > 0;
          scope.assignIsOpen({ isOpen: isDropdownOpen });
          return isDropdownOpen;
        };

        scope.isActive = function(matchIdx) {
          return scope.active === matchIdx;
        };

        scope.selectActive = function(matchIdx) {
          scope.active = matchIdx;
        };

        scope.selectMatch = function(activeIdx, evt) {
          var debounce = scope.debounce();
          if (angular.isNumber(debounce) || angular.isObject(debounce)) {
            $$debounce(function() {
              scope.select({activeIdx: activeIdx, evt: evt});
            }, angular.isNumber(debounce) ? debounce : debounce['default']);
          } else {
            scope.select({activeIdx: activeIdx, evt: evt});
          }
        };
      }
    };
  }])

  .directive('uibTypeaheadMatch', ['$templateRequest', '$compile', '$parse', function($templateRequest, $compile, $parse) {
    return {
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function(scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'uib/template/typeahead/typeahead-match.html';
        $templateRequest(tplUrl).then(function(tplContent) {
          var tplEl = angular.element(tplContent.trim());
          element.replaceWith(tplEl);
          $compile(tplEl)(scope);
        });
      }
    };
  }])

  .filter('uibTypeaheadHighlight', ['$sce', '$injector', '$log', function($sce, $injector, $log) {
    var isSanitizePresent;
    isSanitizePresent = $injector.has('$sanitize');

    function escapeRegexp(queryToEscape) {
      // Regex: capture the whole query string and replace it with the string that will be used to match
      // the results, for example if the capture is "a" the result will be \a
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }

    function containsHtml(matchItem) {
      return /<.*>/g.test(matchItem);
    }

    return function(matchItem, query) {
      if (!isSanitizePresent && containsHtml(matchItem)) {
        $log.warn('Unsafe use of typeahead please use ngSanitize'); // Warn the user about the danger
      }
      matchItem = query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem; // Replaces the capture string with a the same string inside of a "strong" tag
      if (!isSanitizePresent) {
        matchItem = $sce.trustAsHtml(matchItem); // If $sanitize is not present we pack the string in a $sce object for the ng-bind-html directive
      }
      return matchItem;
    };
  }]);

angular.module("uib/template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/accordion/accordion-group.html",
    "<div class=\"panel\" ng-class=\"panelClass || 'panel-default'\">\n" +
    "  <div role=\"tab\" id=\"{{::headingId}}\" aria-selected=\"{{isOpen}}\" class=\"panel-heading\" ng-keypress=\"toggleOpen($event)\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a role=\"button\" data-toggle=\"collapse\" href aria-expanded=\"{{isOpen}}\" aria-controls=\"{{::panelId}}\" tabindex=\"0\" class=\"accordion-toggle\" ng-click=\"toggleOpen()\" uib-accordion-transclude=\"heading\"><span uib-accordion-header ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div id=\"{{::panelId}}\" aria-labelledby=\"{{::headingId}}\" aria-hidden=\"{{!isOpen}}\" role=\"tabpanel\" class=\"panel-collapse collapse\" uib-collapse=\"!isOpen\">\n" +
    "    <div class=\"panel-body\" ng-transclude></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/accordion/accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/accordion/accordion.html",
    "<div role=\"tablist\" class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("uib/template/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/alert/alert.html",
    "<div class=\"alert\" ng-class=\"['alert-' + (type || 'warning'), closeable ? 'alert-dismissible' : null]\" role=\"alert\">\n" +
    "    <button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close({$event: $event})\">\n" +
    "        <span aria-hidden=\"true\">&times;</span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "    </button>\n" +
    "    <div ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/carousel/carousel.html",
    "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\">\n" +
    "  <div class=\"carousel-inner\" ng-transclude></div>\n" +
    "  <a role=\"button\" href class=\"left carousel-control\" ng-click=\"prev()\" ng-class=\"{ disabled: isPrevDisabled() }\" ng-show=\"slides.length > 1\">\n" +
    "    <span aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-left\"></span>\n" +
    "    <span class=\"sr-only\">previous</span>\n" +
    "  </a>\n" +
    "  <a role=\"button\" href class=\"right carousel-control\" ng-click=\"next()\" ng-class=\"{ disabled: isNextDisabled() }\" ng-show=\"slides.length > 1\">\n" +
    "    <span aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-right\"></span>\n" +
    "    <span class=\"sr-only\">next</span>\n" +
    "  </a>\n" +
    "  <ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
    "    <li ng-repeat=\"slide in slides | orderBy:indexOfSlide track by $index\" ng-class=\"{ active: isActive(slide) }\" ng-click=\"select(slide)\">\n" +
    "      <span class=\"sr-only\">slide {{ $index + 1 }} of {{ slides.length }}<span ng-if=\"isActive(slide)\">, currently active</span></span>\n" +
    "    </li>\n" +
    "  </ol>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/carousel/slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/carousel/slide.html",
    "<div ng-class=\"{\n" +
    "    'active': active\n" +
    "  }\" class=\"item text-center\" ng-transclude></div>\n" +
    "");
}]);

angular.module("uib/template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/datepicker.html",
    "<div class=\"uib-datepicker\" ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
    "  <uib-daypicker ng-switch-when=\"day\" tabindex=\"0\"></uib-daypicker>\n" +
    "  <uib-monthpicker ng-switch-when=\"month\" tabindex=\"0\"></uib-monthpicker>\n" +
    "  <uib-yearpicker ng-switch-when=\"year\" tabindex=\"0\"></uib-yearpicker>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/day.html",
    "<table class=\"uib-daypicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <th ng-if=\"showWeeks\" class=\"text-center\"></th>\n" +
    "      <th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"uib-weeks\" ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row\" class=\"uib-day text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default btn-sm\"\n" +
    "          uib-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-muted': dt.secondary, 'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/datepicker/month.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/month.html",
    "<table class=\"uib-monthpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"uib-months\" ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row\" class=\"uib-month text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\"\n" +
    "          uib-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/datepicker/year.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/year.html",
    "<table class=\"uib-yearpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::columns - 2}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"uib-years\" ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row\" class=\"uib-year text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\"\n" +
    "          uib-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/datepickerPopup/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepickerPopup/popup.html",
    "<div>\n" +
    "  <ul class=\"uib-datepicker-popup dropdown-menu uib-position-measure\" dropdown-nested ng-if=\"isOpen\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
    "    <li ng-transclude></li>\n" +
    "    <li ng-if=\"showButtonBar\" class=\"uib-button-bar\">\n" +
    "      <span class=\"btn-group pull-left\">\n" +
    "        <button type=\"button\" class=\"btn btn-sm btn-info uib-datepicker-current\" ng-click=\"select('today', $event)\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
    "        <button type=\"button\" class=\"btn btn-sm btn-danger uib-clear\" ng-click=\"select(null, $event)\">{{ getText('clear') }}</button>\n" +
    "      </span>\n" +
    "      <button type=\"button\" class=\"btn btn-sm btn-success pull-right uib-close\" ng-click=\"close($event)\">{{ getText('close') }}</button>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/modal/backdrop.html",
    "<div class=\"modal-backdrop\"\n" +
    "     uib-modal-animation-class=\"fade\"\n" +
    "     modal-in-class=\"in\"\n" +
    "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
    "></div>\n" +
    "");
}]);

angular.module("uib/template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/modal/window.html",
    "<div modal-render=\"{{$isRendered}}\" tabindex=\"-1\" role=\"dialog\" class=\"modal\"\n" +
    "    uib-modal-animation-class=\"fade\"\n" +
    "    modal-in-class=\"in\"\n" +
    "    ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\">\n" +
    "    <div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\"><div class=\"modal-content\" uib-modal-transclude></div></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/pager/pager.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/pager/pager.html",
    "<ul class=\"pager\">\n" +
    "  <li ng-class=\"{disabled: noPrevious()||ngDisabled, previous: align}\"><a href ng-click=\"selectPage(page - 1, $event)\">{{::getText('previous')}}</a></li>\n" +
    "  <li ng-class=\"{disabled: noNext()||ngDisabled, next: align}\"><a href ng-click=\"selectPage(page + 1, $event)\">{{::getText('next')}}</a></li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("uib/template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-first\"><a href ng-click=\"selectPage(1, $event)\">{{::getText('first')}}</a></li>\n" +
    "  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-prev\"><a href ng-click=\"selectPage(page - 1, $event)\">{{::getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active,disabled: ngDisabled&&!page.active}\" class=\"pagination-page\"><a href ng-click=\"selectPage(page.number, $event)\">{{page.text}}</a></li>\n" +
    "  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-next\"><a href ng-click=\"selectPage(page + 1, $event)\">{{::getText('next')}}</a></li>\n" +
    "  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-last\"><a href ng-click=\"selectPage(totalPages, $event)\">{{::getText('last')}}</a></li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("uib/template/tooltip/tooltip-html-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tooltip/tooltip-html-popup.html",
    "<div class=\"tooltip\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  uib-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind-html=\"contentExp()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  uib-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/tooltip/tooltip-template-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tooltip/tooltip-template-popup.html",
    "<div class=\"tooltip\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  uib-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\"\n" +
    "    uib-tooltip-template-transclude=\"contentExp()\"\n" +
    "    tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/popover/popover-html.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/popover/popover-html.html",
    "<div class=\"popover\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  uib-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"uibTitle\" ng-if=\"uibTitle\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind-html=\"contentExp()\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/popover/popover-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/popover/popover-template.html",
    "<div class=\"popover\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  uib-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"uibTitle\" ng-if=\"uibTitle\"></h3>\n" +
    "      <div class=\"popover-content\"\n" +
    "        uib-tooltip-template-transclude=\"contentExp()\"\n" +
    "        tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/popover/popover.html",
    "<div class=\"popover\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  uib-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"uibTitle\" ng-if=\"uibTitle\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
    "");
}]);

angular.module("uib/template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude aria-labelledby=\"{{::title}}\"></div>");
}]);

angular.module("uib/template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/progressbar/progressbar.html",
    "<div class=\"progress\">\n" +
    "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/rating/rating.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/rating/rating.html",
    "<span ng-mouseleave=\"reset()\" ng-keydown=\"onKeydown($event)\" tabindex=\"0\" role=\"slider\" aria-valuemin=\"0\" aria-valuemax=\"{{range.length}}\" aria-valuenow=\"{{value}}\" aria-valuetext=\"{{title}}\">\n" +
    "    <span ng-repeat-start=\"r in range track by $index\" class=\"sr-only\">({{ $index < value ? '*' : ' ' }})</span>\n" +
    "    <i ng-repeat-end ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < value && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\" ng-attr-title=\"{{r.title}}\"></i>\n" +
    "</span>\n" +
    "");
}]);

angular.module("uib/template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tabs/tab.html",
    "<li ng-class=\"[{active: active, disabled: disabled}, classes]\" class=\"uib-tab nav-item\">\n" +
    "  <a href ng-click=\"select($event)\" class=\"nav-link\" uib-tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("uib/template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tabs/tabset.html",
    "<div>\n" +
    "  <ul class=\"nav nav-{{tabset.type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\"\n" +
    "         ng-repeat=\"tab in tabset.tabs\"\n" +
    "         ng-class=\"{active: tabset.active === tab.index}\"\n" +
    "         uib-tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/timepicker/timepicker.html",
    "<table class=\"uib-timepicker\">\n" +
    "  <tbody>\n" +
    "    <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
    "      <td class=\"uib-increment hours\"><a ng-click=\"incrementHours()\" ng-class=\"{disabled: noIncrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementHours()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "      <td>&nbsp;</td>\n" +
    "      <td class=\"uib-increment minutes\"><a ng-click=\"incrementMinutes()\" ng-class=\"{disabled: noIncrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementMinutes()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "      <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
    "      <td ng-show=\"showSeconds\" class=\"uib-increment seconds\"><a ng-click=\"incrementSeconds()\" ng-class=\"{disabled: noIncrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementSeconds()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "      <td ng-show=\"showMeridian\"></td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <td class=\"form-group uib-time hours\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "        <input type=\"text\" placeholder=\"HH\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementHours()\" ng-blur=\"blur()\">\n" +
    "      </td>\n" +
    "      <td class=\"uib-separator\">:</td>\n" +
    "      <td class=\"form-group uib-time minutes\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "        <input type=\"text\" placeholder=\"MM\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementMinutes()\" ng-blur=\"blur()\">\n" +
    "      </td>\n" +
    "      <td ng-show=\"showSeconds\" class=\"uib-separator\">:</td>\n" +
    "      <td class=\"form-group uib-time seconds\" ng-class=\"{'has-error': invalidSeconds}\" ng-show=\"showSeconds\">\n" +
    "        <input type=\"text\" placeholder=\"SS\" ng-model=\"seconds\" ng-change=\"updateSeconds()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementSeconds()\" ng-blur=\"blur()\">\n" +
    "      </td>\n" +
    "      <td ng-show=\"showMeridian\" class=\"uib-time am-pm\"><button type=\"button\" ng-class=\"{disabled: noToggleMeridian()}\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\" ng-disabled=\"noToggleMeridian()\" tabindex=\"{{::tabindex}}\">{{meridian}}</button></td>\n" +
    "    </tr>\n" +
    "    <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
    "      <td class=\"uib-decrement hours\"><a ng-click=\"decrementHours()\" ng-class=\"{disabled: noDecrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementHours()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "      <td>&nbsp;</td>\n" +
    "      <td class=\"uib-decrement minutes\"><a ng-click=\"decrementMinutes()\" ng-class=\"{disabled: noDecrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementMinutes()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "      <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
    "      <td ng-show=\"showSeconds\" class=\"uib-decrement seconds\"><a ng-click=\"decrementSeconds()\" ng-class=\"{disabled: noDecrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementSeconds()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "      <td ng-show=\"showMeridian\"></td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/typeahead/typeahead-match.html",
    "<a href\n" +
    "   tabindex=\"-1\"\n" +
    "   ng-bind-html=\"match.label | uibTypeaheadHighlight:query\"\n" +
    "   ng-attr-title=\"{{match.label}}\"></a>\n" +
    "");
}]);

angular.module("uib/template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-show=\"isOpen() && !moveInProgress\" ng-style=\"{top: position().top+'px', left: position().left+'px'}\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
    "    <li ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index, $event)\" role=\"option\" id=\"{{::match.id}}\">\n" +
    "        <div uib-typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>\n" +
    "");
}]);
angular.module('ui.bootstrap.carousel').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibCarouselCss && angular.element(document).find('head').prepend('<style type="text/css">.ng-animate.item:not(.left):not(.right){-webkit-transition:0s ease-in-out left;transition:0s ease-in-out left}</style>'); angular.$$uibCarouselCss = true; });
angular.module('ui.bootstrap.datepicker').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibDatepickerCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker .uib-title{width:100%;}.uib-day button,.uib-month button,.uib-year button{min-width:100%;}.uib-left,.uib-right{width:100%}</style>'); angular.$$uibDatepickerCss = true; });
angular.module('ui.bootstrap.position').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibPositionCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-position-measure{display:block !important;visibility:hidden !important;position:absolute !important;top:-9999px !important;left:-9999px !important;}.uib-position-scrollbar-measure{position:absolute !important;top:-9999px !important;width:50px !important;height:50px !important;overflow:scroll !important;}.uib-position-body-scrollbar-measure{overflow:scroll !important;}</style>'); angular.$$uibPositionCss = true; });
angular.module('ui.bootstrap.datepickerPopup').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibDatepickerpopupCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker-popup.dropdown-menu{display:block;float:none;margin:0;}.uib-button-bar{padding:10px 9px 2px;}</style>'); angular.$$uibDatepickerpopupCss = true; });
angular.module('ui.bootstrap.tooltip').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTooltipCss && angular.element(document).find('head').prepend('<style type="text/css">[uib-tooltip-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-bottom > .tooltip-arrow,[uib-popover-popup].popover.top-left > .arrow,[uib-popover-popup].popover.top-right > .arrow,[uib-popover-popup].popover.bottom-left > .arrow,[uib-popover-popup].popover.bottom-right > .arrow,[uib-popover-popup].popover.left-top > .arrow,[uib-popover-popup].popover.left-bottom > .arrow,[uib-popover-popup].popover.right-top > .arrow,[uib-popover-popup].popover.right-bottom > .arrow,[uib-popover-html-popup].popover.top-left > .arrow,[uib-popover-html-popup].popover.top-right > .arrow,[uib-popover-html-popup].popover.bottom-left > .arrow,[uib-popover-html-popup].popover.bottom-right > .arrow,[uib-popover-html-popup].popover.left-top > .arrow,[uib-popover-html-popup].popover.left-bottom > .arrow,[uib-popover-html-popup].popover.right-top > .arrow,[uib-popover-html-popup].popover.right-bottom > .arrow,[uib-popover-template-popup].popover.top-left > .arrow,[uib-popover-template-popup].popover.top-right > .arrow,[uib-popover-template-popup].popover.bottom-left > .arrow,[uib-popover-template-popup].popover.bottom-right > .arrow,[uib-popover-template-popup].popover.left-top > .arrow,[uib-popover-template-popup].popover.left-bottom > .arrow,[uib-popover-template-popup].popover.right-top > .arrow,[uib-popover-template-popup].popover.right-bottom > .arrow{top:auto;bottom:auto;left:auto;right:auto;margin:0;}[uib-popover-popup].popover,[uib-popover-html-popup].popover,[uib-popover-template-popup].popover{display:block !important;}</style>'); angular.$$uibTooltipCss = true; });
angular.module('ui.bootstrap.timepicker').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTimepickerCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-time input{width:50px;}</style>'); angular.$$uibTimepickerCss = true; });
angular.module('ui.bootstrap.typeahead').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTypeaheadCss && angular.element(document).find('head').prepend('<style type="text/css">[uib-typeahead-popup].dropdown-menu{display:block;}</style>'); angular.$$uibTypeaheadCss = true; });
}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js","/../node_modules/angular-ui-bootstrap/dist")
},{"buffer":9,"pBGvAp":11}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 AngularJS v1.5.7
 (c) 2010-2016 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(E){'use strict';function O(a){return function(){var b=arguments[0],d;d="["+(a?a+":":"")+b+"] http://errors.angularjs.org/1.5.7/"+(a?a+"/":"")+b;for(b=1;b<arguments.length;b++){d=d+(1==b?"?":"&")+"p"+(b-1)+"=";var c=encodeURIComponent,e;e=arguments[b];e="function"==typeof e?e.toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof e?"undefined":"string"!=typeof e?JSON.stringify(e):e;d+=c(e)}return Error(d)}}function oa(a){if(null==a||Wa(a))return!1;if(J(a)||F(a)||B&&a instanceof B)return!0;
var b="length"in Object(a)&&a.length;return S(b)&&(0<=b&&(b-1 in a||a instanceof Array)||"function"==typeof a.item)}function r(a,b,d){var c,e;if(a)if(z(a))for(c in a)"prototype"==c||"length"==c||"name"==c||a.hasOwnProperty&&!a.hasOwnProperty(c)||b.call(d,a[c],c,a);else if(J(a)||oa(a)){var f="object"!==typeof a;c=0;for(e=a.length;c<e;c++)(f||c in a)&&b.call(d,a[c],c,a)}else if(a.forEach&&a.forEach!==r)a.forEach(b,d,a);else if(sc(a))for(c in a)b.call(d,a[c],c,a);else if("function"===typeof a.hasOwnProperty)for(c in a)a.hasOwnProperty(c)&&
b.call(d,a[c],c,a);else for(c in a)sa.call(a,c)&&b.call(d,a[c],c,a);return a}function tc(a,b,d){for(var c=Object.keys(a).sort(),e=0;e<c.length;e++)b.call(d,a[c[e]],c[e]);return c}function uc(a){return function(b,d){a(d,b)}}function Zd(){return++pb}function Pb(a,b,d){for(var c=a.$$hashKey,e=0,f=b.length;e<f;++e){var g=b[e];if(H(g)||z(g))for(var h=Object.keys(g),k=0,l=h.length;k<l;k++){var m=h[k],n=g[m];d&&H(n)?ia(n)?a[m]=new Date(n.valueOf()):Xa(n)?a[m]=new RegExp(n):n.nodeName?a[m]=n.cloneNode(!0):
Qb(n)?a[m]=n.clone():(H(a[m])||(a[m]=J(n)?[]:{}),Pb(a[m],[n],!0)):a[m]=n}}c?a.$$hashKey=c:delete a.$$hashKey;return a}function R(a){return Pb(a,ta.call(arguments,1),!1)}function $d(a){return Pb(a,ta.call(arguments,1),!0)}function aa(a){return parseInt(a,10)}function Rb(a,b){return R(Object.create(a),b)}function A(){}function Ya(a){return a}function da(a){return function(){return a}}function vc(a){return z(a.toString)&&a.toString!==ka}function w(a){return"undefined"===typeof a}function x(a){return"undefined"!==
typeof a}function H(a){return null!==a&&"object"===typeof a}function sc(a){return null!==a&&"object"===typeof a&&!wc(a)}function F(a){return"string"===typeof a}function S(a){return"number"===typeof a}function ia(a){return"[object Date]"===ka.call(a)}function z(a){return"function"===typeof a}function Xa(a){return"[object RegExp]"===ka.call(a)}function Wa(a){return a&&a.window===a}function Za(a){return a&&a.$evalAsync&&a.$watch}function Ea(a){return"boolean"===typeof a}function ae(a){return a&&S(a.length)&&
be.test(ka.call(a))}function Qb(a){return!(!a||!(a.nodeName||a.prop&&a.attr&&a.find))}function ce(a){var b={};a=a.split(",");var d;for(d=0;d<a.length;d++)b[a[d]]=!0;return b}function ua(a){return M(a.nodeName||a[0]&&a[0].nodeName)}function $a(a,b){var d=a.indexOf(b);0<=d&&a.splice(d,1);return d}function Z(a,b){function d(a,b){var d=b.$$hashKey,e;if(J(a)){e=0;for(var f=a.length;e<f;e++)b.push(c(a[e]))}else if(sc(a))for(e in a)b[e]=c(a[e]);else if(a&&"function"===typeof a.hasOwnProperty)for(e in a)a.hasOwnProperty(e)&&
(b[e]=c(a[e]));else for(e in a)sa.call(a,e)&&(b[e]=c(a[e]));d?b.$$hashKey=d:delete b.$$hashKey;return b}function c(a){if(!H(a))return a;var b=f.indexOf(a);if(-1!==b)return g[b];if(Wa(a)||Za(a))throw za("cpws");var b=!1,c=e(a);void 0===c&&(c=J(a)?[]:Object.create(wc(a)),b=!0);f.push(a);g.push(c);return b?d(a,c):c}function e(a){switch(ka.call(a)){case "[object Int8Array]":case "[object Int16Array]":case "[object Int32Array]":case "[object Float32Array]":case "[object Float64Array]":case "[object Uint8Array]":case "[object Uint8ClampedArray]":case "[object Uint16Array]":case "[object Uint32Array]":return new a.constructor(c(a.buffer));
case "[object ArrayBuffer]":if(!a.slice){var b=new ArrayBuffer(a.byteLength);(new Uint8Array(b)).set(new Uint8Array(a));return b}return a.slice(0);case "[object Boolean]":case "[object Number]":case "[object String]":case "[object Date]":return new a.constructor(a.valueOf());case "[object RegExp]":return b=new RegExp(a.source,a.toString().match(/[^\/]*$/)[0]),b.lastIndex=a.lastIndex,b;case "[object Blob]":return new a.constructor([a],{type:a.type})}if(z(a.cloneNode))return a.cloneNode(!0)}var f=[],
g=[];if(b){if(ae(b)||"[object ArrayBuffer]"===ka.call(b))throw za("cpta");if(a===b)throw za("cpi");J(b)?b.length=0:r(b,function(a,d){"$$hashKey"!==d&&delete b[d]});f.push(a);g.push(b);return d(a,b)}return c(a)}function na(a,b){if(a===b)return!0;if(null===a||null===b)return!1;if(a!==a&&b!==b)return!0;var d=typeof a,c;if(d==typeof b&&"object"==d)if(J(a)){if(!J(b))return!1;if((d=a.length)==b.length){for(c=0;c<d;c++)if(!na(a[c],b[c]))return!1;return!0}}else{if(ia(a))return ia(b)?na(a.getTime(),b.getTime()):
!1;if(Xa(a))return Xa(b)?a.toString()==b.toString():!1;if(Za(a)||Za(b)||Wa(a)||Wa(b)||J(b)||ia(b)||Xa(b))return!1;d=T();for(c in a)if("$"!==c.charAt(0)&&!z(a[c])){if(!na(a[c],b[c]))return!1;d[c]=!0}for(c in b)if(!(c in d)&&"$"!==c.charAt(0)&&x(b[c])&&!z(b[c]))return!1;return!0}return!1}function ab(a,b,d){return a.concat(ta.call(b,d))}function bb(a,b){var d=2<arguments.length?ta.call(arguments,2):[];return!z(b)||b instanceof RegExp?b:d.length?function(){return arguments.length?b.apply(a,ab(d,arguments,
0)):b.apply(a,d)}:function(){return arguments.length?b.apply(a,arguments):b.call(a)}}function de(a,b){var d=b;"string"===typeof a&&"$"===a.charAt(0)&&"$"===a.charAt(1)?d=void 0:Wa(b)?d="$WINDOW":b&&E.document===b?d="$DOCUMENT":Za(b)&&(d="$SCOPE");return d}function cb(a,b){if(!w(a))return S(b)||(b=b?2:null),JSON.stringify(a,de,b)}function xc(a){return F(a)?JSON.parse(a):a}function yc(a,b){a=a.replace(ee,"");var d=Date.parse("Jan 01, 1970 00:00:00 "+a)/6E4;return isNaN(d)?b:d}function Sb(a,b,d){d=d?
-1:1;var c=a.getTimezoneOffset();b=yc(b,c);d*=b-c;a=new Date(a.getTime());a.setMinutes(a.getMinutes()+d);return a}function va(a){a=B(a).clone();try{a.empty()}catch(b){}var d=B("<div>").append(a).html();try{return a[0].nodeType===Na?M(d):d.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,function(a,b){return"<"+M(b)})}catch(c){return M(d)}}function zc(a){try{return decodeURIComponent(a)}catch(b){}}function Ac(a){var b={};r((a||"").split("&"),function(a){var c,e,f;a&&(e=a=a.replace(/\+/g,"%20"),c=a.indexOf("="),
-1!==c&&(e=a.substring(0,c),f=a.substring(c+1)),e=zc(e),x(e)&&(f=x(f)?zc(f):!0,sa.call(b,e)?J(b[e])?b[e].push(f):b[e]=[b[e],f]:b[e]=f))});return b}function Tb(a){var b=[];r(a,function(a,c){J(a)?r(a,function(a){b.push(ja(c,!0)+(!0===a?"":"="+ja(a,!0)))}):b.push(ja(c,!0)+(!0===a?"":"="+ja(a,!0)))});return b.length?b.join("&"):""}function qb(a){return ja(a,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function ja(a,b){return encodeURIComponent(a).replace(/%40/gi,"@").replace(/%3A/gi,
":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%3B/gi,";").replace(/%20/g,b?"%20":"+")}function fe(a,b){var d,c,e=Oa.length;for(c=0;c<e;++c)if(d=Oa[c]+b,F(d=a.getAttribute(d)))return d;return null}function ge(a,b){var d,c,e={};r(Oa,function(b){b+="app";!d&&a.hasAttribute&&a.hasAttribute(b)&&(d=a,c=a.getAttribute(b))});r(Oa,function(b){b+="app";var e;!d&&(e=a.querySelector("["+b.replace(":","\\:")+"]"))&&(d=e,c=e.getAttribute(b))});d&&(e.strictDi=null!==fe(d,"strict-di"),b(d,c?[c]:[],e))}function Bc(a,
b,d){H(d)||(d={});d=R({strictDi:!1},d);var c=function(){a=B(a);if(a.injector()){var c=a[0]===E.document?"document":va(a);throw za("btstrpd",c.replace(/</,"&lt;").replace(/>/,"&gt;"));}b=b||[];b.unshift(["$provide",function(b){b.value("$rootElement",a)}]);d.debugInfoEnabled&&b.push(["$compileProvider",function(a){a.debugInfoEnabled(!0)}]);b.unshift("ng");c=db(b,d.strictDi);c.invoke(["$rootScope","$rootElement","$compile","$injector",function(a,b,d,c){a.$apply(function(){b.data("$injector",c);d(b)(a)})}]);
return c},e=/^NG_ENABLE_DEBUG_INFO!/,f=/^NG_DEFER_BOOTSTRAP!/;E&&e.test(E.name)&&(d.debugInfoEnabled=!0,E.name=E.name.replace(e,""));if(E&&!f.test(E.name))return c();E.name=E.name.replace(f,"");ea.resumeBootstrap=function(a){r(a,function(a){b.push(a)});return c()};z(ea.resumeDeferredBootstrap)&&ea.resumeDeferredBootstrap()}function he(){E.name="NG_ENABLE_DEBUG_INFO!"+E.name;E.location.reload()}function ie(a){a=ea.element(a).injector();if(!a)throw za("test");return a.get("$$testability")}function Cc(a,
b){b=b||"_";return a.replace(je,function(a,c){return(c?b:"")+a.toLowerCase()})}function ke(){var a;if(!Dc){var b=rb();(pa=w(b)?E.jQuery:b?E[b]:void 0)&&pa.fn.on?(B=pa,R(pa.fn,{scope:Pa.scope,isolateScope:Pa.isolateScope,controller:Pa.controller,injector:Pa.injector,inheritedData:Pa.inheritedData}),a=pa.cleanData,pa.cleanData=function(b){for(var c,e=0,f;null!=(f=b[e]);e++)(c=pa._data(f,"events"))&&c.$destroy&&pa(f).triggerHandler("$destroy");a(b)}):B=U;ea.element=B;Dc=!0}}function sb(a,b,d){if(!a)throw za("areq",
b||"?",d||"required");return a}function Qa(a,b,d){d&&J(a)&&(a=a[a.length-1]);sb(z(a),b,"not a function, got "+(a&&"object"===typeof a?a.constructor.name||"Object":typeof a));return a}function Ra(a,b){if("hasOwnProperty"===a)throw za("badname",b);}function Ec(a,b,d){if(!b)return a;b=b.split(".");for(var c,e=a,f=b.length,g=0;g<f;g++)c=b[g],a&&(a=(e=a)[c]);return!d&&z(a)?bb(e,a):a}function tb(a){for(var b=a[0],d=a[a.length-1],c,e=1;b!==d&&(b=b.nextSibling);e++)if(c||a[e]!==b)c||(c=B(ta.call(a,0,e))),
c.push(b);return c||a}function T(){return Object.create(null)}function le(a){function b(a,b,c){return a[b]||(a[b]=c())}var d=O("$injector"),c=O("ng");a=b(a,"angular",Object);a.$$minErr=a.$$minErr||O;return b(a,"module",function(){var a={};return function(f,g,h){if("hasOwnProperty"===f)throw c("badname","module");g&&a.hasOwnProperty(f)&&(a[f]=null);return b(a,f,function(){function a(b,d,e,f){f||(f=c);return function(){f[e||"push"]([b,d,arguments]);return V}}function b(a,d){return function(b,e){e&&
z(e)&&(e.$$moduleName=f);c.push([a,d,arguments]);return V}}if(!g)throw d("nomod",f);var c=[],e=[],p=[],s=a("$injector","invoke","push",e),V={_invokeQueue:c,_configBlocks:e,_runBlocks:p,requires:g,name:f,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:a("$provide","value"),constant:a("$provide","constant","unshift"),decorator:b("$provide","decorator"),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),controller:b("$controllerProvider",
"register"),directive:b("$compileProvider","directive"),component:b("$compileProvider","component"),config:s,run:function(a){p.push(a);return this}};h&&s(h);return V})}})}function ga(a,b){if(J(a)){b=b||[];for(var d=0,c=a.length;d<c;d++)b[d]=a[d]}else if(H(a))for(d in b=b||{},a)if("$"!==d.charAt(0)||"$"!==d.charAt(1))b[d]=a[d];return b||a}function me(a){R(a,{bootstrap:Bc,copy:Z,extend:R,merge:$d,equals:na,element:B,forEach:r,injector:db,noop:A,bind:bb,toJson:cb,fromJson:xc,identity:Ya,isUndefined:w,
isDefined:x,isString:F,isFunction:z,isObject:H,isNumber:S,isElement:Qb,isArray:J,version:ne,isDate:ia,lowercase:M,uppercase:ub,callbacks:{counter:0},getTestability:ie,$$minErr:O,$$csp:Fa,reloadWithDebugInfo:he});Ub=le(E);Ub("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:oe});a.provider("$compile",Fc).directive({a:pe,input:Gc,textarea:Gc,form:qe,script:re,select:se,style:te,option:ue,ngBind:ve,ngBindHtml:we,ngBindTemplate:xe,ngClass:ye,ngClassEven:ze,ngClassOdd:Ae,ngCloak:Be,ngController:Ce,
ngForm:De,ngHide:Ee,ngIf:Fe,ngInclude:Ge,ngInit:He,ngNonBindable:Ie,ngPluralize:Je,ngRepeat:Ke,ngShow:Le,ngStyle:Me,ngSwitch:Ne,ngSwitchWhen:Oe,ngSwitchDefault:Pe,ngOptions:Qe,ngTransclude:Re,ngModel:Se,ngList:Te,ngChange:Ue,pattern:Hc,ngPattern:Hc,required:Ic,ngRequired:Ic,minlength:Jc,ngMinlength:Jc,maxlength:Kc,ngMaxlength:Kc,ngValue:Ve,ngModelOptions:We}).directive({ngInclude:Xe}).directive(vb).directive(Lc);a.provider({$anchorScroll:Ye,$animate:Ze,$animateCss:$e,$$animateJs:af,$$animateQueue:bf,
$$AnimateRunner:cf,$$animateAsyncRun:df,$browser:ef,$cacheFactory:ff,$controller:gf,$document:hf,$exceptionHandler:jf,$filter:Mc,$$forceReflow:kf,$interpolate:lf,$interval:mf,$http:nf,$httpParamSerializer:of,$httpParamSerializerJQLike:pf,$httpBackend:qf,$xhrFactory:rf,$location:sf,$log:tf,$parse:uf,$rootScope:vf,$q:wf,$$q:xf,$sce:yf,$sceDelegate:zf,$sniffer:Af,$templateCache:Bf,$templateRequest:Cf,$$testability:Df,$timeout:Ef,$window:Ff,$$rAF:Gf,$$jqLite:Hf,$$HashMap:If,$$cookieReader:Jf})}])}function eb(a){return a.replace(Kf,
function(a,d,c,e){return e?c.toUpperCase():c}).replace(Lf,"Moz$1")}function Nc(a){a=a.nodeType;return 1===a||!a||9===a}function Oc(a,b){var d,c,e=b.createDocumentFragment(),f=[];if(Vb.test(a)){d=d||e.appendChild(b.createElement("div"));c=(Mf.exec(a)||["",""])[1].toLowerCase();c=ha[c]||ha._default;d.innerHTML=c[1]+a.replace(Nf,"<$1></$2>")+c[2];for(c=c[0];c--;)d=d.lastChild;f=ab(f,d.childNodes);d=e.firstChild;d.textContent=""}else f.push(b.createTextNode(a));e.textContent="";e.innerHTML="";r(f,function(a){e.appendChild(a)});
return e}function Pc(a,b){var d=a.parentNode;d&&d.replaceChild(b,a);b.appendChild(a)}function U(a){if(a instanceof U)return a;var b;F(a)&&(a=W(a),b=!0);if(!(this instanceof U)){if(b&&"<"!=a.charAt(0))throw Wb("nosel");return new U(a)}if(b){b=E.document;var d;a=(d=Of.exec(a))?[b.createElement(d[1])]:(d=Oc(a,b))?d.childNodes:[]}Qc(this,a)}function Xb(a){return a.cloneNode(!0)}function wb(a,b){b||fb(a);if(a.querySelectorAll)for(var d=a.querySelectorAll("*"),c=0,e=d.length;c<e;c++)fb(d[c])}function Rc(a,
b,d,c){if(x(c))throw Wb("offargs");var e=(c=xb(a))&&c.events,f=c&&c.handle;if(f)if(b){var g=function(b){var c=e[b];x(d)&&$a(c||[],d);x(d)&&c&&0<c.length||(a.removeEventListener(b,f,!1),delete e[b])};r(b.split(" "),function(a){g(a);yb[a]&&g(yb[a])})}else for(b in e)"$destroy"!==b&&a.removeEventListener(b,f,!1),delete e[b]}function fb(a,b){var d=a.ng339,c=d&&gb[d];c&&(b?delete c.data[b]:(c.handle&&(c.events.$destroy&&c.handle({},"$destroy"),Rc(a)),delete gb[d],a.ng339=void 0))}function xb(a,b){var d=
a.ng339,d=d&&gb[d];b&&!d&&(a.ng339=d=++Pf,d=gb[d]={events:{},data:{},handle:void 0});return d}function Yb(a,b,d){if(Nc(a)){var c=x(d),e=!c&&b&&!H(b),f=!b;a=(a=xb(a,!e))&&a.data;if(c)a[b]=d;else{if(f)return a;if(e)return a&&a[b];R(a,b)}}}function zb(a,b){return a.getAttribute?-1<(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+b+" "):!1}function Ab(a,b){b&&a.setAttribute&&r(b.split(" "),function(b){a.setAttribute("class",W((" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g,
" ").replace(" "+W(b)+" "," ")))})}function Bb(a,b){if(b&&a.setAttribute){var d=(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");r(b.split(" "),function(a){a=W(a);-1===d.indexOf(" "+a+" ")&&(d+=a+" ")});a.setAttribute("class",W(d))}}function Qc(a,b){if(b)if(b.nodeType)a[a.length++]=b;else{var d=b.length;if("number"===typeof d&&b.window!==b){if(d)for(var c=0;c<d;c++)a[a.length++]=b[c]}else a[a.length++]=b}}function Sc(a,b){return Cb(a,"$"+(b||"ngController")+"Controller")}function Cb(a,
b,d){9==a.nodeType&&(a=a.documentElement);for(b=J(b)?b:[b];a;){for(var c=0,e=b.length;c<e;c++)if(x(d=B.data(a,b[c])))return d;a=a.parentNode||11===a.nodeType&&a.host}}function Tc(a){for(wb(a,!0);a.firstChild;)a.removeChild(a.firstChild)}function Db(a,b){b||wb(a);var d=a.parentNode;d&&d.removeChild(a)}function Qf(a,b){b=b||E;if("complete"===b.document.readyState)b.setTimeout(a);else B(b).on("load",a)}function Uc(a,b){var d=Eb[b.toLowerCase()];return d&&Vc[ua(a)]&&d}function Rf(a,b){var d=function(c,
d){c.isDefaultPrevented=function(){return c.defaultPrevented};var f=b[d||c.type],g=f?f.length:0;if(g){if(w(c.immediatePropagationStopped)){var h=c.stopImmediatePropagation;c.stopImmediatePropagation=function(){c.immediatePropagationStopped=!0;c.stopPropagation&&c.stopPropagation();h&&h.call(c)}}c.isImmediatePropagationStopped=function(){return!0===c.immediatePropagationStopped};var k=f.specialHandlerWrapper||Sf;1<g&&(f=ga(f));for(var l=0;l<g;l++)c.isImmediatePropagationStopped()||k(a,c,f[l])}};d.elem=
a;return d}function Sf(a,b,d){d.call(a,b)}function Tf(a,b,d){var c=b.relatedTarget;c&&(c===a||Uf.call(a,c))||d.call(a,b)}function Hf(){this.$get=function(){return R(U,{hasClass:function(a,b){a.attr&&(a=a[0]);return zb(a,b)},addClass:function(a,b){a.attr&&(a=a[0]);return Bb(a,b)},removeClass:function(a,b){a.attr&&(a=a[0]);return Ab(a,b)}})}}function Ga(a,b){var d=a&&a.$$hashKey;if(d)return"function"===typeof d&&(d=a.$$hashKey()),d;d=typeof a;return d="function"==d||"object"==d&&null!==a?a.$$hashKey=
d+":"+(b||Zd)():d+":"+a}function Sa(a,b){if(b){var d=0;this.nextUid=function(){return++d}}r(a,this.put,this)}function Wc(a){a=(Function.prototype.toString.call(a)+" ").replace(Vf,"");return a.match(Wf)||a.match(Xf)}function Yf(a){return(a=Wc(a))?"function("+(a[1]||"").replace(/[\s\r\n]+/," ")+")":"fn"}function db(a,b){function d(a){return function(b,c){if(H(b))r(b,uc(a));else return a(b,c)}}function c(a,b){Ra(a,"service");if(z(b)||J(b))b=p.instantiate(b);if(!b.$get)throw Ha("pget",a);return n[a+"Provider"]=
b}function e(a,b){return function(){var c=I.invoke(b,this);if(w(c))throw Ha("undef",a);return c}}function f(a,b,d){return c(a,{$get:!1!==d?e(a,b):b})}function g(a){sb(w(a)||J(a),"modulesToLoad","not an array");var b=[],c;r(a,function(a){function d(a){var b,c;b=0;for(c=a.length;b<c;b++){var e=a[b],f=p.get(e[0]);f[e[1]].apply(f,e[2])}}if(!m.get(a)){m.put(a,!0);try{F(a)?(c=Ub(a),b=b.concat(g(c.requires)).concat(c._runBlocks),d(c._invokeQueue),d(c._configBlocks)):z(a)?b.push(p.invoke(a)):J(a)?b.push(p.invoke(a)):
Qa(a,"module")}catch(e){throw J(a)&&(a=a[a.length-1]),e.message&&e.stack&&-1==e.stack.indexOf(e.message)&&(e=e.message+"\n"+e.stack),Ha("modulerr",a,e.stack||e.message||e);}}});return b}function h(a,c){function d(b,e){if(a.hasOwnProperty(b)){if(a[b]===k)throw Ha("cdep",b+" <- "+l.join(" <- "));return a[b]}try{return l.unshift(b),a[b]=k,a[b]=c(b,e)}catch(f){throw a[b]===k&&delete a[b],f;}finally{l.shift()}}function e(a,c,f){var g=[];a=db.$$annotate(a,b,f);for(var h=0,k=a.length;h<k;h++){var l=a[h];
if("string"!==typeof l)throw Ha("itkn",l);g.push(c&&c.hasOwnProperty(l)?c[l]:d(l,f))}return g}return{invoke:function(a,b,c,d){"string"===typeof c&&(d=c,c=null);c=e(a,c,d);J(a)&&(a=a[a.length-1]);d=11>=Ba?!1:"function"===typeof a&&/^(?:class\s|constructor\()/.test(Function.prototype.toString.call(a)+" ");return d?(c.unshift(null),new (Function.prototype.bind.apply(a,c))):a.apply(b,c)},instantiate:function(a,b,c){var d=J(a)?a[a.length-1]:a;a=e(a,b,c);a.unshift(null);return new (Function.prototype.bind.apply(d,
a))},get:d,annotate:db.$$annotate,has:function(b){return n.hasOwnProperty(b+"Provider")||a.hasOwnProperty(b)}}}b=!0===b;var k={},l=[],m=new Sa([],!0),n={$provide:{provider:d(c),factory:d(f),service:d(function(a,b){return f(a,["$injector",function(a){return a.instantiate(b)}])}),value:d(function(a,b){return f(a,da(b),!1)}),constant:d(function(a,b){Ra(a,"constant");n[a]=b;s[a]=b}),decorator:function(a,b){var c=p.get(a+"Provider"),d=c.$get;c.$get=function(){var a=I.invoke(d,c);return I.invoke(b,null,
{$delegate:a})}}}},p=n.$injector=h(n,function(a,b){ea.isString(b)&&l.push(b);throw Ha("unpr",l.join(" <- "));}),s={},V=h(s,function(a,b){var c=p.get(a+"Provider",b);return I.invoke(c.$get,c,void 0,a)}),I=V;n.$injectorProvider={$get:da(V)};var q=g(a),I=V.get("$injector");I.strictDi=b;r(q,function(a){a&&I.invoke(a)});return I}function Ye(){var a=!0;this.disableAutoScrolling=function(){a=!1};this.$get=["$window","$location","$rootScope",function(b,d,c){function e(a){var b=null;Array.prototype.some.call(a,
function(a){if("a"===ua(a))return b=a,!0});return b}function f(a){if(a){a.scrollIntoView();var c;c=g.yOffset;z(c)?c=c():Qb(c)?(c=c[0],c="fixed"!==b.getComputedStyle(c).position?0:c.getBoundingClientRect().bottom):S(c)||(c=0);c&&(a=a.getBoundingClientRect().top,b.scrollBy(0,a-c))}else b.scrollTo(0,0)}function g(a){a=F(a)?a:d.hash();var b;a?(b=h.getElementById(a))?f(b):(b=e(h.getElementsByName(a)))?f(b):"top"===a&&f(null):f(null)}var h=b.document;a&&c.$watch(function(){return d.hash()},function(a,b){a===
b&&""===a||Qf(function(){c.$evalAsync(g)})});return g}]}function hb(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;J(a)&&(a=a.join(" "));J(b)&&(b=b.join(" "));return a+" "+b}function Zf(a){F(a)&&(a=a.split(" "));var b=T();r(a,function(a){a.length&&(b[a]=!0)});return b}function Ia(a){return H(a)?a:{}}function $f(a,b,d,c){function e(a){try{a.apply(null,ta.call(arguments,1))}finally{if(V--,0===V)for(;I.length;)try{I.pop()()}catch(b){d.error(b)}}}function f(){y=null;g();h()}function g(){q=P();
q=w(q)?null:q;na(q,D)&&(q=D);D=q}function h(){if(v!==k.url()||K!==q)v=k.url(),K=q,r(L,function(a){a(k.url(),q)})}var k=this,l=a.location,m=a.history,n=a.setTimeout,p=a.clearTimeout,s={};k.isMock=!1;var V=0,I=[];k.$$completeOutstandingRequest=e;k.$$incOutstandingRequestCount=function(){V++};k.notifyWhenNoOutstandingRequests=function(a){0===V?a():I.push(a)};var q,K,v=l.href,u=b.find("base"),y=null,P=c.history?function(){try{return m.state}catch(a){}}:A;g();K=q;k.url=function(b,d,e){w(e)&&(e=null);l!==
a.location&&(l=a.location);m!==a.history&&(m=a.history);if(b){var f=K===e;if(v===b&&(!c.history||f))return k;var h=v&&Ja(v)===Ja(b);v=b;K=e;!c.history||h&&f?(h||(y=b),d?l.replace(b):h?(d=l,e=b.indexOf("#"),e=-1===e?"":b.substr(e),d.hash=e):l.href=b,l.href!==b&&(y=b)):(m[d?"replaceState":"pushState"](e,"",b),g(),K=q);y&&(y=b);return k}return y||l.href.replace(/%27/g,"'")};k.state=function(){return q};var L=[],C=!1,D=null;k.onUrlChange=function(b){if(!C){if(c.history)B(a).on("popstate",f);B(a).on("hashchange",
f);C=!0}L.push(b);return b};k.$$applicationDestroyed=function(){B(a).off("hashchange popstate",f)};k.$$checkUrlChange=h;k.baseHref=function(){var a=u.attr("href");return a?a.replace(/^(https?\:)?\/\/[^\/]*/,""):""};k.defer=function(a,b){var c;V++;c=n(function(){delete s[c];e(a)},b||0);s[c]=!0;return c};k.defer.cancel=function(a){return s[a]?(delete s[a],p(a),e(A),!0):!1}}function ef(){this.$get=["$window","$log","$sniffer","$document",function(a,b,d,c){return new $f(a,c,b,d)}]}function ff(){this.$get=
function(){function a(a,c){function e(a){a!=n&&(p?p==a&&(p=a.n):p=a,f(a.n,a.p),f(a,n),n=a,n.n=null)}function f(a,b){a!=b&&(a&&(a.p=b),b&&(b.n=a))}if(a in b)throw O("$cacheFactory")("iid",a);var g=0,h=R({},c,{id:a}),k=T(),l=c&&c.capacity||Number.MAX_VALUE,m=T(),n=null,p=null;return b[a]={put:function(a,b){if(!w(b)){if(l<Number.MAX_VALUE){var c=m[a]||(m[a]={key:a});e(c)}a in k||g++;k[a]=b;g>l&&this.remove(p.key);return b}},get:function(a){if(l<Number.MAX_VALUE){var b=m[a];if(!b)return;e(b)}return k[a]},
remove:function(a){if(l<Number.MAX_VALUE){var b=m[a];if(!b)return;b==n&&(n=b.p);b==p&&(p=b.n);f(b.n,b.p);delete m[a]}a in k&&(delete k[a],g--)},removeAll:function(){k=T();g=0;m=T();n=p=null},destroy:function(){m=h=k=null;delete b[a]},info:function(){return R({},h,{size:g})}}}var b={};a.info=function(){var a={};r(b,function(b,e){a[e]=b.info()});return a};a.get=function(a){return b[a]};return a}}function Bf(){this.$get=["$cacheFactory",function(a){return a("templates")}]}function Fc(a,b){function d(a,
b,c){var d=/^\s*([@&<]|=(\*?))(\??)\s*(\w*)\s*$/,e=T();r(a,function(a,f){if(a in n)e[f]=n[a];else{var g=a.match(d);if(!g)throw fa("iscp",b,f,a,c?"controller bindings definition":"isolate scope definition");e[f]={mode:g[1][0],collection:"*"===g[2],optional:"?"===g[3],attrName:g[4]||f};g[4]&&(n[a]=e[f])}});return e}function c(a){var b=a.charAt(0);if(!b||b!==M(b))throw fa("baddir",a);if(a!==a.trim())throw fa("baddir",a);}function e(a){var b=a.require||a.controller&&a.name;!J(b)&&H(b)&&r(b,function(a,
c){var d=a.match(l);a.substring(d[0].length)||(b[c]=d[0]+c)});return b}var f={},g=/^\s*directive\:\s*([\w\-]+)\s+(.*)$/,h=/(([\w\-]+)(?:\:([^;]+))?;?)/,k=ce("ngSrc,ngSrcset,src,srcset"),l=/^(?:(\^\^?)?(\?)?(\^\^?)?)?/,m=/^(on[a-z]+|formaction)$/,n=T();this.directive=function I(b,d){Ra(b,"directive");F(b)?(c(b),sb(d,"directiveFactory"),f.hasOwnProperty(b)||(f[b]=[],a.factory(b+"Directive",["$injector","$exceptionHandler",function(a,c){var d=[];r(f[b],function(f,g){try{var h=a.invoke(f);z(h)?h={compile:da(h)}:
!h.compile&&h.link&&(h.compile=da(h.link));h.priority=h.priority||0;h.index=g;h.name=h.name||b;h.require=e(h);h.restrict=h.restrict||"EA";h.$$moduleName=f.$$moduleName;d.push(h)}catch(k){c(k)}});return d}])),f[b].push(d)):r(b,uc(I));return this};this.component=function(a,b){function c(a){function e(b){return z(b)||J(b)?function(c,d){return a.invoke(b,this,{$element:c,$attrs:d})}:b}var f=b.template||b.templateUrl?b.template:"",g={controller:d,controllerAs:Xc(b.controller)||b.controllerAs||"$ctrl",
template:e(f),templateUrl:e(b.templateUrl),transclude:b.transclude,scope:{},bindToController:b.bindings||{},restrict:"E",require:b.require};r(b,function(a,b){"$"===b.charAt(0)&&(g[b]=a)});return g}var d=b.controller||function(){};r(b,function(a,b){"$"===b.charAt(0)&&(c[b]=a,z(d)&&(d[b]=a))});c.$inject=["$injector"];return this.directive(a,c)};this.aHrefSanitizationWhitelist=function(a){return x(a)?(b.aHrefSanitizationWhitelist(a),this):b.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=
function(a){return x(a)?(b.imgSrcSanitizationWhitelist(a),this):b.imgSrcSanitizationWhitelist()};var p=!0;this.debugInfoEnabled=function(a){return x(a)?(p=a,this):p};var s=10;this.onChangesTtl=function(a){return arguments.length?(s=a,this):s};this.$get=["$injector","$interpolate","$exceptionHandler","$templateRequest","$parse","$controller","$rootScope","$sce","$animate","$$sanitizeUri",function(a,b,c,e,n,y,P,L,C,D){function G(){try{if(!--oa)throw Z=void 0,fa("infchng",s);P.$apply(function(){for(var a=
[],b=0,c=Z.length;b<c;++b)try{Z[b]()}catch(d){a.push(d)}Z=void 0;if(a.length)throw a;})}finally{oa++}}function Aa(a,b){if(b){var c=Object.keys(b),d,e,f;d=0;for(e=c.length;d<e;d++)f=c[d],this[f]=b[f]}else this.$attr={};this.$$element=a}function Q(a,b,c){la.innerHTML="<span "+b+">";b=la.firstChild.attributes;var d=b[0];b.removeNamedItem(d.name);d.value=c;a.attributes.setNamedItem(d)}function N(a,b){try{a.addClass(b)}catch(c){}}function ba(a,b,c,d,e){a instanceof B||(a=B(a));for(var f=/\S+/,g=0,h=a.length;g<
h;g++){var k=a[g];k.nodeType===Na&&k.nodeValue.match(f)&&Pc(k,a[g]=E.document.createElement("span"))}var l=t(a,b,a,c,d,e);ba.$$addScopeClass(a);var n=null;return function(b,c,d){sb(b,"scope");e&&e.needsNewScope&&(b=b.$parent.$new());d=d||{};var f=d.parentBoundTranscludeFn,g=d.transcludeControllers;d=d.futureParentElement;f&&f.$$boundTransclude&&(f=f.$$boundTransclude);n||(n=(d=d&&d[0])?"foreignobject"!==ua(d)&&ka.call(d).match(/SVG/)?"svg":"html":"html");d="html"!==n?B(ca(n,B("<div>").append(a).html())):
c?Pa.clone.call(a):a;if(g)for(var h in g)d.data("$"+h+"Controller",g[h].instance);ba.$$addScopeInfo(d,b);c&&c(d,b);l&&l(b,d,d,f);return d}}function t(a,b,c,d,e,f){function g(a,c,d,e){var f,k,l,n,m,v,q;if(p)for(q=Array(c.length),n=0;n<h.length;n+=3)f=h[n],q[f]=c[f];else q=c;n=0;for(m=h.length;n<m;)k=q[h[n++]],c=h[n++],f=h[n++],c?(c.scope?(l=a.$new(),ba.$$addScopeInfo(B(k),l)):l=a,v=c.transcludeOnThisElement?wa(a,c.transclude,e):!c.templateOnThisElement&&e?e:!e&&b?wa(a,b):null,c(f,l,k,d,v)):f&&f(a,
k.childNodes,void 0,e)}for(var h=[],k,l,n,m,p,v=0;v<a.length;v++){k=new Aa;l=$b(a[v],[],k,0===v?d:void 0,e);(f=l.length?Ta(l,a[v],k,b,c,null,[],[],f):null)&&f.scope&&ba.$$addScopeClass(k.$$element);k=f&&f.terminal||!(n=a[v].childNodes)||!n.length?null:t(n,f?(f.transcludeOnThisElement||!f.templateOnThisElement)&&f.transclude:b);if(f||k)h.push(v,f,k),m=!0,p=p||f;f=null}return m?g:null}function wa(a,b,c){function d(e,f,g,h,k){e||(e=a.$new(!1,k),e.$$transcluded=!0);return b(e,f,{parentBoundTranscludeFn:c,
transcludeControllers:g,futureParentElement:h})}var e=d.$$slots=T(),f;for(f in b.$$slots)e[f]=b.$$slots[f]?wa(a,b.$$slots[f],c):null;return d}function $b(a,b,c,d,e){var f=c.$attr,k;switch(a.nodeType){case 1:Da(b,xa(ua(a)),"E",d,e);for(var l,n,m,p=a.attributes,v=0,q=p&&p.length;v<q;v++){var s=!1,L=!1;l=p[v];k=l.name;n=W(l.value);l=xa(k);if(m=ya.test(l))k=k.replace(Yc,"").substr(8).replace(/_(.)/g,function(a,b){return b.toUpperCase()});(l=l.match(za))&&S(l[1])&&(s=k,L=k.substr(0,k.length-5)+"end",k=
k.substr(0,k.length-6));l=xa(k.toLowerCase());f[l]=k;if(m||!c.hasOwnProperty(l))c[l]=n,Uc(a,l)&&(c[l]=!0);ia(a,b,n,l,m);Da(b,l,"A",d,e,s,L)}a=a.className;H(a)&&(a=a.animVal);if(F(a)&&""!==a)for(;k=h.exec(a);)l=xa(k[2]),Da(b,l,"C",d,e)&&(c[l]=W(k[3])),a=a.substr(k.index+k[0].length);break;case Na:if(11===Ba)for(;a.parentNode&&a.nextSibling&&a.nextSibling.nodeType===Na;)a.nodeValue+=a.nextSibling.nodeValue,a.parentNode.removeChild(a.nextSibling);aa(b,a.nodeValue);break;case 8:try{if(k=g.exec(a.nodeValue))l=
xa(k[1]),Da(b,l,"M",d,e)&&(c[l]=W(k[2]))}catch(C){}}b.sort(Y);return b}function Zc(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw fa("uterdir",b,c);1==a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return B(d)}function O(a,b,c){return function(d,e,f,g,h){e=Zc(e[0],b,c);return a(d,e,f,g,h)}}function ac(a,b,c,d,e,f){var g;return a?ba(b,c,d,e,f):function(){g||(g=ba(b,c,d,e,f),b=c=f=null);return g.apply(this,
arguments)}}function Ta(a,b,d,e,f,g,h,k,l){function n(a,b,c,d){if(a){c&&(a=O(a,c,d));a.require=u.require;a.directiveName=G;if(s===u||u.$$isolateScope)a=ga(a,{isolateScope:!0});h.push(a)}if(b){c&&(b=O(b,c,d));b.require=u.require;b.directiveName=G;if(s===u||u.$$isolateScope)b=ga(b,{isolateScope:!0});k.push(b)}}function m(a,e,f,g,l){function n(a,b,c,d){var e;Za(a)||(d=c,c=b,b=a,a=void 0);y&&(e=N);c||(c=y?G.parent():G);if(d){var f=l.$$slots[d];if(f)return f(a,b,e,c,t);if(w(f))throw fa("noslot",d,va(G));
}else return l(a,b,e,c,t)}var p,C,u,D,I,N,Q,G;b===f?(g=d,G=d.$$element):(G=B(f),g=new Aa(G,d));I=e;s?D=e.$new(!0):v&&(I=e.$parent);l&&(Q=n,Q.$$boundTransclude=l,Q.isSlotFilled=function(a){return!!l.$$slots[a]});q&&(N=ag(G,g,Q,q,D,e,s));s&&(ba.$$addScopeInfo(G,D,!0,!(L&&(L===s||L===s.$$originalDirective))),ba.$$addScopeClass(G,!0),D.$$isolateBindings=s.$$isolateBindings,C=ha(e,g,D,D.$$isolateBindings,s),C.removeWatches&&D.$on("$destroy",C.removeWatches));for(p in N){C=q[p];u=N[p];var Zb=C.$$bindings.bindToController;
u.bindingInfo=u.identifier&&Zb?ha(I,g,u.instance,Zb,C):{};var P=u();P!==u.instance&&(u.instance=P,G.data("$"+C.name+"Controller",P),u.bindingInfo.removeWatches&&u.bindingInfo.removeWatches(),u.bindingInfo=ha(I,g,u.instance,Zb,C))}r(q,function(a,b){var c=a.require;a.bindToController&&!J(c)&&H(c)&&R(N[b].instance,ib(b,c,G,N))});r(N,function(a){var b=a.instance;if(z(b.$onChanges))try{b.$onChanges(a.bindingInfo.initialChanges)}catch(d){c(d)}if(z(b.$onInit))try{b.$onInit()}catch(e){c(e)}z(b.$onDestroy)&&
I.$on("$destroy",function(){b.$onDestroy()})});p=0;for(C=h.length;p<C;p++)u=h[p],ja(u,u.isolateScope?D:e,G,g,u.require&&ib(u.directiveName,u.require,G,N),Q);var t=e;s&&(s.template||null===s.templateUrl)&&(t=D);a&&a(t,f.childNodes,void 0,l);for(p=k.length-1;0<=p;p--)u=k[p],ja(u,u.isolateScope?D:e,G,g,u.require&&ib(u.directiveName,u.require,G,N),Q);r(N,function(a){a=a.instance;z(a.$postLink)&&a.$postLink()})}l=l||{};for(var p=-Number.MAX_VALUE,v=l.newScopeDirective,q=l.controllerDirectives,s=l.newIsolateScopeDirective,
L=l.templateDirective,C=l.nonTlbTranscludeDirective,D=!1,I=!1,y=l.hasElementTranscludeDirective,N=d.$$element=B(b),u,G,Q,P=e,t,Ca=!1,wa=!1,x,A=0,E=a.length;A<E;A++){u=a[A];var F=u.$$start,Ta=u.$$end;F&&(N=Zc(b,F,Ta));Q=void 0;if(p>u.priority)break;if(x=u.scope)u.templateUrl||(H(x)?(X("new/isolated scope",s||v,u,N),s=u):X("new/isolated scope",s,u,N)),v=v||u;G=u.name;if(!Ca&&(u.replace&&(u.templateUrl||u.template)||u.transclude&&!u.$$tlb)){for(x=A+1;Ca=a[x++];)if(Ca.transclude&&!Ca.$$tlb||Ca.replace&&
(Ca.templateUrl||Ca.template)){wa=!0;break}Ca=!0}!u.templateUrl&&u.controller&&(x=u.controller,q=q||T(),X("'"+G+"' controller",q[G],u,N),q[G]=u);if(x=u.transclude)if(D=!0,u.$$tlb||(X("transclusion",C,u,N),C=u),"element"==x)y=!0,p=u.priority,Q=N,N=d.$$element=B(ba.$$createComment(G,d[G])),b=N[0],da(f,ta.call(Q,0),b),Q[0].$$parentNode=Q[0].parentNode,P=ac(wa,Q,e,p,g&&g.name,{nonTlbTranscludeDirective:C});else{var M=T();Q=B(Xb(b)).contents();if(H(x)){Q=[];var S=T(),Da=T();r(x,function(a,b){var c="?"===
a.charAt(0);a=c?a.substring(1):a;S[a]=b;M[b]=null;Da[b]=c});r(N.contents(),function(a){var b=S[xa(ua(a))];b?(Da[b]=!0,M[b]=M[b]||[],M[b].push(a)):Q.push(a)});r(Da,function(a,b){if(!a)throw fa("reqslot",b);});for(var Y in M)M[Y]&&(M[Y]=ac(wa,M[Y],e))}N.empty();P=ac(wa,Q,e,void 0,void 0,{needsNewScope:u.$$isolateScope||u.$$newScope});P.$$slots=M}if(u.template)if(I=!0,X("template",L,u,N),L=u,x=z(u.template)?u.template(N,d):u.template,x=ra(x),u.replace){g=u;Q=Vb.test(x)?$c(ca(u.templateNamespace,W(x))):
[];b=Q[0];if(1!=Q.length||1!==b.nodeType)throw fa("tplrt",G,"");da(f,N,b);E={$attr:{}};x=$b(b,[],E);var aa=a.splice(A+1,a.length-(A+1));(s||v)&&ad(x,s,v);a=a.concat(x).concat(aa);U(d,E);E=a.length}else N.html(x);if(u.templateUrl)I=!0,X("template",L,u,N),L=u,u.replace&&(g=u),m=$(a.splice(A,a.length-A),N,d,f,D&&P,h,k,{controllerDirectives:q,newScopeDirective:v!==u&&v,newIsolateScopeDirective:s,templateDirective:L,nonTlbTranscludeDirective:C}),E=a.length;else if(u.compile)try{t=u.compile(N,d,P);var Z=
u.$$originalDirective||u;z(t)?n(null,bb(Z,t),F,Ta):t&&n(bb(Z,t.pre),bb(Z,t.post),F,Ta)}catch(ea){c(ea,va(N))}u.terminal&&(m.terminal=!0,p=Math.max(p,u.priority))}m.scope=v&&!0===v.scope;m.transcludeOnThisElement=D;m.templateOnThisElement=I;m.transclude=P;l.hasElementTranscludeDirective=y;return m}function ib(a,b,c,d){var e;if(F(b)){var f=b.match(l);b=b.substring(f[0].length);var g=f[1]||f[3],f="?"===f[2];"^^"===g?c=c.parent():e=(e=d&&d[b])&&e.instance;if(!e){var h="$"+b+"Controller";e=g?c.inheritedData(h):
c.data(h)}if(!e&&!f)throw fa("ctreq",b,a);}else if(J(b))for(e=[],g=0,f=b.length;g<f;g++)e[g]=ib(a,b[g],c,d);else H(b)&&(e={},r(b,function(b,f){e[f]=ib(a,b,c,d)}));return e||null}function ag(a,b,c,d,e,f,g){var h=T(),k;for(k in d){var l=d[k],n={$scope:l===g||l.$$isolateScope?e:f,$element:a,$attrs:b,$transclude:c},m=l.controller;"@"==m&&(m=b[l.name]);n=y(m,n,!0,l.controllerAs);h[l.name]=n;a.data("$"+l.name+"Controller",n.instance)}return h}function ad(a,b,c){for(var d=0,e=a.length;d<e;d++)a[d]=Rb(a[d],
{$$isolateScope:b,$$newScope:c})}function Da(b,e,g,h,k,l,n){if(e===k)return null;k=null;if(f.hasOwnProperty(e)){var m;e=a.get(e+"Directive");for(var p=0,v=e.length;p<v;p++)try{if(m=e[p],(w(h)||h>m.priority)&&-1!=m.restrict.indexOf(g)){l&&(m=Rb(m,{$$start:l,$$end:n}));if(!m.$$bindings){var q=m,s=m,L=m.name,u={isolateScope:null,bindToController:null};H(s.scope)&&(!0===s.bindToController?(u.bindToController=d(s.scope,L,!0),u.isolateScope={}):u.isolateScope=d(s.scope,L,!1));H(s.bindToController)&&(u.bindToController=
d(s.bindToController,L,!0));if(H(u.bindToController)){var C=s.controller,D=s.controllerAs;if(!C)throw fa("noctrl",L);if(!Xc(C,D))throw fa("noident",L);}var N=q.$$bindings=u;H(N.isolateScope)&&(m.$$isolateBindings=N.isolateScope)}b.push(m);k=m}}catch(G){c(G)}}return k}function S(b){if(f.hasOwnProperty(b))for(var c=a.get(b+"Directive"),d=0,e=c.length;d<e;d++)if(b=c[d],b.multiElement)return!0;return!1}function U(a,b){var c=b.$attr,d=a.$attr;r(a,function(d,e){"$"!=e.charAt(0)&&(b[e]&&b[e]!==d&&(d+=("style"===
e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});r(b,function(b,e){a.hasOwnProperty(e)||"$"===e.charAt(0)||(a[e]=b,"class"!==e&&"style"!==e&&(d[e]=c[e]))})}function $(a,b,c,d,f,g,h,k){var l=[],n,m,p=b[0],s=a.shift(),q=Rb(s,{templateUrl:null,transclude:null,replace:null,$$originalDirective:s}),L=z(s.templateUrl)?s.templateUrl(b,c):s.templateUrl,u=s.templateNamespace;b.empty();e(L).then(function(e){var v,C;e=ra(e);if(s.replace){e=Vb.test(e)?$c(ca(u,W(e))):[];v=e[0];if(1!=e.length||1!==v.nodeType)throw fa("tplrt",
s.name,L);e={$attr:{}};da(d,b,v);var D=$b(v,[],e);H(s.scope)&&ad(D,!0);a=D.concat(a);U(c,e)}else v=p,b.html(e);a.unshift(q);n=Ta(a,v,c,f,b,s,g,h,k);r(d,function(a,c){a==v&&(d[c]=b[0])});for(m=t(b[0].childNodes,f);l.length;){e=l.shift();C=l.shift();var I=l.shift(),G=l.shift(),D=b[0];if(!e.$$destroyed){if(C!==p){var y=C.className;k.hasElementTranscludeDirective&&s.replace||(D=Xb(v));da(I,B(C),D);N(B(D),y)}C=n.transcludeOnThisElement?wa(e,n.transclude,G):G;n(m,e,D,d,C)}}l=null});return function(a,b,
c,d,e){a=e;b.$$destroyed||(l?l.push(b,c,d,a):(n.transcludeOnThisElement&&(a=wa(b,n.transclude,e)),n(m,b,c,d,a)))}}function Y(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function X(a,b,c,d){function e(a){return a?" (module: "+a+")":""}if(b)throw fa("multidir",b.name,e(b.$$moduleName),c.name,e(c.$$moduleName),a,va(d));}function aa(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:function(a){a=a.parent();var b=!!a.length;b&&ba.$$addBindingClass(a);
return function(a,c){var e=c.parent();b||ba.$$addBindingClass(e);ba.$$addBindingInfo(e,d.expressions);a.$watch(d,function(a){c[0].nodeValue=a})}}})}function ca(a,b){a=M(a||"html");switch(a){case "svg":case "math":var c=E.document.createElement("div");c.innerHTML="<"+a+">"+b+"</"+a+">";return c.childNodes[0].childNodes;default:return b}}function ea(a,b){if("srcdoc"==b)return L.HTML;var c=ua(a);if("xlinkHref"==b||"form"==c&&"action"==b||"img"!=c&&("src"==b||"ngSrc"==b))return L.RESOURCE_URL}function ia(a,
c,d,e,f){var g=ea(a,e);f=k[e]||f;var h=b(d,!0,g,f);if(h){if("multiple"===e&&"select"===ua(a))throw fa("selmulti",va(a));c.push({priority:100,compile:function(){return{pre:function(a,c,k){c=k.$$observers||(k.$$observers=T());if(m.test(e))throw fa("nodomevents");var l=k[e];l!==d&&(h=l&&b(l,!0,g,f),d=l);h&&(k[e]=h(a),(c[e]||(c[e]=[])).$$inter=!0,(k.$$observers&&k.$$observers[e].$$scope||a).$watch(h,function(a,b){"class"===e&&a!=b?k.$updateClass(a,b):k.$set(e,a)}))}}}})}}function da(a,b,c){var d=b[0],
e=b.length,f=d.parentNode,g,h;if(a)for(g=0,h=a.length;g<h;g++)if(a[g]==d){a[g++]=c;h=g+e-1;for(var k=a.length;g<k;g++,h++)h<k?a[g]=a[h]:delete a[g];a.length-=e-1;a.context===d&&(a.context=c);break}f&&f.replaceChild(c,d);a=E.document.createDocumentFragment();for(g=0;g<e;g++)a.appendChild(b[g]);B.hasData(d)&&(B.data(c,B.data(d)),B(d).off("$destroy"));B.cleanData(a.querySelectorAll("*"));for(g=1;g<e;g++)delete b[g];b[0]=c;b.length=1}function ga(a,b){return R(function(){return a.apply(null,arguments)},
a,b)}function ja(a,b,d,e,f,g){try{a(b,d,e,f,g)}catch(h){c(h,va(d))}}function ha(a,c,d,e,f){function g(b,c,e){z(d.$onChanges)&&c!==e&&(Z||(a.$$postDigest(G),Z=[]),m||(m={},Z.push(h)),m[b]&&(e=m[b].previousValue),m[b]=new Fb(e,c))}function h(){d.$onChanges(m);m=void 0}var k=[],l={},m;r(e,function(e,h){var m=e.attrName,p=e.optional,v,s,L,C;switch(e.mode){case "@":p||sa.call(c,m)||(d[h]=c[m]=void 0);c.$observe(m,function(a){if(F(a)||Ea(a))g(h,a,d[h]),d[h]=a});c.$$observers[m].$$scope=a;v=c[m];F(v)?d[h]=
b(v)(a):Ea(v)&&(d[h]=v);l[h]=new Fb(bc,d[h]);break;case "=":if(!sa.call(c,m)){if(p)break;c[m]=void 0}if(p&&!c[m])break;s=n(c[m]);C=s.literal?na:function(a,b){return a===b||a!==a&&b!==b};L=s.assign||function(){v=d[h]=s(a);throw fa("nonassign",c[m],m,f.name);};v=d[h]=s(a);p=function(b){C(b,d[h])||(C(b,v)?L(a,b=d[h]):d[h]=b);return v=b};p.$stateful=!0;p=e.collection?a.$watchCollection(c[m],p):a.$watch(n(c[m],p),null,s.literal);k.push(p);break;case "<":if(!sa.call(c,m)){if(p)break;c[m]=void 0}if(p&&!c[m])break;
s=n(c[m]);var D=d[h]=s(a);l[h]=new Fb(bc,d[h]);p=a.$watch(s,function(a,b){if(b===a){if(b===D)return;b=D}g(h,a,b);d[h]=a},s.literal);k.push(p);break;case "&":s=c.hasOwnProperty(m)?n(c[m]):A;if(s===A&&p)break;d[h]=function(b){return s(a,b)}}});return{initialChanges:l,removeWatches:k.length&&function(){for(var a=0,b=k.length;a<b;++a)k[a]()}}}var ma=/^\w/,la=E.document.createElement("div"),oa=s,Z;Aa.prototype={$normalize:xa,$addClass:function(a){a&&0<a.length&&C.addClass(this.$$element,a)},$removeClass:function(a){a&&
0<a.length&&C.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=bd(a,b);c&&c.length&&C.addClass(this.$$element,c);(c=bd(b,a))&&c.length&&C.removeClass(this.$$element,c)},$set:function(a,b,d,e){var f=Uc(this.$$element[0],a),g=cd[a],h=a;f?(this.$$element.prop(a,b),e=f):g&&(this[g]=b,h=g);this[a]=b;e?this.$attr[a]=e:(e=this.$attr[a])||(this.$attr[a]=e=Cc(a,"-"));f=ua(this.$$element);if("a"===f&&("href"===a||"xlinkHref"===a)||"img"===f&&"src"===a)this[a]=b=D(b,"src"===a);else if("img"===
f&&"srcset"===a&&x(b)){for(var f="",g=W(b),k=/(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,k=/\s/.test(g)?k:/(,)/,g=g.split(k),k=Math.floor(g.length/2),l=0;l<k;l++)var n=2*l,f=f+D(W(g[n]),!0),f=f+(" "+W(g[n+1]));g=W(g[2*l]).split(/\s/);f+=D(W(g[0]),!0);2===g.length&&(f+=" "+W(g[1]));this[a]=b=f}!1!==d&&(null===b||w(b)?this.$$element.removeAttr(e):ma.test(e)?this.$$element.attr(e,b):Q(this.$$element[0],e,b));(a=this.$$observers)&&r(a[h],function(a){try{a(b)}catch(d){c(d)}})},$observe:function(a,b){var c=this,
d=c.$$observers||(c.$$observers=T()),e=d[a]||(d[a]=[]);e.push(b);P.$evalAsync(function(){e.$$inter||!c.hasOwnProperty(a)||w(c[a])||b(c[a])});return function(){$a(e,b)}}};var pa=b.startSymbol(),qa=b.endSymbol(),ra="{{"==pa&&"}}"==qa?Ya:function(a){return a.replace(/\{\{/g,pa).replace(/}}/g,qa)},ya=/^ngAttr[A-Z]/,za=/^(.+)Start$/;ba.$$addBindingInfo=p?function(a,b){var c=a.data("$binding")||[];J(b)?c=c.concat(b):c.push(b);a.data("$binding",c)}:A;ba.$$addBindingClass=p?function(a){N(a,"ng-binding")}:
A;ba.$$addScopeInfo=p?function(a,b,c,d){a.data(c?d?"$isolateScopeNoTemplate":"$isolateScope":"$scope",b)}:A;ba.$$addScopeClass=p?function(a,b){N(a,b?"ng-isolate-scope":"ng-scope")}:A;ba.$$createComment=function(a,b){var c="";p&&(c=" "+(a||"")+": ",b&&(c+=b+" "));return E.document.createComment(c)};return ba}]}function Fb(a,b){this.previousValue=a;this.currentValue=b}function xa(a){return eb(a.replace(Yc,""))}function bd(a,b){var d="",c=a.split(/\s+/),e=b.split(/\s+/),f=0;a:for(;f<c.length;f++){for(var g=
c[f],h=0;h<e.length;h++)if(g==e[h])continue a;d+=(0<d.length?" ":"")+g}return d}function $c(a){a=B(a);var b=a.length;if(1>=b)return a;for(;b--;)8===a[b].nodeType&&bg.call(a,b,1);return a}function Xc(a,b){if(b&&F(b))return b;if(F(a)){var d=dd.exec(a);if(d)return d[3]}}function gf(){var a={},b=!1;this.has=function(b){return a.hasOwnProperty(b)};this.register=function(b,c){Ra(b,"controller");H(b)?R(a,b):a[b]=c};this.allowGlobals=function(){b=!0};this.$get=["$injector","$window",function(d,c){function e(a,
b,c,d){if(!a||!H(a.$scope))throw O("$controller")("noscp",d,b);a.$scope[b]=c}return function(f,g,h,k){var l,m,n;h=!0===h;k&&F(k)&&(n=k);if(F(f)){k=f.match(dd);if(!k)throw cg("ctrlfmt",f);m=k[1];n=n||k[3];f=a.hasOwnProperty(m)?a[m]:Ec(g.$scope,m,!0)||(b?Ec(c,m,!0):void 0);Qa(f,m,!0)}if(h)return h=(J(f)?f[f.length-1]:f).prototype,l=Object.create(h||null),n&&e(g,n,l,m||f.name),R(function(){var a=d.invoke(f,l,g,m);a!==l&&(H(a)||z(a))&&(l=a,n&&e(g,n,l,m||f.name));return l},{instance:l,identifier:n});l=
d.instantiate(f,g,m);n&&e(g,n,l,m||f.name);return l}}]}function hf(){this.$get=["$window",function(a){return B(a.document)}]}function jf(){this.$get=["$log",function(a){return function(b,d){a.error.apply(a,arguments)}}]}function cc(a){return H(a)?ia(a)?a.toISOString():cb(a):a}function of(){this.$get=function(){return function(a){if(!a)return"";var b=[];tc(a,function(a,c){null===a||w(a)||(J(a)?r(a,function(a){b.push(ja(c)+"="+ja(cc(a)))}):b.push(ja(c)+"="+ja(cc(a))))});return b.join("&")}}}function pf(){this.$get=
function(){return function(a){function b(a,e,f){null===a||w(a)||(J(a)?r(a,function(a,c){b(a,e+"["+(H(a)?c:"")+"]")}):H(a)&&!ia(a)?tc(a,function(a,c){b(a,e+(f?"":"[")+c+(f?"":"]"))}):d.push(ja(e)+"="+ja(cc(a))))}if(!a)return"";var d=[];b(a,"",!0);return d.join("&")}}}function dc(a,b){if(F(a)){var d=a.replace(dg,"").trim();if(d){var c=b("Content-Type");(c=c&&0===c.indexOf(ed))||(c=(c=d.match(eg))&&fg[c[0]].test(d));c&&(a=xc(d))}}return a}function fd(a){var b=T(),d;F(a)?r(a.split("\n"),function(a){d=
a.indexOf(":");var e=M(W(a.substr(0,d)));a=W(a.substr(d+1));e&&(b[e]=b[e]?b[e]+", "+a:a)}):H(a)&&r(a,function(a,d){var f=M(d),g=W(a);f&&(b[f]=b[f]?b[f]+", "+g:g)});return b}function gd(a){var b;return function(d){b||(b=fd(a));return d?(d=b[M(d)],void 0===d&&(d=null),d):b}}function hd(a,b,d,c){if(z(c))return c(a,b,d);r(c,function(c){a=c(a,b,d)});return a}function nf(){var a=this.defaults={transformResponse:[dc],transformRequest:[function(a){return H(a)&&"[object File]"!==ka.call(a)&&"[object Blob]"!==
ka.call(a)&&"[object FormData]"!==ka.call(a)?cb(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:ga(ec),put:ga(ec),patch:ga(ec)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",paramSerializer:"$httpParamSerializer"},b=!1;this.useApplyAsync=function(a){return x(a)?(b=!!a,this):b};var d=!0;this.useLegacyPromiseExtensions=function(a){return x(a)?(d=!!a,this):d};var c=this.interceptors=[];this.$get=["$httpBackend","$$cookieReader","$cacheFactory","$rootScope","$q","$injector",
function(e,f,g,h,k,l){function m(b){function c(a){var b=R({},a);b.data=hd(a.data,a.headers,a.status,f.transformResponse);a=a.status;return 200<=a&&300>a?b:k.reject(b)}function e(a,b){var c,d={};r(a,function(a,e){z(a)?(c=a(b),null!=c&&(d[e]=c)):d[e]=a});return d}if(!H(b))throw O("$http")("badreq",b);if(!F(b.url))throw O("$http")("badreq",b.url);var f=R({method:"get",transformRequest:a.transformRequest,transformResponse:a.transformResponse,paramSerializer:a.paramSerializer},b);f.headers=function(b){var c=
a.headers,d=R({},b.headers),f,g,h,c=R({},c.common,c[M(b.method)]);a:for(f in c){g=M(f);for(h in d)if(M(h)===g)continue a;d[f]=c[f]}return e(d,ga(b))}(b);f.method=ub(f.method);f.paramSerializer=F(f.paramSerializer)?l.get(f.paramSerializer):f.paramSerializer;var g=[function(b){var d=b.headers,e=hd(b.data,gd(d),void 0,b.transformRequest);w(e)&&r(d,function(a,b){"content-type"===M(b)&&delete d[b]});w(b.withCredentials)&&!w(a.withCredentials)&&(b.withCredentials=a.withCredentials);return n(b,e).then(c,
c)},void 0],h=k.when(f);for(r(V,function(a){(a.request||a.requestError)&&g.unshift(a.request,a.requestError);(a.response||a.responseError)&&g.push(a.response,a.responseError)});g.length;){b=g.shift();var m=g.shift(),h=h.then(b,m)}d?(h.success=function(a){Qa(a,"fn");h.then(function(b){a(b.data,b.status,b.headers,f)});return h},h.error=function(a){Qa(a,"fn");h.then(null,function(b){a(b.data,b.status,b.headers,f)});return h}):(h.success=id("success"),h.error=id("error"));return h}function n(c,d){function g(a){if(a){var c=
{};r(a,function(a,d){c[d]=function(c){function d(){a(c)}b?h.$applyAsync(d):h.$$phase?d():h.$apply(d)}});return c}}function l(a,c,d,e){function f(){n(c,a,d,e)}D&&(200<=a&&300>a?D.put(Q,[a,c,fd(d),e]):D.remove(Q));b?h.$applyAsync(f):(f(),h.$$phase||h.$apply())}function n(a,b,d,e){b=-1<=b?b:0;(200<=b&&300>b?L.resolve:L.reject)({data:a,status:b,headers:gd(d),config:c,statusText:e})}function y(a){n(a.data,a.status,ga(a.headers()),a.statusText)}function V(){var a=m.pendingRequests.indexOf(c);-1!==a&&m.pendingRequests.splice(a,
1)}var L=k.defer(),C=L.promise,D,G,Aa=c.headers,Q=p(c.url,c.paramSerializer(c.params));m.pendingRequests.push(c);C.then(V,V);!c.cache&&!a.cache||!1===c.cache||"GET"!==c.method&&"JSONP"!==c.method||(D=H(c.cache)?c.cache:H(a.cache)?a.cache:s);D&&(G=D.get(Q),x(G)?G&&z(G.then)?G.then(y,y):J(G)?n(G[1],G[0],ga(G[2]),G[3]):n(G,200,{},"OK"):D.put(Q,C));w(G)&&((G=jd(c.url)?f()[c.xsrfCookieName||a.xsrfCookieName]:void 0)&&(Aa[c.xsrfHeaderName||a.xsrfHeaderName]=G),e(c.method,Q,d,l,Aa,c.timeout,c.withCredentials,
c.responseType,g(c.eventHandlers),g(c.uploadEventHandlers)));return C}function p(a,b){0<b.length&&(a+=(-1==a.indexOf("?")?"?":"&")+b);return a}var s=g("$http");a.paramSerializer=F(a.paramSerializer)?l.get(a.paramSerializer):a.paramSerializer;var V=[];r(c,function(a){V.unshift(F(a)?l.get(a):l.invoke(a))});m.pendingRequests=[];(function(a){r(arguments,function(a){m[a]=function(b,c){return m(R({},c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){r(arguments,function(a){m[a]=function(b,
c,d){return m(R({},d||{},{method:a,url:b,data:c}))}})})("post","put","patch");m.defaults=a;return m}]}function rf(){this.$get=function(){return function(){return new E.XMLHttpRequest}}}function qf(){this.$get=["$browser","$window","$document","$xhrFactory",function(a,b,d,c){return gg(a,c,a.defer,b.angular.callbacks,d[0])}]}function gg(a,b,d,c,e){function f(a,b,d){var f=e.createElement("script"),m=null;f.type="text/javascript";f.src=a;f.async=!0;m=function(a){f.removeEventListener("load",m,!1);f.removeEventListener("error",
m,!1);e.body.removeChild(f);f=null;var g=-1,s="unknown";a&&("load"!==a.type||c[b].called||(a={type:"error"}),s=a.type,g="error"===a.type?404:200);d&&d(g,s)};f.addEventListener("load",m,!1);f.addEventListener("error",m,!1);e.body.appendChild(f);return m}return function(e,h,k,l,m,n,p,s,V,I){function q(){u&&u();y&&y.abort()}function K(b,c,e,f,g){x(L)&&d.cancel(L);u=y=null;b(c,e,f,g);a.$$completeOutstandingRequest(A)}a.$$incOutstandingRequestCount();h=h||a.url();if("jsonp"==M(e)){var v="_"+(c.counter++).toString(36);
c[v]=function(a){c[v].data=a;c[v].called=!0};var u=f(h.replace("JSON_CALLBACK","angular.callbacks."+v),v,function(a,b){K(l,a,c[v].data,"",b);c[v]=A})}else{var y=b(e,h);y.open(e,h,!0);r(m,function(a,b){x(a)&&y.setRequestHeader(b,a)});y.onload=function(){var a=y.statusText||"",b="response"in y?y.response:y.responseText,c=1223===y.status?204:y.status;0===c&&(c=b?200:"file"==qa(h).protocol?404:0);K(l,c,b,y.getAllResponseHeaders(),a)};e=function(){K(l,-1,null,null,"")};y.onerror=e;y.onabort=e;r(V,function(a,
b){y.addEventListener(b,a)});r(I,function(a,b){y.upload.addEventListener(b,a)});p&&(y.withCredentials=!0);if(s)try{y.responseType=s}catch(P){if("json"!==s)throw P;}y.send(w(k)?null:k)}if(0<n)var L=d(q,n);else n&&z(n.then)&&n.then(q)}}function lf(){var a="{{",b="}}";this.startSymbol=function(b){return b?(a=b,this):a};this.endSymbol=function(a){return a?(b=a,this):b};this.$get=["$parse","$exceptionHandler","$sce",function(d,c,e){function f(a){return"\\\\\\"+a}function g(c){return c.replace(n,a).replace(p,
b)}function h(a,b,c,d){var e;return e=a.$watch(function(a){e();return d(a)},b,c)}function k(f,k,n,p){function r(a){try{var b=a;a=n?e.getTrusted(n,b):e.valueOf(b);var d;if(p&&!x(a))d=a;else if(null==a)d="";else{switch(typeof a){case "string":break;case "number":a=""+a;break;default:a=cb(a)}d=a}return d}catch(g){c(Ka.interr(f,g))}}if(!f.length||-1===f.indexOf(a)){var v;k||(k=g(f),v=da(k),v.exp=f,v.expressions=[],v.$$watchDelegate=h);return v}p=!!p;var u,y,P=0,L=[],C=[];v=f.length;for(var D=[],G=[];P<
v;)if(-1!=(u=f.indexOf(a,P))&&-1!=(y=f.indexOf(b,u+l)))P!==u&&D.push(g(f.substring(P,u))),P=f.substring(u+l,y),L.push(P),C.push(d(P,r)),P=y+m,G.push(D.length),D.push("");else{P!==v&&D.push(g(f.substring(P)));break}n&&1<D.length&&Ka.throwNoconcat(f);if(!k||L.length){var Aa=function(a){for(var b=0,c=L.length;b<c;b++){if(p&&w(a[b]))return;D[G[b]]=a[b]}return D.join("")};return R(function(a){var b=0,d=L.length,e=Array(d);try{for(;b<d;b++)e[b]=C[b](a);return Aa(e)}catch(g){c(Ka.interr(f,g))}},{exp:f,expressions:L,
$$watchDelegate:function(a,b){var c;return a.$watchGroup(C,function(d,e){var f=Aa(d);z(b)&&b.call(this,f,d!==e?c:f,a);c=f})}})}}var l=a.length,m=b.length,n=new RegExp(a.replace(/./g,f),"g"),p=new RegExp(b.replace(/./g,f),"g");k.startSymbol=function(){return a};k.endSymbol=function(){return b};return k}]}function mf(){this.$get=["$rootScope","$window","$q","$$q","$browser",function(a,b,d,c,e){function f(f,k,l,m){function n(){p?f.apply(null,s):f(q)}var p=4<arguments.length,s=p?ta.call(arguments,4):
[],r=b.setInterval,I=b.clearInterval,q=0,K=x(m)&&!m,v=(K?c:d).defer(),u=v.promise;l=x(l)?l:0;u.$$intervalId=r(function(){K?e.defer(n):a.$evalAsync(n);v.notify(q++);0<l&&q>=l&&(v.resolve(q),I(u.$$intervalId),delete g[u.$$intervalId]);K||a.$apply()},k);g[u.$$intervalId]=v;return u}var g={};f.cancel=function(a){return a&&a.$$intervalId in g?(g[a.$$intervalId].reject("canceled"),b.clearInterval(a.$$intervalId),delete g[a.$$intervalId],!0):!1};return f}]}function fc(a){a=a.split("/");for(var b=a.length;b--;)a[b]=
qb(a[b]);return a.join("/")}function kd(a,b){var d=qa(a);b.$$protocol=d.protocol;b.$$host=d.hostname;b.$$port=aa(d.port)||hg[d.protocol]||null}function ld(a,b){var d="/"!==a.charAt(0);d&&(a="/"+a);var c=qa(a);b.$$path=decodeURIComponent(d&&"/"===c.pathname.charAt(0)?c.pathname.substring(1):c.pathname);b.$$search=Ac(c.search);b.$$hash=decodeURIComponent(c.hash);b.$$path&&"/"!=b.$$path.charAt(0)&&(b.$$path="/"+b.$$path)}function la(a,b){if(0===b.lastIndexOf(a,0))return b.substr(a.length)}function Ja(a){var b=
a.indexOf("#");return-1==b?a:a.substr(0,b)}function jb(a){return a.replace(/(#.+)|#$/,"$1")}function gc(a,b,d){this.$$html5=!0;d=d||"";kd(a,this);this.$$parse=function(a){var d=la(b,a);if(!F(d))throw Gb("ipthprfx",a,b);ld(d,this);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Tb(this.$$search),d=this.$$hash?"#"+qb(this.$$hash):"";this.$$url=fc(this.$$path)+(a?"?"+a:"")+d;this.$$absUrl=b+this.$$url.substr(1)};this.$$parseLinkUrl=function(c,e){if(e&&"#"===e[0])return this.hash(e.slice(1)),
!0;var f,g;x(f=la(a,c))?(g=f,g=x(f=la(d,f))?b+(la("/",f)||f):a+g):x(f=la(b,c))?g=b+f:b==c+"/"&&(g=b);g&&this.$$parse(g);return!!g}}function hc(a,b,d){kd(a,this);this.$$parse=function(c){var e=la(a,c)||la(b,c),f;w(e)||"#"!==e.charAt(0)?this.$$html5?f=e:(f="",w(e)&&(a=c,this.replace())):(f=la(d,e),w(f)&&(f=e));ld(f,this);c=this.$$path;var e=a,g=/^\/[A-Z]:(\/.*)/;0===f.lastIndexOf(e,0)&&(f=f.replace(e,""));g.exec(f)||(c=(f=g.exec(c))?f[1]:c);this.$$path=c;this.$$compose()};this.$$compose=function(){var b=
Tb(this.$$search),e=this.$$hash?"#"+qb(this.$$hash):"";this.$$url=fc(this.$$path)+(b?"?"+b:"")+e;this.$$absUrl=a+(this.$$url?d+this.$$url:"")};this.$$parseLinkUrl=function(b,d){return Ja(a)==Ja(b)?(this.$$parse(b),!0):!1}}function md(a,b,d){this.$$html5=!0;hc.apply(this,arguments);this.$$parseLinkUrl=function(c,e){if(e&&"#"===e[0])return this.hash(e.slice(1)),!0;var f,g;a==Ja(c)?f=c:(g=la(b,c))?f=a+d+g:b===c+"/"&&(f=b);f&&this.$$parse(f);return!!f};this.$$compose=function(){var b=Tb(this.$$search),
e=this.$$hash?"#"+qb(this.$$hash):"";this.$$url=fc(this.$$path)+(b?"?"+b:"")+e;this.$$absUrl=a+d+this.$$url}}function Hb(a){return function(){return this[a]}}function nd(a,b){return function(d){if(w(d))return this[a];this[a]=b(d);this.$$compose();return this}}function sf(){var a="",b={enabled:!1,requireBase:!0,rewriteLinks:!0};this.hashPrefix=function(b){return x(b)?(a=b,this):a};this.html5Mode=function(a){return Ea(a)?(b.enabled=a,this):H(a)?(Ea(a.enabled)&&(b.enabled=a.enabled),Ea(a.requireBase)&&
(b.requireBase=a.requireBase),Ea(a.rewriteLinks)&&(b.rewriteLinks=a.rewriteLinks),this):b};this.$get=["$rootScope","$browser","$sniffer","$rootElement","$window",function(d,c,e,f,g){function h(a,b,d){var e=l.url(),f=l.$$state;try{c.url(a,b,d),l.$$state=c.state()}catch(g){throw l.url(e),l.$$state=f,g;}}function k(a,b){d.$broadcast("$locationChangeSuccess",l.absUrl(),a,l.$$state,b)}var l,m;m=c.baseHref();var n=c.url(),p;if(b.enabled){if(!m&&b.requireBase)throw Gb("nobase");p=n.substring(0,n.indexOf("/",
n.indexOf("//")+2))+(m||"/");m=e.history?gc:md}else p=Ja(n),m=hc;var s=p.substr(0,Ja(p).lastIndexOf("/")+1);l=new m(p,s,"#"+a);l.$$parseLinkUrl(n,n);l.$$state=c.state();var r=/^\s*(javascript|mailto):/i;f.on("click",function(a){if(b.rewriteLinks&&!a.ctrlKey&&!a.metaKey&&!a.shiftKey&&2!=a.which&&2!=a.button){for(var e=B(a.target);"a"!==ua(e[0]);)if(e[0]===f[0]||!(e=e.parent())[0])return;var h=e.prop("href"),k=e.attr("href")||e.attr("xlink:href");H(h)&&"[object SVGAnimatedString]"===h.toString()&&(h=
qa(h.animVal).href);r.test(h)||!h||e.attr("target")||a.isDefaultPrevented()||!l.$$parseLinkUrl(h,k)||(a.preventDefault(),l.absUrl()!=c.url()&&(d.$apply(),g.angular["ff-684208-preventDefault"]=!0))}});jb(l.absUrl())!=jb(n)&&c.url(l.absUrl(),!0);var I=!0;c.onUrlChange(function(a,b){w(la(s,a))?g.location.href=a:(d.$evalAsync(function(){var c=l.absUrl(),e=l.$$state,f;a=jb(a);l.$$parse(a);l.$$state=b;f=d.$broadcast("$locationChangeStart",a,c,b,e).defaultPrevented;l.absUrl()===a&&(f?(l.$$parse(c),l.$$state=
e,h(c,!1,e)):(I=!1,k(c,e)))}),d.$$phase||d.$digest())});d.$watch(function(){var a=jb(c.url()),b=jb(l.absUrl()),f=c.state(),g=l.$$replace,n=a!==b||l.$$html5&&e.history&&f!==l.$$state;if(I||n)I=!1,d.$evalAsync(function(){var b=l.absUrl(),c=d.$broadcast("$locationChangeStart",b,a,l.$$state,f).defaultPrevented;l.absUrl()===b&&(c?(l.$$parse(a),l.$$state=f):(n&&h(b,g,f===l.$$state?null:l.$$state),k(a,f)))});l.$$replace=!1});return l}]}function tf(){var a=!0,b=this;this.debugEnabled=function(b){return x(b)?
(a=b,this):a};this.$get=["$window",function(d){function c(a){a instanceof Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=d.console||{},e=b[a]||b.log||A;a=!1;try{a=!!e.apply}catch(k){}return a?function(){var a=[];r(arguments,function(b){a.push(c(b))});return e.apply(b,a)}:function(a,b){e(a,null==b?"":b)}}return{log:e("log"),info:e("info"),warn:e("warn"),error:e("error"),
debug:function(){var c=e("debug");return function(){a&&c.apply(b,arguments)}}()}}]}function Ua(a,b){if("__defineGetter__"===a||"__defineSetter__"===a||"__lookupGetter__"===a||"__lookupSetter__"===a||"__proto__"===a)throw ca("isecfld",b);return a}function ig(a){return a+""}function ra(a,b){if(a){if(a.constructor===a)throw ca("isecfn",b);if(a.window===a)throw ca("isecwindow",b);if(a.children&&(a.nodeName||a.prop&&a.attr&&a.find))throw ca("isecdom",b);if(a===Object)throw ca("isecobj",b);}return a}function od(a,
b){if(a){if(a.constructor===a)throw ca("isecfn",b);if(a===jg||a===kg||a===lg)throw ca("isecff",b);}}function Ib(a,b){if(a&&(a===(0).constructor||a===(!1).constructor||a==="".constructor||a==={}.constructor||a===[].constructor||a===Function.constructor))throw ca("isecaf",b);}function mg(a,b){return"undefined"!==typeof a?a:b}function pd(a,b){return"undefined"===typeof a?b:"undefined"===typeof b?a:a+b}function $(a,b){var d,c;switch(a.type){case t.Program:d=!0;r(a.body,function(a){$(a.expression,b);d=
d&&a.expression.constant});a.constant=d;break;case t.Literal:a.constant=!0;a.toWatch=[];break;case t.UnaryExpression:$(a.argument,b);a.constant=a.argument.constant;a.toWatch=a.argument.toWatch;break;case t.BinaryExpression:$(a.left,b);$(a.right,b);a.constant=a.left.constant&&a.right.constant;a.toWatch=a.left.toWatch.concat(a.right.toWatch);break;case t.LogicalExpression:$(a.left,b);$(a.right,b);a.constant=a.left.constant&&a.right.constant;a.toWatch=a.constant?[]:[a];break;case t.ConditionalExpression:$(a.test,
b);$(a.alternate,b);$(a.consequent,b);a.constant=a.test.constant&&a.alternate.constant&&a.consequent.constant;a.toWatch=a.constant?[]:[a];break;case t.Identifier:a.constant=!1;a.toWatch=[a];break;case t.MemberExpression:$(a.object,b);a.computed&&$(a.property,b);a.constant=a.object.constant&&(!a.computed||a.property.constant);a.toWatch=[a];break;case t.CallExpression:d=a.filter?!b(a.callee.name).$stateful:!1;c=[];r(a.arguments,function(a){$(a,b);d=d&&a.constant;a.constant||c.push.apply(c,a.toWatch)});
a.constant=d;a.toWatch=a.filter&&!b(a.callee.name).$stateful?c:[a];break;case t.AssignmentExpression:$(a.left,b);$(a.right,b);a.constant=a.left.constant&&a.right.constant;a.toWatch=[a];break;case t.ArrayExpression:d=!0;c=[];r(a.elements,function(a){$(a,b);d=d&&a.constant;a.constant||c.push.apply(c,a.toWatch)});a.constant=d;a.toWatch=c;break;case t.ObjectExpression:d=!0;c=[];r(a.properties,function(a){$(a.value,b);d=d&&a.value.constant&&!a.computed;a.value.constant||c.push.apply(c,a.value.toWatch)});
a.constant=d;a.toWatch=c;break;case t.ThisExpression:a.constant=!1;a.toWatch=[];break;case t.LocalsExpression:a.constant=!1,a.toWatch=[]}}function qd(a){if(1==a.length){a=a[0].expression;var b=a.toWatch;return 1!==b.length?b:b[0]!==a?b:void 0}}function rd(a){return a.type===t.Identifier||a.type===t.MemberExpression}function sd(a){if(1===a.body.length&&rd(a.body[0].expression))return{type:t.AssignmentExpression,left:a.body[0].expression,right:{type:t.NGValueParameter},operator:"="}}function td(a){return 0===
a.body.length||1===a.body.length&&(a.body[0].expression.type===t.Literal||a.body[0].expression.type===t.ArrayExpression||a.body[0].expression.type===t.ObjectExpression)}function ud(a,b){this.astBuilder=a;this.$filter=b}function vd(a,b){this.astBuilder=a;this.$filter=b}function Jb(a){return"constructor"==a}function ic(a){return z(a.valueOf)?a.valueOf():ng.call(a)}function uf(){var a=T(),b=T(),d={"true":!0,"false":!1,"null":null,undefined:void 0},c,e;this.addLiteral=function(a,b){d[a]=b};this.setIdentifierFns=
function(a,b){c=a;e=b;return this};this.$get=["$filter",function(f){function g(c,d,e){var g,k,C;e=e||K;switch(typeof c){case "string":C=c=c.trim();var D=e?b:a;g=D[C];if(!g){":"===c.charAt(0)&&":"===c.charAt(1)&&(k=!0,c=c.substring(2));g=e?q:I;var G=new jc(g);g=(new kc(G,f,g)).parse(c);g.constant?g.$$watchDelegate=p:k?g.$$watchDelegate=g.literal?n:m:g.inputs&&(g.$$watchDelegate=l);e&&(g=h(g));D[C]=g}return s(g,d);case "function":return s(c,d);default:return s(A,d)}}function h(a){function b(c,d,e,f){var g=
K;K=!0;try{return a(c,d,e,f)}finally{K=g}}if(!a)return a;b.$$watchDelegate=a.$$watchDelegate;b.assign=h(a.assign);b.constant=a.constant;b.literal=a.literal;for(var c=0;a.inputs&&c<a.inputs.length;++c)a.inputs[c]=h(a.inputs[c]);b.inputs=a.inputs;return b}function k(a,b){return null==a||null==b?a===b:"object"===typeof a&&(a=ic(a),"object"===typeof a)?!1:a===b||a!==a&&b!==b}function l(a,b,c,d,e){var f=d.inputs,g;if(1===f.length){var h=k,f=f[0];return a.$watch(function(a){var b=f(a);k(b,h)||(g=d(a,void 0,
void 0,[b]),h=b&&ic(b));return g},b,c,e)}for(var l=[],n=[],m=0,p=f.length;m<p;m++)l[m]=k,n[m]=null;return a.$watch(function(a){for(var b=!1,c=0,e=f.length;c<e;c++){var h=f[c](a);if(b||(b=!k(h,l[c])))n[c]=h,l[c]=h&&ic(h)}b&&(g=d(a,void 0,void 0,n));return g},b,c,e)}function m(a,b,c,d){var e,f;return e=a.$watch(function(a){return d(a)},function(a,c,d){f=a;z(b)&&b.apply(this,arguments);x(a)&&d.$$postDigest(function(){x(f)&&e()})},c)}function n(a,b,c,d){function e(a){var b=!0;r(a,function(a){x(a)||(b=
!1)});return b}var f,g;return f=a.$watch(function(a){return d(a)},function(a,c,d){g=a;z(b)&&b.call(this,a,c,d);e(a)&&d.$$postDigest(function(){e(g)&&f()})},c)}function p(a,b,c,d){var e;return e=a.$watch(function(a){e();return d(a)},b,c)}function s(a,b){if(!b)return a;var c=a.$$watchDelegate,d=!1,c=c!==n&&c!==m?function(c,e,f,g){f=d&&g?g[0]:a(c,e,f,g);return b(f,c,e)}:function(c,d,e,f){e=a(c,d,e,f);c=b(e,c,d);return x(e)?c:e};a.$$watchDelegate&&a.$$watchDelegate!==l?c.$$watchDelegate=a.$$watchDelegate:
b.$stateful||(c.$$watchDelegate=l,d=!a.inputs,c.inputs=a.inputs?a.inputs:[a]);return c}var V=Fa().noUnsafeEval,I={csp:V,expensiveChecks:!1,literals:Z(d),isIdentifierStart:z(c)&&c,isIdentifierContinue:z(e)&&e},q={csp:V,expensiveChecks:!0,literals:Z(d),isIdentifierStart:z(c)&&c,isIdentifierContinue:z(e)&&e},K=!1;g.$$runningExpensiveChecks=function(){return K};return g}]}function wf(){this.$get=["$rootScope","$exceptionHandler",function(a,b){return wd(function(b){a.$evalAsync(b)},b)}]}function xf(){this.$get=
["$browser","$exceptionHandler",function(a,b){return wd(function(b){a.defer(b)},b)}]}function wd(a,b){function d(){this.$$state={status:0}}function c(a,b){return function(c){b.call(a,c)}}function e(c){!c.processScheduled&&c.pending&&(c.processScheduled=!0,a(function(){var a,d,e;e=c.pending;c.processScheduled=!1;c.pending=void 0;for(var f=0,g=e.length;f<g;++f){d=e[f][0];a=e[f][c.status];try{z(a)?d.resolve(a(c.value)):1===c.status?d.resolve(c.value):d.reject(c.value)}catch(h){d.reject(h),b(h)}}}))}
function f(){this.promise=new d}var g=O("$q",TypeError);R(d.prototype,{then:function(a,b,c){if(w(a)&&w(b)&&w(c))return this;var d=new f;this.$$state.pending=this.$$state.pending||[];this.$$state.pending.push([d,a,b,c]);0<this.$$state.status&&e(this.$$state);return d.promise},"catch":function(a){return this.then(null,a)},"finally":function(a,b){return this.then(function(b){return k(b,!0,a)},function(b){return k(b,!1,a)},b)}});R(f.prototype,{resolve:function(a){this.promise.$$state.status||(a===this.promise?
this.$$reject(g("qcycle",a)):this.$$resolve(a))},$$resolve:function(a){function d(a){k||(k=!0,h.$$resolve(a))}function f(a){k||(k=!0,h.$$reject(a))}var g,h=this,k=!1;try{if(H(a)||z(a))g=a&&a.then;z(g)?(this.promise.$$state.status=-1,g.call(a,d,f,c(this,this.notify))):(this.promise.$$state.value=a,this.promise.$$state.status=1,e(this.promise.$$state))}catch(l){f(l),b(l)}},reject:function(a){this.promise.$$state.status||this.$$reject(a)},$$reject:function(a){this.promise.$$state.value=a;this.promise.$$state.status=
2;e(this.promise.$$state)},notify:function(c){var d=this.promise.$$state.pending;0>=this.promise.$$state.status&&d&&d.length&&a(function(){for(var a,e,f=0,g=d.length;f<g;f++){e=d[f][0];a=d[f][3];try{e.notify(z(a)?a(c):c)}catch(h){b(h)}}})}});var h=function(a,b){var c=new f;b?c.resolve(a):c.reject(a);return c.promise},k=function(a,b,c){var d=null;try{z(c)&&(d=c())}catch(e){return h(e,!1)}return d&&z(d.then)?d.then(function(){return h(a,b)},function(a){return h(a,!1)}):h(a,b)},l=function(a,b,c,d){var e=
new f;e.resolve(a);return e.promise.then(b,c,d)},m=function(a){if(!z(a))throw g("norslvr",a);var b=new f;a(function(a){b.resolve(a)},function(a){b.reject(a)});return b.promise};m.prototype=d.prototype;m.defer=function(){var a=new f;a.resolve=c(a,a.resolve);a.reject=c(a,a.reject);a.notify=c(a,a.notify);return a};m.reject=function(a){var b=new f;b.reject(a);return b.promise};m.when=l;m.resolve=l;m.all=function(a){var b=new f,c=0,d=J(a)?[]:{};r(a,function(a,e){c++;l(a).then(function(a){d.hasOwnProperty(e)||
(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});0===c&&b.resolve(d);return b.promise};return m}function Gf(){this.$get=["$window","$timeout",function(a,b){var d=a.requestAnimationFrame||a.webkitRequestAnimationFrame,c=a.cancelAnimationFrame||a.webkitCancelAnimationFrame||a.webkitCancelRequestAnimationFrame,e=!!d,f=e?function(a){var b=d(a);return function(){c(b)}}:function(a){var c=b(a,16.66,!1);return function(){b.cancel(c)}};f.supported=e;return f}]}function vf(){function a(a){function b(){this.$$watchers=
this.$$nextSibling=this.$$childHead=this.$$childTail=null;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=0;this.$id=++pb;this.$$ChildScope=null}b.prototype=a;return b}var b=10,d=O("$rootScope"),c=null,e=null;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$exceptionHandler","$parse","$browser",function(f,g,h){function k(a){a.currentScope.$$destroyed=!0}function l(a){9===Ba&&(a.$$childHead&&l(a.$$childHead),a.$$nextSibling&&l(a.$$nextSibling));a.$parent=a.$$nextSibling=
a.$$prevSibling=a.$$childHead=a.$$childTail=a.$root=a.$$watchers=null}function m(){this.$id=++pb;this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this.$root=this;this.$$destroyed=!1;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=0;this.$$isolateBindings=null}function n(a){if(K.$$phase)throw d("inprog",K.$$phase);K.$$phase=a}function p(a,b){do a.$$watchersCount+=b;while(a=a.$parent)}function s(a,b,c){do a.$$listenerCount[c]-=
b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];while(a=a.$parent)}function t(){}function I(){for(;y.length;)try{y.shift()()}catch(a){f(a)}e=null}function q(){null===e&&(e=h.defer(function(){K.$apply(I)}))}m.prototype={constructor:m,$new:function(b,c){var d;c=c||this;b?(d=new m,d.$root=this.$root):(this.$$ChildScope||(this.$$ChildScope=a(this)),d=new this.$$ChildScope);d.$parent=c;d.$$prevSibling=c.$$childTail;c.$$childHead?(c.$$childTail.$$nextSibling=d,c.$$childTail=d):c.$$childHead=c.$$childTail=
d;(b||c!=this)&&d.$on("$destroy",k);return d},$watch:function(a,b,d,e){var f=g(a);if(f.$$watchDelegate)return f.$$watchDelegate(this,b,d,f,a);var h=this,k=h.$$watchers,l={fn:b,last:t,get:f,exp:e||a,eq:!!d};c=null;z(b)||(l.fn=A);k||(k=h.$$watchers=[]);k.unshift(l);p(this,1);return function(){0<=$a(k,l)&&p(h,-1);c=null}},$watchGroup:function(a,b){function c(){h=!1;k?(k=!1,b(e,e,g)):b(e,d,g)}var d=Array(a.length),e=Array(a.length),f=[],g=this,h=!1,k=!0;if(!a.length){var l=!0;g.$evalAsync(function(){l&&
b(e,e,g)});return function(){l=!1}}if(1===a.length)return this.$watch(a[0],function(a,c,f){e[0]=a;d[0]=c;b(e,a===c?e:d,f)});r(a,function(a,b){var k=g.$watch(a,function(a,f){e[b]=a;d[b]=f;h||(h=!0,g.$evalAsync(c))});f.push(k)});return function(){for(;f.length;)f.shift()()}},$watchCollection:function(a,b){function c(a){e=a;var b,d,g,h;if(!w(e)){if(H(e))if(oa(e))for(f!==n&&(f=n,q=f.length=0,l++),a=e.length,q!==a&&(l++,f.length=q=a),b=0;b<a;b++)h=f[b],g=e[b],d=h!==h&&g!==g,d||h===g||(l++,f[b]=g);else{f!==
p&&(f=p={},q=0,l++);a=0;for(b in e)sa.call(e,b)&&(a++,g=e[b],h=f[b],b in f?(d=h!==h&&g!==g,d||h===g||(l++,f[b]=g)):(q++,f[b]=g,l++));if(q>a)for(b in l++,f)sa.call(e,b)||(q--,delete f[b])}else f!==e&&(f=e,l++);return l}}c.$stateful=!0;var d=this,e,f,h,k=1<b.length,l=0,m=g(a,c),n=[],p={},s=!0,q=0;return this.$watch(m,function(){s?(s=!1,b(e,e,d)):b(e,h,d);if(k)if(H(e))if(oa(e)){h=Array(e.length);for(var a=0;a<e.length;a++)h[a]=e[a]}else for(a in h={},e)sa.call(e,a)&&(h[a]=e[a]);else h=e})},$digest:function(){var a,
g,k,l,m,p,s,q,r=b,y,x=[],w,A;n("$digest");h.$$checkUrlChange();this===K&&null!==e&&(h.defer.cancel(e),I());c=null;do{q=!1;y=this;for(p=0;p<v.length;p++){try{A=v[p],A.scope.$eval(A.expression,A.locals)}catch(E){f(E)}c=null}v.length=0;a:do{if(p=y.$$watchers)for(s=p.length;s--;)try{if(a=p[s])if(m=a.get,(g=m(y))!==(k=a.last)&&!(a.eq?na(g,k):"number"===typeof g&&"number"===typeof k&&isNaN(g)&&isNaN(k)))q=!0,c=a,a.last=a.eq?Z(g,null):g,l=a.fn,l(g,k===t?g:k,y),5>r&&(w=4-r,x[w]||(x[w]=[]),x[w].push({msg:z(a.exp)?
"fn: "+(a.exp.name||a.exp.toString()):a.exp,newVal:g,oldVal:k}));else if(a===c){q=!1;break a}}catch(B){f(B)}if(!(p=y.$$watchersCount&&y.$$childHead||y!==this&&y.$$nextSibling))for(;y!==this&&!(p=y.$$nextSibling);)y=y.$parent}while(y=p);if((q||v.length)&&!r--)throw K.$$phase=null,d("infdig",b,x);}while(q||v.length);for(K.$$phase=null;P<u.length;)try{u[P++]()}catch(F){f(F)}u.length=P=0},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;this===
K&&h.$$applicationDestroyed();p(this,-this.$$watchersCount);for(var b in this.$$listenerCount)s(this,this.$$listenerCount[b],b);a&&a.$$childHead==this&&(a.$$childHead=this.$$nextSibling);a&&a.$$childTail==this&&(a.$$childTail=this.$$prevSibling);this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling);this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling);this.$destroy=this.$digest=this.$apply=this.$evalAsync=this.$applyAsync=A;this.$on=this.$watch=this.$watchGroup=
function(){return A};this.$$listeners={};this.$$nextSibling=null;l(this)}},$eval:function(a,b){return g(a)(this,b)},$evalAsync:function(a,b){K.$$phase||v.length||h.defer(function(){v.length&&K.$digest()});v.push({scope:this,expression:g(a),locals:b})},$$postDigest:function(a){u.push(a)},$apply:function(a){try{n("$apply");try{return this.$eval(a)}finally{K.$$phase=null}}catch(b){f(b)}finally{try{K.$digest()}catch(c){throw f(c),c;}}},$applyAsync:function(a){function b(){c.$eval(a)}var c=this;a&&y.push(b);
a=g(a);q()},$on:function(a,b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);var e=this;return function(){var d=c.indexOf(b);-1!==d&&(c[d]=null,s(e,1,a))}},$emit:function(a,b){var c=[],d,e=this,g=!1,h={name:a,targetScope:e,stopPropagation:function(){g=!0},preventDefault:function(){h.defaultPrevented=!0},defaultPrevented:!1},k=ab([h],arguments,1),l,m;do{d=e.$$listeners[a]||c;h.currentScope=
e;l=0;for(m=d.length;l<m;l++)if(d[l])try{d[l].apply(null,k)}catch(n){f(n)}else d.splice(l,1),l--,m--;if(g)return h.currentScope=null,h;e=e.$parent}while(e);h.currentScope=null;return h},$broadcast:function(a,b){var c=this,d=this,e={name:a,targetScope:this,preventDefault:function(){e.defaultPrevented=!0},defaultPrevented:!1};if(!this.$$listenerCount[a])return e;for(var g=ab([e],arguments,1),h,k;c=d;){e.currentScope=c;d=c.$$listeners[a]||[];h=0;for(k=d.length;h<k;h++)if(d[h])try{d[h].apply(null,g)}catch(l){f(l)}else d.splice(h,
1),h--,k--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=c.$$nextSibling);)c=c.$parent}e.currentScope=null;return e}};var K=new m,v=K.$$asyncQueue=[],u=K.$$postDigestQueue=[],y=K.$$applyAsyncQueue=[],P=0;return K}]}function oe(){var a=/^\s*(https?|ftp|mailto|tel|file):/,b=/^\s*((https?|ftp|file|blob):|data:image\/)/;this.aHrefSanitizationWhitelist=function(b){return x(b)?(a=b,this):a};this.imgSrcSanitizationWhitelist=function(a){return x(a)?(b=a,this):b};
this.$get=function(){return function(d,c){var e=c?b:a,f;f=qa(d).href;return""===f||f.match(e)?d:"unsafe:"+f}}}function og(a){if("self"===a)return a;if(F(a)){if(-1<a.indexOf("***"))throw ya("iwcard",a);a=xd(a).replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*");return new RegExp("^"+a+"$")}if(Xa(a))return new RegExp("^"+a.source+"$");throw ya("imatcher");}function yd(a){var b=[];x(a)&&r(a,function(a){b.push(og(a))});return b}function zf(){this.SCE_CONTEXTS=ma;var a=["self"],b=[];this.resourceUrlWhitelist=
function(b){arguments.length&&(a=yd(b));return a};this.resourceUrlBlacklist=function(a){arguments.length&&(b=yd(a));return b};this.$get=["$injector",function(d){function c(a,b){return"self"===a?jd(b):!!a.exec(b.href)}function e(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var f=function(a){throw ya("unsafe");
};d.has("$sanitize")&&(f=d.get("$sanitize"));var g=e(),h={};h[ma.HTML]=e(g);h[ma.CSS]=e(g);h[ma.URL]=e(g);h[ma.JS]=e(g);h[ma.RESOURCE_URL]=e(h[ma.URL]);return{trustAs:function(a,b){var c=h.hasOwnProperty(a)?h[a]:null;if(!c)throw ya("icontext",a,b);if(null===b||w(b)||""===b)return b;if("string"!==typeof b)throw ya("itype",a);return new c(b)},getTrusted:function(d,e){if(null===e||w(e)||""===e)return e;var g=h.hasOwnProperty(d)?h[d]:null;if(g&&e instanceof g)return e.$$unwrapTrustedValue();if(d===ma.RESOURCE_URL){var g=
qa(e.toString()),n,p,s=!1;n=0;for(p=a.length;n<p;n++)if(c(a[n],g)){s=!0;break}if(s)for(n=0,p=b.length;n<p;n++)if(c(b[n],g)){s=!1;break}if(s)return e;throw ya("insecurl",e.toString());}if(d===ma.HTML)return f(e);throw ya("unsafe");},valueOf:function(a){return a instanceof g?a.$$unwrapTrustedValue():a}}}]}function yf(){var a=!0;this.enabled=function(b){arguments.length&&(a=!!b);return a};this.$get=["$parse","$sceDelegate",function(b,d){if(a&&8>Ba)throw ya("iequirks");var c=ga(ma);c.isEnabled=function(){return a};
c.trustAs=d.trustAs;c.getTrusted=d.getTrusted;c.valueOf=d.valueOf;a||(c.trustAs=c.getTrusted=function(a,b){return b},c.valueOf=Ya);c.parseAs=function(a,d){var e=b(d);return e.literal&&e.constant?e:b(d,function(b){return c.getTrusted(a,b)})};var e=c.parseAs,f=c.getTrusted,g=c.trustAs;r(ma,function(a,b){var d=M(b);c[eb("parse_as_"+d)]=function(b){return e(a,b)};c[eb("get_trusted_"+d)]=function(b){return f(a,b)};c[eb("trust_as_"+d)]=function(b){return g(a,b)}});return c}]}function Af(){this.$get=["$window",
"$document",function(a,b){var d={},c=!(a.chrome&&a.chrome.app&&a.chrome.app.runtime)&&a.history&&a.history.pushState,e=aa((/android (\d+)/.exec(M((a.navigator||{}).userAgent))||[])[1]),f=/Boxee/i.test((a.navigator||{}).userAgent),g=b[0]||{},h,k=/^(Moz|webkit|ms)(?=[A-Z])/,l=g.body&&g.body.style,m=!1,n=!1;if(l){for(var p in l)if(m=k.exec(p)){h=m[0];h=h[0].toUpperCase()+h.substr(1);break}h||(h="WebkitOpacity"in l&&"webkit");m=!!("transition"in l||h+"Transition"in l);n=!!("animation"in l||h+"Animation"in
l);!e||m&&n||(m=F(l.webkitTransition),n=F(l.webkitAnimation))}return{history:!(!c||4>e||f),hasEvent:function(a){if("input"===a&&11>=Ba)return!1;if(w(d[a])){var b=g.createElement("div");d[a]="on"+a in b}return d[a]},csp:Fa(),vendorPrefix:h,transitions:m,animations:n,android:e}}]}function Cf(){var a;this.httpOptions=function(b){return b?(a=b,this):a};this.$get=["$templateCache","$http","$q","$sce",function(b,d,c,e){function f(g,h){f.totalPendingRequests++;if(!F(g)||w(b.get(g)))g=e.getTrustedResourceUrl(g);
var k=d.defaults&&d.defaults.transformResponse;J(k)?k=k.filter(function(a){return a!==dc}):k===dc&&(k=null);return d.get(g,R({cache:b,transformResponse:k},a))["finally"](function(){f.totalPendingRequests--}).then(function(a){b.put(g,a.data);return a.data},function(a){if(!h)throw pg("tpload",g,a.status,a.statusText);return c.reject(a)})}f.totalPendingRequests=0;return f}]}function Df(){this.$get=["$rootScope","$browser","$location",function(a,b,d){return{findBindings:function(a,b,d){a=a.getElementsByClassName("ng-binding");
var g=[];r(a,function(a){var c=ea.element(a).data("$binding");c&&r(c,function(c){d?(new RegExp("(^|\\s)"+xd(b)+"(\\s|\\||$)")).test(c)&&g.push(a):-1!=c.indexOf(b)&&g.push(a)})});return g},findModels:function(a,b,d){for(var g=["ng-","data-ng-","ng\\:"],h=0;h<g.length;++h){var k=a.querySelectorAll("["+g[h]+"model"+(d?"=":"*=")+'"'+b+'"]');if(k.length)return k}},getLocation:function(){return d.url()},setLocation:function(b){b!==d.url()&&(d.url(b),a.$digest())},whenStable:function(a){b.notifyWhenNoOutstandingRequests(a)}}}]}
function Ef(){this.$get=["$rootScope","$browser","$q","$$q","$exceptionHandler",function(a,b,d,c,e){function f(f,k,l){z(f)||(l=k,k=f,f=A);var m=ta.call(arguments,3),n=x(l)&&!l,p=(n?c:d).defer(),s=p.promise,r;r=b.defer(function(){try{p.resolve(f.apply(null,m))}catch(b){p.reject(b),e(b)}finally{delete g[s.$$timeoutId]}n||a.$apply()},k);s.$$timeoutId=r;g[r]=p;return s}var g={};f.cancel=function(a){return a&&a.$$timeoutId in g?(g[a.$$timeoutId].reject("canceled"),delete g[a.$$timeoutId],b.defer.cancel(a.$$timeoutId)):
!1};return f}]}function qa(a){Ba&&(Y.setAttribute("href",a),a=Y.href);Y.setAttribute("href",a);return{href:Y.href,protocol:Y.protocol?Y.protocol.replace(/:$/,""):"",host:Y.host,search:Y.search?Y.search.replace(/^\?/,""):"",hash:Y.hash?Y.hash.replace(/^#/,""):"",hostname:Y.hostname,port:Y.port,pathname:"/"===Y.pathname.charAt(0)?Y.pathname:"/"+Y.pathname}}function jd(a){a=F(a)?qa(a):a;return a.protocol===zd.protocol&&a.host===zd.host}function Ff(){this.$get=da(E)}function Ad(a){function b(a){try{return decodeURIComponent(a)}catch(b){return a}}
var d=a[0]||{},c={},e="";return function(){var a,g,h,k,l;a=d.cookie||"";if(a!==e)for(e=a,a=e.split("; "),c={},h=0;h<a.length;h++)g=a[h],k=g.indexOf("="),0<k&&(l=b(g.substring(0,k)),w(c[l])&&(c[l]=b(g.substring(k+1))));return c}}function Jf(){this.$get=Ad}function Mc(a){function b(d,c){if(H(d)){var e={};r(d,function(a,c){e[c]=b(c,a)});return e}return a.factory(d+"Filter",c)}this.register=b;this.$get=["$injector",function(a){return function(b){return a.get(b+"Filter")}}];b("currency",Bd);b("date",Cd);
b("filter",qg);b("json",rg);b("limitTo",sg);b("lowercase",tg);b("number",Dd);b("orderBy",Ed);b("uppercase",ug)}function qg(){return function(a,b,d){if(!oa(a)){if(null==a)return a;throw O("filter")("notarray",a);}var c;switch(lc(b)){case "function":break;case "boolean":case "null":case "number":case "string":c=!0;case "object":b=vg(b,d,c);break;default:return a}return Array.prototype.filter.call(a,b)}}function vg(a,b,d){var c=H(a)&&"$"in a;!0===b?b=na:z(b)||(b=function(a,b){if(w(a))return!1;if(null===
a||null===b)return a===b;if(H(b)||H(a)&&!vc(a))return!1;a=M(""+a);b=M(""+b);return-1!==a.indexOf(b)});return function(e){return c&&!H(e)?La(e,a.$,b,!1):La(e,a,b,d)}}function La(a,b,d,c,e){var f=lc(a),g=lc(b);if("string"===g&&"!"===b.charAt(0))return!La(a,b.substring(1),d,c);if(J(a))return a.some(function(a){return La(a,b,d,c)});switch(f){case "object":var h;if(c){for(h in a)if("$"!==h.charAt(0)&&La(a[h],b,d,!0))return!0;return e?!1:La(a,b,d,!1)}if("object"===g){for(h in b)if(e=b[h],!z(e)&&!w(e)&&
(f="$"===h,!La(f?a:a[h],e,d,f,f)))return!1;return!0}return d(a,b);case "function":return!1;default:return d(a,b)}}function lc(a){return null===a?"null":typeof a}function Bd(a){var b=a.NUMBER_FORMATS;return function(a,c,e){w(c)&&(c=b.CURRENCY_SYM);w(e)&&(e=b.PATTERNS[1].maxFrac);return null==a?a:Fd(a,b.PATTERNS[1],b.GROUP_SEP,b.DECIMAL_SEP,e).replace(/\u00A4/g,c)}}function Dd(a){var b=a.NUMBER_FORMATS;return function(a,c){return null==a?a:Fd(a,b.PATTERNS[0],b.GROUP_SEP,b.DECIMAL_SEP,c)}}function wg(a){var b=
0,d,c,e,f,g;-1<(c=a.indexOf(Gd))&&(a=a.replace(Gd,""));0<(e=a.search(/e/i))?(0>c&&(c=e),c+=+a.slice(e+1),a=a.substring(0,e)):0>c&&(c=a.length);for(e=0;a.charAt(e)==mc;e++);if(e==(g=a.length))d=[0],c=1;else{for(g--;a.charAt(g)==mc;)g--;c-=e;d=[];for(f=0;e<=g;e++,f++)d[f]=+a.charAt(e)}c>Hd&&(d=d.splice(0,Hd-1),b=c-1,c=1);return{d:d,e:b,i:c}}function xg(a,b,d,c){var e=a.d,f=e.length-a.i;b=w(b)?Math.min(Math.max(d,f),c):+b;d=b+a.i;c=e[d];if(0<d){e.splice(Math.max(a.i,d));for(var g=d;g<e.length;g++)e[g]=
0}else for(f=Math.max(0,f),a.i=1,e.length=Math.max(1,d=b+1),e[0]=0,g=1;g<d;g++)e[g]=0;if(5<=c)if(0>d-1){for(c=0;c>d;c--)e.unshift(0),a.i++;e.unshift(1);a.i++}else e[d-1]++;for(;f<Math.max(0,b);f++)e.push(0);if(b=e.reduceRight(function(a,b,c,d){b+=a;d[c]=b%10;return Math.floor(b/10)},0))e.unshift(b),a.i++}function Fd(a,b,d,c,e){if(!F(a)&&!S(a)||isNaN(a))return"";var f=!isFinite(a),g=!1,h=Math.abs(a)+"",k="";if(f)k="\u221e";else{g=wg(h);xg(g,e,b.minFrac,b.maxFrac);k=g.d;h=g.i;e=g.e;f=[];for(g=k.reduce(function(a,
b){return a&&!b},!0);0>h;)k.unshift(0),h++;0<h?f=k.splice(h,k.length):(f=k,k=[0]);h=[];for(k.length>=b.lgSize&&h.unshift(k.splice(-b.lgSize,k.length).join(""));k.length>b.gSize;)h.unshift(k.splice(-b.gSize,k.length).join(""));k.length&&h.unshift(k.join(""));k=h.join(d);f.length&&(k+=c+f.join(""));e&&(k+="e+"+e)}return 0>a&&!g?b.negPre+k+b.negSuf:b.posPre+k+b.posSuf}function Kb(a,b,d,c){var e="";if(0>a||c&&0>=a)c?a=-a+1:(a=-a,e="-");for(a=""+a;a.length<b;)a=mc+a;d&&(a=a.substr(a.length-b));return e+
a}function X(a,b,d,c,e){d=d||0;return function(f){f=f["get"+a]();if(0<d||f>-d)f+=d;0===f&&-12==d&&(f=12);return Kb(f,b,c,e)}}function kb(a,b,d){return function(c,e){var f=c["get"+a](),g=ub((d?"STANDALONE":"")+(b?"SHORT":"")+a);return e[g][f]}}function Id(a){var b=(new Date(a,0,1)).getDay();return new Date(a,0,(4>=b?5:12)-b)}function Jd(a){return function(b){var d=Id(b.getFullYear());b=+new Date(b.getFullYear(),b.getMonth(),b.getDate()+(4-b.getDay()))-+d;b=1+Math.round(b/6048E5);return Kb(b,a)}}function nc(a,
b){return 0>=a.getFullYear()?b.ERAS[0]:b.ERAS[1]}function Cd(a){function b(a){var b;if(b=a.match(d)){a=new Date(0);var f=0,g=0,h=b[8]?a.setUTCFullYear:a.setFullYear,k=b[8]?a.setUTCHours:a.setHours;b[9]&&(f=aa(b[9]+b[10]),g=aa(b[9]+b[11]));h.call(a,aa(b[1]),aa(b[2])-1,aa(b[3]));f=aa(b[4]||0)-f;g=aa(b[5]||0)-g;h=aa(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||0)));k.call(a,f,g,h,b)}return a}var d=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
return function(c,d,f){var g="",h=[],k,l;d=d||"mediumDate";d=a.DATETIME_FORMATS[d]||d;F(c)&&(c=yg.test(c)?aa(c):b(c));S(c)&&(c=new Date(c));if(!ia(c)||!isFinite(c.getTime()))return c;for(;d;)(l=zg.exec(d))?(h=ab(h,l,1),d=h.pop()):(h.push(d),d=null);var m=c.getTimezoneOffset();f&&(m=yc(f,m),c=Sb(c,f,!0));r(h,function(b){k=Ag[b];g+=k?k(c,a.DATETIME_FORMATS,m):"''"===b?"'":b.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return g}}function rg(){return function(a,b){w(b)&&(b=2);return cb(a,b)}}function sg(){return function(a,
b,d){b=Infinity===Math.abs(Number(b))?Number(b):aa(b);if(isNaN(b))return a;S(a)&&(a=a.toString());if(!oa(a))return a;d=!d||isNaN(d)?0:aa(d);d=0>d?Math.max(0,a.length+d):d;return 0<=b?oc(a,d,d+b):0===d?oc(a,b,a.length):oc(a,Math.max(0,d+b),d)}}function oc(a,b,d){return F(a)?a.slice(b,d):ta.call(a,b,d)}function Ed(a){function b(b){return b.map(function(b){var c=1,d=Ya;if(z(b))d=b;else if(F(b)){if("+"==b.charAt(0)||"-"==b.charAt(0))c="-"==b.charAt(0)?-1:1,b=b.substring(1);if(""!==b&&(d=a(b),d.constant))var e=
d(),d=function(a){return a[e]}}return{get:d,descending:c}})}function d(a){switch(typeof a){case "number":case "boolean":case "string":return!0;default:return!1}}function c(a,b){var c=0,d=a.type,k=b.type;if(d===k){var k=a.value,l=b.value;"string"===d?(k=k.toLowerCase(),l=l.toLowerCase()):"object"===d&&(H(k)&&(k=a.index),H(l)&&(l=b.index));k!==l&&(c=k<l?-1:1)}else c=d<k?-1:1;return c}return function(a,f,g,h){if(null==a)return a;if(!oa(a))throw O("orderBy")("notarray",a);J(f)||(f=[f]);0===f.length&&
(f=["+"]);var k=b(f),l=g?-1:1,m=z(h)?h:c;a=Array.prototype.map.call(a,function(a,b){return{value:a,tieBreaker:{value:b,type:"number",index:b},predicateValues:k.map(function(c){var e=c.get(a);c=typeof e;if(null===e)c="string",e="null";else if("object"===c)a:{if(z(e.valueOf)&&(e=e.valueOf(),d(e)))break a;vc(e)&&(e=e.toString(),d(e))}return{value:e,type:c,index:b}})}});a.sort(function(a,b){for(var c=0,d=k.length;c<d;c++){var e=m(a.predicateValues[c],b.predicateValues[c]);if(e)return e*k[c].descending*
l}return m(a.tieBreaker,b.tieBreaker)*l});return a=a.map(function(a){return a.value})}}function Ma(a){z(a)&&(a={link:a});a.restrict=a.restrict||"AC";return da(a)}function Kd(a,b,d,c,e){var f=this,g=[];f.$error={};f.$$success={};f.$pending=void 0;f.$name=e(b.name||b.ngForm||"")(d);f.$dirty=!1;f.$pristine=!0;f.$valid=!0;f.$invalid=!1;f.$submitted=!1;f.$$parentForm=Lb;f.$rollbackViewValue=function(){r(g,function(a){a.$rollbackViewValue()})};f.$commitViewValue=function(){r(g,function(a){a.$commitViewValue()})};
f.$addControl=function(a){Ra(a.$name,"input");g.push(a);a.$name&&(f[a.$name]=a);a.$$parentForm=f};f.$$renameControl=function(a,b){var c=a.$name;f[c]===a&&delete f[c];f[b]=a;a.$name=b};f.$removeControl=function(a){a.$name&&f[a.$name]===a&&delete f[a.$name];r(f.$pending,function(b,c){f.$setValidity(c,null,a)});r(f.$error,function(b,c){f.$setValidity(c,null,a)});r(f.$$success,function(b,c){f.$setValidity(c,null,a)});$a(g,a);a.$$parentForm=Lb};Ld({ctrl:this,$element:a,set:function(a,b,c){var d=a[b];d?
-1===d.indexOf(c)&&d.push(c):a[b]=[c]},unset:function(a,b,c){var d=a[b];d&&($a(d,c),0===d.length&&delete a[b])},$animate:c});f.$setDirty=function(){c.removeClass(a,Va);c.addClass(a,Mb);f.$dirty=!0;f.$pristine=!1;f.$$parentForm.$setDirty()};f.$setPristine=function(){c.setClass(a,Va,Mb+" ng-submitted");f.$dirty=!1;f.$pristine=!0;f.$submitted=!1;r(g,function(a){a.$setPristine()})};f.$setUntouched=function(){r(g,function(a){a.$setUntouched()})};f.$setSubmitted=function(){c.addClass(a,"ng-submitted");
f.$submitted=!0;f.$$parentForm.$setSubmitted()}}function pc(a){a.$formatters.push(function(b){return a.$isEmpty(b)?b:b.toString()})}function lb(a,b,d,c,e,f){var g=M(b[0].type);if(!e.android){var h=!1;b.on("compositionstart",function(){h=!0});b.on("compositionend",function(){h=!1;l()})}var k,l=function(a){k&&(f.defer.cancel(k),k=null);if(!h){var e=b.val();a=a&&a.type;"password"===g||d.ngTrim&&"false"===d.ngTrim||(e=W(e));(c.$viewValue!==e||""===e&&c.$$hasNativeValidators)&&c.$setViewValue(e,a)}};if(e.hasEvent("input"))b.on("input",
l);else{var m=function(a,b,c){k||(k=f.defer(function(){k=null;b&&b.value===c||l(a)}))};b.on("keydown",function(a){var b=a.keyCode;91===b||15<b&&19>b||37<=b&&40>=b||m(a,this,this.value)});if(e.hasEvent("paste"))b.on("paste cut",m)}b.on("change",l);if(Md[g]&&c.$$hasNativeValidators&&g===d.type)b.on("keydown wheel mousedown",function(a){if(!k){var b=this.validity,c=b.badInput,d=b.typeMismatch;k=f.defer(function(){k=null;b.badInput===c&&b.typeMismatch===d||l(a)})}});c.$render=function(){var a=c.$isEmpty(c.$viewValue)?
"":c.$viewValue;b.val()!==a&&b.val(a)}}function Nb(a,b){return function(d,c){var e,f;if(ia(d))return d;if(F(d)){'"'==d.charAt(0)&&'"'==d.charAt(d.length-1)&&(d=d.substring(1,d.length-1));if(Bg.test(d))return new Date(d);a.lastIndex=0;if(e=a.exec(d))return e.shift(),f=c?{yyyy:c.getFullYear(),MM:c.getMonth()+1,dd:c.getDate(),HH:c.getHours(),mm:c.getMinutes(),ss:c.getSeconds(),sss:c.getMilliseconds()/1E3}:{yyyy:1970,MM:1,dd:1,HH:0,mm:0,ss:0,sss:0},r(e,function(a,c){c<b.length&&(f[b[c]]=+a)}),new Date(f.yyyy,
f.MM-1,f.dd,f.HH,f.mm,f.ss||0,1E3*f.sss||0)}return NaN}}function mb(a,b,d,c){return function(e,f,g,h,k,l,m){function n(a){return a&&!(a.getTime&&a.getTime()!==a.getTime())}function p(a){return x(a)&&!ia(a)?d(a)||void 0:a}Nd(e,f,g,h);lb(e,f,g,h,k,l);var s=h&&h.$options&&h.$options.timezone,r;h.$$parserName=a;h.$parsers.push(function(a){if(h.$isEmpty(a))return null;if(b.test(a))return a=d(a,r),s&&(a=Sb(a,s)),a});h.$formatters.push(function(a){if(a&&!ia(a))throw nb("datefmt",a);if(n(a))return(r=a)&&
s&&(r=Sb(r,s,!0)),m("date")(a,c,s);r=null;return""});if(x(g.min)||g.ngMin){var t;h.$validators.min=function(a){return!n(a)||w(t)||d(a)>=t};g.$observe("min",function(a){t=p(a);h.$validate()})}if(x(g.max)||g.ngMax){var q;h.$validators.max=function(a){return!n(a)||w(q)||d(a)<=q};g.$observe("max",function(a){q=p(a);h.$validate()})}}}function Nd(a,b,d,c){(c.$$hasNativeValidators=H(b[0].validity))&&c.$parsers.push(function(a){var c=b.prop("validity")||{};return c.badInput||c.typeMismatch?void 0:a})}function Od(a,
b,d,c,e){if(x(c)){a=a(c);if(!a.constant)throw nb("constexpr",d,c);return a(b)}return e}function qc(a,b){a="ngClass"+a;return["$animate",function(d){function c(a,b){var c=[],d=0;a:for(;d<a.length;d++){for(var e=a[d],m=0;m<b.length;m++)if(e==b[m])continue a;c.push(e)}return c}function e(a){var b=[];return J(a)?(r(a,function(a){b=b.concat(e(a))}),b):F(a)?a.split(" "):H(a)?(r(a,function(a,c){a&&(b=b.concat(c.split(" ")))}),b):a}return{restrict:"AC",link:function(f,g,h){function k(a){a=l(a,1);h.$addClass(a)}
function l(a,b){var c=g.data("$classCounts")||T(),d=[];r(a,function(a){if(0<b||c[a])c[a]=(c[a]||0)+b,c[a]===+(0<b)&&d.push(a)});g.data("$classCounts",c);return d.join(" ")}function m(a,b){var e=c(b,a),f=c(a,b),e=l(e,1),f=l(f,-1);e&&e.length&&d.addClass(g,e);f&&f.length&&d.removeClass(g,f)}function n(a){if(!0===b||(f.$index&1)===b){var c=e(a||[]);if(!p)k(c);else if(!na(a,p)){var d=e(p);m(d,c)}}p=J(a)?a.map(function(a){return ga(a)}):ga(a)}var p;f.$watch(h[a],n,!0);h.$observe("class",function(b){n(f.$eval(h[a]))});
"ngClass"!==a&&f.$watch("$index",function(c,d){var g=c&1;if(g!==(d&1)){var m=e(f.$eval(h[a]));g===b?k(m):(g=l(m,-1),h.$removeClass(g))}})}}}]}function Ld(a){function b(a,b){b&&!f[a]?(k.addClass(e,a),f[a]=!0):!b&&f[a]&&(k.removeClass(e,a),f[a]=!1)}function d(a,c){a=a?"-"+Cc(a,"-"):"";b(ob+a,!0===c);b(Pd+a,!1===c)}var c=a.ctrl,e=a.$element,f={},g=a.set,h=a.unset,k=a.$animate;f[Pd]=!(f[ob]=e.hasClass(ob));c.$setValidity=function(a,e,f){w(e)?(c.$pending||(c.$pending={}),g(c.$pending,a,f)):(c.$pending&&
h(c.$pending,a,f),Qd(c.$pending)&&(c.$pending=void 0));Ea(e)?e?(h(c.$error,a,f),g(c.$$success,a,f)):(g(c.$error,a,f),h(c.$$success,a,f)):(h(c.$error,a,f),h(c.$$success,a,f));c.$pending?(b(Rd,!0),c.$valid=c.$invalid=void 0,d("",null)):(b(Rd,!1),c.$valid=Qd(c.$error),c.$invalid=!c.$valid,d("",c.$valid));e=c.$pending&&c.$pending[a]?void 0:c.$error[a]?!1:c.$$success[a]?!0:null;d(a,e);c.$$parentForm.$setValidity(a,e,c)}}function Qd(a){if(a)for(var b in a)if(a.hasOwnProperty(b))return!1;return!0}var Cg=
/^\/(.+)\/([a-z]*)$/,sa=Object.prototype.hasOwnProperty,M=function(a){return F(a)?a.toLowerCase():a},ub=function(a){return F(a)?a.toUpperCase():a},Ba,B,pa,ta=[].slice,bg=[].splice,Dg=[].push,ka=Object.prototype.toString,wc=Object.getPrototypeOf,za=O("ng"),ea=E.angular||(E.angular={}),Ub,pb=0;Ba=E.document.documentMode;A.$inject=[];Ya.$inject=[];var J=Array.isArray,be=/^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/,W=function(a){return F(a)?a.trim():a},xd=
function(a){return a.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")},Fa=function(){if(!x(Fa.rules)){var a=E.document.querySelector("[ng-csp]")||E.document.querySelector("[data-ng-csp]");if(a){var b=a.getAttribute("ng-csp")||a.getAttribute("data-ng-csp");Fa.rules={noUnsafeEval:!b||-1!==b.indexOf("no-unsafe-eval"),noInlineStyle:!b||-1!==b.indexOf("no-inline-style")}}else{a=Fa;try{new Function(""),b=!1}catch(d){b=!0}a.rules={noUnsafeEval:b,noInlineStyle:!1}}}return Fa.rules},
rb=function(){if(x(rb.name_))return rb.name_;var a,b,d=Oa.length,c,e;for(b=0;b<d;++b)if(c=Oa[b],a=E.document.querySelector("["+c.replace(":","\\:")+"jq]")){e=a.getAttribute(c+"jq");break}return rb.name_=e},ee=/:/g,Oa=["ng-","data-ng-","ng:","x-ng-"],je=/[A-Z]/g,Dc=!1,Na=3,ne={full:"1.5.7",major:1,minor:5,dot:7,codeName:"hexagonal-circumvolution"};U.expando="ng339";var gb=U.cache={},Pf=1;U._data=function(a){return this.cache[a[this.expando]]||{}};var Kf=/([\:\-\_]+(.))/g,Lf=/^moz([A-Z])/,yb={mouseleave:"mouseout",
mouseenter:"mouseover"},Wb=O("jqLite"),Of=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,Vb=/<|&#?\w+;/,Mf=/<([\w:-]+)/,Nf=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,ha={option:[1,'<select multiple="multiple">',"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ha.optgroup=ha.option;ha.tbody=ha.tfoot=ha.colgroup=ha.caption=ha.thead;
ha.th=ha.td;var Uf=E.Node.prototype.contains||function(a){return!!(this.compareDocumentPosition(a)&16)},Pa=U.prototype={ready:function(a){function b(){d||(d=!0,a())}var d=!1;"complete"===E.document.readyState?E.setTimeout(b):(this.on("DOMContentLoaded",b),U(E).on("load",b))},toString:function(){var a=[];r(this,function(b){a.push(""+b)});return"["+a.join(", ")+"]"},eq:function(a){return 0<=a?B(this[a]):B(this[this.length+a])},length:0,push:Dg,sort:[].sort,splice:[].splice},Eb={};r("multiple selected checked disabled readOnly required open".split(" "),
function(a){Eb[M(a)]=a});var Vc={};r("input select option textarea button form details".split(" "),function(a){Vc[a]=!0});var cd={ngMinlength:"minlength",ngMaxlength:"maxlength",ngMin:"min",ngMax:"max",ngPattern:"pattern"};r({data:Yb,removeData:fb,hasData:function(a){for(var b in gb[a.ng339])return!0;return!1},cleanData:function(a){for(var b=0,d=a.length;b<d;b++)fb(a[b])}},function(a,b){U[b]=a});r({data:Yb,inheritedData:Cb,scope:function(a){return B.data(a,"$scope")||Cb(a.parentNode||a,["$isolateScope",
"$scope"])},isolateScope:function(a){return B.data(a,"$isolateScope")||B.data(a,"$isolateScopeNoTemplate")},controller:Sc,injector:function(a){return Cb(a,"$injector")},removeAttr:function(a,b){a.removeAttribute(b)},hasClass:zb,css:function(a,b,d){b=eb(b);if(x(d))a.style[b]=d;else return a.style[b]},attr:function(a,b,d){var c=a.nodeType;if(c!==Na&&2!==c&&8!==c)if(c=M(b),Eb[c])if(x(d))d?(a[b]=!0,a.setAttribute(b,c)):(a[b]=!1,a.removeAttribute(c));else return a[b]||(a.attributes.getNamedItem(b)||A).specified?
c:void 0;else if(x(d))a.setAttribute(b,d);else if(a.getAttribute)return a=a.getAttribute(b,2),null===a?void 0:a},prop:function(a,b,d){if(x(d))a[b]=d;else return a[b]},text:function(){function a(a,d){if(w(d)){var c=a.nodeType;return 1===c||c===Na?a.textContent:""}a.textContent=d}a.$dv="";return a}(),val:function(a,b){if(w(b)){if(a.multiple&&"select"===ua(a)){var d=[];r(a.options,function(a){a.selected&&d.push(a.value||a.text)});return 0===d.length?null:d}return a.value}a.value=b},html:function(a,b){if(w(b))return a.innerHTML;
wb(a,!0);a.innerHTML=b},empty:Tc},function(a,b){U.prototype[b]=function(b,c){var e,f,g=this.length;if(a!==Tc&&w(2==a.length&&a!==zb&&a!==Sc?b:c)){if(H(b)){for(e=0;e<g;e++)if(a===Yb)a(this[e],b);else for(f in b)a(this[e],f,b[f]);return this}e=a.$dv;g=w(e)?Math.min(g,1):g;for(f=0;f<g;f++){var h=a(this[f],b,c);e=e?e+h:h}return e}for(e=0;e<g;e++)a(this[e],b,c);return this}});r({removeData:fb,on:function(a,b,d,c){if(x(c))throw Wb("onargs");if(Nc(a)){c=xb(a,!0);var e=c.events,f=c.handle;f||(f=c.handle=
Rf(a,e));c=0<=b.indexOf(" ")?b.split(" "):[b];for(var g=c.length,h=function(b,c,g){var h=e[b];h||(h=e[b]=[],h.specialHandlerWrapper=c,"$destroy"===b||g||a.addEventListener(b,f,!1));h.push(d)};g--;)b=c[g],yb[b]?(h(yb[b],Tf),h(b,void 0,!0)):h(b)}},off:Rc,one:function(a,b,d){a=B(a);a.on(b,function e(){a.off(b,d);a.off(b,e)});a.on(b,d)},replaceWith:function(a,b){var d,c=a.parentNode;wb(a);r(new U(b),function(b){d?c.insertBefore(b,d.nextSibling):c.replaceChild(b,a);d=b})},children:function(a){var b=[];
r(a.childNodes,function(a){1===a.nodeType&&b.push(a)});return b},contents:function(a){return a.contentDocument||a.childNodes||[]},append:function(a,b){var d=a.nodeType;if(1===d||11===d){b=new U(b);for(var d=0,c=b.length;d<c;d++)a.appendChild(b[d])}},prepend:function(a,b){if(1===a.nodeType){var d=a.firstChild;r(new U(b),function(b){a.insertBefore(b,d)})}},wrap:function(a,b){Pc(a,B(b).eq(0).clone()[0])},remove:Db,detach:function(a){Db(a,!0)},after:function(a,b){var d=a,c=a.parentNode;b=new U(b);for(var e=
0,f=b.length;e<f;e++){var g=b[e];c.insertBefore(g,d.nextSibling);d=g}},addClass:Bb,removeClass:Ab,toggleClass:function(a,b,d){b&&r(b.split(" "),function(b){var e=d;w(e)&&(e=!zb(a,b));(e?Bb:Ab)(a,b)})},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){return a.nextElementSibling},find:function(a,b){return a.getElementsByTagName?a.getElementsByTagName(b):[]},clone:Xb,triggerHandler:function(a,b,d){var c,e,f=b.type||b,g=xb(a);if(g=(g=g&&g.events)&&g[f])c={preventDefault:function(){this.defaultPrevented=
!0},isDefaultPrevented:function(){return!0===this.defaultPrevented},stopImmediatePropagation:function(){this.immediatePropagationStopped=!0},isImmediatePropagationStopped:function(){return!0===this.immediatePropagationStopped},stopPropagation:A,type:f,target:a},b.type&&(c=R(c,b)),b=ga(g),e=d?[c].concat(d):[c],r(b,function(b){c.isImmediatePropagationStopped()||b.apply(a,e)})}},function(a,b){U.prototype[b]=function(b,c,e){for(var f,g=0,h=this.length;g<h;g++)w(f)?(f=a(this[g],b,c,e),x(f)&&(f=B(f))):
Qc(f,a(this[g],b,c,e));return x(f)?f:this};U.prototype.bind=U.prototype.on;U.prototype.unbind=U.prototype.off});Sa.prototype={put:function(a,b){this[Ga(a,this.nextUid)]=b},get:function(a){return this[Ga(a,this.nextUid)]},remove:function(a){var b=this[a=Ga(a,this.nextUid)];delete this[a];return b}};var If=[function(){this.$get=[function(){return Sa}]}],Wf=/^([^\(]+?)=>/,Xf=/^[^\(]*\(\s*([^\)]*)\)/m,Eg=/,/,Fg=/^\s*(_?)(\S+?)\1\s*$/,Vf=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Ha=O("$injector");db.$$annotate=
function(a,b,d){var c;if("function"===typeof a){if(!(c=a.$inject)){c=[];if(a.length){if(b)throw F(d)&&d||(d=a.name||Yf(a)),Ha("strictdi",d);b=Wc(a);r(b[1].split(Eg),function(a){a.replace(Fg,function(a,b,d){c.push(d)})})}a.$inject=c}}else J(a)?(b=a.length-1,Qa(a[b],"fn"),c=a.slice(0,b)):Qa(a,"fn",!0);return c};var Sd=O("$animate"),af=function(){this.$get=A},bf=function(){var a=new Sa,b=[];this.$get=["$$AnimateRunner","$rootScope",function(d,c){function e(a,b,c){var d=!1;b&&(b=F(b)?b.split(" "):J(b)?
b:[],r(b,function(b){b&&(d=!0,a[b]=c)}));return d}function f(){r(b,function(b){var c=a.get(b);if(c){var d=Zf(b.attr("class")),e="",f="";r(c,function(a,b){a!==!!d[b]&&(a?e+=(e.length?" ":"")+b:f+=(f.length?" ":"")+b)});r(b,function(a){e&&Bb(a,e);f&&Ab(a,f)});a.remove(b)}});b.length=0}return{enabled:A,on:A,off:A,pin:A,push:function(g,h,k,l){l&&l();k=k||{};k.from&&g.css(k.from);k.to&&g.css(k.to);if(k.addClass||k.removeClass)if(h=k.addClass,l=k.removeClass,k=a.get(g)||{},h=e(k,h,!0),l=e(k,l,!1),h||l)a.put(g,
k),b.push(g),1===b.length&&c.$$postDigest(f);g=new d;g.complete();return g}}}]},Ze=["$provide",function(a){var b=this;this.$$registeredAnimations=Object.create(null);this.register=function(d,c){if(d&&"."!==d.charAt(0))throw Sd("notcsel",d);var e=d+"-animation";b.$$registeredAnimations[d.substr(1)]=e;a.factory(e,c)};this.classNameFilter=function(a){if(1===arguments.length&&(this.$$classNameFilter=a instanceof RegExp?a:null)&&/(\s+|\/)ng-animate(\s+|\/)/.test(this.$$classNameFilter.toString()))throw Sd("nongcls",
"ng-animate");return this.$$classNameFilter};this.$get=["$$animateQueue",function(a){function b(a,c,d){if(d){var h;a:{for(h=0;h<d.length;h++){var k=d[h];if(1===k.nodeType){h=k;break a}}h=void 0}!h||h.parentNode||h.previousElementSibling||(d=null)}d?d.after(a):c.prepend(a)}return{on:a.on,off:a.off,pin:a.pin,enabled:a.enabled,cancel:function(a){a.end&&a.end()},enter:function(e,f,g,h){f=f&&B(f);g=g&&B(g);f=f||g.parent();b(e,f,g);return a.push(e,"enter",Ia(h))},move:function(e,f,g,h){f=f&&B(f);g=g&&B(g);
f=f||g.parent();b(e,f,g);return a.push(e,"move",Ia(h))},leave:function(b,c){return a.push(b,"leave",Ia(c),function(){b.remove()})},addClass:function(b,c,g){g=Ia(g);g.addClass=hb(g.addclass,c);return a.push(b,"addClass",g)},removeClass:function(b,c,g){g=Ia(g);g.removeClass=hb(g.removeClass,c);return a.push(b,"removeClass",g)},setClass:function(b,c,g,h){h=Ia(h);h.addClass=hb(h.addClass,c);h.removeClass=hb(h.removeClass,g);return a.push(b,"setClass",h)},animate:function(b,c,g,h,k){k=Ia(k);k.from=k.from?
R(k.from,c):c;k.to=k.to?R(k.to,g):g;k.tempClasses=hb(k.tempClasses,h||"ng-inline-animate");return a.push(b,"animate",k)}}}]}],df=function(){this.$get=["$$rAF",function(a){function b(b){d.push(b);1<d.length||a(function(){for(var a=0;a<d.length;a++)d[a]();d=[]})}var d=[];return function(){var a=!1;b(function(){a=!0});return function(d){a?d():b(d)}}}]},cf=function(){this.$get=["$q","$sniffer","$$animateAsyncRun","$document","$timeout",function(a,b,d,c,e){function f(a){this.setHost(a);var b=d();this._doneCallbacks=
[];this._tick=function(a){var d=c[0];d&&d.hidden?e(a,0,!1):b(a)};this._state=0}f.chain=function(a,b){function c(){if(d===a.length)b(!0);else a[d](function(a){!1===a?b(!1):(d++,c())})}var d=0;c()};f.all=function(a,b){function c(f){e=e&&f;++d===a.length&&b(e)}var d=0,e=!0;r(a,function(a){a.done(c)})};f.prototype={setHost:function(a){this.host=a||{}},done:function(a){2===this._state?a():this._doneCallbacks.push(a)},progress:A,getPromise:function(){if(!this.promise){var b=this;this.promise=a(function(a,
c){b.done(function(b){!1===b?c():a()})})}return this.promise},then:function(a,b){return this.getPromise().then(a,b)},"catch":function(a){return this.getPromise()["catch"](a)},"finally":function(a){return this.getPromise()["finally"](a)},pause:function(){this.host.pause&&this.host.pause()},resume:function(){this.host.resume&&this.host.resume()},end:function(){this.host.end&&this.host.end();this._resolve(!0)},cancel:function(){this.host.cancel&&this.host.cancel();this._resolve(!1)},complete:function(a){var b=
this;0===b._state&&(b._state=1,b._tick(function(){b._resolve(a)}))},_resolve:function(a){2!==this._state&&(r(this._doneCallbacks,function(b){b(a)}),this._doneCallbacks.length=0,this._state=2)}};return f}]},$e=function(){this.$get=["$$rAF","$q","$$AnimateRunner",function(a,b,d){return function(b,e){function f(){a(function(){g.addClass&&(b.addClass(g.addClass),g.addClass=null);g.removeClass&&(b.removeClass(g.removeClass),g.removeClass=null);g.to&&(b.css(g.to),g.to=null);h||k.complete();h=!0});return k}
var g=e||{};g.$$prepared||(g=Z(g));g.cleanupStyles&&(g.from=g.to=null);g.from&&(b.css(g.from),g.from=null);var h,k=new d;return{start:f,end:f}}}]},fa=O("$compile"),bc=new function(){};Fc.$inject=["$provide","$$sanitizeUriProvider"];Fb.prototype.isFirstChange=function(){return this.previousValue===bc};var Yc=/^((?:x|data)[\:\-_])/i,cg=O("$controller"),dd=/^(\S+)(\s+as\s+([\w$]+))?$/,kf=function(){this.$get=["$document",function(a){return function(b){b?!b.nodeType&&b instanceof B&&(b=b[0]):b=a[0].body;
return b.offsetWidth+1}}]},ed="application/json",ec={"Content-Type":ed+";charset=utf-8"},eg=/^\[|^\{(?!\{)/,fg={"[":/]$/,"{":/}$/},dg=/^\)\]\}',?\n/,Gg=O("$http"),id=function(a){return function(){throw Gg("legacy",a);}},Ka=ea.$interpolateMinErr=O("$interpolate");Ka.throwNoconcat=function(a){throw Ka("noconcat",a);};Ka.interr=function(a,b){return Ka("interr",a,b.toString())};var Hg=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,hg={http:80,https:443,ftp:21},Gb=O("$location"),Ig={$$absUrl:"",$$html5:!1,$$replace:!1,
absUrl:Hb("$$absUrl"),url:function(a){if(w(a))return this.$$url;var b=Hg.exec(a);(b[1]||""===a)&&this.path(decodeURIComponent(b[1]));(b[2]||b[1]||""===a)&&this.search(b[3]||"");this.hash(b[5]||"");return this},protocol:Hb("$$protocol"),host:Hb("$$host"),port:Hb("$$port"),path:nd("$$path",function(a){a=null!==a?a.toString():"";return"/"==a.charAt(0)?a:"/"+a}),search:function(a,b){switch(arguments.length){case 0:return this.$$search;case 1:if(F(a)||S(a))a=a.toString(),this.$$search=Ac(a);else if(H(a))a=
Z(a,{}),r(a,function(b,c){null==b&&delete a[c]}),this.$$search=a;else throw Gb("isrcharg");break;default:w(b)||null===b?delete this.$$search[a]:this.$$search[a]=b}this.$$compose();return this},hash:nd("$$hash",function(a){return null!==a?a.toString():""}),replace:function(){this.$$replace=!0;return this}};r([md,hc,gc],function(a){a.prototype=Object.create(Ig);a.prototype.state=function(b){if(!arguments.length)return this.$$state;if(a!==gc||!this.$$html5)throw Gb("nostate");this.$$state=w(b)?null:
b;return this}});var ca=O("$parse"),jg=Function.prototype.call,kg=Function.prototype.apply,lg=Function.prototype.bind,Ob=T();r("+ - * / % === !== == != < > <= >= && || ! = |".split(" "),function(a){Ob[a]=!0});var Jg={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},jc=function(a){this.options=a};jc.prototype={constructor:jc,lex:function(a){this.text=a;this.index=0;for(this.tokens=[];this.index<this.text.length;)if(a=this.text.charAt(this.index),'"'===a||"'"===a)this.readString(a);else if(this.isNumber(a)||
"."===a&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdentifierStart(this.peekMultichar()))this.readIdent();else if(this.is(a,"(){}[].,;:?"))this.tokens.push({index:this.index,text:a}),this.index++;else if(this.isWhitespace(a))this.index++;else{var b=a+this.peek(),d=b+this.peek(2),c=Ob[b],e=Ob[d];Ob[a]||c||e?(a=e?d:c?b:a,this.tokens.push({index:this.index,text:a,operator:!0}),this.index+=a.length):this.throwError("Unexpected next character ",this.index,this.index+1)}return this.tokens},
is:function(a,b){return-1!==b.indexOf(a)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},isNumber:function(a){return"0"<=a&&"9">=a&&"string"===typeof a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdentifierStart:function(a){return this.options.isIdentifierStart?this.options.isIdentifierStart(a,this.codePointAt(a)):this.isValidIdentifierStart(a)},isValidIdentifierStart:function(a){return"a"<=a&&"z">=
a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isIdentifierContinue:function(a){return this.options.isIdentifierContinue?this.options.isIdentifierContinue(a,this.codePointAt(a)):this.isValidIdentifierContinue(a)},isValidIdentifierContinue:function(a,b){return this.isValidIdentifierStart(a,b)||this.isNumber(a)},codePointAt:function(a){return 1===a.length?a.charCodeAt(0):(a.charCodeAt(0)<<10)+a.charCodeAt(1)-56613888},peekMultichar:function(){var a=this.text.charAt(this.index),b=this.peek();if(!b)return a;var d=
a.charCodeAt(0),c=b.charCodeAt(0);return 55296<=d&&56319>=d&&56320<=c&&57343>=c?a+b:a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,b,d){d=d||this.index;b=x(b)?"s "+b+"-"+this.index+" ["+this.text.substring(b,d)+"]":" "+d;throw ca("lexerr",a,b,this.text);},readNumber:function(){for(var a="",b=this.index;this.index<this.text.length;){var d=M(this.text.charAt(this.index));if("."==d||this.isNumber(d))a+=d;else{var c=this.peek();if("e"==d&&this.isExpOperator(c))a+=
d;else if(this.isExpOperator(d)&&c&&this.isNumber(c)&&"e"==a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||c&&this.isNumber(c)||"e"!=a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}this.tokens.push({index:b,text:a,constant:!0,value:Number(a)})},readIdent:function(){var a=this.index;for(this.index+=this.peekMultichar().length;this.index<this.text.length;){var b=this.peekMultichar();if(!this.isIdentifierContinue(b))break;this.index+=b.length}this.tokens.push({index:a,
text:this.text.slice(a,this.index),identifier:!0})},readString:function(a){var b=this.index;this.index++;for(var d="",c=a,e=!1;this.index<this.text.length;){var f=this.text.charAt(this.index),c=c+f;if(e)"u"===f?(e=this.text.substring(this.index+1,this.index+5),e.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+e+"]"),this.index+=4,d+=String.fromCharCode(parseInt(e,16))):d+=Jg[f]||f,e=!1;else if("\\"===f)e=!0;else{if(f===a){this.index++;this.tokens.push({index:b,text:c,constant:!0,
value:d});return}d+=f}this.index++}this.throwError("Unterminated quote",b)}};var t=function(a,b){this.lexer=a;this.options=b};t.Program="Program";t.ExpressionStatement="ExpressionStatement";t.AssignmentExpression="AssignmentExpression";t.ConditionalExpression="ConditionalExpression";t.LogicalExpression="LogicalExpression";t.BinaryExpression="BinaryExpression";t.UnaryExpression="UnaryExpression";t.CallExpression="CallExpression";t.MemberExpression="MemberExpression";t.Identifier="Identifier";t.Literal=
"Literal";t.ArrayExpression="ArrayExpression";t.Property="Property";t.ObjectExpression="ObjectExpression";t.ThisExpression="ThisExpression";t.LocalsExpression="LocalsExpression";t.NGValueParameter="NGValueParameter";t.prototype={ast:function(a){this.text=a;this.tokens=this.lexer.lex(a);a=this.program();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);return a},program:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.expressionStatement()),
!this.expect(";"))return{type:t.Program,body:a}},expressionStatement:function(){return{type:t.ExpressionStatement,expression:this.filterChain()}},filterChain:function(){for(var a=this.expression();this.expect("|");)a=this.filter(a);return a},expression:function(){return this.assignment()},assignment:function(){var a=this.ternary();this.expect("=")&&(a={type:t.AssignmentExpression,left:a,right:this.assignment(),operator:"="});return a},ternary:function(){var a=this.logicalOR(),b,d;return this.expect("?")&&
(b=this.expression(),this.consume(":"))?(d=this.expression(),{type:t.ConditionalExpression,test:a,alternate:b,consequent:d}):a},logicalOR:function(){for(var a=this.logicalAND();this.expect("||");)a={type:t.LogicalExpression,operator:"||",left:a,right:this.logicalAND()};return a},logicalAND:function(){for(var a=this.equality();this.expect("&&");)a={type:t.LogicalExpression,operator:"&&",left:a,right:this.equality()};return a},equality:function(){for(var a=this.relational(),b;b=this.expect("==","!=",
"===","!==");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.relational()};return a},relational:function(){for(var a=this.additive(),b;b=this.expect("<",">","<=",">=");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.additive()};return a},additive:function(){for(var a=this.multiplicative(),b;b=this.expect("+","-");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.multiplicative()};return a},multiplicative:function(){for(var a=this.unary(),b;b=this.expect("*",
"/","%");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.unary()};return a},unary:function(){var a;return(a=this.expect("+","-","!"))?{type:t.UnaryExpression,operator:a.text,prefix:!0,argument:this.unary()}:this.primary()},primary:function(){var a;this.expect("(")?(a=this.filterChain(),this.consume(")")):this.expect("[")?a=this.arrayDeclaration():this.expect("{")?a=this.object():this.selfReferential.hasOwnProperty(this.peek().text)?a=Z(this.selfReferential[this.consume().text]):this.options.literals.hasOwnProperty(this.peek().text)?
a={type:t.Literal,value:this.options.literals[this.consume().text]}:this.peek().identifier?a=this.identifier():this.peek().constant?a=this.constant():this.throwError("not a primary expression",this.peek());for(var b;b=this.expect("(","[",".");)"("===b.text?(a={type:t.CallExpression,callee:a,arguments:this.parseArguments()},this.consume(")")):"["===b.text?(a={type:t.MemberExpression,object:a,property:this.expression(),computed:!0},this.consume("]")):"."===b.text?a={type:t.MemberExpression,object:a,
property:this.identifier(),computed:!1}:this.throwError("IMPOSSIBLE");return a},filter:function(a){a=[a];for(var b={type:t.CallExpression,callee:this.identifier(),arguments:a,filter:!0};this.expect(":");)a.push(this.expression());return b},parseArguments:function(){var a=[];if(")"!==this.peekToken().text){do a.push(this.filterChain());while(this.expect(","))}return a},identifier:function(){var a=this.consume();a.identifier||this.throwError("is not a valid identifier",a);return{type:t.Identifier,name:a.text}},
constant:function(){return{type:t.Literal,value:this.consume().value}},arrayDeclaration:function(){var a=[];if("]"!==this.peekToken().text){do{if(this.peek("]"))break;a.push(this.expression())}while(this.expect(","))}this.consume("]");return{type:t.ArrayExpression,elements:a}},object:function(){var a=[],b;if("}"!==this.peekToken().text){do{if(this.peek("}"))break;b={type:t.Property,kind:"init"};this.peek().constant?(b.key=this.constant(),b.computed=!1,this.consume(":"),b.value=this.expression()):
this.peek().identifier?(b.key=this.identifier(),b.computed=!1,this.peek(":")?(this.consume(":"),b.value=this.expression()):b.value=b.key):this.peek("[")?(this.consume("["),b.key=this.expression(),this.consume("]"),b.computed=!0,this.consume(":"),b.value=this.expression()):this.throwError("invalid key",this.peek());a.push(b)}while(this.expect(","))}this.consume("}");return{type:t.ObjectExpression,properties:a}},throwError:function(a,b){throw ca("syntax",b.text,a,b.index+1,this.text,this.text.substring(b.index));
},consume:function(a){if(0===this.tokens.length)throw ca("ueoe",this.text);var b=this.expect(a);b||this.throwError("is unexpected, expecting ["+a+"]",this.peek());return b},peekToken:function(){if(0===this.tokens.length)throw ca("ueoe",this.text);return this.tokens[0]},peek:function(a,b,d,c){return this.peekAhead(0,a,b,d,c)},peekAhead:function(a,b,d,c,e){if(this.tokens.length>a){a=this.tokens[a];var f=a.text;if(f===b||f===d||f===c||f===e||!(b||d||c||e))return a}return!1},expect:function(a,b,d,c){return(a=
this.peek(a,b,d,c))?(this.tokens.shift(),a):!1},selfReferential:{"this":{type:t.ThisExpression},$locals:{type:t.LocalsExpression}}};ud.prototype={compile:function(a,b){var d=this,c=this.astBuilder.ast(a);this.state={nextId:0,filters:{},expensiveChecks:b,fn:{vars:[],body:[],own:{}},assign:{vars:[],body:[],own:{}},inputs:[]};$(c,d.$filter);var e="",f;this.stage="assign";if(f=sd(c))this.state.computing="assign",e=this.nextId(),this.recurse(f,e),this.return_(e),e="fn.assign="+this.generateFunction("assign",
"s,v,l");f=qd(c.body);d.stage="inputs";r(f,function(a,b){var c="fn"+b;d.state[c]={vars:[],body:[],own:{}};d.state.computing=c;var e=d.nextId();d.recurse(a,e);d.return_(e);d.state.inputs.push(c);a.watchId=b});this.state.computing="fn";this.stage="main";this.recurse(c);e='"'+this.USE+" "+this.STRICT+'";\n'+this.filterPrefix()+"var fn="+this.generateFunction("fn","s,l,a,i")+e+this.watchFns()+"return fn;";e=(new Function("$filter","ensureSafeMemberName","ensureSafeObject","ensureSafeFunction","getStringValue",
"ensureSafeAssignContext","ifDefined","plus","text",e))(this.$filter,Ua,ra,od,ig,Ib,mg,pd,a);this.state=this.stage=void 0;e.literal=td(c);e.constant=c.constant;return e},USE:"use",STRICT:"strict",watchFns:function(){var a=[],b=this.state.inputs,d=this;r(b,function(b){a.push("var "+b+"="+d.generateFunction(b,"s"))});b.length&&a.push("fn.inputs=["+b.join(",")+"];");return a.join("")},generateFunction:function(a,b){return"function("+b+"){"+this.varsPrefix(a)+this.body(a)+"};"},filterPrefix:function(){var a=
[],b=this;r(this.state.filters,function(d,c){a.push(d+"=$filter("+b.escape(c)+")")});return a.length?"var "+a.join(",")+";":""},varsPrefix:function(a){return this.state[a].vars.length?"var "+this.state[a].vars.join(",")+";":""},body:function(a){return this.state[a].body.join("")},recurse:function(a,b,d,c,e,f){var g,h,k=this,l,m,n;c=c||A;if(!f&&x(a.watchId))b=b||this.nextId(),this.if_("i",this.lazyAssign(b,this.computedMember("i",a.watchId)),this.lazyRecurse(a,b,d,c,e,!0));else switch(a.type){case t.Program:r(a.body,
function(b,c){k.recurse(b.expression,void 0,void 0,function(a){h=a});c!==a.body.length-1?k.current().body.push(h,";"):k.return_(h)});break;case t.Literal:m=this.escape(a.value);this.assign(b,m);c(m);break;case t.UnaryExpression:this.recurse(a.argument,void 0,void 0,function(a){h=a});m=a.operator+"("+this.ifDefined(h,0)+")";this.assign(b,m);c(m);break;case t.BinaryExpression:this.recurse(a.left,void 0,void 0,function(a){g=a});this.recurse(a.right,void 0,void 0,function(a){h=a});m="+"===a.operator?
this.plus(g,h):"-"===a.operator?this.ifDefined(g,0)+a.operator+this.ifDefined(h,0):"("+g+")"+a.operator+"("+h+")";this.assign(b,m);c(m);break;case t.LogicalExpression:b=b||this.nextId();k.recurse(a.left,b);k.if_("&&"===a.operator?b:k.not(b),k.lazyRecurse(a.right,b));c(b);break;case t.ConditionalExpression:b=b||this.nextId();k.recurse(a.test,b);k.if_(b,k.lazyRecurse(a.alternate,b),k.lazyRecurse(a.consequent,b));c(b);break;case t.Identifier:b=b||this.nextId();d&&(d.context="inputs"===k.stage?"s":this.assign(this.nextId(),
this.getHasOwnProperty("l",a.name)+"?l:s"),d.computed=!1,d.name=a.name);Ua(a.name);k.if_("inputs"===k.stage||k.not(k.getHasOwnProperty("l",a.name)),function(){k.if_("inputs"===k.stage||"s",function(){e&&1!==e&&k.if_(k.not(k.nonComputedMember("s",a.name)),k.lazyAssign(k.nonComputedMember("s",a.name),"{}"));k.assign(b,k.nonComputedMember("s",a.name))})},b&&k.lazyAssign(b,k.nonComputedMember("l",a.name)));(k.state.expensiveChecks||Jb(a.name))&&k.addEnsureSafeObject(b);c(b);break;case t.MemberExpression:g=
d&&(d.context=this.nextId())||this.nextId();b=b||this.nextId();k.recurse(a.object,g,void 0,function(){k.if_(k.notNull(g),function(){e&&1!==e&&k.addEnsureSafeAssignContext(g);if(a.computed)h=k.nextId(),k.recurse(a.property,h),k.getStringValue(h),k.addEnsureSafeMemberName(h),e&&1!==e&&k.if_(k.not(k.computedMember(g,h)),k.lazyAssign(k.computedMember(g,h),"{}")),m=k.ensureSafeObject(k.computedMember(g,h)),k.assign(b,m),d&&(d.computed=!0,d.name=h);else{Ua(a.property.name);e&&1!==e&&k.if_(k.not(k.nonComputedMember(g,
a.property.name)),k.lazyAssign(k.nonComputedMember(g,a.property.name),"{}"));m=k.nonComputedMember(g,a.property.name);if(k.state.expensiveChecks||Jb(a.property.name))m=k.ensureSafeObject(m);k.assign(b,m);d&&(d.computed=!1,d.name=a.property.name)}},function(){k.assign(b,"undefined")});c(b)},!!e);break;case t.CallExpression:b=b||this.nextId();a.filter?(h=k.filter(a.callee.name),l=[],r(a.arguments,function(a){var b=k.nextId();k.recurse(a,b);l.push(b)}),m=h+"("+l.join(",")+")",k.assign(b,m),c(b)):(h=
k.nextId(),g={},l=[],k.recurse(a.callee,h,g,function(){k.if_(k.notNull(h),function(){k.addEnsureSafeFunction(h);r(a.arguments,function(a){k.recurse(a,k.nextId(),void 0,function(a){l.push(k.ensureSafeObject(a))})});g.name?(k.state.expensiveChecks||k.addEnsureSafeObject(g.context),m=k.member(g.context,g.name,g.computed)+"("+l.join(",")+")"):m=h+"("+l.join(",")+")";m=k.ensureSafeObject(m);k.assign(b,m)},function(){k.assign(b,"undefined")});c(b)}));break;case t.AssignmentExpression:h=this.nextId();g=
{};if(!rd(a.left))throw ca("lval");this.recurse(a.left,void 0,g,function(){k.if_(k.notNull(g.context),function(){k.recurse(a.right,h);k.addEnsureSafeObject(k.member(g.context,g.name,g.computed));k.addEnsureSafeAssignContext(g.context);m=k.member(g.context,g.name,g.computed)+a.operator+h;k.assign(b,m);c(b||m)})},1);break;case t.ArrayExpression:l=[];r(a.elements,function(a){k.recurse(a,k.nextId(),void 0,function(a){l.push(a)})});m="["+l.join(",")+"]";this.assign(b,m);c(m);break;case t.ObjectExpression:l=
[];n=!1;r(a.properties,function(a){a.computed&&(n=!0)});n?(b=b||this.nextId(),this.assign(b,"{}"),r(a.properties,function(a){a.computed?(g=k.nextId(),k.recurse(a.key,g)):g=a.key.type===t.Identifier?a.key.name:""+a.key.value;h=k.nextId();k.recurse(a.value,h);k.assign(k.member(b,g,a.computed),h)})):(r(a.properties,function(b){k.recurse(b.value,a.constant?void 0:k.nextId(),void 0,function(a){l.push(k.escape(b.key.type===t.Identifier?b.key.name:""+b.key.value)+":"+a)})}),m="{"+l.join(",")+"}",this.assign(b,
m));c(b||m);break;case t.ThisExpression:this.assign(b,"s");c("s");break;case t.LocalsExpression:this.assign(b,"l");c("l");break;case t.NGValueParameter:this.assign(b,"v"),c("v")}},getHasOwnProperty:function(a,b){var d=a+"."+b,c=this.current().own;c.hasOwnProperty(d)||(c[d]=this.nextId(!1,a+"&&("+this.escape(b)+" in "+a+")"));return c[d]},assign:function(a,b){if(a)return this.current().body.push(a,"=",b,";"),a},filter:function(a){this.state.filters.hasOwnProperty(a)||(this.state.filters[a]=this.nextId(!0));
return this.state.filters[a]},ifDefined:function(a,b){return"ifDefined("+a+","+this.escape(b)+")"},plus:function(a,b){return"plus("+a+","+b+")"},return_:function(a){this.current().body.push("return ",a,";")},if_:function(a,b,d){if(!0===a)b();else{var c=this.current().body;c.push("if(",a,"){");b();c.push("}");d&&(c.push("else{"),d(),c.push("}"))}},not:function(a){return"!("+a+")"},notNull:function(a){return a+"!=null"},nonComputedMember:function(a,b){var d=/[^$_a-zA-Z0-9]/g;return/[$_a-zA-Z][$_a-zA-Z0-9]*/.test(b)?
a+"."+b:a+'["'+b.replace(d,this.stringEscapeFn)+'"]'},computedMember:function(a,b){return a+"["+b+"]"},member:function(a,b,d){return d?this.computedMember(a,b):this.nonComputedMember(a,b)},addEnsureSafeObject:function(a){this.current().body.push(this.ensureSafeObject(a),";")},addEnsureSafeMemberName:function(a){this.current().body.push(this.ensureSafeMemberName(a),";")},addEnsureSafeFunction:function(a){this.current().body.push(this.ensureSafeFunction(a),";")},addEnsureSafeAssignContext:function(a){this.current().body.push(this.ensureSafeAssignContext(a),
";")},ensureSafeObject:function(a){return"ensureSafeObject("+a+",text)"},ensureSafeMemberName:function(a){return"ensureSafeMemberName("+a+",text)"},ensureSafeFunction:function(a){return"ensureSafeFunction("+a+",text)"},getStringValue:function(a){this.assign(a,"getStringValue("+a+")")},ensureSafeAssignContext:function(a){return"ensureSafeAssignContext("+a+",text)"},lazyRecurse:function(a,b,d,c,e,f){var g=this;return function(){g.recurse(a,b,d,c,e,f)}},lazyAssign:function(a,b){var d=this;return function(){d.assign(a,
b)}},stringEscapeRegex:/[^ a-zA-Z0-9]/g,stringEscapeFn:function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)},escape:function(a){if(F(a))return"'"+a.replace(this.stringEscapeRegex,this.stringEscapeFn)+"'";if(S(a))return a.toString();if(!0===a)return"true";if(!1===a)return"false";if(null===a)return"null";if("undefined"===typeof a)return"undefined";throw ca("esc");},nextId:function(a,b){var d="v"+this.state.nextId++;a||this.current().vars.push(d+(b?"="+b:""));return d},current:function(){return this.state[this.state.computing]}};
vd.prototype={compile:function(a,b){var d=this,c=this.astBuilder.ast(a);this.expression=a;this.expensiveChecks=b;$(c,d.$filter);var e,f;if(e=sd(c))f=this.recurse(e);e=qd(c.body);var g;e&&(g=[],r(e,function(a,b){var c=d.recurse(a);a.input=c;g.push(c);a.watchId=b}));var h=[];r(c.body,function(a){h.push(d.recurse(a.expression))});e=0===c.body.length?A:1===c.body.length?h[0]:function(a,b){var c;r(h,function(d){c=d(a,b)});return c};f&&(e.assign=function(a,b,c){return f(a,c,b)});g&&(e.inputs=g);e.literal=
td(c);e.constant=c.constant;return e},recurse:function(a,b,d){var c,e,f=this,g;if(a.input)return this.inputs(a.input,a.watchId);switch(a.type){case t.Literal:return this.value(a.value,b);case t.UnaryExpression:return e=this.recurse(a.argument),this["unary"+a.operator](e,b);case t.BinaryExpression:return c=this.recurse(a.left),e=this.recurse(a.right),this["binary"+a.operator](c,e,b);case t.LogicalExpression:return c=this.recurse(a.left),e=this.recurse(a.right),this["binary"+a.operator](c,e,b);case t.ConditionalExpression:return this["ternary?:"](this.recurse(a.test),
this.recurse(a.alternate),this.recurse(a.consequent),b);case t.Identifier:return Ua(a.name,f.expression),f.identifier(a.name,f.expensiveChecks||Jb(a.name),b,d,f.expression);case t.MemberExpression:return c=this.recurse(a.object,!1,!!d),a.computed||(Ua(a.property.name,f.expression),e=a.property.name),a.computed&&(e=this.recurse(a.property)),a.computed?this.computedMember(c,e,b,d,f.expression):this.nonComputedMember(c,e,f.expensiveChecks,b,d,f.expression);case t.CallExpression:return g=[],r(a.arguments,
function(a){g.push(f.recurse(a))}),a.filter&&(e=this.$filter(a.callee.name)),a.filter||(e=this.recurse(a.callee,!0)),a.filter?function(a,c,d,f){for(var n=[],p=0;p<g.length;++p)n.push(g[p](a,c,d,f));a=e.apply(void 0,n,f);return b?{context:void 0,name:void 0,value:a}:a}:function(a,c,d,m){var n=e(a,c,d,m),p;if(null!=n.value){ra(n.context,f.expression);od(n.value,f.expression);p=[];for(var s=0;s<g.length;++s)p.push(ra(g[s](a,c,d,m),f.expression));p=ra(n.value.apply(n.context,p),f.expression)}return b?
{value:p}:p};case t.AssignmentExpression:return c=this.recurse(a.left,!0,1),e=this.recurse(a.right),function(a,d,g,m){var n=c(a,d,g,m);a=e(a,d,g,m);ra(n.value,f.expression);Ib(n.context);n.context[n.name]=a;return b?{value:a}:a};case t.ArrayExpression:return g=[],r(a.elements,function(a){g.push(f.recurse(a))}),function(a,c,d,e){for(var f=[],p=0;p<g.length;++p)f.push(g[p](a,c,d,e));return b?{value:f}:f};case t.ObjectExpression:return g=[],r(a.properties,function(a){a.computed?g.push({key:f.recurse(a.key),
computed:!0,value:f.recurse(a.value)}):g.push({key:a.key.type===t.Identifier?a.key.name:""+a.key.value,computed:!1,value:f.recurse(a.value)})}),function(a,c,d,e){for(var f={},p=0;p<g.length;++p)g[p].computed?f[g[p].key(a,c,d,e)]=g[p].value(a,c,d,e):f[g[p].key]=g[p].value(a,c,d,e);return b?{value:f}:f};case t.ThisExpression:return function(a){return b?{value:a}:a};case t.LocalsExpression:return function(a,c){return b?{value:c}:c};case t.NGValueParameter:return function(a,c,d){return b?{value:d}:d}}},
"unary+":function(a,b){return function(d,c,e,f){d=a(d,c,e,f);d=x(d)?+d:0;return b?{value:d}:d}},"unary-":function(a,b){return function(d,c,e,f){d=a(d,c,e,f);d=x(d)?-d:0;return b?{value:d}:d}},"unary!":function(a,b){return function(d,c,e,f){d=!a(d,c,e,f);return b?{value:d}:d}},"binary+":function(a,b,d){return function(c,e,f,g){var h=a(c,e,f,g);c=b(c,e,f,g);h=pd(h,c);return d?{value:h}:h}},"binary-":function(a,b,d){return function(c,e,f,g){var h=a(c,e,f,g);c=b(c,e,f,g);h=(x(h)?h:0)-(x(c)?c:0);return d?
{value:h}:h}},"binary*":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)*b(c,e,f,g);return d?{value:c}:c}},"binary/":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)/b(c,e,f,g);return d?{value:c}:c}},"binary%":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)%b(c,e,f,g);return d?{value:c}:c}},"binary===":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)===b(c,e,f,g);return d?{value:c}:c}},"binary!==":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)!==b(c,e,f,g);return d?{value:c}:
c}},"binary==":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)==b(c,e,f,g);return d?{value:c}:c}},"binary!=":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)!=b(c,e,f,g);return d?{value:c}:c}},"binary<":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)<b(c,e,f,g);return d?{value:c}:c}},"binary>":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)>b(c,e,f,g);return d?{value:c}:c}},"binary<=":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)<=b(c,e,f,g);return d?{value:c}:c}},"binary>=":function(a,
b,d){return function(c,e,f,g){c=a(c,e,f,g)>=b(c,e,f,g);return d?{value:c}:c}},"binary&&":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)&&b(c,e,f,g);return d?{value:c}:c}},"binary||":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)||b(c,e,f,g);return d?{value:c}:c}},"ternary?:":function(a,b,d,c){return function(e,f,g,h){e=a(e,f,g,h)?b(e,f,g,h):d(e,f,g,h);return c?{value:e}:e}},value:function(a,b){return function(){return b?{context:void 0,name:void 0,value:a}:a}},identifier:function(a,
b,d,c,e){return function(f,g,h,k){f=g&&a in g?g:f;c&&1!==c&&f&&!f[a]&&(f[a]={});g=f?f[a]:void 0;b&&ra(g,e);return d?{context:f,name:a,value:g}:g}},computedMember:function(a,b,d,c,e){return function(f,g,h,k){var l=a(f,g,h,k),m,n;null!=l&&(m=b(f,g,h,k),m+="",Ua(m,e),c&&1!==c&&(Ib(l),l&&!l[m]&&(l[m]={})),n=l[m],ra(n,e));return d?{context:l,name:m,value:n}:n}},nonComputedMember:function(a,b,d,c,e,f){return function(g,h,k,l){g=a(g,h,k,l);e&&1!==e&&(Ib(g),g&&!g[b]&&(g[b]={}));h=null!=g?g[b]:void 0;(d||
Jb(b))&&ra(h,f);return c?{context:g,name:b,value:h}:h}},inputs:function(a,b){return function(d,c,e,f){return f?f[b]:a(d,c,e)}}};var kc=function(a,b,d){this.lexer=a;this.$filter=b;this.options=d;this.ast=new t(a,d);this.astCompiler=d.csp?new vd(this.ast,b):new ud(this.ast,b)};kc.prototype={constructor:kc,parse:function(a){return this.astCompiler.compile(a,this.options.expensiveChecks)}};var ng=Object.prototype.valueOf,ya=O("$sce"),ma={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},
pg=O("$compile"),Y=E.document.createElement("a"),zd=qa(E.location.href);Ad.$inject=["$document"];Mc.$inject=["$provide"];var Hd=22,Gd=".",mc="0";Bd.$inject=["$locale"];Dd.$inject=["$locale"];var Ag={yyyy:X("FullYear",4,0,!1,!0),yy:X("FullYear",2,0,!0,!0),y:X("FullYear",1,0,!1,!0),MMMM:kb("Month"),MMM:kb("Month",!0),MM:X("Month",2,1),M:X("Month",1,1),LLLL:kb("Month",!1,!0),dd:X("Date",2),d:X("Date",1),HH:X("Hours",2),H:X("Hours",1),hh:X("Hours",2,-12),h:X("Hours",1,-12),mm:X("Minutes",2),m:X("Minutes",
1),ss:X("Seconds",2),s:X("Seconds",1),sss:X("Milliseconds",3),EEEE:kb("Day"),EEE:kb("Day",!0),a:function(a,b){return 12>a.getHours()?b.AMPMS[0]:b.AMPMS[1]},Z:function(a,b,d){a=-1*d;return a=(0<=a?"+":"")+(Kb(Math[0<a?"floor":"ceil"](a/60),2)+Kb(Math.abs(a%60),2))},ww:Jd(2),w:Jd(1),G:nc,GG:nc,GGG:nc,GGGG:function(a,b){return 0>=a.getFullYear()?b.ERANAMES[0]:b.ERANAMES[1]}},zg=/((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/,yg=/^\-?\d+$/;Cd.$inject=["$locale"];
var tg=da(M),ug=da(ub);Ed.$inject=["$parse"];var pe=da({restrict:"E",compile:function(a,b){if(!b.href&&!b.xlinkHref)return function(a,b){if("a"===b[0].nodeName.toLowerCase()){var e="[object SVGAnimatedString]"===ka.call(b.prop("href"))?"xlink:href":"href";b.on("click",function(a){b.attr(e)||a.preventDefault()})}}}}),vb={};r(Eb,function(a,b){function d(a,d,e){a.$watch(e[c],function(a){e.$set(b,!!a)})}if("multiple"!=a){var c=xa("ng-"+b),e=d;"checked"===a&&(e=function(a,b,e){e.ngModel!==e[c]&&d(a,b,
e)});vb[c]=function(){return{restrict:"A",priority:100,link:e}}}});r(cd,function(a,b){vb[b]=function(){return{priority:100,link:function(a,c,e){if("ngPattern"===b&&"/"==e.ngPattern.charAt(0)&&(c=e.ngPattern.match(Cg))){e.$set("ngPattern",new RegExp(c[1],c[2]));return}a.$watch(e[b],function(a){e.$set(b,a)})}}}});r(["src","srcset","href"],function(a){var b=xa("ng-"+a);vb[b]=function(){return{priority:99,link:function(d,c,e){var f=a,g=a;"href"===a&&"[object SVGAnimatedString]"===ka.call(c.prop("href"))&&
(g="xlinkHref",e.$attr[g]="xlink:href",f=null);e.$observe(b,function(b){b?(e.$set(g,b),Ba&&f&&c.prop(f,e[g])):"href"===a&&e.$set(g,null)})}}}});var Lb={$addControl:A,$$renameControl:function(a,b){a.$name=b},$removeControl:A,$setValidity:A,$setDirty:A,$setPristine:A,$setSubmitted:A};Kd.$inject=["$element","$attrs","$scope","$animate","$interpolate"];var Td=function(a){return["$timeout","$parse",function(b,d){function c(a){return""===a?d('this[""]').assign:d(a).assign||A}return{name:"form",restrict:a?
"EAC":"E",require:["form","^^?form"],controller:Kd,compile:function(d,f){d.addClass(Va).addClass(ob);var g=f.name?"name":a&&f.ngForm?"ngForm":!1;return{pre:function(a,d,e,f){var n=f[0];if(!("action"in e)){var p=function(b){a.$apply(function(){n.$commitViewValue();n.$setSubmitted()});b.preventDefault()};d[0].addEventListener("submit",p,!1);d.on("$destroy",function(){b(function(){d[0].removeEventListener("submit",p,!1)},0,!1)})}(f[1]||n.$$parentForm).$addControl(n);var s=g?c(n.$name):A;g&&(s(a,n),e.$observe(g,
function(b){n.$name!==b&&(s(a,void 0),n.$$parentForm.$$renameControl(n,b),s=c(n.$name),s(a,n))}));d.on("$destroy",function(){n.$$parentForm.$removeControl(n);s(a,void 0);R(n,Lb)})}}}}}]},qe=Td(),De=Td(!0),Bg=/^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,Kg=/^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+\])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,Lg=/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,
Mg=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,Ud=/^(\d{4,})-(\d{2})-(\d{2})$/,Vd=/^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,rc=/^(\d{4,})-W(\d\d)$/,Wd=/^(\d{4,})-(\d\d)$/,Xd=/^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,Md=T();r(["date","datetime-local","month","time","week"],function(a){Md[a]=!0});var Yd={text:function(a,b,d,c,e,f){lb(a,b,d,c,e,f);pc(c)},date:mb("date",Ud,Nb(Ud,["yyyy","MM","dd"]),"yyyy-MM-dd"),"datetime-local":mb("datetimelocal",Vd,Nb(Vd,"yyyy MM dd HH mm ss sss".split(" ")),
"yyyy-MM-ddTHH:mm:ss.sss"),time:mb("time",Xd,Nb(Xd,["HH","mm","ss","sss"]),"HH:mm:ss.sss"),week:mb("week",rc,function(a,b){if(ia(a))return a;if(F(a)){rc.lastIndex=0;var d=rc.exec(a);if(d){var c=+d[1],e=+d[2],f=d=0,g=0,h=0,k=Id(c),e=7*(e-1);b&&(d=b.getHours(),f=b.getMinutes(),g=b.getSeconds(),h=b.getMilliseconds());return new Date(c,0,k.getDate()+e,d,f,g,h)}}return NaN},"yyyy-Www"),month:mb("month",Wd,Nb(Wd,["yyyy","MM"]),"yyyy-MM"),number:function(a,b,d,c,e,f){Nd(a,b,d,c);lb(a,b,d,c,e,f);c.$$parserName=
"number";c.$parsers.push(function(a){if(c.$isEmpty(a))return null;if(Mg.test(a))return parseFloat(a)});c.$formatters.push(function(a){if(!c.$isEmpty(a)){if(!S(a))throw nb("numfmt",a);a=a.toString()}return a});if(x(d.min)||d.ngMin){var g;c.$validators.min=function(a){return c.$isEmpty(a)||w(g)||a>=g};d.$observe("min",function(a){x(a)&&!S(a)&&(a=parseFloat(a,10));g=S(a)&&!isNaN(a)?a:void 0;c.$validate()})}if(x(d.max)||d.ngMax){var h;c.$validators.max=function(a){return c.$isEmpty(a)||w(h)||a<=h};d.$observe("max",
function(a){x(a)&&!S(a)&&(a=parseFloat(a,10));h=S(a)&&!isNaN(a)?a:void 0;c.$validate()})}},url:function(a,b,d,c,e,f){lb(a,b,d,c,e,f);pc(c);c.$$parserName="url";c.$validators.url=function(a,b){var d=a||b;return c.$isEmpty(d)||Kg.test(d)}},email:function(a,b,d,c,e,f){lb(a,b,d,c,e,f);pc(c);c.$$parserName="email";c.$validators.email=function(a,b){var d=a||b;return c.$isEmpty(d)||Lg.test(d)}},radio:function(a,b,d,c){w(d.name)&&b.attr("name",++pb);b.on("click",function(a){b[0].checked&&c.$setViewValue(d.value,
a&&a.type)});c.$render=function(){b[0].checked=d.value==c.$viewValue};d.$observe("value",c.$render)},checkbox:function(a,b,d,c,e,f,g,h){var k=Od(h,a,"ngTrueValue",d.ngTrueValue,!0),l=Od(h,a,"ngFalseValue",d.ngFalseValue,!1);b.on("click",function(a){c.$setViewValue(b[0].checked,a&&a.type)});c.$render=function(){b[0].checked=c.$viewValue};c.$isEmpty=function(a){return!1===a};c.$formatters.push(function(a){return na(a,k)});c.$parsers.push(function(a){return a?k:l})},hidden:A,button:A,submit:A,reset:A,
file:A},Gc=["$browser","$sniffer","$filter","$parse",function(a,b,d,c){return{restrict:"E",require:["?ngModel"],link:{pre:function(e,f,g,h){h[0]&&(Yd[M(g.type)]||Yd.text)(e,f,g,h[0],b,a,d,c)}}}}],Ng=/^(true|false|\d+)$/,Ve=function(){return{restrict:"A",priority:100,compile:function(a,b){return Ng.test(b.ngValue)?function(a,b,e){e.$set("value",a.$eval(e.ngValue))}:function(a,b,e){a.$watch(e.ngValue,function(a){e.$set("value",a)})}}}},ve=["$compile",function(a){return{restrict:"AC",compile:function(b){a.$$addBindingClass(b);
return function(b,c,e){a.$$addBindingInfo(c,e.ngBind);c=c[0];b.$watch(e.ngBind,function(a){c.textContent=w(a)?"":a})}}}}],xe=["$interpolate","$compile",function(a,b){return{compile:function(d){b.$$addBindingClass(d);return function(c,d,f){c=a(d.attr(f.$attr.ngBindTemplate));b.$$addBindingInfo(d,c.expressions);d=d[0];f.$observe("ngBindTemplate",function(a){d.textContent=w(a)?"":a})}}}}],we=["$sce","$parse","$compile",function(a,b,d){return{restrict:"A",compile:function(c,e){var f=b(e.ngBindHtml),g=
b(e.ngBindHtml,function(b){return a.valueOf(b)});d.$$addBindingClass(c);return function(b,c,e){d.$$addBindingInfo(c,e.ngBindHtml);b.$watch(g,function(){var d=f(b);c.html(a.getTrustedHtml(d)||"")})}}}}],Ue=da({restrict:"A",require:"ngModel",link:function(a,b,d,c){c.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),ye=qc("",!0),Ae=qc("Odd",0),ze=qc("Even",1),Be=Ma({compile:function(a,b){b.$set("ngCloak",void 0);a.removeClass("ng-cloak")}}),Ce=[function(){return{restrict:"A",scope:!0,controller:"@",
priority:500}}],Lc={},Og={blur:!0,focus:!0};r("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var b=xa("ng-"+a);Lc[b]=["$parse","$rootScope",function(d,c){return{restrict:"A",compile:function(e,f){var g=d(f[b],null,!0);return function(b,d){d.on(a,function(d){var e=function(){g(b,{$event:d})};Og[a]&&c.$$phase?b.$evalAsync(e):b.$apply(e)})}}}}]});var Fe=["$animate","$compile",function(a,
b){return{multiElement:!0,transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function(d,c,e,f,g){var h,k,l;d.$watch(e.ngIf,function(d){d?k||g(function(d,f){k=f;d[d.length++]=b.$$createComment("end ngIf",e.ngIf);h={clone:d};a.enter(d,c.parent(),c)}):(l&&(l.remove(),l=null),k&&(k.$destroy(),k=null),h&&(l=tb(h.clone),a.leave(l).then(function(){l=null}),h=null))})}}}],Ge=["$templateRequest","$anchorScroll","$animate",function(a,b,d){return{restrict:"ECA",priority:400,terminal:!0,
transclude:"element",controller:ea.noop,compile:function(c,e){var f=e.ngInclude||e.src,g=e.onload||"",h=e.autoscroll;return function(c,e,m,n,p){var s=0,r,t,q,w=function(){t&&(t.remove(),t=null);r&&(r.$destroy(),r=null);q&&(d.leave(q).then(function(){t=null}),t=q,q=null)};c.$watch(f,function(f){var m=function(){!x(h)||h&&!c.$eval(h)||b()},t=++s;f?(a(f,!0).then(function(a){if(!c.$$destroyed&&t===s){var b=c.$new();n.template=a;a=p(b,function(a){w();d.enter(a,null,e).then(m)});r=b;q=a;r.$emit("$includeContentLoaded",
f);c.$eval(g)}},function(){c.$$destroyed||t!==s||(w(),c.$emit("$includeContentError",f))}),c.$emit("$includeContentRequested",f)):(w(),n.template=null)})}}}}],Xe=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(b,d,c,e){ka.call(d[0]).match(/SVG/)?(d.empty(),a(Oc(e.template,E.document).childNodes)(b,function(a){d.append(a)},{futureParentElement:d})):(d.html(e.template),a(d.contents())(b))}}}],He=Ma({priority:450,compile:function(){return{pre:function(a,
b,d){a.$eval(d.ngInit)}}}}),Te=function(){return{restrict:"A",priority:100,require:"ngModel",link:function(a,b,d,c){var e=b.attr(d.$attr.ngList)||", ",f="false"!==d.ngTrim,g=f?W(e):e;c.$parsers.push(function(a){if(!w(a)){var b=[];a&&r(a.split(g),function(a){a&&b.push(f?W(a):a)});return b}});c.$formatters.push(function(a){if(J(a))return a.join(e)});c.$isEmpty=function(a){return!a||!a.length}}}},ob="ng-valid",Pd="ng-invalid",Va="ng-pristine",Mb="ng-dirty",Rd="ng-pending",nb=O("ngModel"),Pg=["$scope",
"$exceptionHandler","$attrs","$element","$parse","$animate","$timeout","$rootScope","$q","$interpolate",function(a,b,d,c,e,f,g,h,k,l){this.$modelValue=this.$viewValue=Number.NaN;this.$$rawModelValue=void 0;this.$validators={};this.$asyncValidators={};this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$untouched=!0;this.$touched=!1;this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$error={};this.$$success={};this.$pending=void 0;this.$name=l(d.name||"",!1)(a);
this.$$parentForm=Lb;var m=e(d.ngModel),n=m.assign,p=m,s=n,t=null,I,q=this;this.$$setOptions=function(a){if((q.$options=a)&&a.getterSetter){var b=e(d.ngModel+"()"),f=e(d.ngModel+"($$$p)");p=function(a){var c=m(a);z(c)&&(c=b(a));return c};s=function(a,b){z(m(a))?f(a,{$$$p:b}):n(a,b)}}else if(!m.assign)throw nb("nonassign",d.ngModel,va(c));};this.$render=A;this.$isEmpty=function(a){return w(a)||""===a||null===a||a!==a};this.$$updateEmptyClasses=function(a){q.$isEmpty(a)?(f.removeClass(c,"ng-not-empty"),
f.addClass(c,"ng-empty")):(f.removeClass(c,"ng-empty"),f.addClass(c,"ng-not-empty"))};var K=0;Ld({ctrl:this,$element:c,set:function(a,b){a[b]=!0},unset:function(a,b){delete a[b]},$animate:f});this.$setPristine=function(){q.$dirty=!1;q.$pristine=!0;f.removeClass(c,Mb);f.addClass(c,Va)};this.$setDirty=function(){q.$dirty=!0;q.$pristine=!1;f.removeClass(c,Va);f.addClass(c,Mb);q.$$parentForm.$setDirty()};this.$setUntouched=function(){q.$touched=!1;q.$untouched=!0;f.setClass(c,"ng-untouched","ng-touched")};
this.$setTouched=function(){q.$touched=!0;q.$untouched=!1;f.setClass(c,"ng-touched","ng-untouched")};this.$rollbackViewValue=function(){g.cancel(t);q.$viewValue=q.$$lastCommittedViewValue;q.$render()};this.$validate=function(){if(!S(q.$modelValue)||!isNaN(q.$modelValue)){var a=q.$$rawModelValue,b=q.$valid,c=q.$modelValue,d=q.$options&&q.$options.allowInvalid;q.$$runValidators(a,q.$$lastCommittedViewValue,function(e){d||b===e||(q.$modelValue=e?a:void 0,q.$modelValue!==c&&q.$$writeModelToScope())})}};
this.$$runValidators=function(a,b,c){function d(){var c=!0;r(q.$validators,function(d,e){var g=d(a,b);c=c&&g;f(e,g)});return c?!0:(r(q.$asyncValidators,function(a,b){f(b,null)}),!1)}function e(){var c=[],d=!0;r(q.$asyncValidators,function(e,g){var h=e(a,b);if(!h||!z(h.then))throw nb("nopromise",h);f(g,void 0);c.push(h.then(function(){f(g,!0)},function(){d=!1;f(g,!1)}))});c.length?k.all(c).then(function(){g(d)},A):g(!0)}function f(a,b){h===K&&q.$setValidity(a,b)}function g(a){h===K&&c(a)}K++;var h=
K;(function(){var a=q.$$parserName||"parse";if(w(I))f(a,null);else return I||(r(q.$validators,function(a,b){f(b,null)}),r(q.$asyncValidators,function(a,b){f(b,null)})),f(a,I),I;return!0})()?d()?e():g(!1):g(!1)};this.$commitViewValue=function(){var a=q.$viewValue;g.cancel(t);if(q.$$lastCommittedViewValue!==a||""===a&&q.$$hasNativeValidators)q.$$updateEmptyClasses(a),q.$$lastCommittedViewValue=a,q.$pristine&&this.$setDirty(),this.$$parseAndValidate()};this.$$parseAndValidate=function(){var b=q.$$lastCommittedViewValue;
if(I=w(b)?void 0:!0)for(var c=0;c<q.$parsers.length;c++)if(b=q.$parsers[c](b),w(b)){I=!1;break}S(q.$modelValue)&&isNaN(q.$modelValue)&&(q.$modelValue=p(a));var d=q.$modelValue,e=q.$options&&q.$options.allowInvalid;q.$$rawModelValue=b;e&&(q.$modelValue=b,q.$modelValue!==d&&q.$$writeModelToScope());q.$$runValidators(b,q.$$lastCommittedViewValue,function(a){e||(q.$modelValue=a?b:void 0,q.$modelValue!==d&&q.$$writeModelToScope())})};this.$$writeModelToScope=function(){s(a,q.$modelValue);r(q.$viewChangeListeners,
function(a){try{a()}catch(c){b(c)}})};this.$setViewValue=function(a,b){q.$viewValue=a;q.$options&&!q.$options.updateOnDefault||q.$$debounceViewValueCommit(b)};this.$$debounceViewValueCommit=function(b){var c=0,d=q.$options;d&&x(d.debounce)&&(d=d.debounce,S(d)?c=d:S(d[b])?c=d[b]:S(d["default"])&&(c=d["default"]));g.cancel(t);c?t=g(function(){q.$commitViewValue()},c):h.$$phase?q.$commitViewValue():a.$apply(function(){q.$commitViewValue()})};a.$watch(function(){var b=p(a);if(b!==q.$modelValue&&(q.$modelValue===
q.$modelValue||b===b)){q.$modelValue=q.$$rawModelValue=b;I=void 0;for(var c=q.$formatters,d=c.length,e=b;d--;)e=c[d](e);q.$viewValue!==e&&(q.$$updateEmptyClasses(e),q.$viewValue=q.$$lastCommittedViewValue=e,q.$render(),q.$$runValidators(b,e,A))}return b})}],Se=["$rootScope",function(a){return{restrict:"A",require:["ngModel","^?form","^?ngModelOptions"],controller:Pg,priority:1,compile:function(b){b.addClass(Va).addClass("ng-untouched").addClass(ob);return{pre:function(a,b,e,f){var g=f[0];b=f[1]||
g.$$parentForm;g.$$setOptions(f[2]&&f[2].$options);b.$addControl(g);e.$observe("name",function(a){g.$name!==a&&g.$$parentForm.$$renameControl(g,a)});a.$on("$destroy",function(){g.$$parentForm.$removeControl(g)})},post:function(b,c,e,f){var g=f[0];if(g.$options&&g.$options.updateOn)c.on(g.$options.updateOn,function(a){g.$$debounceViewValueCommit(a&&a.type)});c.on("blur",function(){g.$touched||(a.$$phase?b.$evalAsync(g.$setTouched):b.$apply(g.$setTouched))})}}}}}],Qg=/(\s+|^)default(\s+|$)/,We=function(){return{restrict:"A",
controller:["$scope","$attrs",function(a,b){var d=this;this.$options=Z(a.$eval(b.ngModelOptions));x(this.$options.updateOn)?(this.$options.updateOnDefault=!1,this.$options.updateOn=W(this.$options.updateOn.replace(Qg,function(){d.$options.updateOnDefault=!0;return" "}))):this.$options.updateOnDefault=!0}]}},Ie=Ma({terminal:!0,priority:1E3}),Rg=O("ngOptions"),Sg=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
Qe=["$compile","$document","$parse",function(a,b,d){function c(a,b,c){function e(a,b,c,d,f){this.selectValue=a;this.viewValue=b;this.label=c;this.group=d;this.disabled=f}function f(a){var b;if(!r&&oa(a))b=a;else{b=[];for(var c in a)a.hasOwnProperty(c)&&"$"!==c.charAt(0)&&b.push(c)}return b}var n=a.match(Sg);if(!n)throw Rg("iexp",a,va(b));var p=n[5]||n[7],r=n[6];a=/ as /.test(n[0])&&n[1];var t=n[9];b=d(n[2]?n[1]:p);var x=a&&d(a)||b,q=t&&d(t),w=t?function(a,b){return q(c,b)}:function(a){return Ga(a)},
v=function(a,b){return w(a,D(a,b))},u=d(n[2]||n[1]),y=d(n[3]||""),A=d(n[4]||""),z=d(n[8]),C={},D=r?function(a,b){C[r]=b;C[p]=a;return C}:function(a){C[p]=a;return C};return{trackBy:t,getTrackByValue:v,getWatchables:d(z,function(a){var b=[];a=a||[];for(var d=f(a),e=d.length,g=0;g<e;g++){var h=a===d?g:d[g],l=a[h],h=D(l,h),l=w(l,h);b.push(l);if(n[2]||n[1])l=u(c,h),b.push(l);n[4]&&(h=A(c,h),b.push(h))}return b}),getOptions:function(){for(var a=[],b={},d=z(c)||[],g=f(d),h=g.length,n=0;n<h;n++){var p=d===
g?n:g[n],q=D(d[p],p),r=x(c,q),p=w(r,q),s=u(c,q),C=y(c,q),q=A(c,q),r=new e(p,r,s,C,q);a.push(r);b[p]=r}return{items:a,selectValueMap:b,getOptionFromViewValue:function(a){return b[v(a)]},getViewValueFromOption:function(a){return t?ea.copy(a.viewValue):a.viewValue}}}}}var e=E.document.createElement("option"),f=E.document.createElement("optgroup");return{restrict:"A",terminal:!0,require:["select","ngModel"],link:{pre:function(a,b,c,d){d[0].registerOption=A},post:function(d,h,k,l){function m(a,b){a.element=
b;b.disabled=a.disabled;a.label!==b.label&&(b.label=a.label,b.textContent=a.label);a.value!==b.value&&(b.value=a.selectValue)}function n(){var a=y&&p.readValue();if(y)for(var b=y.items.length-1;0<=b;b--){var c=y.items[b];c.group?Db(c.element.parentNode):Db(c.element)}y=z.getOptions();var d={};v&&h.prepend(w);y.items.forEach(function(a){var b;if(x(a.group)){b=d[a.group];b||(b=f.cloneNode(!1),E.appendChild(b),b.label=a.group,d[a.group]=b);var c=e.cloneNode(!1)}else b=E,c=e.cloneNode(!1);b.appendChild(c);
m(a,c)});h[0].appendChild(E);s.$render();s.$isEmpty(a)||(b=p.readValue(),(z.trackBy||t?na(a,b):a===b)||(s.$setViewValue(b),s.$render()))}var p=l[0],s=l[1],t=k.multiple,w;l=0;for(var q=h.children(),A=q.length;l<A;l++)if(""===q[l].value){w=q.eq(l);break}var v=!!w,u=B(e.cloneNode(!1));u.val("?");var y,z=c(k.ngOptions,h,d),E=b[0].createDocumentFragment();t?(s.$isEmpty=function(a){return!a||0===a.length},p.writeValue=function(a){y.items.forEach(function(a){a.element.selected=!1});a&&a.forEach(function(a){if(a=
y.getOptionFromViewValue(a))a.element.selected=!0})},p.readValue=function(){var a=h.val()||[],b=[];r(a,function(a){(a=y.selectValueMap[a])&&!a.disabled&&b.push(y.getViewValueFromOption(a))});return b},z.trackBy&&d.$watchCollection(function(){if(J(s.$viewValue))return s.$viewValue.map(function(a){return z.getTrackByValue(a)})},function(){s.$render()})):(p.writeValue=function(a){var b=y.getOptionFromViewValue(a);b?(h[0].value!==b.selectValue&&(u.remove(),v||w.remove(),h[0].value=b.selectValue,b.element.selected=
!0),b.element.setAttribute("selected","selected")):null===a||v?(u.remove(),v||h.prepend(w),h.val(""),w.prop("selected",!0),w.attr("selected",!0)):(v||w.remove(),h.prepend(u),h.val("?"),u.prop("selected",!0),u.attr("selected",!0))},p.readValue=function(){var a=y.selectValueMap[h.val()];return a&&!a.disabled?(v||w.remove(),u.remove(),y.getViewValueFromOption(a)):null},z.trackBy&&d.$watch(function(){return z.getTrackByValue(s.$viewValue)},function(){s.$render()}));v?(w.remove(),a(w)(d),w.removeClass("ng-scope")):
w=B(e.cloneNode(!1));h.empty();n();d.$watchCollection(z.getWatchables,n)}}}}],Je=["$locale","$interpolate","$log",function(a,b,d){var c=/{}/g,e=/^when(Minus)?(.+)$/;return{link:function(f,g,h){function k(a){g.text(a||"")}var l=h.count,m=h.$attr.when&&g.attr(h.$attr.when),n=h.offset||0,p=f.$eval(m)||{},s={},t=b.startSymbol(),x=b.endSymbol(),q=t+l+"-"+n+x,z=ea.noop,v;r(h,function(a,b){var c=e.exec(b);c&&(c=(c[1]?"-":"")+M(c[2]),p[c]=g.attr(h.$attr[b]))});r(p,function(a,d){s[d]=b(a.replace(c,q))});f.$watch(l,
function(b){var c=parseFloat(b),e=isNaN(c);e||c in p||(c=a.pluralCat(c-n));c===v||e&&S(v)&&isNaN(v)||(z(),e=s[c],w(e)?(null!=b&&d.debug("ngPluralize: no rule defined for '"+c+"' in "+m),z=A,k()):z=f.$watch(e,k),v=c)})}}}],Ke=["$parse","$animate","$compile",function(a,b,d){var c=O("ngRepeat"),e=function(a,b,c,d,e,m,n){a[c]=d;e&&(a[e]=m);a.$index=b;a.$first=0===b;a.$last=b===n-1;a.$middle=!(a.$first||a.$last);a.$odd=!(a.$even=0===(b&1))};return{restrict:"A",multiElement:!0,transclude:"element",priority:1E3,
terminal:!0,$$tlb:!0,compile:function(f,g){var h=g.ngRepeat,k=d.$$createComment("end ngRepeat",h),l=h.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);if(!l)throw c("iexp",h);var m=l[1],n=l[2],p=l[3],s=l[4],l=m.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);if(!l)throw c("iidexp",m);var t=l[3]||l[1],w=l[2];if(p&&(!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(p)||/^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(p)))throw c("badident",
p);var q,x,v,u,y={$id:Ga};s?q=a(s):(v=function(a,b){return Ga(b)},u=function(a){return a});return function(a,d,f,g,l){q&&(x=function(b,c,d){w&&(y[w]=b);y[t]=c;y.$index=d;return q(a,y)});var m=T();a.$watchCollection(n,function(f){var g,n,q=d[0],s,y=T(),z,A,E,C,D,B,F;p&&(a[p]=f);if(oa(f))D=f,n=x||v;else for(F in n=x||u,D=[],f)sa.call(f,F)&&"$"!==F.charAt(0)&&D.push(F);z=D.length;F=Array(z);for(g=0;g<z;g++)if(A=f===D?g:D[g],E=f[A],C=n(A,E,g),m[C])B=m[C],delete m[C],y[C]=B,F[g]=B;else{if(y[C])throw r(F,
function(a){a&&a.scope&&(m[a.id]=a)}),c("dupes",h,C,E);F[g]={id:C,scope:void 0,clone:void 0};y[C]=!0}for(s in m){B=m[s];C=tb(B.clone);b.leave(C);if(C[0].parentNode)for(g=0,n=C.length;g<n;g++)C[g].$$NG_REMOVED=!0;B.scope.$destroy()}for(g=0;g<z;g++)if(A=f===D?g:D[g],E=f[A],B=F[g],B.scope){s=q;do s=s.nextSibling;while(s&&s.$$NG_REMOVED);B.clone[0]!=s&&b.move(tb(B.clone),null,q);q=B.clone[B.clone.length-1];e(B.scope,g,t,E,w,A,z)}else l(function(a,c){B.scope=c;var d=k.cloneNode(!1);a[a.length++]=d;b.enter(a,
null,q);q=d;B.clone=a;y[B.id]=B;e(B.scope,g,t,E,w,A,z)});m=y})}}}}],Le=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(b,d,c){b.$watch(c.ngShow,function(b){a[b?"removeClass":"addClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],Ee=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(b,d,c){b.$watch(c.ngHide,function(b){a[b?"addClass":"removeClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],Me=Ma(function(a,b,d){a.$watch(d.ngStyle,function(a,
d){d&&a!==d&&r(d,function(a,c){b.css(c,"")});a&&b.css(a)},!0)}),Ne=["$animate","$compile",function(a,b){return{require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(d,c,e,f){var g=[],h=[],k=[],l=[],m=function(a,b){return function(){a.splice(b,1)}};d.$watch(e.ngSwitch||e.on,function(c){var d,e;d=0;for(e=k.length;d<e;++d)a.cancel(k[d]);d=k.length=0;for(e=l.length;d<e;++d){var t=tb(h[d].clone);l[d].$destroy();(k[d]=a.leave(t)).then(m(k,d))}h.length=0;l.length=0;(g=f.cases["!"+
c]||f.cases["?"])&&r(g,function(c){c.transclude(function(d,e){l.push(e);var f=c.element;d[d.length++]=b.$$createComment("end ngSwitchWhen");h.push({clone:d});a.enter(d,f.parent(),f)})})})}}}],Oe=Ma({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,b,d,c,e){c.cases["!"+d.ngSwitchWhen]=c.cases["!"+d.ngSwitchWhen]||[];c.cases["!"+d.ngSwitchWhen].push({transclude:e,element:b})}}),Pe=Ma({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,
b,d,c,e){c.cases["?"]=c.cases["?"]||[];c.cases["?"].push({transclude:e,element:b})}}),Tg=O("ngTransclude"),Re=Ma({restrict:"EAC",link:function(a,b,d,c,e){d.ngTransclude===d.$attr.ngTransclude&&(d.ngTransclude="");if(!e)throw Tg("orphan",va(b));e(function(a){a.length&&(b.empty(),b.append(a))},null,d.ngTransclude||d.ngTranscludeSlot)}}),re=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(b,d){"text/ng-template"==d.type&&a.put(d.id,b[0].text)}}}],Ug={$setViewValue:A,$render:A},
Vg=["$element","$scope",function(a,b){var d=this,c=new Sa;d.ngModelCtrl=Ug;d.unknownOption=B(E.document.createElement("option"));d.renderUnknownOption=function(b){b="? "+Ga(b)+" ?";d.unknownOption.val(b);a.prepend(d.unknownOption);a.val(b)};b.$on("$destroy",function(){d.renderUnknownOption=A});d.removeUnknownOption=function(){d.unknownOption.parent()&&d.unknownOption.remove()};d.readValue=function(){d.removeUnknownOption();return a.val()};d.writeValue=function(b){d.hasOption(b)?(d.removeUnknownOption(),
a.val(b),""===b&&d.emptyOption.prop("selected",!0)):null==b&&d.emptyOption?(d.removeUnknownOption(),a.val("")):d.renderUnknownOption(b)};d.addOption=function(a,b){if(8!==b[0].nodeType){Ra(a,'"option value"');""===a&&(d.emptyOption=b);var g=c.get(a)||0;c.put(a,g+1);d.ngModelCtrl.$render();b[0].hasAttribute("selected")&&(b[0].selected=!0)}};d.removeOption=function(a){var b=c.get(a);b&&(1===b?(c.remove(a),""===a&&(d.emptyOption=void 0)):c.put(a,b-1))};d.hasOption=function(a){return!!c.get(a)};d.registerOption=
function(a,b,c,h,k){if(h){var l;c.$observe("value",function(a){x(l)&&d.removeOption(l);l=a;d.addOption(a,b)})}else k?a.$watch(k,function(a,e){c.$set("value",a);e!==a&&d.removeOption(e);d.addOption(a,b)}):d.addOption(c.value,b);b.on("$destroy",function(){d.removeOption(c.value);d.ngModelCtrl.$render()})}}],se=function(){return{restrict:"E",require:["select","?ngModel"],controller:Vg,priority:1,link:{pre:function(a,b,d,c){var e=c[1];if(e){var f=c[0];f.ngModelCtrl=e;b.on("change",function(){a.$apply(function(){e.$setViewValue(f.readValue())})});
if(d.multiple){f.readValue=function(){var a=[];r(b.find("option"),function(b){b.selected&&a.push(b.value)});return a};f.writeValue=function(a){var c=new Sa(a);r(b.find("option"),function(a){a.selected=x(c.get(a.value))})};var g,h=NaN;a.$watch(function(){h!==e.$viewValue||na(g,e.$viewValue)||(g=ga(e.$viewValue),e.$render());h=e.$viewValue});e.$isEmpty=function(a){return!a||0===a.length}}}},post:function(a,b,d,c){var e=c[1];if(e){var f=c[0];e.$render=function(){f.writeValue(e.$viewValue)}}}}}},ue=["$interpolate",
function(a){return{restrict:"E",priority:100,compile:function(b,d){if(x(d.value))var c=a(d.value,!0);else{var e=a(b.text(),!0);e||d.$set("value",b.text())}return function(a,b,d){var k=b.parent();(k=k.data("$selectController")||k.parent().data("$selectController"))&&k.registerOption(a,b,d,c,e)}}}}],te=da({restrict:"E",terminal:!1}),Ic=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){c&&(d.required=!0,c.$validators.required=function(a,b){return!d.required||!c.$isEmpty(b)},d.$observe("required",
function(){c.$validate()}))}}},Hc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var e,f=d.ngPattern||d.pattern;d.$observe("pattern",function(a){F(a)&&0<a.length&&(a=new RegExp("^"+a+"$"));if(a&&!a.test)throw O("ngPattern")("noregexp",f,a,va(b));e=a||void 0;c.$validate()});c.$validators.pattern=function(a,b){return c.$isEmpty(b)||w(e)||e.test(b)}}}}},Kc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var e=-1;d.$observe("maxlength",function(a){a=
aa(a);e=isNaN(a)?-1:a;c.$validate()});c.$validators.maxlength=function(a,b){return 0>e||c.$isEmpty(b)||b.length<=e}}}}},Jc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var e=0;d.$observe("minlength",function(a){e=aa(a)||0;c.$validate()});c.$validators.minlength=function(a,b){return c.$isEmpty(b)||b.length>=e}}}}};E.angular.bootstrap?E.console&&console.log("WARNING: Tried to load angular more than once."):(ke(),me(ea),ea.module("ngLocale",[],["$provide",function(a){function b(a){a+=
"";var b=a.indexOf(".");return-1==b?0:a.length-b-1}a.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),ERANAMES:["Before Christ","Anno Domini"],ERAS:["BC","AD"],FIRSTDAYOFWEEK:6,MONTH:"January February March April May June July August September October November December".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),STANDALONEMONTH:"January February March April May June July August September October November December".split(" "),
WEEKENDRANGE:[5,6],fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",medium:"MMM d, y h:mm:ss a",mediumDate:"MMM d, y",mediumTime:"h:mm:ss a","short":"M/d/yy h:mm a",shortDate:"M/d/yy",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"-\u00a4",negSuf:"",posPre:"\u00a4",posSuf:""}]},id:"en-us",localeID:"en_US",pluralCat:function(a,
c){var e=a|0,f=c;void 0===f&&(f=Math.min(b(a),3));Math.pow(10,f);return 1==e&&0==f?"one":"other"}})}]),B(E.document).ready(function(){ge(E.document,Bc)}))})(window);!window.angular.$$csp().noInlineStyle&&window.angular.element(document.head).prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}</style>');
//# sourceMappingURL=angular.min.js.map

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/angular/angular.min.js","/../node_modules/angular")
},{"buffer":9,"pBGvAp":11}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/base64-js/lib/b64.js","/../node_modules/base64-js/lib")
},{"buffer":9,"pBGvAp":11}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/buffer/index.js","/../node_modules/buffer")
},{"base64-js":8,"buffer":9,"ieee754":10,"pBGvAp":11}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/ieee754/index.js","/../node_modules/ieee754")
},{"buffer":9,"pBGvAp":11}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/process/browser.js","/../node_modules/process")
},{"buffer":9,"pBGvAp":11}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/underscore/underscore.js","/../node_modules/underscore")
},{"buffer":9,"pBGvAp":11}]},{},[1])
(function (window, document, $, angular) {
  'use strict';

  var posties = {};

  var dependencies = ['angular-medium-editor', 'angulartics', 'angulartics.google.analytics'];

  var postiesApp = angular.module('posties', dependencies, function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  }).config(function ($analyticsProvider) {
    $analyticsProvider.firstPageview(true);
    $analyticsProvider.withAutoBase(true);
  });

  postiesApp.constant('config', {
    domain: window.location.hostname.indexOf('posti.es') > -1 ? 'posti.es' : 'localhost:5000',
    headerJSON: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    keySettings: 'postiesKeySettings'
  });

  window.posties = posties;
  window.postiesApp = postiesApp;

})(window, document, $, angular);
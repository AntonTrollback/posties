var postiesApp = angular.module('posties', ['ngSanitize', 'colorpicker.module'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

postiesApp.constant('config', {
    headerJSON: { 'Content-Type': 'application/json;charset=UTF-8' }
});

postiesApp.service('SettingsService', function($http, config) {

	this.isOpen = false;
	
	this.getSettings = function() {
		var promise = $http({
			url: '/api/settings',
			method: 'get',
			headers: config.headerJSON
		}).then(function(response) {
			this.data = response.data;
			return response.data;
		}, function(response) {
			console.log(response);
		});

		return promise;
	}

	this.open = function() {
		return this.isOpen = !this.isOpen;
    }

    this.submitUpdateSettings = function(userSettings) {
    	var promise = $http({
			url: '/api/settings',
			method: 'put',
			data: userSettings,
			headers: config.headerJSON
		}).then(function(response) {
			this.data = response.data;
			return response.data;
		}, function(response) {
			console.log(response);
		});

		this.close();

		return promise;
    }

	this.close = function() {
		this.isOpen = false;
	}

});


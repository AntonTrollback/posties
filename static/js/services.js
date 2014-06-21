var postiesApp = angular.module('posties', ['ngSanitize'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

postiesApp.constant('config', {
    headerJSON: { 'Content-Type': 'application/json;charset=UTF-8' }
});

postiesApp.service('SettingsService', function($http, config) {

	var isOpen = false;
	var settings = false;

	this.open = function() {
		if(!settings) {
			$http({
				url: '/api/settings',
				method: 'get',
				headers: config.headerJSON
			}).then(function(response) {
				settings = response.data;
			}, function(response) {
				console.log(response);
			});
		} else {
			console.log(settings);
		}

		this.isOpen = !this.isOpen;
		return this.isOpen;
	}

});
var postiesApp = angular.module('posties', ['ngSanitize', 'colorpicker.module'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

postiesApp.constant('config', {
    headerJSON: { 'Content-Type': 'application/json;charset=UTF-8' },
    keySettings: 'postiesKeySettings'
});

postiesApp.service('SettingsService', function($http, config) {

	this.isOpen = false;
	
	this.getSettings = function() {
		if($('body').hasClass('authenticated')) {
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
		} else {
			var userSettings = localStorage.getItem(config.keySettings);
			if(userSettings)
				return JSON.parse(userSettings);
			else
				return {
					created:  new Date(),
					id:  "123",
					pagebackgroundcolor:  "#f5f5f5" ,
					pagehaspostshadows: true ,
					postbackgroundcolor:  "#ffffff" ,
					posttextcolor:  "#141414" ,
					typefaceheadline:  "sans-serif" ,
					typefaceparagraph:  "sans-serif" ,
					username:  false
				};
		}
	}

    this.submitUpdateSettings = function(userSettings) {
    	if($('body').hasClass('authenticated')) {
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
    	} else {
    		localStorage.setItem(config.keySettings, JSON.stringify(userSettings));
    		this.close();
    	}
    }

    this.open = function() {
		return this.isOpen = !this.isOpen;
    }

    this.close = function() {
		return this.isOpen = false;
	}

});


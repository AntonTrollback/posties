var postiesApp = angular.module('posties', ['ngSanitize'], function ($interpolateProvider) {
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

    $('.colorpicker').colpick({ 
		layout : 'hex', 
		onSubmit: function(hsb, hex, rgb, el) {
			$(el).parents('fieldset:eq(0)').find('input:eq(0)')
			.css('background', '#' + hex)
			.val('#' + hex);

			$(el).colpickHide();
		}
	});
});


(function () {
	'use strict';
	/*global angular*/
	var app = angular.module('jsrMocks', []);
	app.provider('jsrMocks', function () {
		var $mocks;
		return {
			setMocks: function (mocks) {
				$mocks = mocks;
			},
			$get: function ($log, $http, $window, $timeout, $q) {
				if (!$window.Visualforce || !$window.Visualforce.ProviderManager) {
					return {
						remoting: {
							Manager: {
								invokeAction: invokeStaticAction
							}
						}
					};
				} else {
					return $window.Visualforce;
				}
				function invokeStaticAction() {
					if (!$mocks) {
						throw 'jsrMocksProvider is not configured';
					}
					if (!$mocks[arguments[0]]) {
						throw 'Mock Error ' + arguments[0];
					}
					if (!arguments[0]) {
						throw 'Missing Mock, method argument is undefined';
					}
					var lastArg = arguments[arguments.length - 1],
						callback = lastArg,
						mock = $mocks[arguments[0].trim()],
						result = mock.method(arguments),
						event = {
							status: true
						};
					if (typeof (callback) === 'object') {
						callback = arguments[arguments.length - 2];
					}
					if (mock) {
						return $timeout(function () {
							callback(result, event);
						}, mock.timeout || 50);
					}
				}
			}
		};
	});
	// The actual factory that gets called in the controller.	
	app.factory('jsr', function (jsrMocks, $q, $rootScope) {
		var Visualforce = jsrMocks;
		return function (request) {
			// Wrap it in a Promise
			var deferred = $q.defer();
			// Add each parameter, first the method name, then the arguments, then the callback
			var parameters = [request.method];
			if (request.args) {
				for (var i = 0; i < request.args.length; i++) {
					parameters.push(request.args[i]);
				}
			}
			// Resolve/Reject the promise
			var callback = function (result, event) {
				$rootScope.$apply(function () {
					if (event.status) {
						deferred.resolve(result);
					} else {
						deferred.reject(event);
					}
				});
			};
			parameters.push(callback);
			if (request.options) {
				parameters.push(request.options);
			}
			// Here is where we actually invoke the action we want to call with our parameters
			Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);
			return deferred.promise;
		};
	});
}());

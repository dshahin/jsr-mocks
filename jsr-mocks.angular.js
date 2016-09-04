'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* globals window, Visualforce */


var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//if we can't find a specific jsr mock method
var genericMock = {
    method: function method(args) {
        alert('mock not implemented for ' + args[0]);
        console.error('mock not implemented for ', args);
    },
    timeout: 500 //half second
};

function jsrMocks() {
    var $mocks;
    var $mockServer;
    return {
        setMocks: function setMocks(mocks, mockServer) {
            $mocks = mocks;
            $mockServer = mockServer;
        },

        $get: function $get($log, $http, $window, $timeout) {
            'ngInject';

            if (!window.Visualforce) {

                return {
                    remoting: {
                        Manager: {
                            invokeAction: invokeStaticAction
                        }
                    }
                };
            } else {
                return Visualforce;
            }

            function invokeStaticAction() {

                var lastArg = arguments[arguments.length - 1],
                    callback = lastArg,
                    mock = $mocks[arguments[0]] || genericMock,
                    result = mock.method(arguments),
                    event = {
                    status: true
                };

                if (mock.error) {
                    event.status = false;
                    event.message = mock.error;
                }

                if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === 'object') {
                    callback = arguments[arguments.length - 2];
                }
                $timeout(function () {
                    callback(result, event);
                }, mock.timeout);
            }
        }

    };
}

function jsr(jsrMocks, $q, $rootScope) {
    'ngInject';

    var Visualforce = jsrMocks;

    return function (request) {
        var deferred = $q.defer();

        var parameters = [request.method];

        if (request.args) {

            for (var i = 0; i < request.args.length; i++) {
                parameters.push(request.args[i]);
            }
        }
        var callback = function callback(result, event) {
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

        Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);

        return deferred.promise;
    };
}

exports.default = _angular2.default.module('jsrMocks', []).provider('jsrMocks', jsrMocks).factory('jsr', jsr).name;

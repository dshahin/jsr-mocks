/* globals window, Visualforce */
import angular from 'angular';

//if we can't find a specific jsr mock method
var genericMock ={
    method : args => {
        alert('mock not implemented for '  + args[0]);
        console.error('mock not implemented for ', args);
    },
    timeout : 500 //half second
};

function jsrMocks() {
    "ngInject";
    var $mocks;
    var $mockServer;
    return {
        setMocks: function (mocks, mockServer) {
            $mocks = mocks;
            $mockServer = mockServer;
        },

        $get: function ($timeout) {
            "ngInject";
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

                if (mock.error){
                    event.status = false;
                    event.message = mock.error;
                }

                if (typeof (callback) === 'object') {
                    callback = arguments[arguments.length - 2];
                }
                $timeout( () => {
                    callback(result, event);
                }, mock.timeout);
            }

        }

    };

}

function jsr(jsrMocks, $q, $rootScope) {
    "ngInject";
    var Visualforce = jsrMocks;

    return function (request) {
        var deferred = $q.defer();

        var parameters = [request.method];

        if (request.args) {

            for (var i = 0; i < request.args.length; i++) {
                parameters.push(request.args[i]);
            }
        }
        var callback = (result, event) => {
            $rootScope.$apply( () => {
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

export default angular.module('jsrMocks', [])
    .provider('jsrMocks', jsrMocks)
    .factory('jsr', jsr)
    .name;

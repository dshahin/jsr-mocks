'use strict';

angular.module('jsrMocks', [])
    .provider('Visualforce', jsrMocks);

function jsrMocks() {

    var $mocks;

    return {

        setMocks: function(mocks) {
            $mocks = mocks;
        },

        $get: function() {
            if(!window.Visualforce){
                return {
                    remoting: {
                        Manager: {
                            invokeAction: function() {
                                var lastArg = arguments[arguments.length - 1],
                                    callback = lastArg,
                                    mock = $mocks[arguments[0]],
                                    result = mock.method(arguments),
                                    event = {
                                        status: true
                                    };
                                if (typeof(callback) === 'object') {
                                    callback = arguments[arguments.length - 2];
                                }
                                setTimeout(function() {
                                    callback(result, event);
                                }, mock.timeout);
                            }
                        }
                    }
                };
            }else{
                return Visualforce;
            }
        }

    }
}


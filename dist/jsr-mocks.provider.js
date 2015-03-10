'use strict';

angular.module('jsrMocks', [])
    .provider('jsrMocks', jsrMocks);

function jsrMocks() {
    var title;
    var $mocks;


    return {

        setTitle: function(value) {
            title = value;
        },

        setMocks: function(mocks) {
            $mocks = mocks;
        },

        showMocks: function(){
            console.log('the mocks',$mocks);
        },

        config: function() {

        },

        $get: function() {
            if(!window.Visualforce){
                return {
                    title: "foobar " + title,
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


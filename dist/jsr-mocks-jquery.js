(function($) {
    //if we can't find a specific jsr mock method
    var genericMock ={
        method : function(args){
            alert('generic mock args:', args);
        },
        timeout : 500 //half second
    };

    if (!window.Visualforce){
        var $mocks = window.configSettings.mocks || {};
        window.Visualforce = {
            //Visualforce.remoting.Manager.invokeAction
            remoting :{
                Manager:{
                    invokeAction: function(){
                        var lastArg = arguments[arguments.length - 1],
                            callback = lastArg,
                            mock = $mocks[arguments[0]] || genericMock,
                            result = mock.method(arguments) ,
                            event = {status : true};
			
			if (mock.error) {
                            event.status = false;
                            event.message = mock.error;
                        }
                        if(typeof(callback) === 'object'){
                            callback = arguments[arguments.length - 2];
                        }
                        setTimeout(function(){
                            callback(result,event);
                        },mock.timeout);
                    }
                }
            }
        };
    }

    $.jsr = function(request) {

        var deferred = $.Deferred();

        var parameters = [request.method];

        if (request.args) {

            for (var i = 0; i < request.args.length; i++) {
                parameters.push(request.args[i]);
            }
        }

        var callback = function(result, event) {

            if (event.status) {

                deferred.resolve(result);
            } else {
                deferred.reject(event);
            }

        };

        parameters.push(callback);

        if (request.options) {
            parameters.push(request.options);
        }

        Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);
        return deferred.promise();
    };

}(jQuery));

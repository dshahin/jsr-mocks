//if we can't find a specific jsr mock method
var genericMock ={
    method : function(args){
        alert('generic mock args:', args);
    },
    timeout : 500 //half second
};

var $mocks =  {};

var setMocks = function(location){
    $mocks = location;
};

if (!window.Visualforce){
    
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

var promise = function(request) {

    
    return new Promise(function(resolve, reject) {

        var parameters = [request.method];

        if (request.args) {

            for (var i = 0; i < request.args.length; i++) {
                parameters.push(request.args[i]);
            }
        }

        var callback = function(result, event) {

            if (event.status) {

                resolve(result);
            } else {
                reject(event);
            }

        };

        parameters.push(callback);

        if (request.options) {
            parameters.push(request.options);
        }

        Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);
    });


};

exports.promise = promise;
exports.setMocks = setMocks;

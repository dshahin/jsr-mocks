(function(global, configSettings){


	if(!global.Visualforce){
		var $mocks = configSettings.mocks;
		global.Visualforce = {
			//Visualforce.remoting.Manager.invokeAction
			remoting :{
				Manager:{
					invokeAction: function(){
						var lastArg = arguments[arguments.length - 1],
						    callback = lastArg,
							mock = $mocks[arguments[0]],
							result = mock.method(arguments),
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
})(window, configSettings);

(function(global, $, $config){

	var $mocks = $config.mocks;
	
	global.Visualforce = {
		//Visualforce.remoting.Manager.invokeAction
		remoting :{
			Manager:{
				invokeAction: function(){
					var callback = arguments[arguments.length - 1],
						mockMethod = $mocks[arguments[0]],
						result = mockMethod(arguments),
						event = {status : true};
					setTimeout(function(){
						callback(result,event);
					},$config.mockTimeout);
				}
			}
		}
	}
})(window, jQuery, $config);

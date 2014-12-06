(function(global, $, $config){

	var $mocks = $config.mocks;
	
	global.Visualforce = {
		//Visualforce.remoting.Manager.invokeAction
		remoting :{
			Manager:{
				invokeAction: function(){
					var callback = arguments[arguments.length - 1],
						mock = $mocks[arguments[0]],
						result = mock.method(arguments),
						event = {status : true};
					setTimeout(function(){
						callback(result,event);
					},mock.timeout);
				}
			}
		}
	}
})(window, jQuery, $config);

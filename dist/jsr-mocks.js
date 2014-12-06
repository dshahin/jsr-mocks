(function(global, $, $mocks){
	
	global.Visualforce = {
		//Visualforce.remoting.Manager.invokeAction
		remoting :{
			Manager:{
				invokeAction: function(){
					var callback = arguments[arguments.length - 1],
						mockMethod = $mocks[arguments[0]],
						result = mockMethod(),
						event = {status : true};
					setTimeout(function(){
						callback(result,event);
					},0);
				}
			}
		}
	}
})(window, jQuery, $mocks);

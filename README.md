jsr-mocks
=========

a mock shim for javascript remoting

Use to test local versions of single page salesforce apps without deploying to server

intallation
===========
```bower install jsr-mocks```
jsr-mocks will expect a global object named ```configSettings``` with a property called mocks containing local methods that don't need a Salesforce server, and a timeout to simulate jsr load times.
```html
<head>

	<link rel="stylesheet" href="/static/css/main.css" />
</head>

<div id="ready" class="ready">I am ready already</div>
<div id="ready2" class="ready"><img src="http://s25.postimage.org/ykwiwxw23/ajax_loader_2.gif" alt="loading"/></div>
<div id="ready3" class="ready"><img src="http://s25.postimage.org/ykwiwxw23/ajax_loader_2.gif" alt="loading"/></div>
<script src="/static/bower_components/jquery/dist/jquery.js"></script>
<script src="/static/js/myOtherModule.js"></script>
<!-- first resolve VF variables into configSettings, our only global object -->
<script>
var configSettings = {
	jsr: {
		myFunction :'{!$RemoteAction.MyCustomController.myFunction}',
		myOtherFunction :'{!$RemoteAction.MyCustomController.myOtherFunction}'
	},
	mocks :{
		'{!$RemoteAction.MyCustomController.myFunction}' : {
			timeout : 2000, //2 seconds with inline callback
			method : function(args){   
				console.log('args',args);
				return { message:  args[1]}
			}
		},
		'{!$RemoteAction.MyCustomController.myOtherFunction}' : {
			timeout : 3000, //3 seconds with named callback function
			method : myCallback
		}
	}
}; 

function myCallback(args){
	console.log('args',args);
	return { message:  args[1] + ' says the other callback'}
}
	
</script>
<!-- since this is not a VF page, we load a shim library instead for JSR calls -->
<script src="/static/bower_components/jsr-mocks/dist/jsr-mocks.provider.js"></script>
<!-- now our main script can call JSR methods in VF and mock methods in HTML Page with same syntax -->
<script src="/static/js/main.js"></script>

```

main.js can now look like this

```javascript

angular.module('myModule', ['jsrMocks']) //inject dependency
  .config(function ($stateProvider, $urlRouterProvider, jsrMocksProvider){
    jsrMocksProvider.setMocks(configSettings.mocks);//point to global config variable (see html)
});
```
factories can now include the jsrMocks object and override Visualforce selectively
```javascript
'use strict';

angular.module('myModule').factory('PatientFactory',  PatientFactory );

function PatientFactory($q, $rootScope, $log, jsrMocks) {
    
	//insert the shim
    var Visualforce = jsrMocks;

	var factory = {
		GetPatient : GetPatient
	};

	return factory;

	function GetPatient (patientId) {
        var deferred = $q.defer();
        
        Visualforce.remoting.Manager.invokeAction(
            configSettings.remoteActions.getPatient,
            patientId,//this is the first argument to jsr method
            function(result, event) {
                $rootScope.$apply(function() {
                    if (event.status) {
                    	deferred.resolve(result);
                    } else {
                    	deferred.reject(event);
                    }
                });
            }
        );
		//always return a promise when making async calls
        return deferred.promise;
	}



	
}



```

jsr-mocks
=========

a mock shim for javascript remoting

Use to test local versions of single page salesforce apps without deploying to server

intallation
===========
```bower install jsr-mocks```
jsr-mocks will expect a global object named $config with a property call mocks.
```html
<script>
	var $config = {
		jsr: {
			myFunction :'{!$RemoteAction.MyCustomController.myFunction}',
			myOtherFunction :'{!$RemoteAction.MyCustomController.myOtherFunction}'
		},
		mocks :{
			'{!$RemoteAction.MyCustomController.myFunction}' : {
				timeout : 2000,
				method : function(args){
					console.log('args',args);
					return { message:  args[1]}
				}
			},
			'{!$RemoteAction.MyCustomController.myOtherFunction}' : {
				timeout : 3000,
				method : function(args){
					console.log('args',args);
					return { message:  args[1]}
				}
			}
		}
	}; 

	</script>

	<script src="/static/bower_components/jsr-mocks/dist/jsr-mocks.js"></script>
	<script src="/static/js/main.js"></script>
	```

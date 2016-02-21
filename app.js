
/**
 * Module dependencies.
 */

var express = require('express')
, http = require('http')
, path = require('path')
, es = require("./esmodule");


var app = express();

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
	console.log('Initializing...');

	console.log('Checking connection to elastic...');
	es.esConnectionOk(function(status){
		if(status == true){
			console.log('elastic is good.');
			console.log('Checking for the elastic indices...');
			es.createDoodlyIndex();
			es.createPackageIndex();
			es.createConsumerIndex();
		}else{
			console.log('elastic health is bad, exiting.');
			process.exit(1);
		}		
	});		
});




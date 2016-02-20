
/**
 * Module dependencies.
 */

var express = require('express')
/* , routes = require('./routes')
  , user = require('./routes/user')*/
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

/*app.get('/', routes.index);
app.get('/users', user.check);*/


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
	console.log('Initializing...');

	console.log('Checking connection to elastic...');
	es.esConnectionOk(function(status){
		if(status == true){
			console.log('elastic is good.');
		}else{
			console.log('elastic health is bad, exiting.');
			process.exit(1);
		}		
	});

	console.log('Checking for the elastic indices...');
	es.createDoodlyIndex();
	es.createPackageIndex();
	es.createConsumerIndex();	
	
});




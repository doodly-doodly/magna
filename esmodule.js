/*Load elastic module*/
var elasticsearch = require('elasticsearch')
, esconstants = require("./esconstants")
, es = require("./esmodule");

/*Create client connection*/
var client = new elasticsearch.Client({
	host: 'localhost:9200'/*,
	log: 'trace'*/
});


/*Is elastic connection OK?*/
exports.esConnectionOk = function(Callback){
	return client.cluster.health(function (err, resp) {
		if (err) {
			console.error(err.message);	
			callback(false);
		} else {			
			if(resp.status == 'yellow' || resp.status == 'green'){
				Callback(true);
			}
		}			
	});
}

/*Is index exists?*/
exports.esIndexExists = function(indexName, callback){	
	client.indices.exists({
		index: indexName
	},function(error, exists){
		if (error) {
			console.error(error.message);
			callback(false);			
		} else {			
			callback(exists);
		}				
	});	
}

/*Create index*/
exports.createESIndex = function(indexName, mappings, callback){
	console.log(mappings);
	client.indices.create({
		index: indexName,
		body: mappings		
	}, function (err, resp, respcode) {		
		if(respcode == 200){
			callback(true);
		}else{
			callback(false);
		}
	});
}

/*Check if index is present, if not then create*/
exports.checkAndCreateIndex = function(indexName, mappings){
	this.esIndexExists(indexName, function(status){
		if(status == true){
			console.log('index '+indexName+' is present.');
		}else{
			console.log('index '+indexName+' is not present, creating it.');
			es.createESIndex(indexName, mappings, function(status){
				if(status == true){
					console.log('Created the index {'+indexName+'}...');
				}else{
					console.log('Problem creating the index {'+indexName+'}, exiting...');
					process.exit(2);
				}
			});
		}
	});
}

/*Create doodly index*/
exports.createDoodlyIndex = function(){	
	this.checkAndCreateIndex("doodly", esconstants.doodlymappingLines);
}

/*Create package index*/
exports.createPackageIndex = function(){
	this.checkAndCreateIndex("package", esconstants.packagemappingLines);	
}

/*Create consumer index*/
exports.createConsumerIndex = function(){
	this.checkAndCreateIndex("consumer", esconstants.consumermappingLines);
}

/*Index doodly*/
exports.indexInToDoodly = function(doodlyDetails){
	var record = {
			index: "doodly",
			type: "aType",
			id: doodlyDetails.doodlyId,
			body: doodlyDetails
	};

	client.index(record, function(err, resp) {
		if (err) {
			console.error(err.message);
		} else {
			console.log("---->"+resp);
		}	
	});
}

/*this.indexInToDoodly({
	doodlyId: '1',
	name: 'abc1',
	mobile: '0000000000',
	address: 'address1',
	sex: 'm',
	marital_status: 'single',
	currLocation: {
		lat: 0.0,
		lon: 0.0
	},
	nextStop:{
		address: 'abc2',
		geoLocation: {
			lat: 0.0,
			lon: 0.0
		}
	},
	packageSet:[
	            {
	            	packageId: 'p1',
					packageType: 'pt1',
					size: '1.5',
					status: 'status',
					pickupLocation: {
						name: 'abc',
						mobile: '0000000000',
						address: 'abc1',
						geoLocation: {
							lat: 0.0,
							lon: 0.0
						}
					},
					dropLocation: {
						name: 'def',
						mobile: '0000000000',
						address: 'def',
						geoLocation: {
							lat: 0.0,
							lon: 0.0
						}
					}
	            },
	            {
	            	packageId: 'p2',
					packageType: 'pt1',
					size: '1.5',
					status: 'status',
					pickupLocation: {
						name: 'abc',
						mobile: '0000000000',
						address: 'abc1',
						geoLocation: {
							lat: 0.0,
							lon: 0.0
						}
					},
					dropLocation: {
						name: 'def',
						mobile: '0000000000',
						address: 'def',
						geoLocation: {
							lat: 0.0,
							lon: 0.0
						}
					}
	            }
	            ]
})*/

/*Index doodly*/
exports.searchES = function(index, query, callback){
	client.search({
		index: index,
		type: 'aType',
		body: query
	}, function (error, response) {
		if(error){
			console.log(error.message);
		}else{
			callback(response.hits.hits);
		}		
	});
}

exports.searchDoodlyInLocation = function(latitude, longtitude, distance, callback){
	this.searchES("doodly", {
		query: {
			filtered : {
				query : {
					match_all : {}
				},
				filter : {
					geo_distance : {						
						distance : distance,
						currLocation : {
							lat : latitude,
							lon : longtitude
						}						
					}
				}
			}
		}
	}, callback);
}


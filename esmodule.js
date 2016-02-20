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
	client.cluster.health().then(function (resp) {		
		if(resp.status == 'yellow' || resp.status == 'green'){
			Callback(true);
		}
	},function(error){
		console.error(error.message);	
		callback(false);
	});
}

/*Is index exists?*/
exports.esIndexExists = function(indexName, callback){	
	client.indices.exists({
		index: indexName
	}).then(function(resp){		
		callback(resp);
	},function(error){
		console.error(error.message);
		callback(false);
	});	
}

/*Create index*/
exports.createESIndex = function(indexName, mappings, callback){	
	client.indices.create({
		index: indexName,
		body: mappings		
	}).then(function(resp){
		console.log(resp.acknowledged);
		callback(resp.acknowledged);

	},function(error){
		console.log(err);
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
					/*process.exit(2);*/
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
		} 	
	});
}

/*Search*/
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

/*Search doodly given a location and distance*/
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

/*Update partial record into es*/
exports.updateES = function(index, id, query){
	client.update({
		index: index,
		type: 'aType',
		id: id,
		body: query
	}, function (error, response) {
		if(error){
			console.log(error.message);
		}else{
			console.log(response);
		}
	});
}

/*Add package to doodly*/
exports.addPackageToDoodly = function(id, nextPackage){	
	this.searchES('doodly', {
		query: {
			match: {
				doodlyId: id
			}
		}
	}, function(res){		
		if(res.length > 0){
			for(var i=0;i<res.length;i++){
				if(res[i]["_source"]["doodlyId"] == id){
					var packages = res[i]["_source"]["packageSet"];					
					packages.push(nextPackage);
					console.log(packages);
					es.updateES("doodly", id, {
						doc:{
							packageSet: packages
						}
					});
				}
			}
		}
	});
}

/*Insert record into package*/
exports.indexInToPackage = function(packageDetails){
	var record = {
			index: "package",
			type: "aType",
			id: packageDetails.packageId,
			body: packageDetails
	};

	client.index(record, function(err, resp) {
		if (err) {
			console.error(err.message);
		} 	
	});
}

/*Handover package to other doodly*/
exports.handOverPackage = function(pId, dId, currLat, currLon){
	es.updateES("package", pId, {
		doc:{
			doodly: {
				doodlyId: dId,
				location: {
					lat: currLat,
					lon: currLon
				}
			}
		}
	});
}

/*update package location to other doodly*/
exports.handOverPackage = function(pId, dId, currLat, currLon){
	es.updateES("package", pId, {
		doc:{
			doodly: {
				doodlyId: dId,
				location: {
					lat: currLat,
					lon: currLon
				}
			}
		}
	});
}

/*update doodly current location*/
exports.updateDoodlyCurrentLocation = function(id, currLat, currLon){
	/*Update the doodly with the current location*/
	es.updateES("doodly", id, {
		doc:{
			currLocation: {
				lat: currLat,
				lon: currLon
			}
		}
	});
	/*Need to propogate to all the packages*/
	this.searchES('doodly', {
		query: {
			match: {
				doodlyId: id
			}
		}
	}, function(res){		
		if(res.length > 0){
			for(var i=0;i<res.length;i++){
				if(res[i]["_source"]["doodlyId"] == id){
					var packages = res[i]["_source"]["packageSet"];	
					console.log(packages);
					for(var packInd=0;packInd<packages.length;packInd++){
						es.updateES("package", packages[packInd]["packageId"], {
							doc:{
								doodly: {
									location: {
										lat: currLat,
										lon: currLon
									}
								}
							}
						});
					}
					
				}
			}
		}
	});
}

/*this.updateDoodlyCurrentLocation("1", 11, 11);*/

/*this.handOverPackage("package1", "doodly9", 1.0, 1.0);*/


/*this.indexInToPackage({
	packageId: "p3",
	consumerId: "consumer1",
	packageType: "pt1",
	size: "small",
	packageDescription: "test package",
	status: "open",
	doodly: {
		doodlyId: "doodly1",
		location: {
			lat: 0.0,
			lon: 0.0
		}
	},
	pickupLocation: {
		name: "Mr. A",
		mobile: "0000000000",
		address: "Address 1",
		geoLocation: {
			lat: 0.0,
			lon: 0.0
		}
	},
	dropLocation: {
		name: "Mr. B",
		mobile: "0000000000",
		address: "Address 2",
		geoLocation: {
			lat: 0.0,
			lon: 0.0
		}
	}

});*/


/*this.addPackageToDoodly('1',{
	packageId: 'p3',
	packageType: 'pt2',
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
});
 */

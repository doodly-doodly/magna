/*Load elastic module*/
var elasticsearch = require('elasticsearch')
, esconstants = require("./esconstants")
, es = require("./esmodule");

/*Create client connection*/
var client = new elasticsearch.Client({
	host: '169.44.60.229:9200'/*,
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
exports.checkAndCreateIndex = function(indexName, mappings, callback){
	this.esIndexExists(indexName, function(status){
		if(status == true){
			console.log('index '+indexName+' is present.');
		}else{
			console.log('index '+indexName+' is not present, creating it.');
			es.createESIndex(indexName, mappings, function(status){
				if(status == true){
					console.log('Created the index {'+indexName+'}...');
					callback();
				}else{
					console.log('Problem creating the index {'+indexName+'}, exiting...');
					/*process.exit(2);*/
				}
			});
		}
	});
}

/*Create doodly index*/
exports.createDoodlyIndex = function(callback){	
	this.checkAndCreateIndex("doodly", esconstants.doodlymappingLines, callback);
}

/*Create package index*/
exports.createPackageIndex = function(callback){
	this.checkAndCreateIndex("package", esconstants.packagemappingLines, callback);	
}

/*Create consumer index*/
exports.createConsumerIndex = function(callback){
	this.checkAndCreateIndex("consumer", esconstants.consumermappingLines, callback);
}

/*Create consumer index*/
exports.createJointMappingIndex = function(callback){
	this.checkAndCreateIndex("joint-mapping", esconstants.jointmappingLines, callback);
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
			var hitresult = response.hits.hits;
			var expectedresult = [];
			for(var i=0; i<hitresult.length;i++){			
				expectedresult.push(hitresult[i]["_source"]);
			}
			callback(expectedresult);
		}		
	});
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
		}else{
			if(doodlyDetails.doodlyType == 'JOINT'){
				client.indices.refresh({
					index: 'doodly'
				},function(error, resp){					
					es.searchES('doodly',{
						size: 1000,
						query: {
							match:{
								doodlyType : 'JOINT'
							}
						}					
					},function(res){
						if(res.length > 0){

							for(var i=0;i<res.length;i++){								
								var point1 = res[i]["doodlyId"];

								var point2 = doodlyDetails.doodlyId;

								if(point1 != point2){
									var dir1 = point1 + '-' + point2;
									var dir2 = point2 + '-' + point1;

									es.getDistanceBetweenLoc(dir1, point1, point2,
											res[i]["currLocation"]["lat"],
											res[i]["currLocation"]["lon"],
											doodlyDetails.currLocation.lat,
											doodlyDetails.currLocation.lon,
											function(costret, actdir, actpoint1, actpoint2){

										var jointmaprecbody = {
												mapId: actdir,
												from: actpoint1,
												to: actpoint2,
												cost: costret
										}
										var jointmaprec = {
												index: "joint-mapping",
												type: "aType",
												id: jointmaprecbody.mapId,
												body: jointmaprecbody
										}
										client.index(jointmaprec, function(err1, resp1) {
											if(err1){
												console.log(err1);
											}
											console.log(resp1);
										});
									});

									es.getDistanceBetweenLoc(dir2, point1, point2,
											doodlyDetails.currLocation.lat,
											doodlyDetails.currLocation.lon,
											res[i]["currLocation"]["lat"],
											res[i]["currLocation"]["lon"],											
											function(costret, actdir, actpoint1, actpoint2){

										var jointmaprecbodyrev = {
												mapId: actdir,
												from: actpoint2,
												to: actpoint1,
												cost: costret
										}

										var jointmaprecrev = {
												index: "joint-mapping",
												type: "aType",
												id: jointmaprecbodyrev.mapId,
												body: jointmaprecbodyrev
										}

										client.index(jointmaprecrev, function(err1, resp2) {
											if(err1){
												console.log(err1);
											}

										});
									});								

								}

							}
						}
					});
				});

			}
		}	
	});
}

var http = require('http');

exports.getDistanceBetweenLoc = function(dir, point1, point2, startLat, startLon, endLat, endLon, callback){
	var options = {
			host: '169.45.107.101',
			port: 8989,
			path: "/route?" +
			"point="+startLat+"%2C"+startLon +
			"&point="+endLat+"%2C"+endLon +
			"&type=json&key=&locale=en-US&vehicle=car&weighting=fastest&elevation=false"
	};
	http.request(options, function(resp){
		var str = '';
		//another chunk of data has been recieved, so append it to `str`
		resp.on('data', function (chunk) {
			str += chunk;
		});
		//the whole response has been recieved, so we just print it out here
		resp.on('end', function () {
			/*console.log(str);*/
			var result = JSON.parse(str);
			var dist = result.paths[0]["distance"];
			callback(dist, dir, point1, point2);
		});
	}).end();
}

/*this.getDistanceBetweenLoc(12.974617, 77.596918, 12.979447, 77.602701, function(){

});*/

/*Search doodly given a location and distance*/
exports.searchDoodlyInLocation = function(latitude, longtitude, distance, callback){
	this.searchES("doodly", {
		size: 1000,
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

/*Get all doodlys*/
exports.getAllDoodlys = function(callback){
	this.searchES("doodly", {
		size: 1000,
		query: {
			match_all : {}
		}
	}, callback);
}

/*create package*/
exports.createBooking = function(pack, callback){	

	var packid = new Date().getMilliseconds();
	pack.packageId = 'pack_'+packid;

//	sourceLat, sourceLon, destLat, destLon, pack, callback

	var srcLat = pack.pickupLocation.geoLocation.lat;
	var srcLon = pack.pickupLocation.geoLocation.lon;
	var trgLat = pack.dropLocation.geoLocation.lat;
	var trgLon = pack.dropLocation.geoLocation.lon;

	this.getNearestDoodlyJoints(srcLat, srcLon, trgLat, trgLon, pack, function(jointid, packagePath){
		pack.path = packagePath;
		es.indexInToPackage(pack);
		callback(pack.packageId, jointid);
	});


}

/**/
exports.routeToNextJoint = function(){

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
		size: 1000,
		query: {
			match: {
				doodlyId: id
			}
		}
	}, function(res){		
		if(res.length > 0){
			for(var i=0;i<res.length;i++){
				if(res[i]["doodlyId"] == id){
					var packages = res[i]["packageSet"];
					if(packages.length == 0){

					}
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

/*Add package to Joint*/
exports.addPackageToDoodlyJoint = function(id, nextPackage){	
	this.searchES('doodly', {
		size: 1000,
		query: {
			match: {
				doodlyId: id
			}
		}
	}, function(res){		
		if(res.length > 0){
			for(var i=0;i<res.length;i++){
				if(res[i]["doodlyId"] == id){
					var packages = res[i]["packageSet"];
					if(packages.length == 0){

					}
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
/*exports.handOverPackage = function(pId, dId, currLat, currLon){
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
}*/

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
		size:1000,
		query: {
			match: {
				doodlyId: id
			}
		}
	}, function(res){		
		if(res.length > 0){
			for(var i=0;i<res.length;i++){
				if(res[i]["doodlyId"] == id){
					var packages = res[i]["packageSet"];	
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


/*update doodly current location*/
exports.deleteIndex = function(indexName, callback){
	client.indices.delete(
			{
				index:indexName
			},function(error, resp){
				if(error){
					console.log(indexName + ' may not be there!!!');
				}else{
					console.log(resp);
				}	
				callback();
			});
}

/*when doodly reaches a joint*/
exports.doodlyReachedJoint = function(jointId, did, currentLat, currentLon, callback){
	//Drop packages
	this.searchES('doodly', {
		size:1000,
		query: {
			match: {
				doodlyId: did
			}
		}
	}, function(res){		
		var packageInUse = [];
		var droppedPack = [];
		for(var i=0;i<res[0].packageSet.length;i++){
			console.log(res[0].packageSet[i]["path"][1]);
			console.log(res[0].nextStops[1]);
			if(res[0].nextStops[1] && res[0].packageSet[i]["path"][1] == res[0].nextStops[1]){
				packageInUse.push(res[0].packageSet[i]);
				var pathinPck = res[0].packageSet[i].path;
				pathinPck.shift();
				es.updateES("package", res[0].packageSet[i].packageId, {
					doc:{
						path: pathinPck
					}
				});
			}else{
				droppedPack.push(res[0].packageSet[i]);
			}		
		}

		es.searchES('doodly', {
			size:1000,
			query: {
				match: {
					doodlyId: jointId
				}
			}
		}, function(jres){			
			var packageToAddToJoint = [];	
			var pickedUpPack = [];
			for(var a = 0; a<packageInUse.lenght; a++){				
				for(var b=0; b<jres[0].packageSet.length; b++){					
					if(packageInUse[a]["packageId"] != jres[0].packageSet[b]["packageId"]){
						jres[0].packageSet[b]["path"].shift(); 
						packageToAddToJoint.push(jres[0].packageSet[b]);
					}else{
						pickedUpPack.push(jres[0].packageSet[b]);
						var pathinPck1 = jres[0].packageSet[b].path;
						pathinPck1.shift();
						es.updateES("package", jres[0].packageSet[i].packageId, {
							doc:{
								path: pathinPck1
							}
						});
					}					
				}				
			}

			es.updateES("doodly", did, {
				doc:{
					packageSet: packageInUse
				}
			});


			if(packageToAddToJoint.lenght != jres[0].packageSet.length){
				es.updateES("doodly", jointId, {
					doc:{
						packageSet: packageToAddToJoint
					}
				});
			}			

			if(res[0].nextStops[1]){				
				es.searchES('doodly', {
					size:1000,
					query: {
						match: {
							doodlyId: res[0].nextStops[1]
						}
					}
				}, function(j1res){

					var options = {
							host: '169.45.107.101',
							port: 8989,
							path: "/route?" +
							"point="+res[0].currLocation.lat+"%2C"+res[0].currLocation.lon +
							"&point="+j1res[0].currLocation.lat+"%2C"+j1res[0].currLocation.lon +
							"&type=json&key=&locale=en-US&vehicle=car&weighting=fastest&elevation=false"
					};
					http.request(options, function(resp){
						var str = '';
						//another chunk of data has been recieved, so append it to `str`
						resp.on('data', function (chunk) {
							str += chunk;
						});
						//the whole response has been recieved, so we just print it out here
						resp.on('end', function () {
							/*console.log(str);*/
							var result = JSON.parse(str);
							var point = result.paths[0]["points"];						
							console.log(point);						
							callback(pickedUpPack, droppedPack, point);

						});
					}).end();

					res[0].nextStops.shift();
					console.log(res[0].nextStops);
					es.updateES("doodly", did, {
						doc:{
							nextStops: res[0].nextStops
						}
					});

				});
			}



		});


	});


	//
}

/*this.doodlyReachedJoint('RoyalMart', 'Martin' ,12.965568, 77.603399, function(a,b,c){});*/

/*find nearest joint for source and target*/
exports.getNearestDoodlyJoints = function(sourceLat, sourceLon, destLat, destLon, pack, callback){
	var distance = '1km';
	
	es.searchES('joint-mapping',{size:1000,query : {
		match_all:{}
	}					
	},function(costres){
		
		var costMap = {}
		
		for(var ii = 0; ii<costres.length; ii++){
			costMap[costres[ii].mapId] = costres[ii].cost;
		}
		es.searchDoodlyInLocation(sourceLat, sourceLon, distance, function(sourceDoodlyRes){
			var srcDoodlyJoint;
			for(var srcLoc = 0; srcLoc<sourceDoodlyRes.length; srcLoc++){
				if(sourceDoodlyRes[srcLoc]["doodlyType"] == 'JOINT'){
					srcDoodlyJoint =  sourceDoodlyRes[srcLoc];				
					break;
				}
			}		
			if(srcDoodlyJoint){
				es.searchDoodlyInLocation(destLat, destLon, distance, function(destinationDoodlyRes){
					var dstDoodlyJoint;
					for(var dstLoc = 0; dstLoc<destinationDoodlyRes.length; dstLoc++){
						if(destinationDoodlyRes[dstLoc]["doodlyType"] == 'JOINT' && destinationDoodlyRes[dstLoc]["doodlyId"] !=  srcDoodlyJoint["doodlyId"]){
							dstDoodlyJoint =  destinationDoodlyRes[dstLoc];				
							break;
						}
					}
					if(dstDoodlyJoint){					
						if(srcDoodlyJoint["doodlyId"] == dstDoodlyJoint["doodlyId"]){
							callback({
								srcJoint: srcDoodlyJoint["doodlyId"],
								trgJoint: dstDoodlyJoint["doodlyId"]
							});
						}else{

							es.searchES('doodly',{query : {
								match_all:{}
							}					
							},function(allDoodlyRes){

								var nextStopsArr = [];
								if(allDoodlyRes.length > 0){
									for(var i=0;i<allDoodlyRes.length;i++){
										console.log(allDoodlyRes[i]);
										if(allDoodlyRes[i]["nextStops"].length>0){

											var nodedts = allDoodlyRes[i]["nextStops"];
											var nodedtsObj = [];
											var previousjoint='';
											var costC = 0;
											for(var nodedtsind=0; nodedtsind<nodedts.length;nodedtsind++){
												var key = previousjoint+"-"+nodedts[nodedtsind];
												
												previousjoint = nodedts[nodedtsind];
												
												if(costMap.hasOwnProperty(key)){													
													var thiscost = parseFloat(costMap[key]);
												
													costC += thiscost;
												}
												
												nodedtsObj.push({
													name: nodedts[nodedtsind]
												}); 
											}

											var existPathDetails = {
													nodes: nodedtsObj,
													id: allDoodlyRes[i]["doodlyId"],
													cost: ''+costC+''
											}

											nextStopsArr.push(existPathDetails);
										}
									}
								}
								/*Nobody is there*/
								es.searchES('doodly',{query : {
									match:{
										doodlyType : 'JOINT'
									}
								}					
								},function(noderes){
									var allnodes = [];
									if(noderes.length > 0){
										for(var i=0;i<noderes.length;i++){	
											allnodes.push({
												name: noderes[i]["doodlyId"]
											});
										}
									}
									es.searchES('joint-mapping',{
										size:1000,
										query : {
											match_all:{}
										}					
									},function(edgeres){									
										var alledges = [];
										if(edgeres.length > 0){
											for(var i=0;i<edgeres.length;i++){
												alledges.push({
													from:{
														name: edgeres[i]["from"]
													},
													to:{
														name: edgeres[i]["to"]
													},
													cost:edgeres[i]["cost"]
												});
											}
										}
										var post_data = {
												nodes: allnodes,
												edges: alledges,
												from: {
													name: srcDoodlyJoint["doodlyId"]
												},
												to:{
													name: dstDoodlyJoint["doodlyId"]
												},
												existingPaths: nextStopsArr
										};

										console.log(post_data);

										var options = {
												host: '169.45.222.215',
												port: '28080',
												path: "/abscido/rest/getPath",
												method: 'POST',					
												headers: {
													'Content-Type': 'application/json',
												}
										};

										var req = http.request(options, function(resp){
											var str = '';
											//another chunk of data has been recieved, so append it to `str`
											resp.on('data', function (chunk) {
												str += chunk;
											});
											//the whole response has been recieved, so we just print it out here
											resp.on('end', function () {
												var obj = JSON.parse(str);
												/*console.log(obj.path.nodes);*/
												var retNodes = [];
												for(var j=0; j<obj.path.nodes.length; j++){
													retNodes.push(obj.path.nodes[j]["name"]);
													console.log("--->"+obj.path.nodes[j]["name"]);
												}
												es.searchDoodlyInLocation(sourceLat, sourceLon, distance, function(movingDoodlyRes){
													var movDoodly;
													for(var mdLoc = 0; mdLoc<movingDoodlyRes.length; mdLoc++){
														if(movingDoodlyRes[mdLoc]["doodlyType"] == 'MOVING'){
															movDoodly =  movingDoodlyRes[mdLoc];				
															break;
														}
													}
													es.updateES("doodly", movDoodly["doodlyId"], {
														doc:{
															nextStops: retNodes														 
														}
													});
													es.addPackageToDoodlyJoint(movDoodly["doodlyId"], pack);													
													
													var assignedDoodly = movDoodly;
													var startLat = assignedDoodly["currLocation"]["lat"];
													var startLon = assignedDoodly["currLocation"]["lon"];
													var node = assignedDoodly["nextStops"][0];
													console.log('---------------------------------------'+node);
													es.searchES('doodly',{query : {
														match:{
															doodlyId : node
														}
													}					
													},function(jointnoderes){
														var jointlat = jointnoderes[0]['currLocation']['lat'];
														var jointlon = jointnoderes[0]['currLocation']['lon'];
														
														var options = {
																host: '169.45.107.101',
																port: 8989,
																path: "/route?" +
																"point="+startLat+"%2C"+startLon +
																"&point="+jointlat+"%2C"+jointlon +
																"&type=json&key=&locale=en-US&vehicle=car&weighting=fastest&elevation=false"
														};
														http.request(options, function(resp){
															var str = '';
															//another chunk of data has been recieved, so append it to `str`
															resp.on('data', function (chunk) {
																str += chunk;
															});
															//the whole response has been recieved, so we just print it out here
															resp.on('end', function () {
																/*console.log(str);*/
																var result = JSON.parse(str);
																var point = result.paths[0]["points"];						
																console.log(point);						
																callback(retNodes[0], retNodes, movDoodly["doodlyId"], point,  null);

															});
														}).end();
													});
													
												});

											});
										});
										req.write(JSON.stringify(post_data));
										req.end();
									});
								});
							});
						}
					}else{
						callback(null, null, null, null, 'no assignments');
					}
				});
			}else{
				callback(null, null,  null, null, 'no assignments');
			}		
		});
		
	});
	
	
}

/*this.getNearestDoodlyJoints(12.974617, 77.596918, 12.979447, 77.602701, {}, function(resp1, resp2, doodlyid, point, error){
	console.log('Point: '+point);
});*/

/*es.searchES("doodly",{
	size: 1000,
	query: {
		match:{
			doodlyId: 'Martin'
		}
	}
}, function(res){
	console.log(res);
});*/

/*es.searchES("joint-mapping",{
					size: 1000,
					query: {
						match:{
							from: sourceDoodlyRes["doodlyId"]
						}
					}
				}, function(directJoints){
					for(){

					}
				})*/

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


var es = require("./esmodule");

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

var getDoodlyJoints = function(id, type, name, latitude, longitude){
	return	{
		doodlyId: id,
		doodlyType: type,
		name: name,
		mobile: '0000000000',
		address: 'address of '+id,
		sex: 'm',
		marital_status: 'single',
		currLocation: {
			lat: latitude,
			lon: longitude
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
		            	packageId: 'p1'+id,
		            	packageType: 'pt',
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
		            	packageId: 'p2'+id,
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
		            }
		            ]
	};
}

var doodlyData = function(){
	es.indexInToDoodly(getDoodlyJoints('1', 'JOINT', 'doodly1', 12.967439, 77.605845));
	es.indexInToDoodly(getDoodlyJoints('2', 'JOINT', 'doodly2', 12.969875, 77.603227));
	es.indexInToDoodly(getDoodlyJoints('3', 'JOINT', 'doodly3', 12.965568, 77.603399));
	es.indexInToDoodly(getDoodlyJoints('4', 'JOINT', 'doodly4', 12.965170, 77.610276));
}

setTimeout(function(){
	doodlyData();
}, 3000);



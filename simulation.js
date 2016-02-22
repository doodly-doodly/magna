
var es = require("./esmodule");

console.log('Checking connection to elastic...');
es.esConnectionOk(function(status){
	if(status == true){
		console.log('elastic is good.');
		console.log('Checking for the elastic indices...');
		/*If index already exists, delete and recreate the same and insert data.*/
		es.deleteIndex('doodly', function(){
			es.createDoodlyIndex(function(){
				doodlyData();
			});
		});
		
		es.deleteIndex('package', function(){
			es.createPackageIndex(function(){
				
			});
		});
		
		es.deleteIndex('consumer', function(){
			es.createConsumerIndex(function(){
				
			});
		});
		
		es.deleteIndex('joint-mapping', function(){
			es.createJointMappingIndex(function(){
				
			});
		});
	}else{
		console.log('elastic health is bad, exiting.');
		process.exit(1);
	}		
});



var getDoodlyJoints = function(id, type, nam, mob, addr, s, ms, currLat, curLon){
	return	{
		doodlyId: id,
		doodlyType: type,
		name: nam,
		mobile: mob,
		address: addr,
		sex: s,
		marital_status: ms,
		nextStops:[],
		currLocation: {
			lat: currLat,
			lon: curLon
		},
		packageSet:[]
	};
}

var doodlyData = function(){
	
	es.indexInToDoodly(getDoodlyJoints('Dominos', 'JOINT', 'Dominos', '0000000000', 'addrJ1', 'm', 'single', 12.972609,77.600083));
	es.indexInToDoodly(getDoodlyJoints('MedPlus', 'JOINT', 'MedPlus', '0000000000', 'addrJ1', 'm', 'single', 12.966127,77.604836));
	es.indexInToDoodly(getDoodlyJoints('Fasoos', 'JOINT', 'Fasoos', '0000000000', 'addrJ2', 'm', 'single', 12.96871,77.607154));
	es.indexInToDoodly(getDoodlyJoints('RoyalMart', 'JOINT', 'Royal Mart', '0000000000', 'addrJ3', 'm', 'single', 12.971867,77.606317));
	es.indexInToDoodly(getDoodlyJoints('McDonald', 'JOINT', 'McDonald', '0000000000', 'addrJ4', 'm', 'single', 12.973488,77.603506));
	es.indexInToDoodly(getDoodlyJoints('RelianceElectronics', 'JOINT', 'Reliance Electronics', '0000000000', 'addrJ5', 'm', 'single', 12.967047,77.600126));
	es.indexInToDoodly(getDoodlyJoints('Woodland', 'JOINT', 'Woodland', '0000000000', 'addrJ6', 'm', 'single', 12.970205,77.611799));
	es.indexInToDoodly(getDoodlyJoints('LocalStore', 'JOINT', 'Local Store', '0000000000', 'addrJ4', 'm', 'single', 12.975641,77.607787));
	es.indexInToDoodly(getDoodlyJoints('KamatHotel', 'JOINT', 'Kamat Hotel', '0000000000', 'addrJ5', 'm', 'single', 12.971794,77.594891));
	es.indexInToDoodly(getDoodlyJoints('MetroStation', 'JOINT', 'Metro Station', '0000000000', 'addrJ6', 'm', 'single', 12.966838,77.596049));

	es.indexInToDoodly(getDoodlyJoints('Jesse', 'MOVING', 'Jesse', '0000000000', 'addrM1', 'm', 'single', 12.9685,77.600802));// >>> Should be moving
	es.indexInToDoodly(getDoodlyJoints('Harry', 'MOVING', 'Harry', '0000000000', 'addrM2', 'm', 'single', 12.966796,77.604772));//>>> Should be moving
	es.indexInToDoodly(getDoodlyJoints('Jacob', 'MOVING', 'Jacob', '0000000000', 'addrM3', 'm', 'single', 12.971742,77.605652));//>>> Stagnant
	es.indexInToDoodly(getDoodlyJoints('Martin', 'MOVING', 'Martin', '0000000000', 'addrM4', 'm', 'single', 12.972317,77.600094));//>>> Stagnant
	es.indexInToDoodly(getDoodlyJoints('Rahul', 'MOVING', 'Jacob', '0000000000', 'addrM3', 'm', 'single', 12.97125,77.604997));//>>> Stagnant
	es.indexInToDoodly(getDoodlyJoints('Parikh', 'MOVING', 'Martin', '0000000000', 'addrM4', 'f', 'single', 12.97263,77.604053));//>>> Stagnant
}

doodlyData();

/*setTimeout(function(){
	doodlyData();
}, 4000);*/



/*var getDoodlyJoints = function(id, type, name, mob, addr, s, ms, currLat, curLon){
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
}*/




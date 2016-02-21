/*{
    nodes:[
        {name: "A"},
        {name: "B"},
        {name: "C"},
        {name: "D"}
    ],
    "edges":[
        {"from": {"name":"A"}, "to": {"name":"B"}, "cost": 10},
        {"from": {"name":"A"}, "to": {"name":"C"}, "cost": 10},
        {"from": {"name":"B"}, "to": {"name":"C"}, "cost": 10},
        {"from": {"name":"C"}, "to": {"name":"D"}, "cost": 10}
    ],
    "from": {"name":"A"},
    "to": {"name":"D"}
} */


var es = require("./esmodule");
var http = require('http');

var test1 = function(){

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
					name: noderes[i]["_source"]["doodlyId"]
				});
			}
		}


		es.searchES('joint-mapping',{size:1000,
			query : {
				match_all:{}

			}					
		},function(edgeres){
			var alledges = [];
			if(edgeres.length > 0){
				for(var i=0;i<edgeres.length;i++){
					alledges.push({
						from:{
							name: edgeres[i]["_source"]["from"]
						},
						to:{
							name: edgeres[i]["_source"]["to"]
						},
						cost:edgeres[i]["_source"]["cost"]

					});
				}
			}
			var post_data = {
					nodes: allnodes,
					edges: alledges,
					from: {
						name:'McDonald'
					},
					to:{
						name:'IyengarBakery'
					}
			};

			var options = {
					host: '10.129.27.183',
					port: '28080',
					path: "/abscido/rest/getAllPaths",
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
					console.log(str);					
				});
			});
			req.write(JSON.stringify(post_data));
			req.end();
		});

	});

}

//test1();


var test2 = function(){
	es.getAllDoodlys(function(res){
		var result = [];		
		console.log(res);
	});
}

test2();


var test3 = function(){
	es.searchDoodlyInLocation(12.967439, 77.605845, '100m',function(res){
		console.log(res.length);
	});
}

//test3();


exports.doodlymappingLines = {
		mappings: {
			aType: {
				properties: {
					doodlyId: {"type": "string", "index": "not_analyzed"},
					doodlyType: {"type": "string", "index": "not_analyzed"},
					name: {"type": "string", "index": "not_analyzed"},
					mobile: {"type": "string", "index": "not_analyzed"},
					address: {"type": "string", "index": "not_analyzed"},
					sex: {"type": "string", "index": "not_analyzed"},
					marital_status: {"type": "string", "index": "not_analyzed"},
					currLocation:{"type": "geo_point"},
					nextStop:{
						properties:{
							address: {"type": "string", "index": "not_analyzed"},
							geoLocation: {"type": "geo_point"}
						}
					},
					packageSet:{
						properties:{
							packageId: {"type": "string", "index": "not_analyzed"},
							packageType: {"type": "string", "index": "not_analyzed"},
							size: {"type": "string", "index": "not_analyzed"},
							status: {"type": "string", "index": "not_analyzed"},
							pickupLocation:{
								properties:{
									name: {"type": "string", "index": "not_analyzed"},
									mobile: {"type": "string", "index": "not_analyzed"},
									address: {"type": "string", "index": "not_analyzed"},
									geoLocation: {"type": "geo_point"}
								}
							},
							dropLocation:{
								properties:{
									name: {"type": "string", "index": "not_analyzed"},
									mobile: {"type": "string", "index": "not_analyzed"},
									address: {"type": "string", "index": "not_analyzed"},
									geoLocation: {"type": "geo_point"}
								}
							}
						}
					}
				}
			}
		}
};


exports.packagemappingLines = {
		mappings: {
			aType: {
				properties: {
					packageId: {"type": "string", "index": "not_analyzed"},
					consumerId: {"type": "string", "index": "not_analyzed"},
					packageType: {"type": "string", "index": "not_analyzed"},
					size: {"type": "string", "index": "not_analyzed"},
					packageDescription: {"type": "string", "index": "not_analyzed"},
					status: {"type": "string", "index": "not_analyzed"},
					doodly:{
						properties:{
							doodlyId: {"type": "string", "index": "not_analyzed"},
							location: {"type": "geo_point"}
						}
					},
					pickupLocation:{
						properties:{
							name: {"type": "string", "index": "not_analyzed"},
							mobile: {"type": "string", "index": "not_analyzed"},
							address: {"type": "string", "index": "not_analyzed"},
							geoLocation: {"type": "geo_point"}
						}
					},
					dropLocation:{
						properties:{
							name: {"type": "string", "index": "not_analyzed"},
							mobile: {"type": "string", "index": "not_analyzed"},
							address: {"type": "string", "index": "not_analyzed"},
							geoLocation: {"type": "geo_point"}
						}
					}
				}
			}
		}
};


exports.consumermappingLines = {
		mappings: {
			aType: {
				properties: {
					consumerId: {"type": "string", "index": "not_analyzed"},
					name: {"type": "string", "index": "not_analyzed"},
					mobile: {"type": "string", "index": "not_analyzed"},
					address: {"type": "string", "index": "not_analyzed"},
					sex: {"type": "string", "index": "not_analyzed"},
					marital_status: {"type": "string", "index": "not_analyzed"},
					currentPackages: {"type": "string"},
					DeliveredPackages: {"type": "string"}
				}
			}
		}
};


exports.jointmappingLines = {
		mappings: {
			aType: {
				properties: {
					mapId: {"type": "string", "index": "not_analyzed"},
					from: {"type": "string", "index": "not_analyzed"},
					to: {"type": "string", "index": "not_analyzed"},
					cost: {"type": "string", "index": "not_analyzed"}
				}
			}
		}
};

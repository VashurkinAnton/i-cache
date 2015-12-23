var caches = {};
function cache(opts){
	var linkSetters = {};
	var transformers = {};
	var valueSetters ={};
	var storage = {};
	var expires = opts.expires || 1000 * 60 * 60 * 5; // default cache expires 5 hours
	var c = {
		get: function(group, key, cl, data, recall){
			var keyCache = storage[group] && storage[group][key];
			if(keyCache && ((new Date()).getTime() - keyCache['cTime']) < expires){
				keyCache['views'] += 1;
				cl(keyCache['value']);
			}else if(valueSetters[group] && !recall){
				var vSetter = valueSetters[group]
				if(vSetter['async']){
					vSetter['handler'](key, function(value){
						c.set(group, key, value);
						c.get(group, key, cl, data, true);
					}, data);
				}else{
					c.set(group, key, vSetter['handler'](key, data));
					c.get(group, key, cl, data, true);
				}
			}else{
				cl(null);
			}
		},
		set: function(group, key, value){
			if(!storage[group]){
				storage[group] = {};
			}
			storage[group][key] = {
				value: value,
				cTime: (new Date()).getTime(),
				views: 0	
			};
			if(linkSetters[group]){
				for(var i = 0, len = linkSetters[group].length; i < len; i++){
					var linkSetter = linkSetters[group][i];
					storage[group][linkSetter(storage[group][key]['value'])] = storage[group][key];
				}
			}
			if(transformers[group]){
				for(var i = 0, len = transformers[group].length; i < len; i++){
					storage[group][key]['value'] = transformers[group][i](storage[group][key]['value']);
				}
			}
		},
		linkSetter: function(groupName, handler){
			if(!linkSetters[groupName]){
				linkSetters[groupName] = [];
			}
			linkSetters[groupName].push(handler);
		},
		valueSetter: function(groupName, handler, async){
			valueSetters[groupName] = {
				handler: handler,
				async: async
			};			
		},
		valueTransformer: function(groupName, handler){
			if(!transformers[groupName]){
				transformers[groupName] = [];
			}
			transformers[groupName].push(handler);
		},
		getCache: function(){
			return storage;
		}
	};
	return c;
}

module.exports = function(name, opts){
	if(!opts){opts = {}};
	var cacheHandler = caches[name];
	if(cacheHandler){
		return cacheHandler;
	}else{
		caches[name] = cache(opts); 
		return caches[name];
	}
};
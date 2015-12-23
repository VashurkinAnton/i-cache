## Example:

```
var cache = require('./cache.js')('10027', {expires: 1000 * 2});
var obj = { id: '123',fields: {falust: {value: 'qq:qwe'},nid: 2},otherData: []};
cache.linkSetter('content', function(data){
	return data['fields']['nid']
});
cache.linkSetter('content', function(data){
	return data['fields']['falust']['value']
});
cache.linkSetter('content', function(data){
	return data['id']
});
cache.valueTransformer('content', function(obj){ 	
	obj['falust'] = obj['fields']['falust']['value'];	
	obj['nid'] = obj['fields']['nid'];	
	delete obj['fields'];	
	return obj;
});
cache.valueSetter('content', function(key){
	console.log('vSetter'); 
	return obj;
}, false);
cache.get('content', 1, function(value){ console.log(value) });
```
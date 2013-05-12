//
// demo.js
//
// This file is just here to show how to use the converter. Just run
// it with:
//
// $ node demo.js
//
'use strict';

var fs = require('fs');
var converter = require('./lib/converter');


fs.readFile('test_files/test.xml', {encoding : 'utf-8'}, function(err, file) {

	// console.log('===========================================');
	// console.log(' Original XML');
	// console.log('===========================================');
	// console.log(file);
	

	//converter.toJson(file, {keepXML : false, addHelpers: false, keepRootElem: false}, function(json, err) {
	converter.toJson(file, function(json, err) {
		if ( err ) {
			console.log('**************************');
			console.log(' Error');
			console.log('**************************');
			console.error(err.message);
			return;
		}

		console.log('===========================================');
		console.log(' JSON');
		console.log('===========================================');
		console.log(JSON.stringify(json, null, 4));

		console.log( json.note[0].heading.value );
	});

});


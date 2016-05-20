# Description #
XML to JSON converter. This is a quick and very dirty converter for turning 
XML documents into JSON objects. It's by no means complete. This converter was 
made to work with a handful of document on some of my various projects. I tried 
to keep it as generic as possible with respect to schema, and it has been good 
enough to get me through some basic XML files. I may add features as they come 
up in the future. BTW, there may be better (or more efficient) ways to parse the 
XML files, but this was done quickly to fill a specific need. 


## Dependencies ##
The following node dependencies will be needed for this to work. These are listed 
in the `package.json` file, so they can be retrieved using `$ npm install`.

* node-xml - https://github.com/robrighter/node-xml
* lodash (underscore may be acceptable too) - https://github.com/bestiejs/lodash


## Use ##
This isn't a full node module so just add the dependencies to your project, and 
put converter.js in your project path. Assuming it is in the lib folder, just 
include it like so:

	var converter = require('./lib/converter');

Then it can be used on a file like so:


	fs.readFile('test_files/test.xml', {encoding : 'utf-8'}, function(err, file) {

		converter.toJson(file, function(json, err) {
			if ( err ) {
				console.error(err.message);
				return;
			}

			console.log('JSON: ');
			console.log(JSON.stringify(json, null, 4));
		});

	});

Or:

	fs.readFile('test_files/test.xml', {encoding : 'utf-8'}, function(err, file) {

		converter.toJson(file, {keepXML : true, addHelpers: true}, function(json, err) {
			if ( err ) {
				console.error(err.message);
				return;
			}

			console.log('JSON: ');
			console.log(JSON.stringify(json, null, 4));
		});

	});


After the import, there's really only one method. The signature is 

	converter.toJson(xmlFile, [options], callback);

* xmlFile - the xml file to convert as a string
* options - converter options object
	* keepXML - (boolean) flag to attach the original XML string on the result JSON
	* addHelpers - (boolean) flag to attach some helper functions on the result JSON
* callback(json, err) - callback that gets the converted JSON object
	* json - the converted JSON object (or null if error)
	* err - error object if something went wrong

If addHelpers is set to true, some helper methods are added. These helpers are things like:
 
 * has - check for child element (goes on each object of JSON tree)
 * hasAttr - check for attribute (goes on each object of JSON tree)
 * search - goes on the root JSON node and recursively searches for child objects
 * first - get the first child node (goes on each object of JSON tree)
 * firstKey - get the first child's key (goes on each object of JSON tree)
 * keys - get all of the child keys of a node (goes on each object of JSON tree)


This converter doesn't really support namespaces. It just lumps elements that it encounters
together. Be careful if you have multiple namespaces with identical element names.

Below is an example of the converter's use. Attributes are added to a child object with the key '@'. Text nodes of an element are added to a 'value' property.  I know that may seem weird, but I like addressing my document using something like value so that I know I'm dealing with text and not another node:

	console.log( notes.note[0].heading.value )


Example XML doc:

	<notes>
		<note id="note01">
			<to>Bob</to>
			<from>Alice</from>
			<heading>Reminder</heading>
			<body>Don't forget meeting this Friday!</body>
		</note>
		<note id="note02">
			<to>Jane</to>
			<from>Alice</from>
			<heading>Reports</heading>
			<body>TPS repots due Monday</body>
		</note>
	</notes>


Example Result:

	{
		"notes": {
			"note": [
				{
					"@": { "id": "note01" },
					"to"     : {"value": "Bob"},
					"from"   : {"value": "Alice"},
					"heading": {"value": "Reminder"},
	 				"body"   : {"value": "Don't forget meeting this Friday!"}
				},
				{
					"@": { "id": "note02" },
					"to"     : {"value": "Jane"},
					"from"   : {"value": "Alice"},
					"heading": {"value": "Reports"},
					"body"   : {"value": "TPS repots due Monday"}
				}
			]
		}
	}


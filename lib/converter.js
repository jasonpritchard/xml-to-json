// The MIT License (MIT)
//
// Copyright (c) 2013 Jason Pritchard
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// ===================================================================================
//
// Description:
// XML to JSON converter. This is a quick and very dirty converter for turning 
// XML documents into JSON objects. It's by no means complete. It ignores 
// namespaces, so if there are more than one namespaces in the document, it 
// will lump them all together most likely. This hasen't been extensively tested
// and was made to work with a few specific documents. 
//
'use strict';

var xml = require('node-xml');
var _   = require('lodash')._;


/**
 * Parse the XML document and call the callback when done converting. The callback 
 * is called with either the newly converted object or an error. This is not a full
 * parser, and has no support for namespaces. The resulting JSON object uses the 
 * '@' symbol for attributes on elements, and a 'value' property for the text data 
 * of an element. 
 *
 * Example XML doc:
 * <notes>
 * 	<note id="note01">
 * 		<to>Bob</to>
 * 		<from>Alice</from>
 * 		<heading>Reminder</heading>
 * 		<body>Don't forget meeting this Friday!</body>
 * 	</note>
 * 	<note id="note02">
 * 		<to>Jane</to>
 * 		<from>Alice</from>
 * 		<heading>Reports</heading>
 * 		<body>TPS repots due Monday</body>
 * 	</note>
 * </notes>
 *
 * Result:
 * {
 * 	"notes": {
 * 		"note": [
 * 			{
 * 				"@": { "id": "note01" },
 *				"to"     : {"value": "Bob"},
 *				"from"   : {"value": "Alice"},
 *				"heading": {"value": "Reminder"},
 *				"body"   : {"value": "Don't forget meeting this Friday!"}
 *			},
 *			{
 *				"@": { "id": "note02" },
 *				"to"     : {"value": "Jane"},
 *				"from"   : {"value": "Alice"},
 *				"heading": {"value": "Reports"},
 *				"body"   : {"value": "TPS repots due Monday"}
 *			}
 *		]
 *	}
 * }
 * 
 * @param  {string}   xml document to convert into to JSON.
 * @param  {object}   options (optional) Converter options.
 *   converter options:
 *     - addHelpers: add some helper functions to the resulting JSON
 *     - keepXML: put the raw XML string on the result object
 *     
 * @param  {Function} cb (optional) callback for when done converting the XML.
 * @return {object}  Converter object used to parse the XML doc.
 */
exports.toJson = function(xml, options, cb) {
	if ( options && typeof options === 'function') {
		cb = options;
		options = {};
	}
	return new Converter(options).toJson(xml, cb);
};


/**
 * Converter object used to transform XML documents into JSON objects.
 * 
 * @param {object} options options for the converter
 */
function Converter(options) {
	this.options = {
		addHelpers : false,
		keepXML    : false
	};
	_.extend(this.options, options);

	// callback - default noop
	this.callback = function(){};
	// base XML doc
	this.xml = null;
	// cancel flag
	this.cancelParse = false;
	// sax parser
	this._initParser();
};
var con = Converter.prototype;


/**
 * toJson parses the XML file and calls the supplied callback 
 * with either the converted JSON object or an error.
 * 
 * @param  {string}   xml  XML doc to convert
 * @param  {Function} cb   callback when done processing XML doc. cb gets 
 *     two arguments, JSON object or error object. cb(obect, error).
 * @return {object}  this converter object.
 */
con.toJson = function(xml, cb) {
	this.xml = xml; // keep the xml
	this.callback = cb || function(){};
	this._parser.parseString(xml);
	return this;
};


//========================================================
// Initialize sax parser
//========================================================
con._initParser = function() {
	var self = this;
	this._parser = new xml.SaxParser(function(cb) {

		var result = {};
		var currentNode = result;
		var currentNodeName = '';
		var nodeStack = [];
		var lastNode = result;
		var lastNodeName = '';
		var parentKeys = [];

		// start element handler
		cb.onStartElementNS(function(nodeName, attrs, prefix, uri, namespaces) {
			if ( self.cancelParse ) { return; }

			//
			// TODO: I'm sure there's a better way to do this. 
			//

			// add new node
			if ( nodeName !== lastNodeName ) {

				if ( currentNodeName !== lastNodeName ) {
					parentKeys.push(currentNodeName);
				}

				currentNode[nodeName] = {};
				lastNode = currentNode;
				nodeStack.push(currentNode);
				currentNode = currentNode[nodeName];

				// add attributes
				if ( attrs && attrs.length > 0 ) {
					var cn = lastNode;
					//if ( currentNodeName != lastNodeName ) {
					if ( parentKeys[parentKeys.length-1] != lastNodeName ) {
						//cn = nodeStack[nodeStack.length-1][nodeName];
						cn = lastNode[nodeName];
					}

					attrs.forEach(function(attr) {
						var ns = attr[0].split(':');
						var name = ns[ns.length-1];
						if ( !cn.hasOwnProperty('@') ) {cn['@'] = {};}
						cn['@'][name] = attr[1];
					});
				}

			}
			// array situation
			else if ( nodeName === lastNodeName ) {

				if ( currentNodeName != lastNodeName ) {
					currentNode = nodeStack[nodeStack.length-1];
				}

				// we have a duplicate element name, so create an 
				// array and put the existing node in that array
				if ( !_.isArray(currentNode[nodeName]) ) {
					var old = currentNode[nodeName];
					currentNode[nodeName] = [];
					currentNode[nodeName].push(old);
				}

				var tmp = {};

				// add attributes
				if ( attrs && attrs.length > 0 ) {
					attrs.forEach(function(attr) {
						var ns = attr[0].split(':');
						var name = ns[ns.length-1];
						if ( !tmp.hasOwnProperty('@') ) {tmp['@'] = {};}
						tmp['@'][name] = attr[1];
					});
				}

				currentNode[nodeName].push(tmp)

				if ( currentNodeName != lastNodeName ) {
					currentNode = tmp;
				}
			}

			currentNodeName = nodeName;
		});


		// end element handler
		cb.onEndElementNS(function(elem, prefix, uri) {
			if ( self.cancelParse ) { return; }
			
			if ( elem === currentNodeName && currentNodeName != lastNodeName ) {
				currentNode = nodeStack.pop();
			}

			if ( elem === parentKeys[parentKeys.length-1] ) {
				parentKeys.pop();
			}

			lastNodeName = elem;
		});


		// element data handler
		cb.onCharacters(function(t) {
			var t = t.replace(/^\s+|\n+|\s+$/g,'');
			if ( self.cancelParse || t === '') { return; }

			if ( _.isArray(lastNode[currentNodeName]) ) {
				lastNode[currentNodeName][lastNode[currentNodeName].length-1]['value'] = t;
			}
			else {
				currentNode['value'] = t;
			}
		});


		// end document handler
		cb.onEndDocument(function() {
			if ( self.cancelParse ) { return; }

			// parser stream is done, and ready to have more stuff written to it.
			// here we can add some extra helper methods onto the resulting JSON for 
			// working with the XML data. 
			if ( !self._isEmpty(result) && self.options.addHelpers ) {

				// attach methods to all nodes
				(function(stack) {

					var attach = function(obj, name, func) {
						Object.keys(obj).forEach(function(key) {
							if ( key !== '@' && typeof obj[key] === 'object' && !Array.isArray(obj[key]) ) {
								obj[key][name] = func;
								attach.call(obj, obj[key], name, func);
							}
						});
					};

					attach(stack, 'hasAttr', function(attr) {return this.hasOwnProperty('@') && this['@'].hasOwnProperty(attr);});
					attach(stack, 'has', function(elem) {return this.hasOwnProperty(elem);});
					attach(stack, 'keys', function() {
						return _.without(_.keys(this), 'has', 'hasAttr', 'search', 'first', 'firstKey', 'keys');
					});
					attach(stack, 'firstKey', function() { return this.keys()[0]; });
					attach(stack, 'first', function() { return this[this.firstKey()]; });

				})(result);
				

				// attach a search function for finding nodes within the full object
				if ( !result.hasOwnProperty('_searchCache') ) {
					result['_searchCache'] = {};
				}
				result['search'] = function(needle, stack) {
					if ( result['_searchCache'].hasOwnProperty(needle) ) {
						return result['_searchCache'][needle];
					}

					var haystack = stack || this;
					var self = this;
					var found = false;

					Object.keys(haystack).forEach(function(key) {
						if ( key === needle ) {
							found = result['_searchCache'][needle] = haystack[needle]; 
							return haystack[needle];
						}

						if (typeof haystack[key] === 'object' && !found ) {
							// check the result to bubble out
							var tmp = self.search.call(self, needle, haystack[key]);
							if ( tmp ) {
								found = tmp;
							}
						}
					});

					return found;
				};
			}

			// attach original XML 
			if ( self.options.keepXML ) {
				result['xml'] = self.xml;
			}

			// pass result to callback
			self._nextTick(function() {
				self.callback(result);
			});
		});


		// warnings and errors
		cb.onWarning(function(msg) { /* TODO: pass warning */ console.warn(msg); });
		cb.onError(function(msg) { 
			self._nextTick(function() {
				self.callback(null, msg); 
				self.cancelParse = true; 
			});
		});

	});
};



//========================================================
// Wrapper for callbacks. In node, use process.nextTick. 
// In the browser, use setTimeout.
//========================================================
con._nextTick = function(fn) {
	if ( typeof process == 'object' && process.hasOwnProperty('nextTick') ) {
		process.nextTick(fn);
	}
	else {
		setTimeout(fn, 0);
	}
};


//========================================================
// Checks if the given object is empty (has no own props)
//========================================================
con._isEmpty = function(obj) {
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop))
			return false;
	}
	return true;
};



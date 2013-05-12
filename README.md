Dependencies
------------
* node-xml - https://github.com/robrighter/node-xml
* lodash - https://github.com/bestiejs/lodash


Example XML doc:
<pre>
&lt;notes&gt;
	&lt;note id="note01"&gt;
		&lt;to&gt;Bob&lt;/to&gt;
		&lt;from&gt;Alice&lt;/from&gt;
		&lt;heading&gt;Reminder&lt;/heading&gt;
		&lt;body&gt;Don't forget meeting this Friday!&lt;/body&gt;
	&lt;/note&gt;
	&lt;note id="note02"&gt;
		&lt;to&gt;Jane&lt;/to&gt;
		&lt;from&gt;Alice&lt;/from&gt;
		&lt;heading&gt;Reports&lt;/heading&gt;
		&lt;body&gt;TPS repots due Monday&lt;/body&gt;
	&lt;/note&gt;
&lt;/notes&gt;
</pre>

Example Result:
<pre>
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
</pre>
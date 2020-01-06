// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.TapsellPlus = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{

	/////////////////////////////////////
	// Tapsell Plus
	function TapsellPlus(appId)
	{
		this.onAdAvailable = null;
		this.onNoAdAvailable = null;
		this.onError = null;
		this.onNoNetwork = null;
		this.onExpiring = null;
		this.onOpened = null;
		this.onClosed = null;
		this.onAdShowFinished = null;
		this.onAdShowCanceled = null;
		
		this.zone_to_adId_map = {};

		this.appId = appId;
		
		var self = this;
		window['tapsellPlus']['initialize'](this.appId);
	};
	
	TapsellPlus.prototype.requestRewarded = function(zoneId)
	{
		console.log('TapsellPlus requestRewarded' + zoneId )
		var self = this;
		window['tapsellPlus']['requestRewarded'](zoneId, function(result){
			if(result['action']=='response')
			{
				console.log('TapsellPlus response');
				var zoneId = result['zoneId']; 
				self.response(zoneId);
			}
			else if( result['action']=='error' )
			{
				console.log('TapsellPlus error');
				var zoneId = result['zoneId'];
				var message = result['message']; // description of error
				self.error(zoneId, message);
			}
		});
	}

	TapsellPlus.prototype.showAd = function(zoneId)
	{
		console.log('TapsellPlus showAd' + zoneId)
	
		window['tapsellPlus']['showAd'](zoneId);
	}
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.TapsellPlus.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
		if(this.runtime.isBlackberry10 || this.runtime.isWindows8App || this.runtime.isWindowsPhone8 || this.runtime.isWindowsPhone81){
		var scripts=document.getElementsByTagName("script");
		var scriptExist=false;
		for(var i=0;i<scripts.length;i++){
			if(scripts[i].src.indexOf("cordova.js")!=-1||scripts[i].src.indexOf("phonegap.js")!=-1){
				scriptExist=true;
				break;
			}
		}
		if(!scriptExist){
			var newScriptTag=document.createElement("script");
			newScriptTag.setAttribute("type","text/javascript");
			newScriptTag.setAttribute("src", "cordova.js");
			document.getElementsByTagName("head")[0].appendChild(newScriptTag);
		}
	}
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
		
		this.appId = this.properties[0];

		this.tapsellplus_instance = null;
		
		this.tapsellplus_instance = new TapsellPlus(this.appId);
		
		var self = this;
		
		if (this.tapsellplus_instance)
		{
			this.response = null;
			this.error = null;
		
			this.tapsellplus_instance.response = function (zone)
			{
				self.runtime.trigger(cr.plugins_.TapsellPlus.prototype.cnds.response, self);
			};
			this.tapsell_instance.error = function ()
			{
				self.runtime.trigger(cr.plugins_.TapsellPlus.prototype.cnds.error, self);
			};			
		}	
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.reponse = function ()
	{
		return true;
	};

	Cnds.prototype.error = function ()
	{
		return true;
	};
		
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.requestRewarded = function (zoneId)
	{
		this.tapsellplus_instance.requestRewarded(zoneId);
	};

	Acts.prototype.showAd = function(zoneId)
	{
		this.tapsellplus_instance.showAd(zoneId);
	}
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	pluginProto.exps = new Exps();

}());
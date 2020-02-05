// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");


/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.TapsellPlus = function (runtime) {
	this.runtime = runtime;
};

(function () {

	/////////////////////////////////////
	// Tapsell Plus
	function TapsellPlus(appId) {
		this.response = null;
		this.error = null;
		this.appId = appId;

		tapsellPlus.initialize(appId)
	};

	TapsellPlus.prototype.requestRewarded = function (zoneId) {
		tapsellPlus.requestRewarded(zoneId)
	}

	TapsellPlus.prototype.requestInterstitial = function (zoneId) {
		tapsellPlus.requestInterstitial(zoneId)
	}

	TapsellPlus.prototype.showAd = function (zoneId) {
		tapsellPlus.showAd(zoneId)
	}

	TapsellPlus.prototype.requestResponse = function (zoneId) {
		this.requestResponse(zoneId)
	}

	TapsellPlus.prototype.requestError = function (zoneId, errorMessage) {
		this.requestError(zoneId, errorMessage)
	}

	window.requestResponse = function (zoneId) {
		window.myTapsellPlusInstance.requestResponse(zoneId);
	}

	window.requestError = function (zoneId, errorMessage) {
		window.myTapsellPlusInstance.requestError(zoneId, errorMessage);
	}


	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.TapsellPlus.prototype;


	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;


	// called on startup for each object type
	typeProto.onCreate = function () {
		if (this.runtime.isBlackberry10 || this.runtime.isWindows8App || this.runtime.isWindowsPhone8 || this.runtime.isWindowsPhone81) {
			var scripts = document.getElementsByTagName("script");
			var scriptExist = false;
			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i].src.indexOf("cordova.js") != -1 || scripts[i].src.indexOf("phonegap.js") != -1) {
					scriptExist = true;
					break;
				}
			}
			if (!scriptExist) {
				var newScriptTag = document.createElement("script");
				newScriptTag.setAttribute("type", "text/javascript");
				newScriptTag.setAttribute("src", "cordova.js");
				document.getElementsByTagName("head")[0].appendChild(newScriptTag);
			}
		}
	};


	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};

	var instanceProto = pluginProto.Instance.prototype;


	// called whenever an instance is created
	instanceProto.onCreate = function () {
		this.appId = this.properties[0];
		this.tapsellplus_instance = null;
		this.tapsellplus_instance = new TapsellPlus(this.appId);
		window.myTapsellPlusInstance = this.tapsellplus_instance;

		var self = this;

		if (this.tapsellplus_instance) {
			this.requestResponse = null;
			this.requestError = null;

			this.tapsellplus_instance.requestResponse = function (zone) {
				self.runtime.trigger(cr.plugins_.TapsellPlus.prototype.cnds.requestResponse, self);
			};
			this.tapsellplus_instance.requestError = function () {
				self.runtime.trigger(cr.plugins_.TapsellPlus.prototype.cnds.requestError, self);
			};
		}
	};


	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function (ctx) {
	};


	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw) {
	};


	//////////////////////////////////////
	// Conditions
	function Cnds() { };

	Cnds.prototype.requestResponse = function () {
		return true;
	};

	Cnds.prototype.requestError = function () {
		return true;
	};

	pluginProto.cnds = new Cnds();


	//////////////////////////////////////
	// Actions 
	function Acts() { };

	Acts.prototype.requestRewarded = function (zoneId) {
		this.tapsellplus_instance.requestRewarded(zoneId);
	};

	Acts.prototype.requestInterstitial = function (zoneId) {
		this.tapsellplus_instance.requestInterstitial(zoneId);
	};

	Acts.prototype.showAd = function (zoneId) {
		this.tapsellplus_instance.showAd(zoneId);
	}

	pluginProto.acts = new Acts();


	//////////////////////////////////////
	// Expressions
	function Exps() { };

	pluginProto.exps = new Exps();

}());
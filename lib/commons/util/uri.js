//Taken from http://github.com/garycourt/uri-js

// TODO align keys with jsgi

/**
 * URI.js
 * 
 * @fileOverview An RFC 3986 compliant, scheme extendable URI parsing/validating/resolving library for JavaScript.
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @version 1.0
 * @see http://github.com/garycourt/uri-js
 */

/*
 * Copyright 2010 Gary Court. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Gary Court.
 */

/*jslint white: true, sub: true, onevar: true, undef: true, eqeqeq: true, newcap: true, immed: true, indent: 4 */

var exports = exports || this,
	require = require || function () {
		return exports;
	};

(function () {
	var	Options, URIComponents, SchemeHandler, URI,
	
		mergeSet = function () {
			var set = arguments[0],
				x = 1,
				nextSet = arguments[x];
			
			while (nextSet) {
				set = set.slice(0, -1) + nextSet.slice(1);
				nextSet = arguments[++x];
			}
			
			return set;
		},
		
		subexp = function (str) {
			return "(?:" + str + ")";
		},
	
		ALPHA$$ = "[A-Za-z]",
		CR$ = "[\\x0D]",
		DIGIT$$ = "[0-9]",
		DQUOTE$$ = "[\\x22]",
		HEXDIG$$ = mergeSet(DIGIT$$, "[A-Fa-f]"),  //case-insensitive
		LF$$ = "[\\x0A]",
		SP$$ = "[\\x20]",
		PCT_ENCODED$ = subexp("%" + HEXDIG$$ + HEXDIG$$),
		GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]",
		SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]",
		RESERVED$$ = mergeSet(GEN_DELIMS$$, SUB_DELIMS$$),
		UNRESERVED$$ = mergeSet(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]"),
		SCHEME$ = subexp(ALPHA$$ + mergeSet(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"),
		USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:]")) + "*"),
		DEC_OCTET$ = subexp(DIGIT$$ + "|" + subexp("[1-9]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("25[0-5]")),
		IPV4ADDRESS$ = subexp(DEC_OCTET$ + "." + DEC_OCTET$ + "." + DEC_OCTET$ + "." + DEC_OCTET$),
		H16$ = subexp(HEXDIG$$ + "{1,4}"),
		LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$),
		IPV6ADDRESS$ = subexp(mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),  //FIXME
		IPVFUTURE$ = subexp("v" + HEXDIG$$ + "+\\." + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),
		IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"),
		REG_NAME$ = subexp(subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$)) + "*"),
		HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "|" + REG_NAME$),
		PORT$ = subexp(DIGIT$$ + "*"),
		AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"),
		PCHAR$ = subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@]")),
		SEGMENT$ = subexp(PCHAR$ + "*"),
		SEGMENT_NZ$ = subexp(PCHAR$ + "+"),
		SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$ + "|" + mergeSet(UNRESERVED$$, SUB_DELIMS$$, "[\\@]")) + "+"),
		PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"),
		PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"),  //simplified
		PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$),  //simplified
		PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$),  //simplified
		PATH_EMPTY$ = subexp(""),  //simplified
		PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
		QUERY$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
		FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
		HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
		URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
		RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$),
		RELATIVE_REF$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
		URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE_REF$),
		ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"),
		
		URI_REF = new RegExp("^" + subexp("(" + URI$ + ")|(" + RELATIVE_REF$ + ")") + "$"),
		GENERIC_REF  = new RegExp("^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$"),
		RELATIVE_REF = new RegExp("^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$"),
		ABSOLUTE_REF = new RegExp("^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$"),
		SAMEDOC_REF = new RegExp("^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$"),
		AUTHORITY = new RegExp("^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$"),
		
		NOT_SCHEME = new RegExp(mergeSet("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
		NOT_USERINFO = new RegExp(mergeSet("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_HOST = new RegExp(mergeSet("[^\\%]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_PATH = new RegExp(mergeSet("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_PATH_NOSCHEME = new RegExp(mergeSet("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		NOT_QUERY = new RegExp(mergeSet("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
		NOT_FRAGMENT = NOT_QUERY,
		ESCAPE = new RegExp(mergeSet("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
		UNRESERVED = new RegExp(UNRESERVED$$, "g"),
		OTHER_CHARS = new RegExp(mergeSet("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
		PCT_ENCODEDS = new RegExp(PCT_ENCODED$ + "+", "g"),
		URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?([^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/i,
		RDS1 = /^\.\.?\//,
		RDS2 = /^\/\.(\/|$)/,
		RDS3 = /^\/\.\.(\/|$)/,
		RDS4 = /^\.\.?$/,
		RDS5 = /^\/?.*?(?=\/|$)/,
		NO_MATCH_IS_UNDEFINED = ("").match(/(){0}/)[1] === undefined,
		
		pctEncChar = function (chr) {
			var c = chr.charCodeAt(0);
 
			if (c < 128) {
				return "%" + c.toString(16).toUpperCase();
			}
			else if ((c > 127) && (c < 2048)) {
				return "%" + ((c >> 6) | 192).toString(16).toUpperCase() + "%" + ((c & 63) | 128).toString(16).toUpperCase();
			}
			else {
				return "%" + ((c >> 12) | 224).toString(16).toUpperCase() + "%" + (((c >> 6) & 63) | 128).toString(16).toUpperCase() + "%" + ((c & 63) | 128).toString(16).toUpperCase();
			}
		},
		
		pctDecUnreserved = function (str) {
			var newStr = "", 
				i = 0,
				c, s;
	 
			while (i < str.length) {
				c = parseInt(str.substr(i + 1, 2), 16);
	 
				if (c < 128) {
					s = String.fromCharCode(c);
					if (s.match(UNRESERVED)) {
						newStr += s;
					} else {
						newStr += str.substr(i, 3);
					}
					i += 3;
				}
				else if ((c > 191) && (c < 224)) {
					newStr += str.substr(i, 6);
					i += 6;
				}
				else {
					newStr += str.substr(i, 9);
					i += 9;
				}
			}
	 
			return newStr;
		},
		
		pctDecChars = function (str) {
			var newStr = "", 
				i = 0,
				c, c2, c3;
	 
			while (i < str.length) {
				c = parseInt(str.substr(i + 1, 2), 16);
	 
				if (c < 128) {
					newStr += String.fromCharCode(c);
					i += 3;
				}
				else if ((c > 191) && (c < 224)) {
					c2 = parseInt(str.substr(i + 4, 2), 16);
					newStr += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 6;
				}
				else {
					c2 = parseInt(str.substr(i + 4, 2), 16);
					c3 = parseInt(str.substr(i + 7, 2), 16);
					newStr += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 9;
				}
			}
	 
			return newStr;
		},
		
		typeOf = function (o) {
			return o === undefined ? "undefined" : (o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase());
		};
	
	/**
	 * @class
	 */
	
	Options = function () {};
	
	Options.prototype = {
		/**
		 * @type Boolean
		 */
		
		tolerant : undefined,
		
		/**
		 * @type String
		 */
		
		scheme : undefined,
		
		/**
		 * @type String
		 * @enum "uri", "absolute", "relative", "same-document", "suffix"
		 */
		
		reference : undefined
	};
	
	/**
	 * @class
	 */
	
	URIComponents = function () {
		this.errors = [];
	};
	
	URIComponents.prototype = {
		/**
		 * @type String
		 */
		
		scheme : undefined,
		
		/**
		 * @type String
		 */
		
		authority : undefined,
		
		/**
		 * @type String
		 */
		
		userinfo : undefined,
		
		/**
		 * @type String
		 */
		
		host : undefined,
		
		/**
		 * @type Number
		 */
		
		port : undefined,
		
		/**
		 * @type String
		 */
		
		path : undefined,
		
		/**
		 * @type String
		 */
		
		query : undefined,
		
		/**
		 * @type String
		 */
		
		fragment : undefined,
		
		/**
		 * @type String
		 * @enum "uri", "absolute", "relative", "same-document"
		 */
		
		reference : undefined,
		
		/**
		 * @type Array
		 */
		
		errors : undefined
	};
	
	/**
	 * @class
	 */
	
	SchemeHandler = function () {};
	
	/**
	 * @param {URIComponents} components
	 * @param {Options} options
	 */
	
	SchemeHandler.prototype.parse = function (components, options) {};
	
	/**
	 * @param {URIComponents} components
	 * @param {Options} options
	 */
	
	SchemeHandler.prototype.serialize = function (components, options) {};
	
	/**
	 * @namespace
	 */
	
	URI = {};
	
	/**
	 * @namespace
	 */
	
	URI.SCHEMES = {};
	
	/**
	 * @param {String} uriString
	 * @param {Options} [options]
	 * @returns {URIComponents}
	 */
	
	URI.parse = function (uriString, options) {
		var matches, 
			components = new URIComponents(),
			schemeHandler;
		
		uriString = uriString ? uriString.toString() : "";
		options = options || {};
		
		if (options.reference === "suffix") {
			uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
		}
		
		matches = uriString.match(URI_REF);
		
		if (matches) {
			if (matches[1]) {
				//generic URI
				matches = uriString.match(GENERIC_REF);
			} else {
				//relative URI
				matches = uriString.match(RELATIVE_REF);
			}
		} else {
			if (!options.tolerant) {
				components.errors.push("URI is not strictly valid.");
			}
			matches = uriString.match(URI_PARSE);
		}
		
		if (matches) {
			if (NO_MATCH_IS_UNDEFINED) {
				//store each component
				components.scheme = matches[1];
				components.authority = matches[2];
				components.userinfo = matches[3];
				components.host = matches[4];
				components.port = parseInt(matches[5], 10);
				components.path = matches[6] || "";
				components.query = matches[7];
				components.fragment = matches[8];
				
				//fix port number
				if (isNaN(components.port)) {
					components.port = matches[5];
				}
			} else {  //IE FIX for improper RegExp matching
				//store each component
				components.scheme = matches[1] || undefined;
				components.authority = (uriString.indexOf("//") !== -1 ? matches[2] : undefined);
				components.userinfo = (uriString.indexOf("@") !== -1 ? matches[3] : undefined);
				components.host = (uriString.indexOf("//") !== -1 ? matches[4] : undefined);
				components.port = parseInt(matches[5], 10);
				components.path = matches[6] || "";
				components.query = (uriString.indexOf("?") !== -1 ? matches[7] : undefined);
				components.fragment = (uriString.indexOf("#") !== -1 ? matches[8] : undefined);
				
				//fix port number
				if (isNaN(components.port)) {
					components.port = (uriString.match(/\/\/.*\:(?:\/|\?|\#|$)/) ? matches[4] : undefined);
				}
			}
			
			//determine reference type
			if (!components.scheme && !components.authority && !components.path && !components.query) {
				components.reference = "same-document";
			} else if (!components.scheme) {
				components.reference = "relative";
			} else if (!components.fragment) {
				components.reference = "absolute";
			} else {
				components.reference = "uri";
			}
			
			//check for reference errors
			if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
				components.errors.push("URI is not a " + options.reference + " reference.");
			}
			
			//check if a handler for the scheme exists
			schemeHandler = URI.SCHEMES[components.scheme || options.scheme];
			if (schemeHandler && schemeHandler.parse) {
				//perform extra parsing
				schemeHandler.parse(components, options);
			}
		} else {
			components.errors.push("URI can not be parsed.");
		}
		
		return components;
	};
	
	/**
	 * @private
	 * @param {URIComponents} components
	 * @returns {String}
	 */
	
	URI._recomposeAuthority = function (components) {
		var uriTokens = [];
		
		if (components.userinfo !== undefined || components.host !== undefined || typeof components.port === "number") {
			if (components.userinfo !== undefined) {
				uriTokens.push(components.userinfo.toString().replace(NOT_USERINFO, pctEncChar));
				uriTokens.push("@");
			}
			if (components.host !== undefined) {
				uriTokens.push(components.host.toString().toLowerCase().replace(NOT_HOST, pctEncChar));
			}
			if (typeof components.port === "number") {
				uriTokens.push(":");
				uriTokens.push(components.port.toString(10));
			}
		}
		
		return uriTokens.length ? uriTokens.join("") : undefined;
	};
	
	/**
	 * @param {String} input
	 * @returns {String}
	 */
	
	URI.removeDotSegments = function (input) {
		var output = [], s;
		
		while (input.length) {
			if (input.match(RDS1)) {
				input = input.replace(RDS1, "");
			} else if (input.match(RDS2)) {
				input = input.replace(RDS2, "/");
			} else if (input.match(RDS3)) {
				input = input.replace(RDS3, "/");
				output.pop();
			} else if (input === "." || input === "..") {
				input = "";
			} else {
				s = input.match(RDS5)[0];
				input = input.slice(s.length);
				output.push(s);
			}
		}
		
		return output.join("");
	};
	
	/**
	 * @param {URIComponents} components
	 * @param {Options} options
	 * @returns {String}
	 */
	
	URI.serialize = function (components, options) {
		var uriTokens = [], 
			schemeHandler, 
			s;
		options = options || {};
		
		//check if a handler for the scheme exists
		schemeHandler = URI.SCHEMES[components.scheme || options.scheme];
		if (schemeHandler && schemeHandler.serialize) {
			//perform extra serialization
			schemeHandler.serialize(components, options);
		}
		
		if (options.reference !== "suffix" && components.scheme) {
			uriTokens.push(components.scheme.toString().toLowerCase().replace(NOT_SCHEME, ""));
			uriTokens.push(":");
		}
		
		components.authority = URI._recomposeAuthority(components);
		if (components.authority !== undefined) {
			if (options.reference !== "suffix") {
				uriTokens.push("//");
			}
			
			uriTokens.push(components.authority);
			
			if (components.path && components.path.charAt(0) !== "/") {
				uriTokens.push("/");
			}
		}
		
		if (components.path) {
			s = URI.removeDotSegments(components.path.toString().replace(/%2E/ig, "."));
			
			if (components.scheme) {
				s = s.replace(NOT_PATH, pctEncChar);
			} else {
				s = s.replace(NOT_PATH_NOSCHEME, pctEncChar);
			}
			
			if (components.authority === undefined) {
				s = s.replace(/^\/\//, "/%2F");  //don't allow the path to start with "//"
			}
			uriTokens.push(s);
		}
		
		if (components.query) {
			uriTokens.push("?");
			uriTokens.push(components.query.toString().replace(NOT_QUERY, pctEncChar));
		}
		
		if (components.fragment) {
			uriTokens.push("#");
			uriTokens.push(components.fragment.toString().replace(NOT_FRAGMENT, pctEncChar));
		}
		
		return uriTokens
			.join('')  //merge tokens into a string
			.replace(PCT_ENCODEDS, pctDecUnreserved)  //undecode unreserved characters
			//.replace(OTHER_CHARS, pctEncChar)  //replace non-URI characters
			.replace(/%[0-9A-Fa-f]{2}/g, function (str) {  //uppercase percent encoded characters
				return str.toUpperCase();
			})
		;
	};
	
	/**
	 * @param {URIComponents} base
	 * @param {URIComponents} relative
	 * @param {Options} [options]
	 * @param {Boolean} [skipNormalization]
	 * @returns {URIComponents}
	 */
	
	URI.resolveComponents = function (base, relative, options, skipNormalization) {
		var target = new URIComponents();
		
		if (!skipNormalization) {
			base = URI.parse(URI.serialize(base, options), options);  //normalize base components
			relative = URI.parse(URI.serialize(relative, options), options);  //normalize relative components
		}
		options = options || {};
		
		if (!options.tolerant && relative.scheme) {
			target.scheme = relative.scheme;
			target.authority = relative.authority;
			target.userinfo = relative.userinfo;
			target.host = relative.host;
			target.port = relative.port;
			target.path = URI.removeDotSegments(relative.path);
			target.query = relative.query;
		} else {
			if (relative.authority !== undefined) {
				target.authority = relative.authority;
				target.userinfo = relative.userinfo;
				target.host = relative.host;
				target.port = relative.port;
				target.path = URI.removeDotSegments(relative.path);
				target.query = relative.query;
			} else {
				if (!relative.path) {
					target.path = base.path;
					if (relative.query !== undefined) {
						target.query = relative.query;
					} else {
						target.query = base.query;
					}
				} else {
					if (relative.path.charAt(0) === "/") {
						target.path = URI.removeDotSegments(relative.path);
					} else {
						if (base.authority !== undefined && !base.path) {
							target.path = "/" + relative.path;
						} else if (!base.path) {
							target.path = relative.path;
						} else {
							target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
						}
						target.path = URI.removeDotSegments(target.path);
					}
					target.query = relative.query;
				}
				target.authority = base.authority;
				target.userinfo = base.userinfo;
				target.host = base.host;
				target.port = base.port;
			}
			target.scheme = base.scheme;
		}
		
		target.fragment = relative.fragment;
		
		return target;
	};
	
	/**
	 * @param {String} baseURI
	 * @param {String} relativeURI
	 * @param {Options} [options]
	 * @returns {String}
	 */
	
	URI.resolve = function (baseURI, relativeURI, options) {
		return URI.serialize(URI.resolveComponents(URI.parse(baseURI, options), URI.parse(relativeURI, options), options, true), options);
	};
	
	/**
	 * @param {String|URIComponents} uri
	 * @param {Options} options
	 * @returns {String|URIComponents}
	 */
	
	URI.normalize = function (uri, options) {
		if (typeof uri === "string") {
			return URI.serialize(URI.parse(uri, options), options);
		} else if (typeOf(uri) === "object") {
			return URI.parse(URI.serialize(uri, options), options);
		}
		
		return uri;
	};
	
	/**
	 * @param {String|URIComponents} uriA
	 * @param {String|URIComponents} uriB
	 * @param {Options} options
	 */
	
	URI.equal = function (uriA, uriB, options) {
		if (typeof uriA === "string") {
			uriA = URI.serialize(URI.parse(uriA, options), options);
		} else if (typeOf(uriA) === "object") {
			uriA = URI.serialize(uriA, options);
		}
		
		if (typeof uriB === "string") {
			uriB = URI.serialize(URI.parse(uriB, options), options);
		} else if (typeOf(uriB) === "object") {
			uriB = URI.serialize(uriB, options);
		}
		
		return uriA === uriB;
	};
	
	/**
	 * @param {String} str
	 * @returns {String}
	 */
	
	URI.escapeComponent = function (str) {
		return str && str.toString().replace(ESCAPE, pctEncChar);
	};
	
	/**
	 * @param {String} str
	 * @returns {String}
	 */
	
	URI.unescapeComponent = function (str) {
		return str && str.toString().replace(PCT_ENCODEDS, pctDecChars);
	};
	
	//export API
	exports.Options = Options;
	exports.URIComponents = URIComponents;
	exports.SchemeHandler = SchemeHandler;
	exports.URI = URI;
	
}());
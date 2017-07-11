/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author fengwan@staff.sina.com.cn
*/
"use strict";

 

class JsonpTemplatePlugin {
	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.mainTemplate.plugin("jsonp-script", function(_, chunk, hash) {
				const chunkFilename = this.outputOptions.chunkFilename;
				const chunkMaps = chunk.getChunkMaps();
				const crossOriginLoading = this.outputOptions.crossOriginLoading;
				const chunkLoadTimeout = this.outputOptions.chunkLoadTimeout||5000;
				const scriptSrcPath = this.applyPluginsWaterfall("asset-path", JSON.stringify(chunkFilename), {
					hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
					hashWithLength: length => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
					chunk: {
						id: "\" + chunkId + \"",
						hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
						hashWithLength(length) {
							const shortChunkHashMap = Object.create(null);
							Object.keys(chunkMaps.hash).forEach(chunkId => {
								if(typeof chunkMaps.hash[chunkId] === "string")
									shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(0, length);
							});
							return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
						},
						name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
					}
				});
	
				return this.asString([
					"var script = document.createElement('script');",
					"script.type = 'text/javascript';",
					"script.charset = 'utf-8';",
					"script.async = true;",
					`script.timeout = ${chunkLoadTimeout};`,
					crossOriginLoading ? `script.crossOrigin = ${JSON.stringify(crossOriginLoading)};` : "",
					`if (${this.requireFn}.nc) {`,
					this.indent(`script.setAttribute("nonce", ${this.requireFn}.nc);`),
					"}",
					`var enlssrc = ${this.requireFn}.p + ${scriptSrcPath};`,
					`var contentKey = ${scriptSrcPath};`,
					`var md5Key  = (${scriptSrcPath}).split('.')[0];`,
					"if(window.localStorage){",
		        	this.indent([
		        		"var enls = window.localStorage;",
		        		"var md5Text = enls.getItem(md5Key)",
		        		"if(md5Text == contentKey){",//非第一次加载这个js
		        		this.indent([
		        			"var enlsText = enls.getItem(md5Text);",
		        			"script.text = eval(enlsText);",
			        		"head.appendChild(script);",
			        		"return promise;",
			        	]),
		     		]),
		        	"}else{",//第一次加载这个js
		        	this.indent([
		        		"srcInsert();",
		        		"getUrl( enlssrc).then( function( result ) {",
						this.indent([
							"enls.setItem( md5Key, contentKey);",
							"enls.setItem( contentKey, JSON.stringify( result.content ) );",
							"for(var i = 0 ; i < enls.length; i ++){",
							this.indent([
					
								`if(new RegExp('/js\\/'+${JSON.stringify(chunkMaps.name)}[chunkId]+'.([A-Za-z0-9]*).chunk.js/').test(enls.key(i))){`,
								this.indent([
									"if(contentKey != enls.key(i) ){",
									this.indent([
										"enls.removeItem(enls.key(i))",
									]),
									"}",
								]),
								"}",
							]),
							"}",
						]),
						"});",
						"return promise;",
					]),
		        	"}",
		        "}else{",
		        this.indent([
		        	"srcInsert();",
				 	"return promise;",
		 		]),
		        "}",
					"function srcInsert(){",
					this.indent([
						`script.src = ${this.requireFn}.p + ${scriptSrcPath};`,
						`var timeout = setTimeout(onScriptComplete, ${chunkLoadTimeout});`,
						"script.onerror = script.onload = onScriptComplete;",
						"function onScriptComplete() {",
						this.indent([
							"// avoid mem leaks in IE.",
							"script.onerror = script.onload = null;",
							"clearTimeout(timeout);",
							"var chunk = installedChunks[chunkId];",
							"if(chunk !== 0) {",
							this.indent([
								"if(chunk) {",
								this.indent("chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));"),
								"}",
								"installedChunks[chunkId] = undefined;"
							]),
							"}",
						]),
						"};",
						"head.appendChild(script);",
					]),
					"};",
				]);
			});
			compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
				return this.asString([
					"var installedChunkData = installedChunks[chunkId];",
					"if(installedChunkData === 0) {",
					this.indent([
						"return new Promise(function(resolve) { resolve(); });"
					]),
					"}",
					"",
					"// a Promise means \"currently loading\".",
					"if(installedChunkData) {",
					this.indent([
						"return installedChunkData[2];"
					]),
					"}",
					"",
					"// setup Promise in chunk cache",
					"var promise = new Promise(function(resolve, reject) {",
					this.indent([
						"installedChunkData = installedChunks[chunkId] = [resolve, reject];"
					]),
					"});",
					"installedChunkData[2] = promise;",
					"",
					"// start chunk loading",
					"var head = document.getElementsByTagName('body')[0];",
					this.applyPluginsWaterfall("jsonp-script", "", chunk, hash),
					
					"",
					"return promise;",
					"function getUrl (url) {",
					this.indent([
						"var promise = new Promise( function( resolve, reject ){",
						this.indent([
							"var xhr = new XMLHttpRequest();",
							"xhr.open( 'GET', url , true);",
							"xhr.onreadystatechange = function() {",
							this.indent([
								"if ( xhr.readyState === 4 ) {",
									"if (( xhr.status === 200 ) ||(( xhr.status === 0 ) && xhr.responseText ) ) {",
										"resolve( {",
											"content: xhr.responseText,",
											"type: xhr.getResponseHeader('content-type')",
										"});",
									"}else{",
										"reject( new Error( xhr.statusText ) );",
									"}",
								"}",
							]),
							"};",
							"setTimeout( function () {",
							this.indent([
								"if( xhr.readyState < 4 ) {",
									"xhr.abort();",
								"}",
							]),
							`}, 2000);`,
							"xhr.send();",
						]),
						"});",
						"return promise;",
					]),
					"};",
				]);
			});
		});
	}
}
module.exports = JsonpTemplatePlugin;
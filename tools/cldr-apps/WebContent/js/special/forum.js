/**
 * Special Dojo "module" that shows a forum page.
 *
 * TODO: migrate to modern strict JavaScript module
 */
define("js/special/forum.js", ["js/special/SpecialPage.js", "dojo/request", "dojo/window"], 
		function(SpecialPage, request, win) {
	var _super;
	
	function Page() {
		// constructor
	}
	
	// set up the inheritance before defining other functions
	_super = Page.prototype = new SpecialPage();

	/**
	 * parse a hash tag
	 *
	 * Reference: https://dojotoolkit.org/reference-guide/1.10/dojo/hash.html
	 *
	 * @function parseHash
	 */
	Page.prototype.parseHash = function parseHash(hash, pieces) {
		surveyCurrentPage='';
		if(pieces && pieces.length>3){
			if(!pieces[3] || pieces[3]=='') {
				surveyCurrentId='';
			} else {
				var id = new Number(pieces[3]);
				if(id == NaN) {
					surveyCurrentId = '';
				} else {
					surveyCurrentId = id.toString();
					this.handleIdChanged(surveyCurrentId);
				}
			}
		}
	};
	
	Page.prototype.handleIdChanged = function handleIdChanged(strid) {
		if(strid && strid != '') {
			var id = new Number(strid);
			if(id == NaN) {
				surveyCurrentId = '';
			} else {
				surveyCurrentId = id.toString();
			}
			var itemid = "fp"+id;
			var pdiv = document.getElementById(itemid);
			if(pdiv) {
				console.log("Scrolling " + itemid);
				win.scrollIntoView(pdiv);
				(function(o,itemid,pdiv){
						pdiv.style["background-color"]="yellow";
						window.setTimeout(function(){
							pdiv.style["background-color"]=null;
						}, 2000);
				})(this,itemid,pdiv);
			} else {
				console.log("No item "+itemid);
			}
		}
	};

	Page.prototype.show = function show(params) {

		if(surveyCurrentLocale=='') {
			hideLoader(null);
			params.flipper.flipTo(params.pages.other, createChunk(stui.str("generic_nolocale"),"p","helpContent"));
		} else {
			request
			.get('SurveyAjax?s='+surveySessionId+'&what=forum_fetch&xpath=0&_='+surveyCurrentLocale, {handleAs: 'json'})
			.then(function(json) {
				if(json.err) {
		        	params.special.showError(params, json, {what: "Loading forum data"});
		        	return;
				}
				// set up the 'right sidebar'
				showInPop2(stui.str(params.name+"Guidance"), null, null, null, true); /* show the box the first time */					
				
				var ourDiv = document.createElement("div");

				ourDiv.appendChild(createChunk(stui.sub("forum_msg", {
						forum: locmap.getLocaleName(locmap.getLanguage(surveyCurrentLocale)),
						locale: surveyCurrentLocaleName}),
					"h4", ""));

				const filterMenu = cldrStForumFilter.createMenu(surveyUser.id, reloadV);
				ourDiv.appendChild(filterMenu);

				ourDiv.appendChild(document.createElement('hr'));
				const posts = json.ret;
				if (posts.length == 0) {
					ourDiv.appendChild(createChunk(stui.str("forum_noposts"),"p","helpContent"));
				} else {
					const content = cldrStForum.parseContent(posts, 'main');
					ourDiv.appendChild(content);
				}
				
				// No longer loading
				hideLoader(null);
				params.flipper.flipTo(params.pages.other, ourDiv);
				params.special.handleIdChanged(surveyCurrentId); // rescroll.
			})
			.otherwise(function(err) {
	        	params.special.showError(params, null, {err: err, what: "Loading forum data"});
			});
		}
	};

	return Page;
});
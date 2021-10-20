$(document).ready(function(){
	ANCHOR._hide_partial();

	//routes the path on load

	$(".ANCHOR").click(function(e){
		e.preventDefault();

		ANCHOR.route("#" + ANCHOR._anchor_path($(this)) + ANCHOR._anchor_params($(this)))
	})
})


window.addEventListener('popstate', function(event){
	var origin = event.state;

	//route(path);
	if(origin !== null){	
		var link = ANCHOR._get_link(origin);
		ANCHOR._hide_partial();
		//router(link.path, link.params);	
		ANCHOR._show_div(link.path);

		//TODO : shouldn't this use ANCHORED route?
		$(document).trigger("ANCHOR");
	}									
})

var ANCHOR = {
	load : function(){
		var that = this;
		ANCHOR._hide_partial();
		this.route(window.location.hash + window.location.search)

		//routes the path on load

		$(".ANCHOR").click(function(e){
			e.preventDefault();

			that.route("#" + that._anchor_path($(this)) + that._anchor_params($(this)))
		})
	}
	,
	buffer : function(){
		var that = this;
		$(".ANCHOR").click(function(e){
			e.preventDefault();

			that.route("#" + that._anchor_path($(this)) + that._anchor_params($(this)))
		})
	}
	,
	page : function(){
		return this._get_link(window.location.hash).path
	}
	,
	route : function(origin){		
		console.log("ANCHOR : " + origin);
		this._hide_partial();
		var link = this._get_link(window.location.pathname + origin);			
		history.pushState(origin, '', origin)
		$(document).trigger("ANCHOR");
		this._show_div(link.path);
	}
	,
	getParams : function(){
		  var search = window.location.hash.split("?")[1]
		  if(search){
		  	  if(search.indexOf('?') > -1){
			    search = search.split('?')[1];
			  }
			  var pairs = search.split('&');
			  var result = {};
			  pairs.forEach(function(pair) {
			    pair = pair.split('=');
			    result[pair[0]] = decodeURIComponent(pair[1] || '');
			  });
			  return result;
		  }
	}
	,
	_hyperlink:  function(hyperlink){
		window.location.replace(hyperlink);
	}
	,
	_get_link : function(origin){		
		var params = origin.split("?")
		var path = params[0].split("#");
		return {
			path : path[1],
			params : params
		}
	}
	,
	_show_div : function(path){
		$("div." + path).show();
	}
	,
	_anchor_path : function(href){
		return href.attr("class").split(/\s+/)[1];
	}
	,
	_anchor_params(a){
		return a.attr("href").split('?')[1] ? "?" + a.attr("href").split('?')[1] : "";
	}
	,
	_hide_partial : function(){
		$(".ANCHOR_partial").hide();
	}
}
var JSONP_COUNTER = 0;

Nemo = (function() {
    function Jsonp(params) {
        var counter = 0, head, query, key;
        function load(url) {
            // TODO: Change script varialble
            var script = document.createElement('script'), done = false;
            script.src = url;
            script.async = true;
            if(/MSIE/.test(navigator.userAgent)) {
                script.attachEvent('error', function(err){
                                    errorObj = {};
                                    errorObj.errorCode = "4";
                                    onError(errorObj);
                }, true);
            }
            else {
                script.addEventListener('error', function(err){
                                    errorObj = {};
                                    errorObj.errorCode = "4";
                                    onError(errorObj);
                }, true);
            }
            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    done = true;
                    // TODO : check alternate for script onload check on all
                    // browsers
                    script.onload = script.onreadystatechange = null;
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }
            };
            if (!head) {
                head = document.getElementsByTagName('head')[0];
            }
            head.appendChild(script);
        }
		
		function onError(errorObj) {
			var errorCode = errorObj.errorCode;
			var errorMessages = config.errorMessages || {};
			var errorMessage = errorMessages[errorCode];
			if (errorMessage && !errorMessageShown) {
				errorMessageShown  = true;
				//alert("Error:"+errorMessage);
			}
			
			
		}

        function jsonp(url, params, callback) {
            query = "?";
            params = params || {};

            for (key in params) {
                // FIX : use typeof
                if (params.hasOwnProperty(key)) {
                    query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
                }
            }

            var jsonp = "nemo_json_" + (++JSONP_COUNTER);
            window[jsonp] = function(data) {
                callback(data);
                try {
                    delete window[jsonp];
                } catch (e) {
                }
                window[jsonp] = null;
            };

            load(url + query + "jsonp=" + jsonp);
            return jsonp;
        }

        jsonp(params.url, params.content, params.load);

    }

    var me = {
        Jsonp : Jsonp
    };
    return me;
})();

	function authenticateCobrowse(assistBaseUrl,interactionid,skey,cobrowseid,onCobrowseAllowedCallback,onCobrowseDeniedCallback){
	  var params = {
		"_skey" : skey,
		"cobrowseId" : cobrowseid
	  };
	  var url=assistBaseUrl+"/en/as/rest/interaction/"+interactionid+"/cobrowseauth";
	
      Nemo.Jsonp({
		url : url,
		content : params,
		load : function(response) {		
		    //alert(response);		
		    if (response['status']['code'] == 0) {
				statusMessage = response.status.message;				
					if('true'==statusMessage){
					   if(onCobrowseAllowedCallback)
						 onCobrowseAllowedCallback();
					} else{
					     if(onCobrowseDeniedCallback)
							onCobrowseDeniedCallback();
					}
			} else {
				if(onCobrowseDeniedCallback)
					onCobrowseDeniedCallback();
			}
		},
		error : function(response) {
			if(onCobrowseDeniedCallback)
				onCobrowseDeniedCallback();
		}
	  });
    }//authenticateCobrowse		


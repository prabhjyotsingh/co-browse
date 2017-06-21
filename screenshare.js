/**
 * Created by prabhu on 29/01/14.
 */
var serverProtocol = 'https';
var CDN = serverProtocol + '://cobrowse-staging.app.247-inc.net/';
var isProxyCssNeeded = 'false';
var clientMask = false;



var Utils = {"attributeAndRegexWhiteList":{"data-afvurl":{"regex":"anything"},"abbr":{"regex":"paragraph"},"align":{"regex":"alignRegEx"},"axis":{"regex":"axisRegEx"},"background":{"regex":"onsiteURL"},"bgcolor":{"regex":["colorName","colorCode"]},"border":{"regex":"number"},"cellpadding":{"regex":"number"},"cellspacing":{"regex":"number"},"char":{"regex":"charRegEx"},"charoff":{"regex":"numberOrPercent"},"checked":{"regex":"anything"},"class":{"regex":"htmlClass"},"cols":{"regex":"number"},"colspan":{"regex":"number"},"disabled":{"regex":"anything"},"headers":{"regex":"headersRegEx"},"height":{"regex":"numberOrPercent"},"href":{"regex":["onsiteURL","offsiteURL"]},"id":{"regex":"htmlId"},"media":{"regex":"mediaRegEx"},"name":{"regex":"nameRegEx"},"nowrap":{"regex":"anything"},"placeholder":{"regex":"anything"},"readonly":{"regex":"anything"},"rel":{"regex":"htmlClass"},"rows":{"regex":"number"},"rowspan":{"regex":"number"},"src":{"regex":["onsiteURL","offsiteURL"]},"style":{"regex":"anything"},"title":{"regex":"htmlClass"},"type":{"regex":"type"},"valign":{"regex":"valignRegEx"},"value":{"regex":"plainText"},"width":{"regex":"numberOrPercent"}},"attributeBlackList":{"onabort":1,"oncancel":1,"oncanplay":1,"onload":1,"oncanplaythrough":1,"onchange":1,"onclick":1,"oncuechange":1,"ondblclcik":1,"ondurationchange":1,"onemptied":1,"onended":1,"oninput":1,"oninvalid":1,"onkeydown":1,"onkeypress":1,"onkeyup":1,"onloadeddata":1,"onloadedmetadata":1,"onloadstart":1,"onmousedown":1,"onmouseenter":1,"onmouseleave":1,"onmousemove":1,"omnouseout":1,"onmouseover":1,"onmouseup":1,"onmousewheel":1,"onpause":1,"onplay":1,"onplaying":1,"onprogress":1,"onratechage":1,"onreset":1,"onseeked":1,"onseeking":1,"onselect":1,"onshow":1,"onstalled":1,"onsubmit":1,"onsuspend":1,"ontimeupdate":1,"ontoggle":1,"onvolumechange":1,"onwaiting":1},"tagBlackList":["applet","embed","object","script","iframe","nottoshow"],"inputTags":["input","select","textarea"],"regexList":{"alignRegEx":"^(center|middle|left|right|justify|char)$","anything":".*$","axisRegEx":"^[a-zA-Z0-9\\s*,]*$","boolean":"^(true|false$)","charRegEx":"^.{0,1}$","colorCode":"^(#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}))$","colorName":"^(aqua|black|blue|fuchsia|gray|grey|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow)$","headersRegEx":"^[a-zA-Z0-9\\s*]*$","htmlClass":"^[a-zA-Z0-9\\s,\\-_]+$","htmlId":"^[a-zA-Z0-9\\:\\-_\\.\\s]+$","integer":"^(-|\\+)?[0-9]+$","mediaRegex":"^[a-zA-Z0-9,\\-\\s]+$","nameRegEx":"^[a-zA-Z0-9\\-_\\$]+$","number":"^(-|\\+)?([0-9]+(\\.[0-9]+)?)$","numberOrPercent":"^(\\d)+(%{0,1})$","offsiteURL":"^(\\s)*((ht|f)tp(s?):\\/\\/|mailto:)[a-zA-z\\d]+[a-zA-z\\d \\t\\.\\#@\\$%\\+\\&;:\\-_~,\\?=\\/!\\(\\)]*(\\s)*$","onsiteURL":"^([a-zA-z\\d\\\\\\.\\#@\\$%\\+\\&;\\-_~,\\?=\\/!]+|\\#(\\w)+)$","paragraph":"^([\\p{L}\\p{N},'\\.\\s\\-_\\(\\)]|&amp;[0-9]{2};)*$","plainText":"^[a-zA-Z0-9\\s,\\.\\*\\?\\!\\@\\$\\%\\^\\&\\*\\(\\-\\_\\+\\=\\)]*$","positiveInteger":"^(\\+)?[0-9]+$","singlePrintable":"^[a-zA-Z0-9]{1}$","type":"^[a-zA-Z0-9\\/]+","valignRegEx":"^(baseline|bottom|middle|top)$"}};
Utils.contains = function(obj, str) {
    if(typeof obj == 'object') {
        for(var i = 0 ; i < obj.length ; i++) {
            if(obj[i] === str) {
                return true;
            }
        }
    } else {
        if(obj == str) {
            return true;
        }
    }
    return false;
};

//var SocketCDN = 'http://cobrowse-staging.app.247-inc.net/';
//if(window.location.protocol == "https:") {
//    SocketCDN = 'https://cobrowse-staging.app.247-inc.net/';
//}
var SocketCDN = CDN;

var devMode = 'false';
var adminMouseStyle = 'position: absolute; z-index: 9999; height: 30px; width: 30px; background-color: orange; opacity:0.5; border-radius: 5em';

var socket = undefined;
var channelIds = 1;
var tabId = (
    new Date()
    ).getTime();
var isClientInitiatedHandshake = true;
var activeTabId = tabId;
var protocall;
var path = '';
var basePathURl = '';
var lastChange = '';
var secondChange = '';
var sendMouse = false;
var JQ;
var dollar;

function IE(v) {
return RegExp('msie' + (!isNaN(v)?('\\s'+v):''), 'i').test(navigator.userAgent);
}



var nonMutationSupportedBrowser = (
    typeof WebKitMutationObserver == 'undefined' && typeof MutationObserver == 'undefined'
    ) && !IE(10);
var isInit = false;
var isIeInit = false;
var agentHeight, agentWidth;
var isMirrored = false;
var loopDelay = 5000;
var applyChangeIdx = 0;
var tree;

var isIE = (
    function(doc) {
        var cache = {}, elem;
        return function(version, comparison) {
            if(/*@cc_on!@*/true) {
                return false;
            }
            var key = [comparison || "", "IE", version || ""].join(" ");
            if(!(
                key in cache
                )) {
                elem = elem || doc.createElement("B");
                elem.innerHTML = "<!--[if " + key + "]><b></b><![endif]-->";
                cache[key] = !!elem.getElementsByTagName("b").length;
            }
            return cache[key];
        };
    }(document)
    );

setTimeout(function() {
    var windowPath = window.location.pathname.split('?')[0].split('.')[0].split('/');
    path = window.location.protocol + "//" + window.location.host;
    basePathURl = path;
    if(window.cobrowseUser && window.cobrowseUser == 'afv'){              // uncomment it when working on Access Control.
        basePathURl = window.parent.visitorHost;                             // fix for  AFV-459 CORS policy issue for visitor css
    }
    protocall = window.location.protocol;
    if(windowPath.length > 2) {
        for(var i = 0 ; i < windowPath.length - 1 ; i++) {
            path += windowPath[i] + '/';
        }
    } else {
        path += '/';
    }

    if(typeof $ != 'undefined') {
        dollar = $;
        setTimeout(function() {
            $ = dollar;
        }, 5000);
    }

    if(nonMutationSupportedBrowser) {
        loadScript(CDN + 'javascripts/json3.min.js');
        if(typeof jQuery == 'undefined' || jQuery.fn.jquery == 'undefined') {
            loadScript(CDN + 'javascripts/jquery.js');
        } else {
            JQ = jQuery;
        }
        //        loadScript(CDN + 'javascripts/loader.js');
        //        loadScript(CDN + 'javascripts/mutation_summary_ie.js');
      
           loadScript(CDN + 'build/nonMutationAndSocketFiles.min.js');
              
        initIE();

    } else {

        if((!!window.MSInputMethodContext && !!document.documentMode) ||IE(10)){
            if(IE(10)){
                loadScript(CDN + 'javascripts/mutationObserver.js');
            }
            loadScript(CDN + 'javascripts/wgxpath.install.js',function(){
                wgxpath.install()

            });
        }
        loadScript(CDN + 'javascripts/json3.min.js', function() {
            if(typeof jQuery == 'undefined' || jQuery.fn.jquery == 'undefined') {
                loadScript(CDN + 'javascripts/jquery.js', function() {
                    JQ = jQuery.noConflict();
                    loadAllScript();
                });
            } else {
                JQ = jQuery;
                loadAllScript();
            }
        });
    }
}, 100);

function initIE() {
    setTimeout(function() {
        try {
            JQ = jQuery.noConflict();
            init();
        } catch(e) {
            initIE();
        }
    }, 1000);
}

var isMutationLoaded = false;

function loadAllScript() {
    setTimeout(function() {
        if(!isMutationLoaded) {
            isMutationLoaded = true;
            loadMutation();
        }
    }, 2000);
    JQ(document).ready(function() {
        if(!isMutationLoaded) {
            isMutationLoaded = true;
            loadMutation();
        }
    });
}

function loadScript(url, onLoadFunction) {
    //    check to make sure the function variable is a proper function
    /*
     var url = 'https://cobrowse-staging.app.247-inc.net/screenshare.js';var head = document.head||document.getElementsByTagName("head")[0]|| document.documentumentElement, script =document.createElement("script");script.src = url;script.async = true;head.insertBefore(script, head.firstChild);
     */
    if(typeof(
        url
        ) == 'string') {
        var head = document.head || document.getElementsByTagName("head")[0] || document.documentumentElement, script = document.createElement("script");

        script.src = url;    // specify the target of the scripts source
        script.async = true; // let it load asynchronously

        //  Insert script into the <head> tag at first position
        head.insertBefore(script, head.firstChild);

        //add our listener
        if(onLoadFunction) {
            script.addEventListener("load", onLoadFunction, false);
        }
    } else {
        // you did not pass in a string
        throw(
            "loadScript ERROR: a string was not passed in to be the source of the script"
            );
    }
}



function loadMutation() {
    if(devMode){
        var count=0;
        if(isIE(10, 'lte')) {
        
                loadScript(CDN + 'build/mutationAndSocketFilesIE.min.js');
                
        }
        else {
        
                        if(count == 3){
                            loadScript(CDN + 'build/mutationAndSocketFiles.min.js', init());
                        }else{
                            loadScript(CDN + 'build/mutationAndSocketFiles.min.js');
                            count++;
                        }
                

        }
    }
    if(isIE(10, 'lte')) {
    
     loadScript(CDN + 'build/mutationAndSocketFilesIE.min.js', init());
        
    }
    else {
       
                  loadScript(CDN + 'build/mutationAndSocketFiles.min.js', init());
                     

    }
}

function init() {
    if(typeof io != "undefined") {
        isInit = true;
        AddMenu();
        if(devMode && devMode != 'false') {
            JQ.ajax({
                url         : CDN + 'getSession.json',
                type        : 'GET',
                crossDomain : true,
                dataType    : 'jsonp',
                success     : function(response) {
                    if(response.sessionId) {
                        channelIds = response.sessionId;
                        JQ('#SessionKey').val(channelIds);
                        JQ('#sharingURL').val(response.sharingURL + '?sessionId=' + channelIds);
                        JQ('p#RemoteStatus').parents('.mainMenuClass').find('a').remove();
                        console.log(response.sharingURL + '?sessionId=' + channelIds);
                        ContinueSession(channelIds + ';' + response.sessionType);
                    } else {
                        CreateSession('cobrowse', console.log, JSON.stringify);
                    }
                }
            });
        }
        JQ(window).resize(function() {
            if(socket != undefined) {
                socketSend({
                    height : JQ(window).height(),
                    width  : JQ(window).width()
                });
            }
        });
    } else {
        setTimeout(function() {
            init();
        }, 500);
    }

}
function socketSend(msg) {
    var msgSend = false;
    if(socket.connected) {
        if(activeTabId == tabId) {
            msgSend = true;
        } else if(msg.f == 'initialize' || msg.base) {
            msgSend = true;
        }
    }
    if(msgSend) {
        if(msg && msg['args']) {
            socket.emit('clientChanges', {
                change    : msg,
                channelId : channelIds,
                tabId     : tabId
            });
        } else {
            socket.emit('clientChanges', {
                change    : msg,
                channelId : channelIds,
                tabId     : tabId
            });
        }
    }
}

function roundFigure(val, places) {
    val = Math.round(val * (
        Math.pow(10, places)
        )) / Math.pow(10, places);
    if(isNaN(val)) {
        val = 0;
    }
    return val;

}

function startMirroring() {
    if(!isMirrored) {
        if(socket != undefined) {
            sendCurrentUrl();
            socketSend({base : location.href.match(/^(.*\/)[^\/]*$/)[1]});
            try {
                if(!nonMutationSupportedBrowser) {
                    if(typeof tree == "object") {
                        tree.disconnect();
                        tree = undefined;
                    }
                    tree = new TreeMirrorClient(document, {
                        initialize   : function(rootId, children) {
                            socketSend({
                                f      : 'initialize',
                                args   : [rootId, children],
                                scroll : JQ(window).scrollTop()
                            });
                        },
                        applyChanged : function(removed, addedOrMoved, attributes, text) {
                            applyChange(removed, addedOrMoved, attributes, text, 0);
                        }
                    });
                }
                JQ(window).bind('beforeunload', function(e) {
                    socket.emit('clientPageUnload', {
                        channelId : channelIds,
                        e         : e
                    });
                });
            } catch(e) {
                //                console.error('Error:');
                //                console.error(e);
            }

            if(nonMutationSupportedBrowser) {
                if(!isIeInit) {
                    isIeInit = true;
                    loopForNonMutationSupportedBrowsers();
                }
            }
        }
        isMirrored = true;
    }

}

function initializeIE() {
    socketSend({base : location.href.match(/^(.*\/)[^\/]*$/)[1]});
    if(!nonMutationSupportedBrowser) {
        applyChangeIdx++;
        if(typeof tree == "object") {
            tree.disconnect();
            tree = undefined;
        }
        tree = new TreeMirrorClient(document, {
            initialize   : function(rootId, children) {
                socketSend({
                    f      : 'initializeIE',
                    args   : [rootId, children],
                    scroll : JQ(window).scrollTop()
                });
            },
            applyChanged : function(removed, addedOrMoved, attributes, text) {
                applyChange(removed, addedOrMoved, attributes, text, applyChangeIdx);
            }
        });
    } else {
        tree = new TreeMirrorClient(document, {
            initialize : function(rootId, children) {
                socketSend({
                    f      : 'initializeIE',
                    args   : [rootId, children],
                    scroll : JQ(window).scrollTop()
                });
            }
        });
    }
    socketSend({
        height : JQ(window).height(),
        width  : JQ(window).width()
    });
}
function loopForNonMutationSupportedBrowsers() {
    setTimeout(function() {
        initializeIE();
        loopForNonMutationSupportedBrowsers();
    }, loopDelay);
}

function switchSession(channelIds, type) {
    JQ.ajax({
        url         : CDN + 'getSession.json?set=' + channelIds + '&browse=' + type,
        type        : 'GET',
        crossDomain : true,
        dataType    : 'jsonp',
        success     : function() {
            socket.emit('clientSessionChange', {
                'sessionType' : type,
                'by'          : 'client',
                channelId     : channelIds
            });
        }
    });
}

function ContinueSession(data) {
    if(isInit) {

        var channelIds = "";
        var type = "";

        if(typeof data == 'object') {
            channelIds = data['channelIds'];
            type = data['type'];
        } else {
            data = data.split(';');

            channelIds = data[0];
            type = data[1];
        }

        JQ('#sharingURL').val(CDN + channelIds + '/admin.html?sessionId=' + channelIds);
        switchSession(channelIds, type);
        if(socket) {
            startMirroring();
        } else {
    socket = io.connect(SocketCDN,{transports: ['websocket'],
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax' : 5000,
    'reconnectionAttempts': 5});
            socket.on('connect', function() {
                JQ('.cobrowse-boundary').show();
                JQ('.AdminMousePosition').show();
                socket.emit('clientJoinChannel', {
                    channelId : channelIds,
                    type      : 'client'
                });
                startInitiateCoBrowse(channelIds);
                switchSession(channelIds, type);
                socket.emit('clientHandshake', {channelId : channelIds});
            });
        }

    } else {
        setTimeout(function() {
            ContinueSession(data);
        }, 1000);
    }

}

function startInitiateCoBrowse(channelId) {
    channelIds = channelId;
    socket.emit('clientPageChanged', {channelId : channelId});

    try {
        startMirroring();
    } catch(E) {
        //        console.log(E);
    }
    socket.on(channelId, function(msg) {
        var message = JSON.parse(msg);
        var action = message.action;
        var data = message.msg;
        switch(action) {
            case 'adminGetSession' :
                socket.emit('clientAccepted', {channelId : channelId});
                startMirroring();
                socketSend({
                    height : JQ(window).height(),
                    width  : JQ(window).width()
                });
                isClientInitiatedHandshake = true;
                break;

            case 'adminRequestReloadUI':
                initializeIE();
                break;

            case 'adminHandshake':
                isMirrored = false;
                if(isClientInitiatedHandshake) {
                    isClientInitiatedHandshake = false;
                    socket.emit('clientHandshake', {channelId : channelId});
                }
                if(data.height) {
                    agentHeight = data.height;
                    agentWidth = data.width;
                    medium = data.medium ? data.medium : null;
                    window.parent.ResizePreview(agentWidth, agentHeight,medium);
                } else {
                    socketSend({
                        height : JQ(window).height(),
                        width  : JQ(window).width()
                    });
                }
                if(JQ('.AdminMousePosition').size() == 0) {
                    setTimeout(function() {
                        JQ('body').append('<div class="AdminMousePosition" ' + 'style="' + adminMouseStyle + '"' + '></div>');
                    }, 1000);
                }
                SendMouse();
                JQ(this).unbind('scroll');
                setTimeout(function() {
                    JQ(this).scroll(function() {
                        var self = this, THIS = JQ(self);
                        if(THIS.data('scrollTimeout')) {
                            clearTimeout(THIS.data('scrollTimeout'));
                        }
                        THIS.data('scrollTimeout', setTimeout(function() {
                            var scrollTop = JQ(window).scrollTop();
                            if(scrollTop == 0) {
                                scrollTop = 1;
                            }
                            socketSend({scroll : scrollTop});
                        }, 250, self));
                    });
                }, 1000);

                break;

            case 'adminLeaveChannel':
                if(typeof(
                    handleVisitorLeftSession
                    ) == "function") {
                    handleVisitorLeftSession();
                }
                break;

            case 'adminMousePosition' :
                JQ('.AdminMousePosition').css({
                    'left' : data.PositionLeft - 15,
                    'top'  : data.PositionTop
                });
                break;

            case 'adminClick':
                if(message.tabId == tabId) {
    				if((!!window.MSInputMethodContext && !!document.documentMode) || IE(10)){
            			var obj=document.evaluate(data['data']['xpath'], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
            			obj=JQ(obj)
                    }
    				else{
    					var obj = JQ(document).xpath(data['data']['xpath']);
                    }


                     if(obj[0] instanceof SVGElement){

                     if (typeof(Event) == 'function') {
                        var event = document.createEvent("SVGEvents");
                        event.initEvent("click",true,true);
                        obj[0].dispatchEvent(event);
                        }
                        else{

                    	function CustomEvent ( event, params ) {
                        	params = params || { bubbles: false, cancelable: false, detail: undefined };
                        	var evt = document.createEvent( 'CustomEvent' );
                        	evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                        	return evt;
                            };

                            var event = CustomEvent('SVGEvents');
                            event.initEvent("click",true,true);
                            obj[0].dispatchEvent(event);
                        }
                     }
                    else{
                    obj[0].focus();
                    obj[0].click();
                    }


    if($(obj[0]).hasClass('ui-slider') || $(obj[0]).hasClass('dijitSliderBar')) {
                        var evt = mouseEvent("mousedown",
                            data['data'].screenX,
                            data['data'].screenY,
                            data['data'].clientX,
                            data['data'].clientY);
                        dispatchEvent(obj[0], evt);

                        var evt = mouseEvent("mouseup",
                            data['data'].screenX,
                            data['data'].screenY,
                            data['data'].clientX,
                            data['data'].clientY);
                        dispatchEvent(obj[0], evt);
                    }

                }
                break;

            case 'adminMouseEnter':
                if(!isIE(8, 'lte')) {
                 	if((!!window.MSInputMethodContext && !!document.documentMode) || IE(10)) {
    					var obj =  document.evaluate(data['data'], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    	obj=JQ(obj);
                   		obj.mouseenter();
               		}
   					else{
    					var obj = JQ(document).xpath(data['data']);
    					obj.mouseenter();
    				}
    			}
                break;

            case 'adminMouseLeave':
            	    if(!isIE(8, 'lte')) {
   						if((!!window.MSInputMethodContext && !!document.documentMode) || IE(10)) {
                    		var obj = document.evaluate(data['data'], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    		obj=JQ(obj);
               				obj.mouseleave();
               			}
  						else{
   							var obj = JQ(document).xpath(data['data']);
  							obj.mouseleave();
                		}
                	}
                	break;
            case 'adminKeyPress':
                if(message.tabId == tabId) {
                    var d = data.data;
                    if(d == '^d13') {

                    } else {
    					if((!!window.MSInputMethodContext && !!document.documentMode) || IE(10)) {
                			var obj = document.evaluate(data['div'], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                			obj=JQ(obj)[0]
        				}
    					else{
                        	var obj = JQ(document).xpath(data['div'])[0];
    						}
                        if(obj && obj.nodeName == 'SELECT') {
                            try {
                                obj.val(d);
                            } catch(e) {
                                JQ(obj).val(d);
                            }
                        } else if(obj && obj.nodeName != 'HTML' && obj.nodeName != 'BODY') {
                            JQ(obj).val(d);
                            JQ(obj).focus();
                            //JQ(obj).html(d);   this causes script injection so removing it.
                            JQ(obj).keypress();
                            JQ(obj).keyup();
                            JQ(obj).keydown();
                        }
                    }
                }
                break;

            case 'adminScroll' :
                if(message.tabId == tabId) {
                    if(data.change.scroll) {
                        JQ(window).unbind('scroll');
                        JQ(window).scrollTop(data.change.scroll);
                        setTimeout(function() {
                            JQ(this).scroll(function() {
                                var self = this, THIS = JQ(self);
                                if(THIS.data('scrollTimeout')) {
                                    clearTimeout(THIS.data('scrollTimeout'));
                                }
                                THIS.data('scrollTimeout', setTimeout(function() {
                                    var scrollTop = JQ(window).scrollTop();
                                    if(scrollTop == 0) {
                                        scrollTop = 1;
                                    }
                                    socketSend({scroll : scrollTop});
                                }, 250, self));
                            });
                        }, 500);
                    }
                }
                break;

            case 'adminDOMLoaded'  :
                BindEverything();
                break;

            case 'clientMousePosition':
                activeTabId = data.tabId;
                break;

            case 'adminLocationChange':
                if(data == 'back') {
                    history.back();
                } else if(data == 'forward') {
                    history.forward();
                }
                break;
        }
    });

    socket.on('sessionTimedOut', function() {
        JQ('.cobrowse-boundary').remove();
        JQ('.AdminMousePosition').remove();
        console.log('Connection Timed Out !');
        disconnect();

        if(typeof handleScreenShareTimeout == 'function') {
            handleScreenShareTimeout();
        }
        //        alert('Connection Timed Out !');
    });
}

function PrepareSessionChannel(cobrowse, urlSendCallBack, userDataSaveCallBack, nemoCobrowseId, timeOut, callback) {
    if(JQ('#MenuTable #sharingURL').val() + "" == "") {
        JQ.ajax({
            url         : CDN + 'getSession.json?get=' + (new Date()).getMilliseconds() + '&browse=' + cobrowse + '&nemoCobrowseId=' + nemoCobrowseId,
            type        : 'GET',
            crossDomain : true,
            dataType    : 'jsonp',
            success     : function(response) {
                channelIds = response.sessionId;
                JQ('#MenuTable #sharingURL').val(response.sharingURL + '?sessionId=' + channelIds);
                JQ('.cobrowse-boundary').show();
                JQ('.AdminMousePosition').show();
                try {
                    urlSendCallBack(JQ('#MenuTable #sharingURL').val());
                } catch(e) {
                    //                    console.log(e);
                }

                var event = {
                    'channelId'  : 'red sky 5',
                    'cookieData' : response.sessionId + ';' + response.sessionType
                };
                try {
                    userDataSaveCallBack(event);
                } catch(e) {
                    //                    console.log(e);
                }
                callback();
            }
        });
    } else {
    socket = io.connect(SocketCDN,
    {transports: ['websocket'],
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax' : 5000,
    'reconnectionAttempts': 5});

        socket.on('connect', function() {
            socket.emit('clientJoinChannel', {
                channelId : channelIds,
                type      : 'client'
            });
            socket.emit('clientGetSession', {
                sessionId : channelIds,
                channelId : channelIds
            });
            startInitiateCoBrowse(channelIds);
        });
        socket.on('disconnect', function() {
            socketConnectTimeInterval = setInterval(function() {
                socket.socket.reconnect();
                if(socket.socket.connected) {
                    clearInterval(socketConnectTimeInterval);
                }
            }, 3000);
        });

    }
}

function CreateSession(cobrowse, urlSendCallBack, userDataSaveCallBack, nemoCobrowseId, timeOut) {
    PrepareSessionChannel(cobrowse, urlSendCallBack, userDataSaveCallBack, nemoCobrowseId, timeOut, function() {
        if(socket) {
            socket.emit('clientSessionChange', {
                'sessionType' : cobrowse,
                'by'          : 'client',
                channelId     : channelIds
            });
        }

    socket = io.connect(SocketCDN,
    {transports: ['websocket'],
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax' : 5000,
    'reconnectionAttempts': 5});
        socket.on('connect', function() {
//            socket.emit('clientJoinChannel', {
//                channelId : channelIds,
//                type      : 'client'
//            });

            socket.emit('clientJoinChannel', {
                channelId : channelIds,
                type      : 'client',
                timeOut   : timeOut
            });
            socket.emit('clientGetSession', {
                sessionId : channelIds,
                channelId : channelIds
            });

            startInitiateCoBrowse(channelIds);

        });
    });
}

function applyChange(removed, addedOrMoved, attributes, text, applyChangeCurrentIdx) {
    if(applyChangeIdx == applyChangeCurrentIdx) {
        //        for(var i = 0 ; i < attributes.length ; i++) {
        //            if(attributes[i]['attributes'] && attributes[i]['attributes']['style']) {
        //                var style = attributes[i]['attributes']['style'];
        //                var style = "{\"".concat(style.replace(/\"/g, "\\\"").replace(/: /g, "\": \"").replace(/; /g,
        //                    "\",\"").concat("\"}")).replace(',""', '');
        //                var styleObj = eval("(" + style + ")");
        //                if(styleObj['opacity']) {
        //                    styleObj['opacity'] = roundFigure(styleObj['opacity'], 1);
        //                    style = JSON3.stringify(styleObj);
        //                    style = style.replace("{\"", "").replace("\"}", "").replace(/\":\"/g, ":
        // ").replace(/\",\"/g, "; ").replace(/\\\"/g, "\"").replace(/\":/g, ":").replace(/,\"/g, ",");
        // attributes[i]['attributes']['style'] = style; } } } var change = JSON3.stringify([removed, addedOrMoved,
        // attributes, text]); if(!(change == lastChange || change == secondChange)) { secondChange = lastChange;
        // lastChange = change;
        socketSend({
            f    : 'applyChanged',
            args : [removed, addedOrMoved, attributes, text]
        });
        if(window.cobrowseUser && window.cobrowseUser == 'afv'){
            parent.window.saveSnapshot();
        }
        //        }
    }
}

function SendMouse() {
    if(!sendMouse) {
        sendMouse = true;
        socket.emit('clientMousePosition', {
            PositionLeft : 0,
            PositionTop  : -5,
            channelId    : channelIds,
            tabId        : tabId
        });

        document.onmousemove = function(e) {
            if(!e) e = window.event;

            if(e.pageX == null && e.clientX != null) {
                var doc = document.documentElement, body = document.body;
                e.pageX = e.clientX + (
                    doc && doc.scrollLeft || body && body.scrollLeft || 0
                    ) - (
                    doc.clientLeft || 0
                    );
                e.pageY = e.clientY + (
                    doc && doc.scrollTop || body && body.scrollTop || 0
                    ) - (
                    doc.clientTop || 0
                    );
            }

            socket.emit('clientMousePosition', {
                PositionLeft : e.pageX,
                PositionTop  : e.pageY - 5,
                channelId    : channelIds,
                tabId        : tabId
            });

            if(tabId != activeTabId && activeTabId != 0) {
                activeTabId = tabId;
                sendCurrentUrl();
                initializeIE();
            }
        };

        var emitKeyDown = function() {
            socket.emit('clientKeyPress', {
                channelId : channelIds
            });
        };

        document.onkeypress = emitKeyDown;
        document.onkeydown = emitKeyDown;
    }
}

function BindEverything() {
    setInterval(function(){
        JQ(':input').each(function() {
            JQ(this).attr('value', this.value);
            if(this.getAttribute('value')!==this.value){
                this.setAttribute('value', this.value)
            }
        });
    }, 1000);

    JQ(':input').bind('keyup', function() {
        JQ(this).attr('value', this.value);
    });

    JQ(":input[type='text']").focus(function() {
        JQ(this).attr('value', this.value);
    });

    JQ(":input[type='text']").blur(function() {
        JQ(this).attr('value', this.value);
    });

    JQ(':input').bind('change', function() {
        if(JQ(this).attr('type') == 'radio') {
            JQ(":input[name='" + JQ(this).attr('name') + "']").removeAttr('checked');
            JQ(this).attr('checked', 'checked');
            JQ(this).prop('checked', 'checked');
        } else if(JQ(this).attr('type') == 'checkbox') {
            if(JQ(this).prop('checked')) {
                JQ(this).attr('checked', true);
                JQ(this).prop('checked', true);
            } else {
                JQ(this).attr('checked', false);
                JQ(this).prop('checked', false);
            }
        } else if(JQ(this).attr('type') == 'text') {
            JQ(this).attr('value', this.value);
        }
    });
    JQ('select').bind('change', function() {
        var THIS = this;
        var sel = JQ(THIS).find('option:selected');
        JQ(THIS).val('');
        sel.attr('selected', 'selected');
        var value = sel.val() || sel.name();
        JQ(THIS).val(value);
        setTimeout(function() {
            JQ(THIS).find('option').not(sel).removeAttr('selected');
        }, 500);

    });
}

function AddMenu() {
    var style = "display: none; border: 2px solid #008000; height: 100%; position: fixed;top: 0px; width: 100%; z-index: 999999; left: 0px";
    JQ('body').prepend('<div class="cobrowse-boundary cobrowse-boundary-left" style="' + style + '"></div>');
    JQ('body').prepend('<div class="cobrowse-boundary cobrowse-boundary-top" style="' + style + '"></div>');
    JQ('body').prepend('<div class="cobrowse-boundary cobrowse-boundary-right" style="' + style + '"></div>');
    JQ('body').prepend('<div class="cobrowse-boundary cobrowse-boundary-bottom" style="' + style + '"></div>');
    JQ('body').append('<div id="MenuTable" style="display: none;"><input id="sharingURL" readonly="readonly" /></div>');
    JQ('.AdminMousePosition').show();
    JQ('.cobrowse-boundary-left:eq(0)').css({
        'height' : JQ(window).height() + 'px',
        'width'  : '0px'
    });
    JQ('.cobrowse-boundary-top:eq(0)').css({
        'height' : '0px',
        'width'  : (
            JQ(window).width() - 8
            ) + 'px'
    });
    JQ('.cobrowse-boundary-right:eq(0)').css({
        'height'      : JQ(window).height() + 'px',
        'width'       : '0px',
        'margin-left' : (
            JQ(window).width() - 4
            ) + 'px'
    });
    JQ('.cobrowse-boundary-bottom:eq(0)').css({
        'height'     : '0px',
        'width'      : (
            JQ(window).width()
            ) + 'px',
        'margin-top' : (
            JQ(window).height() - 4
            ) + 'px'
    });
    JQ(window).resize(function() {
        JQ('.cobrowse-boundary-left:eq(0)').css({
            'height' : JQ(window).height() + 'px',
            'width'  : '0px'
        });
        JQ('.cobrowse-boundary-top:eq(0)').css({
            'height' : '0px',
            'width'  : (
                JQ(window).width() - 8
                ) + 'px'
        });
        JQ('.cobrowse-boundary-right:eq(0)').css({
            'height'      : JQ(window).height() + 'px',
            'width'       : '0px',
            'margin-left' : (
                JQ(window).width() - 4
                ) + 'px'
        });
        JQ('.cobrowse-boundary-bottom:eq(0)').css({
            'height'     : '0px',
            'width'      : (
                JQ(window).width()
                ) + 'px',
            'margin-top' : (
                JQ(window).height() - 4
                ) + 'px'
        });
    });
}

function disconnect() {
    if(socket) {
        JQ('.cobrowse-boundary').remove();
        JQ('#MenuTable').hide();
        JQ('#MenuTable #sharingURL').val("");
        JQ('.AdminMousePosition').remove();

        document.cookie = "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

        socket.emit('clientLeaveChannel', {
            channelId : channelIds
        });

        socket.disconnect();
    } else {
        setTimeout(function() {
            disconnect();
        }, 1000);
    }
}

function mouseEvent(type, sx, sy, cx, cy) {
    var evt;
    var e = {
        bubbles       : true,
        cancelable    : (type != "mousemove"),
        view          : window,
        detail        : 0,
        screenX       : sx,
        screenY       : sy,
        clientX       : cx,
        clientY       : cy,
        ctrlKey       : false,
        altKey        : false,
        shiftKey      : false,
        metaKey       : false,
        button        : 0,
        relatedTarget : undefined
    };
    if(typeof( document.createEvent ) == "function") {
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(type,
            e.bubbles,
            e.cancelable,
            e.view,
            e.detail,
            e.screenX,
            e.screenY,
            e.clientX,
            e.clientY,
            e.ctrlKey,
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,
            document.body.parentNode);
    } else if(document.createEventObject) {
        evt = document.createEventObject();
        for(prop in e) {
            evt[prop] = e[prop];
        }
        evt.button = {
            0 : 1,
            1 : 4,
            2 : 2
        }[evt.button] || evt.button;
    }
    return evt;
}

function dispatchEvent(el, evt) {
    if(el.dispatchEvent) {
        el.dispatchEvent(evt);
    } else if(el.fireEvent) {
        el.fireEvent('on' + type, evt);
    }
    return evt;
}

function sendCurrentUrl() {
    socket.emit('clientCurrentUrl', {
        url       : location.href,
        channelId : channelIds
    });
}

if(navigator.userAgent.indexOf("Safari") > -1 || navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf('MSIE 1') > -1) {
    (function() {
        var c = window.console.log;
        window.console.log = function() {
            c.apply(window.console, arguments);
        }
    })();
}

function cs() {
    //    function CreateSession(cobrowse, urlSendCallBack, userDataSaveCallBack, nemoCobrowseId, timeOut)
    CreateSession('cobrowse', console.log, JSON.stringify, 'nemoCobrowseId', 6000000);
}

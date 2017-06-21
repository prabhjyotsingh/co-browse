function assignCookie() {

    var cookie = document.referrer;
    var sessionIdValue = cookie.split("sessionId=");
    var sessionId = sessionIdValue[1].split(/&(.+)/);
    document.cookie = "sessionId="+sessionId[0]+ ";domain=247-inc.net;path=/";
}

assignCookie()

var mirror = Object();
var SessionKey;
var currentInputBox;

var iOS = false, p = navigator.platform;

if(p === 'iPad' || p === 'iPhone' || p === 'iPod' || p === 'iPhone Simulator' || p === 'iPad Simulator') {
    iOS = true;
}

if(typeof Object.keys != 'function') {
    Object.keys = function(data) {
        var arr = [];
        for(var prop in data) {
            if(data.hasOwnProperty(prop)) {
                arr.push(prop);
            }
        }
        return arr;
    }
}

var SocketEmit = function(channel, data) {
    if(typeof window.parent.SocketEmit == "function") {
        window.parent.SocketEmit(channel, data);
    } else {
        setTimeout(function() {
            SocketEmit(channel, data);
        }, 1000);
    }
};

function SendMouse() {
    document.onmousemove = function(e) {
        if(!e) e = window.event;

        if(e.pageX == null && e.clientX != null) {
            var doc = document.documentElement, body = document.body;

            e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);

            e.pageY = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
        }
        SocketEmit('adminMousePosition', {
            PositionLeft : e.pageX,
            PositionTop  : e.pageY - 15,
            room         : SessionKey,
            channelId    : SessionKey,
            sessionType  : window.parent.view_mode
        });
    }
}

function leaveSession(key) {
    SocketEmit('adminLeaveChannel', {channelId : key});
}

function getSession(key) {
    SessionKey = key;
    SocketEmit('adminHandshake', {channelId : SessionKey});
    SocketEmit('adminJoinChannel', {
        channelId : key,
        type      : 'agent'
    });
    SessionStarted();
    SocketEmit('adminGetSession', {
        channelId   : SessionKey,
        sessionType : window.parent.view_mode
    });

}

function flushWindow() {
    while(document.firstChild) {
        document.removeChild(document.firstChild);
    }
    var base;
    mirror = new TreeMirror(document, {
        createElement : function(tagName) {
            if(tagName == 'SCRIPT') {
                var node = document.createElement('NO-SCRIPT');
                node.style.display = 'none';
                return node;
            }

            if(tagName == 'HEAD') {
                var node = document.createElement('HEAD');
                node.appendChild(document.createElement('BASE'));
                node.firstChild.href = base;
                return node;
            }
        }
    });
}

function registerFunction() {
    JQ(document).click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        SocketEmit('adminClick', {
            data        : {
                xpath   : myArrayToString(getXPath(e.target)),
                screenX : e.screenX,
                screenY : e.screenY,
                clientX : e.clientX,
                clientY : e.clientY
            },
            channelId   : SessionKey,
            sessionType : window.parent.view_mode
        });
    });

    JQ('*').on('mouseenter', JQ.debounce(500, function(e) {
        SocketEmit('adminMouseEnter', {
            data        : myArrayToString(getXPath(e.target)),
            channelId   : SessionKey,
            sessionType : window.parent.view_mode
        });
    }));

    JQ('*').on('mouseleave', JQ.debounce(500, function(e) {
        SocketEmit('adminMouseLeave', {
            data        : myArrayToString(getXPath(e.target)),
            channelId   : SessionKey,
            sessionType : window.parent.view_mode
        });
    }));

    JQ(document).keyup(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    JQ(':input').blur(function(e) {
        var div = myArrayToString(getXPath(e.target));
        var text = JQ(e.target).val() || JQ(e.target).html();

        if(JQ(e.target).attr('type') == 'text') {
            text = JQ(e.target).val();
        }
        SocketEmit('adminKeyPress', {
            data        : text,
            div         : div,
            channelId   : SessionKey,
            sessionType : window.parent.view_mode
        });
    });

    JQ(document).keyup(JQ.debounce(500, function(e) {
        if(JQ(e.target)[0].nodeName == 'BODY') {
            return;
        }
        var div = myArrayToString(getXPath(e.target));
        if(e.which == 13) {
            e.preventDefault();
            e.stopPropagation();
            SocketEmit('adminKeyPress', {
                data        : "^d13",
                div         : div,
                channelId   : SessionKey,
                sessionType : window.parent.view_mode
            });
        }
        var text = JQ(e.target).val() || JQ(e.target).html();

        if(JQ(e.target).attr('type') == 'text') {
            text = JQ(e.target).val();
        }
        currentInputBox = e.target;
        SocketEmit('adminKeyPress', {
            data        : text,
            div         : div,
            channelId   : SessionKey,
            sessionType : window.parent.view_mode
        });
        setTimeout(function() {
            currentInputBox = undefined;
        }, 5000);
    }));
    setTimeout(function() {
        JQ('select').bind('change', function(e) {
            var div = myArrayToString(getXPath(e.target));
            var sel = JQ(this).find('option:selected');
            var value = sel.val() || sel.name();
            SocketEmit('adminKeyPress', {
                data        : value,
                div         : div,
                channelId   : SessionKey,
                sessionType : window.parent.view_mode
            });
        });
    }, 5000);

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

            SocketEmit('adminScroll', {
                change      : {scroll : scrollTop},
                room        : SessionKey,
                channelId   : SessionKey,
                sessionType : window.parent.view_mode
            });
        }, 250, self));
    });

    if(iOS) {
        document.addEventListener("touchmove", ScrollStart, false);

        function ScrollStart() {
            var self = this, THIS = JQ(self);
            if(THIS.data('scrollTimeout')) {
                clearTimeout(THIS.data('scrollTimeout'));
            }
            THIS.data('scrollTimeout', setTimeout(function() {
                SocketEmit('adminScroll', {
                    change      : {scroll : window.parent.JQ(window.parent).scrollTop()},
                    room        : SessionKey,
                    channelId   : SessionKey,
                    sessionType : window.parent.view_mode
                });
            }, 250, self));

        }
    }
}

function setMirror(type, data) {
    mirror[type].apply(mirror, data);
    resetScroll();
    setTimeout(function() {
        JQ('div.cobrowse-boundary-left:eq(0)').hide();
        JQ('div.cobrowse-boundary-top:eq(0)').hide();
        JQ('div.cobrowse-boundary-right:eq(0)').hide();
        JQ('div.cobrowse-boundary-bottom:eq(0)').hide();
    }, 500);
}

function resetScroll(scr) {
    JQ(window).unbind('scroll');
    if(iOS) {
        window.parent.JQ(window.parent).scrollTop(scr);
    } else {
        JQ(window).scrollTop(scr);
    }

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
                SocketEmit('adminScroll', {
                    change      : {scroll : scrollTop},
                    room        : SessionKey,
                    channelId   : SessionKey,
                    sessionType : window.parent.view_mode
                });
            }, 250, self));
        });

    }, 500);
}

function SessionStarted() {
    while(document.firstChild) {
        document.removeChild(document.firstChild);
    }
    var base;
    mirror = new TreeMirror(document, {
        createElement : function(tagName) {
            if(tagName == 'SCRIPT') {
                var node = document.createElement('NO-SCRIPT');
                node.style.display = 'none';
                return node;
            }

            if(tagName == 'HEAD') {
                var node = document.createElement('HEAD');
                node.appendChild(document.createElement('BASE'));
                node.firstChild.href = base;
                return node;
            }
        }
    });
}

function getXPath(node, path) {
    path = path || [];
    if(node.parentNode) {
        path = getXPath(node.parentNode, path);
    }

    if(node.previousSibling) {
        var count = 1;
        var sibling = node.previousSibling
        do {
            if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
                count++;
            }
            sibling = sibling.previousSibling;
        } while(sibling);
        if(count == 1) {
            count = null;
        }
    } else if(node.nextSibling) {
        var sibling = node.nextSibling;
        do {
            if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
                var count = 1;
                sibling = null;
            } else {
                var count = null;
                sibling = sibling.previousSibling;
            }
        } while(sibling);
    }

    if(node.nodeType == 1) {
        var nodeName=node.nodeName.toLowerCase();
        if(node instanceof SVGElement){
            nodeName = '*[local-name()="'+ nodeName +'"]'
        }
        path.push(nodeName + (count > 0 ? "[" + count + "]" : ''));

    }
    return path;
};

function myArrayToString(arr, delimeter) {
    if(!delimeter) {
        delimeter = "/";
    }
    var str = "//";
    for(var i = 0 ; i < arr.length ; i++) {
        if(arr[i][arr[i].length - 1] != ']') {
            str += arr[i] + '[1]' + delimeter;
        } else {
            str += arr[i] + delimeter;
        }
    }
    str = str.substr(0, str.length - 1);
    if(str[str.length - 1] != ']') {
        str += '[1]';
    }
    return str;
}
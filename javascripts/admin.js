var frame = JQ('#ClientView')[0].contentWindow;

var socket;
var SessionKey;
var lastChange = '';
var hashIndex = 0;
var currentHash = 0;
var isAdminLocationChanged = false;
var isClientJoined = false;
var view_mode;
var clientTimedOut;
var isResponseReceived = false;
var allowedModeMap = {
    'CO_BROWSE' : 'cobrowse',
    'CO_VIEW'   : 'coview',
    'SILENT'    : 'silent'
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

function SocketEmit(channel, data) {
    socket.emit(channel, data);
}

function StartSession() {
    JQ('.navbar-form .btn:eq(0)').remove();
    JQ('.navbar-form .btn:eq(0)').show();
    SessionKey = JQ('#SessionKey').val();
    if(isDevAuth) {
        AuthSuccess();
    } else {
        JQ.ajax({
                    type        : "GET",
                    url         : decodeURIComponent(getParameterByName('authUrl')),
                    dataType    : "jsonp",
                    cache       : false,
                    crossDomain : true,
                    processData : true,

                    success : function(data) {
                        if(data.hasPreviledges) {

                            view_mode = allowedModeMap[data['currentMode']];
                            if(!view_mode || (view_mode != 'silent' && view_mode != 'coview')) {
                                view_mode = 'cobrowse';
                            }

                            switchBrand();

                            if(data.allowedModes && data.allowedModes.length > 1) {
                                for(var i = 0 ; i < data.allowedModes.length ; i++) {
                                    JQ('#viewModeId').append('<option value="' + allowedModeMap[data.allowedModes[i]] +
                                                             '">' + data.allowedModes[i] + '</option>')
                                }
                                JQ('#viewModeId').val(allowedModeMap[data.currentMode]);
                                //                        JQ('#viewModeId').show();
                            }
                            AuthSuccess();
                        } else {
                            AuthFailed();
                        }

                    },
                    error   : function(XMLHttpRequest, textStatus, errorThrown) {
                        AuthFailed();
                    }
                });
    }
}

function AuthFailed() {
    alert('You are not authorized to view this Co-Browse session.');
}

function AuthSuccess() {
//For loading preview.js
    var getSessionID= setInterval(function(){
        if(JQ('#ClientView')[0].contentWindow && JQ('#ClientView')[0].contentWindow.getSession){
            JQ('#ClientView')[0].contentWindow.getSession(SessionKey);
            clearInterval(getSessionID);
        }
        else{
            console.log("Preview not loaded")
        }
        }, 500);

    socket.on(SessionKey, function(msg) {
        var message = JSON.parse(msg);
        var action = message.action;
        var data = message.msg;
        switch(action) {

            case 'clientHandshake':
                isClientJoined = true;
                SocketEmit('adminHandshake', {channelId : SessionKey});
                break;

            case 'clientDeclined':
                console.info(message.msg);
                socket.disconnect();
                break;
            case 'clientAccepted':
                console.log(message.msg);
                clientTimedOut = message.timeOut;
                break;

            case 'clientGetSession':
                console.log('clientGetSession');
                frame.SendMouse();
                break;

            case 'sessionChange':
                console.info(message.msg);
                break;

            case 'clientLeaveChannel':
                console.info(message.msg);
                JQ('html').html('');
                window.close();
                break;

            case 'clientSessionChange':
                if(message.type != view_mode) {
                    view_mode = message.type;
                    alert(message.msg);
                }
                switchBrand();
                break;

            case 'clientPageUnload':
                JQ('#loader').show();
                isResponseReceived = false;
                setTimeout(function() {
                    if(!isResponseReceived) {
                        JQ('#loader').show();
                        JQ('#loader .loadImg').remove();
                        JQ('#loader span').html("Client Timed out").css('left', '45px');
                        JQ('#ClientView').remove();
                        socket.disconnect();
                    }
                }, clientTimedOut);
                break;

            case 'clientPageChanged':
                frame.flushWindow();

            case 'clientChanges':
                isClientJoined = true;
                if(data.change) {
                    if(data.change.base && data.change.f == 'initialize') {
                        base = data.change.base;
                        if(!isAdminLocationChanged) {
                            location.hash = hashIndex++;
                            currentHash = location.hash;
                        }
                        isAdminLocationChanged = false;
                    }
                    if(data.change.height) {
                        ResizePreview(data.change.width, data.change.height);
                    }
                    if(data.change.args) {
                        if(data.change.f == 'initializeIE') {

                            var change = JSON.stringify(data.change.args);
                            if(lastChange != change) {
                                lastChange = change;

                                frame.flushWindow();
                                frame.setMirror('initialize', data.change.args)

                                setTimeout(function() {
                                    frame.registerFunction();
                                    JQ(frame.document).find('head').append('<link rel="stylesheet" href="/stylesheets/preview.css">')
                                }, 1000);

                                JQ('#loader', window.parent.document).hide();

                                if(data.change.scroll) {
                                    frame.resetScroll(data.change.scroll);
                                }
                            }
                        } else {
                            if(data.change.f == 'initialize') {
                                SocketEmit('adminDOMLoaded',
                                           {
                                               room      : SessionKey,
                                               channelId : SessionKey
                                           });
                                JQ('#loader').hide();
                                isResponseReceived = true;
                                setTimeout(function() {
                                    frame.registerFunction();
                                    JQ(frame.document).find('head').append('<link rel="stylesheet" href="/stylesheets/preview.css">')
                                }, 1000);
                            }
                            frame.setMirror(data.change.f, data.change.args);
                        }
                    }
                    if(data.change.scroll) {
                        frame.resetScroll(data.change.scroll);
                    }
                }
                break;

            case 'clientMousePosition':
                MoveMouse(data.PositionLeft, data.PositionTop - JQ(frame.document).scrollTop());
                break;

        }
//        frame.removeAdminMouse();
    });

    socket.on('sessionTimedOut', function() {
        socket.disconnect();
        alert('Connection Timed Out!');
    });
}

function LeaveSession() {
    JQ('#ClientView')[0].contentWindow.leaveSession(JQ('#SessionKey').val());
    JQ('html').html('');
}

function ResizePreview(width, height) {
    JQ('#ClientView').width(width);
    JQ('#ClientView').height(height);
}

function MoveMouse(x, y) {
    JQ('.ClientPointer').css({
                                 'left' : x - 15,
                                 'top'  : y + 30
                             });
}

JQ(document).ready(function() {
    JQ('.btn:eq(1)').show();

    JQ('form').attr('onsubmit', 'return false');

    if(JQ('#SessionKey').val().split('?').length > 1) {
        JQ('#SessionKey').val(JQ('#SessionKey').val().split('?')[0]);
    }

    JQ('#SessionKey').keydown(function(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            e.stopPropagation();
            StartSession();
        }
    });
    socket = io.connect(JQ('#host').val().trim(),
                        {
                            transports: ['websocket'],
                            'reconnection': true,
                            'reconnectionDelay': 1000,
                            'reconnectionDelayMax' : 5000,
                            'reconnectionAttempts': 5
                        });

    socket.on('connect', function() {
        try {
            frame.SendMouse();
        } catch(e) {

        }

        StartSession();
    });

    window.onhashchange = function() {
        if(currentHash != location.hash) {
            if(currentHash > location.hash) {
                SocketEmit('adminLocationChange',
                           {
                               action      : 'back',
                               channelId   : SessionKey,
                               sessionType : view_mode
                           });
            } else {
                SocketEmit('adminLocationChange',
                           {
                               action      : 'forward',
                               channelId   : SessionKey,
                               sessionType : view_mode
                           });
            }
            currentHash = location.hash;
            isAdminLocationChanged = true;
        }
    };

    JQ('#viewModeId').change(function() {
        view_mode = JQ(this).val();
        var url = decodeURIComponent(getParameterByName('authUrl'));
        url = url.replace('/authorize?', '/switchmode?');
        url = url + '&toMode=' + JQ('#viewModeId option:selected').text();
        JQ.ajax({
                    type        : "GET",
                    url         : url,
                    dataType    : "jsonp",
                    cache       : false,
                    crossDomain : true,
                    processData : true,
                    success     : function(data) {
                    },
                    error       : function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log(textStatus);
                        console.log(errorThrown);
                        alert('Error while requesting switch mode');
                    }
                });
    });

    function closeEditorWarning() {
        return 'It looks like you have been editing something -- if you leave before submitting your changes will be lost.'
    }

    window.onbeforeunload = closeEditorWarning

});

function reloadUI() {
    SocketEmit('adminRequestReloadUI', {channelId : SessionKey});
}

function switchBrand() {
    console.log("swithch brand function")
    if(view_mode == 'coview') {
        JQ('.brand').html('Co-View Session');
    } else if(view_mode == 'silent') {
        JQ('.brand').html('Silent-View Session');
    } else {
        JQ('.brand').html('Co-Browse Session');
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    }
}
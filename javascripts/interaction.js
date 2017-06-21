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

JQ('form').submit(false);

JQ('.send_blue_btn').click(function() {
    var text = JQ('.form-control').val();
    JQ('.form-control').val("");
    var div = "//html[1]/body[1]/div[5]/div[1]/input[1]";
    SocketEmit('adminKeyPress', {data : text, div : div, channelId : SessionKey, sessionType : view_mode});
});

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
    SessionKey = JQ('#SessionKey').val();
    AuthSuccess();
}

function AuthSuccess() {
    JQ('#ClientView')[0].contentWindow.getSession(SessionKey);
    setTimeout(function() {
        if(!isClientJoined) {
            alert('This ' + JQ('.brand').html().trim() + ' has been terminated.');
            JQ('#ClientView')[0].contentWindow.leaveSession(JQ('#SessionKey').val());
        }
    }, 15000);

    socket.on(SessionKey, function(msg) {
        var message = JSON.parse(msg);
        var action = message.action;
        var data = message.msg;
        switch(action) {

            case 'clientHandshake':
                isClientJoined = true;
                SocketEmit('adminHandshake', {
                    channelId : SessionKey,
                    height    : JQ('#ClientView').css('height'),
                    width     : JQ('#ClientView').css('width')
                });
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
                alert(message.msg);
//                JQ('html').html('');
//                window.close();
                break;

            case 'clientPageUnload':
                JQ('#loader').show();
                isResponseReceived = false;
                setTimeout(function() {
                    if(!isResponseReceived) {
                        JQ('#loader').show()
                        JQ('#loader .loadImg').remove()
                        JQ('#loader span').html("Client Timed out").css('left', '45px');
                        JQ('#ClientView').remove();
                        socket.disconnect();
                    }
                }, clientTimedOut);
                break;

            case 'clientPageChanged':
                frame.flushWindow();

            case 'clientChanges':
                if(data.change) {
                    if(data.change.base && data.change.f == 'initialize') {
                        base = data.change.base;
                        if(!isAdminLocationChanged) {
                            location.hash = hashIndex++;
                            currentHash = location.hash;
                        }
                        isAdminLocationChanged = false;
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
                                SocketEmit('adminDOMLoaded', {room : SessionKey, channelId : SessionKey});
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
}

function LeaveSession() {
    JQ('#ClientView')[0].contentWindow.leaveSession(JQ('#SessionKey').val());
    JQ('html').html('');
}

function MoveMouse(x, y) {
    JQ('.ClientPointer').css({'left' : x - 15, 'top' : y + 30});
}

JQ(document).ready(function() {

    JQ('#ClientView').css('height', JQ(window).height() - 85 + "px");
    JQ('#ClientView').css('width', JQ(window).width() + "px");

    JQ('.btn:eq(1)').show();

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
    socket = io.connect(JQ('#host').val().trim(), {"force new connection" : true, "sync disconnect on unload" : false});

    socket.on('connect', function() {
        frame.SendMouse();
        StartSession();
    });

    window.onhashchange = function() {
        if(currentHash != location.hash) {
            if(currentHash > location.hash) {
                SocketEmit('adminLocationChange', {action : 'back', channelId : SessionKey, sessionType : view_mode});
            } else {
                SocketEmit('adminLocationChange',
                    {action : 'forward', channelId : SessionKey, sessionType : view_mode});
            }
            currentHash = location.hash;
            isAdminLocationChanged = true;
        }
    };

    view_mode = getParameterByName('view_mode');
    if(!view_mode || (view_mode != 'silent' && view_mode != 'coview')) {
        view_mode = 'cobrowse';
    }
    JQ('#viewModeId').val(view_mode);
    //    JQ('#viewModeId').change(function() {
    //        view_mode = JQ(this).val();
    ////        if(view_mode == 'coview') {
    ////            JQ('form.navbar-form').show();
    ////        }
    //    });

    if(view_mode == 'coview') {
        JQ('.brand').html('Co-View Session');
    } else if(view_mode == 'silent') {
        JQ('.brand').html('Silent-View Session');
    } else {
        JQ('.brand').html('Co-Browse Session');
    }

    function closeEditorWarning() {
        return 'It looks like you have been editing something -- if you leave before submitting your changes will be lost.'
    }

    window.onbeforeunload = closeEditorWarning

});

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
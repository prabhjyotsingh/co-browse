var socket = io.connect($('#host').text().trim());

socket.emit('generateChannel','');


socket.on('channelName', function (msg) {

});

socket.on('session', function (msg) {
    socket.on('news', function (news) {
        $("body").append('<br/>' + news);
    });
    socket.on('message', function (msg) {
        $("body").append('<br/>' + msg);
    });
});

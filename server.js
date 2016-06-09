var express = require('express'),
    app     = express(),
    favicon     = require('serve-favicon'),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    port    = process.env.PORT || 1337;

app .use(express.static(__dirname + '/resources'))
    .use(express.static(__dirname + '/www'))
    .use(favicon(__dirname + '/resources/images/favicon.ico'));

var socketio = require('./resources/socketio/main.js');
socketio(io);

server.listen(port);
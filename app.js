var mosca = require('mosca');
var winston = require('winston')

var logger = new (winston.Logger)({transports : [new (winston.transports.Console)({'timestamp': true})]});

var moscaSettings = {port: 1833};

var server = new mosca.Server(moscaSettings)

server.on('ready', function(){
	logger.info('Mosca Server started');
});

server.on('clientConnected', function(client){
	logger.info('Client connected', client.id);
});

server.on('published', function(packet, client){
	logger.info('Received', packet.payload);
});

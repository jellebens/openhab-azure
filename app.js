'use strict';

var mosca = require('mosca');
var winston = require('winston')
var mqttDevice = require('azure-iot-device-mqtt');
var iotDevice = require('azure-iot-device');
var config = require('./config');

var logger = new (winston.Logger)({transports : [new (winston.transports.Console)({'timestamp': true})]});

var moscaSettings = {port: config.mosca.port };

var server = new mosca.Server(moscaSettings)

var protocol = mqttDevice.Mqtt;

var authorized = false;

server.on('ready', function(){
	logger.info('Mosca Server started');
	server.authenticate = authenticate;
	server.authorizePublish = authorizePublish;
	server.authorizeSubscribe = authorizeSubscribe;
});

server.on('clientConnected', function(client){
	logger.info('Client connected', client.id);
});

server.on('published', function(packet, aClient){
	logger.info('published to topic', packet.topic.toString());

	 var deviceId = packet.topic.toString().split('/', 1).toString();
	 var topic = packet.topic.toString().split('/')[1].toString();
	 var data = JSON.stringify({ "payload": packet.payload.toString(), "topic": topic, "DeviceId": deviceId, "TimeStamp": Date() });
	 var message = new iotDevice.Message(data);

	if(aClient){
		client.connectiona.iotclient.sendEvent(message, print('send'));
	
	}else{
		logger.warn('No client element found skipping');
	}


});

var authenticate = function(client, username, password, callback){
	var connection = mqttDevice.clientFromConnectionString(config.iothub.connectionstring, protocol);
        connection.open(function(args){
              client.connectiona = connection;
	      client.user = username;
	      authorized = true;
	      callback(null, authorized);
        });

}

var authorizePublish = function (client, topic, payload, callback) {
    callback(null, true);
}

var authorizeSubscribe = function (client, topic, callback) {
    callback(null, true);
}

 
function print(op){
	return function printResult(err, res) {
        if (err) console.log('IOT: ' + op + ' error: ' + err.toString());
        if (res && (res.statusCode !== 204)) console.log('IOT: ' + op + ' status: ' + res.statusCode + ' ' + res.statusMessage);
    };

}

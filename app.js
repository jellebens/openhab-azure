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

var client = mqttDevice.clientFromConnectionString(config.iothub.connectionstring, protocol);

client.open(function(err){
	if(err){
		logger.info('Could not connect to azure iothub ' + err);
	}else{
		logger.info('Connected to azure hub');
	}
});

server.on('ready', function(){
	logger.info('Mosca Server started');
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
		client.connection.iotclient.sendEvent(message, print('send'));
	
	}else{
		logger.warn('No client element found skipping');
	}


});

function print(op){
	return function printResult(err, res) {
        if (err) console.log('IOT: ' + op + ' error: ' + err.toString());
        if (res && (res.statusCode !== 204)) console.log('IOT: ' + op + ' status: ' + res.statusCode + ' ' + res.statusMessage);
    };

}

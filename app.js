'use strict';

var mosca = require('mosca');
var winston = require('winston')
var mqttDevice = require('azure-iot-device-mqtt');
var iotDevice = require('azure-iot-device');
var config = require('./config');

var logger = new (winston.Logger)({transports : [new (winston.transports.Console)({'timestamp': true})]});

var moscaSettings = { port: config.mosca.port };

var server = new mosca.Server(moscaSettings)


var client = mqttDevice.clientFromConnectionString(config.iothub.connectionstring, protocol);
var protocol = mqttDevice.Mqtt;


var connectCallback = function (err) {
  if (err) {
      logger.error('Could not connect: ' + err.message);
        } else {
	    logger.info('Client connected to azure');
	    client.on('message', function (msg) {
	    logger.Info('Id: ' + msg.messageId + ' Body: ' + msg.data);
	   
	    client.complete(msg, printResultFor('completed'));
	    // reject and abandon follow the same pattern.
	   // /!\ reject and abandon are not available with MQTT
	    });
	}
};

client.open(connectCallback);

server.on('ready', function(){
	logger.info('Mosca Server listening on', config.mosca.port);
	server.authenticate = authenticate;
	server.authorizePublish = authorizePublish;
	server.authorizeSubscribe = authorizeSubscribe;
});

server.on('clientConnected', function(client){
	logger.info('Client connected', client.id);
});

server.on('published', function(packet, aClient){
	logger.info('published to topic', packet.topic.toString());

	 var topic = packet.topic.toString().split('/')[1].toString();
	
	 var data = JSON.stringify({ "payload": packet.payload.toString(), "topic": topic, "DeviceId": config.iothub.deviceId, "TimeStamp": Date() });
	 if(topic == 'openhab'){	
	    var message = new iotDevice.Message(data);
	    client.sendEvent(message, printResultFor('send'));
	}
});

var authenticate = function(client, username, password, callback){
	callback(null, true);

}

var authorizePublish = function (client, topic, payload, callback) {
    callback(null, true);
}

var authorizeSubscribe = function (client, topic, callback) {
    callback(null, true);
}

 
function printResultFor(op){
	return function printResult(err, res) {
         if(err){ 
		logger.error('IOT: ' + op + ' error: ' + err.toString());
	}
        
		

	
    };

}

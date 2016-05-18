'use strict';

var mqtt = require('mqtt');
var winston = require('winston')
var azureClient = require('azure-iot-device-mqtt');
var iotDevice = require('azure-iot-device');
var config = require('./config');

var logger = new (winston.Logger)({ 
				transports : [  new winston.transports.File({
            						level: 'info',
	            					filename: config.logging.path,
						        handleExceptions: true,
            						json: true,
            						maxsize: 5242880, //5MB
            						maxFiles: 5,
            						colorize: false}),					
						new (winston.transports.Console)({
							'timestamp': true,
							colorize: true
						})
					    ]});


//var protocol = mqttDevice.Mqtt;
//var azureClient = azureClient.clientFromConnectionString(config.iothub.connectionstring, protocol);

logger.info('Connecting to localhost');

var client = mqtt.connect('tcp://localhost:1883/');


client.on('connect',  function(args){
	logger.info('Client Connected to mosquitto ' + config.mqtt.connectionstring);
});

logger.info('Connected to localhost');

logger.info(client);

client.on('error', function(error){
	logger.error('An error occurred', error);

});


client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
  client.end();
});

'use strict';

var mqtt = require('mqtt');
var winston = require('winston')
var iotMqttDevice = require('azure-iot-device-mqtt');
var iotDevice = require('azure-iot-device');
var config = require('./config.js');

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


var protocol = iotMqttDevice.Mqtt;
var azureClient = iotMqttDevice.clientFromConnectionString(config.iothub.connectionstring, protocol);



logger.info('Connecting to localhost');
var client = mqtt.connect('tcp://' + config.mqtt.hostname + ':' + config.mqtt.port + '/');

client.on('connect',  function(args){
    logger.info('Client Connected to mqtt buss');
    try {
        client.subscribe(config.mqtt.topic);
        logger.info('Client subscribed to ' + config.mqtt.topic);

        azureClient.open(connectCallback);

    } catch (exc) { 
        logger.error('Exception occurred supscibing to topic ' + exc.toString());
    }
    
});

client.on('error', function(error){
	logger.error('An error occurred', error);
});


client.on('message', function (topic, message) {
    
    try {
        logger.info('Message received');

        var forwardedMsg = new iotDevice.Message(message);
        
        logger.info('Forwarding message');
        
        azureClient.sendEvent(forwardedMsg, printResultFor('send'));
        
        logger.info('Message forwarded')
        
        
    }catch (exc) { 
        logger.error('An exception occured' + exc.toString());   
    }
    
});

var connectCallback = function (err) {
    if (err) {
        logger.error('Could not connect: ' + err);
    } else {
        logger.info('Client connected to cloud');
    }
}

function printResultFor(op) {
   
    return function printResult(err, res) {
        if (err) { 
            logger.error(op + ' error: ' + err.toString());
        } 
        if (res) { 
            logger.info(op + ' status: ' + res.constructor.name);
        } 
    };
}


process.on('uncaughtException', function(err){
    console.log('Caught exception: ' + err);
});

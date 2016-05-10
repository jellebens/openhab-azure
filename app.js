'use strict';

var mosca = require('mosca');
var winston = require('winston')
var mqttDevice = require('azure-iot-device-mqtt');
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



var client = mqttDevice.clientFromConnectionString(config.iothub.connectionstring, protocol);
var protocol = mqttDevice.Mqtt;

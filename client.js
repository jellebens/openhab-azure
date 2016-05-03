var winston = require('winston')
var mqttDevice = require('azure-iot-device-mqtt');
var iotDevice = require('azure-iot-device');
var config = require('./config');


var logger = new (winston.Logger)({transports : [new (winston.transports.Console)({'timestamp': true})]});


var protocol = mqttDevice.Mqtt;

var client = mqttDevice.clientFromConnectionString(config.iothub.connectionstring, protocol);


var connectCallback = function (err) {
  if (err) {
      logger.error('Could not connect: ' + err.message);
        } else {
            logger.info('Client connected to azure');
            client.on('message', function (msg) {
            logger.info('Id: ' + msg.messageId + ' Body: ' + msg.data);

            client.complete(msg, printResultFor('completed'));
            });
        }
};

client.open(connectCallback);



client.on('publish', function(packet, client){
	logger.info('published to topic', packet.topic.toString());
	logger.ingo(packet.toString());
});

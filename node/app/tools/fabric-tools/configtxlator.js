'use strict';

var request = require('request');
var rp = require('request-promise-native');
var fs = require('fs');
var log4js = require('log4js');
var logger = log4js.getLogger("configtxlator.js");

var Configtxlator = class {
    constructor(endpoint) {
        this.endpoint = 'http://localhost:7059';

        if (typeof endpoint === 'string') {
            this.endpoint = endpoint;
        }
        logger.info('Configtxlator server address: %s', this.endpoint);
    }

    encode(message, proto_name) {
        var url = this.endpoint.concat('/protolator/encode/', proto_name);
        logger.debug('Encode proto name: %s, request url: %s', proto_name, url);

        return rp.post({
          url: url,
          body: message,
          encoding: null,
          resolveWithFullResponse: true}).then((response)=> {
              logger.info('encode response: ', response.statusCode);
              if (response.statusCode == 200) {
                  return Promise.resolve(response.body);
              }
              else {
                  return Promise.reject(response);
              }
          }, (err) => {
              logger.error('encode failed, error: ', err);
              return Promise.reject(err);
          });
    }

    decode(block, proto_name) {
        var url = this.endpoint.concat('/protolator/decode/', proto_name);
        logger.debug('Encode proto name: %s, request url: %s', proto_name, url);

        return rp.post({
          url: url,
          body: block,
          encoding: null,
          resolveWithFullResponse: true}).then((response)=> {
              logger.info('decode response: ', response.statusCode);
              if (response.statusCode == 200) {
                  logger.debug('Response: ', response.body.toString('utf8'));
                  return Promise.resolve(response.body.toString('utf8'));
              }
              else {
                  return Promise.reject(response);
              }
          }, (err) => {
              logger.error('decode failed, error: ', err);
              return Promise.reject(err);
          });
    }

    compute_delta(original, updated, channel) {
        var url = this.endpoint.concat('/configtxlator/compute/update-from-configs');
        logger.debug('Compute delta for channel %s, request url: %s', channel, url);

        var form = {
            'original': {
                value: original,
                options: {
                    filename: 'original.proto',
                    contentType: 'application/octet-stream'
                }
            },
            'updated': {
                value: updated,
                options: {
                    filename: 'updated.proto',
                    contentType: 'application/octet-stream'
                }
            },
           'channel' : channel
        };

        return rp.post({
          url: url,
          formData: form,
          encoding: null,
          resolveWithFullResponse: true}).then((response)=> {
              logger.info('compute delta response: ', response.statusCode);
              if (response.statusCode == 200) {
                  var buffer = Buffer.from(response.body);
                  return Promise.resolve(buffer);
              }
              else {
                  return Promise.reject(response);
              }
          }, (err) => {
              logger.error('compute delta failed, error: ', err);
              return Promise.reject(err);
          });

    }

    error_handler(err){
        if (err.statusCode != 200){
            logger.error("The error StatusCodeError is %s, error is %s", err.statusCode, err.error.toString());
            // return new Error("The error StatusCodeError is %s, error is %s", err.statusCode, err.error.toString());
        }
    }
};

module.exports = Configtxlator;


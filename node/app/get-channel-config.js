'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('get-channel-config');
var Configtxlator = require('./tools/fabric-tools/configtxlator');
//Instantiate the configlator
var configtx = new Configtxlator();

/**
 * Consider that, the different between the app and sys channel options are the msp( the sign identity, specially).
 * But for show the difference clear, we make them as two functions.
 */

/**
 * Get Application channel config block from the target node of target channel
 * @param {Target channel name} channelName 
 * @param {*Use the target org's admin identity to query the data} org 
 * @param {* Query target node} target 
 */
var getChannelConfigApp = function (channelName, org, target) {
	logger.info('\n\n============ Get config to Channel ============\n');

	var client = null;
	var channel = null;
	var originalConfigBlock = null;

	return helper.getClient(org).then(_client => {
		client = _client;
		// have the clients build a channel with all peers and orderers
		channel = client.getChannel(channelName);

		return channel.getChannelConfig(target);//Get channel config from peer
		// Or, we can get the target channel config block from orderer
		// return channel.getChannelConfigFromOrderer();//Get channel config from orderer
	}).then((configEnvelope) => {
		originalConfigBlock = configEnvelope.config.toBuffer();
		//Get the readable json format data for config info
		return configtx.decode(originalConfigBlock, 'common.Config');
	}).then(configEnvelopeJson => {

		helper.writeFile(channelName + "-configJson.json", configEnvelopeJson);
		logger.info(util.format('Successfully get application channel config, the config is \n %s \n', configEnvelopeJson));
		return { status: "Get Application channel config successfully", config_data: configEnvelopeJson };
	}, (err) => {
		logger.error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
	});
};

/**
 * Get Application channel config block from the target node of target channel
 * @param {Target channel name} channelName 
 * @param {*Use the target org's admin identity to query the data} org 
 * @param {* Query target node} target 
 */
var getChannelConfigSys = function (org) {
	logger.info('\n\n============ Get config to Channel ============\n');

	var client = null;
	var channel = null;
	var originalConfigBlock = null;
	var channelName = "testchainid";

	return helper.getClient(org).then(_client => {
		client = _client;
		// have the clients build a channel with all peers and orderers
		channel = client.getChannel(channelName);
		/**
		 * Copy from the SDK - lib/Channel.js
		 * Asks the orderer for the current (latest) configuration block for this channel.
		 * This is similar to [getGenesisBlock()], except
		 * that instead of getting block number 0 it gets the latest block that contains
		 * the channel configuration, and only returns the decoded ConfigEnvelope.
		 *
		 * @returns {Promise} A Promise for a ConfigEnvelope object containing the configuration items.
		 */
		return channel.getChannelConfigFromOrderer();//Get channel config from orderer?
	}).then((configEnvelope) => {
		originalConfigBlock = configEnvelope.config.toBuffer();
		//Get the readable json format data for config info
		return configtx.decode(originalConfigBlock, 'common.Config');
	}).then(configEnvelopeJson => {

		helper.writeFile(channelName + "-configJson.json", configEnvelopeJson);
		logger.info(util.format('Successfully get application channel config, the config is \n %s \n', configEnvelopeJson));
		return { status: "Get Application channel config successfully", config_data: configEnvelopeJson };
	}, (err) => {
		logger.error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to get application channel config due to error: ' + err.stack ? err.stack : err);
	});
};

exports.getChannelConfigApp = getChannelConfigApp;
exports.getChannelConfigSys = getChannelConfigSys;

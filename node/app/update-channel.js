'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('update-channel');
var Configtxlator = require('./tools/fabric-tools/configtxlator');
var FabricConfigBuilder = require('./tools/fabric-config-builder');
var MSP = require('./tools/msp-tool')
//Instantiate the configlator
var configtx = new Configtxlator();


var updateAppChannel = function (channelName, org, updateOpt) {
	logger.info('\n\n============ Update config to Channel ============\n');

	var client = null;
	var channel = null;
	var tx_id = null;
	var originalConfigBlock = null;
	var originalConfigObj = null;
	var updatedConfigBlock = null;
	var updatedConfigObj = null;
	var signatures = [];


	return helper.getClient(org).then(_client => {
		client = _client;
		// have the clients build a channel with all peers and orderers
		channel = client.getChannel(channelName);

		return channel.getChannelConfig(updateOpt.target);//Get channel config from peer
		// Or, we can get the target channel config block from orderer
		// return channel.getChannelConfigFromOrderer();//Get channel config from orderer
	}).then((configEnvelope) => {
		originalConfigBlock = configEnvelope.config.toBuffer();
		//Get the readable json format data for config info
		return configtx.decode(originalConfigBlock, 'common.Config');
	}).then(configEnvelopeJson => {
		originalConfigObj = JSON.parse(configEnvelopeJson);
		//Add a new org, you should prepare a related msp for the target org first
		//Build a new organisation group for application group section
		var orgName = updateOpt.orgName;
		var mspId = updateOpt.mspId;
		var mspObj = new MSP(mspId);
		mspObj.load(updateOpt.mspDir);

		var builder = new FabricConfigBuilder();
		builder.addOrganization(orgName, mspId, mspObj.getMSP());

		var orgAppGroup = builder.buildApplicationGroup(false);

		//Modify the target config json with a new org group
		updatedConfigObj = originalConfigObj;
		updatedConfigObj.channel_group.groups.Application.groups[orgName] = orgAppGroup;

		//change the updated obj to json for encode
		var updatedConfigEnvelopeJson = JSON.stringify(updatedConfigObj);
		// Log the file
		helper.writeFile("updateConfigJson.json", updatedConfigEnvelopeJson);
		return configtx.encode(updatedConfigEnvelopeJson, 'common.Config');
	}).then(updatedConfigEnvelopeBlock => {
		updatedConfigBlock = updatedConfigEnvelopeBlock;
		// Compute the diff by configtxlator
		return configtx.compute_delta(originalConfigBlock, updatedConfigBlock, channelName);
	}).then(config_pb => {

		//Then we should sign the envelope for updating the channel config
		var signature = client.signChannelConfig(config_pb);
		signatures.push(signature);

		//The signatures list should be satisfied with the channel config modify policy


		tx_id = client.newTransactionID(true);
		let request = {
			config: config_pb,
			signatures: signatures,
			name: channelName,
			txId: tx_id
		};

		return client.updateChannel(request); //admin from current org
	}).then((results) => {
		logger.info('\n***\n completed the update \n***\n');

		logger.debug(' response ::%j', results);
		if (results.status && results.status === 'SUCCESS') {
			logger.info(util.format('Successfully update channel and received response: Status - %s', results.status));
			return { status: "Update channel successfully" };
		} else {
			throw new Error(util.format('Failed to update channel or receive valid response: %s', results.status));
		}
	}, (err) => {
		configtx.error_handler(err);
		logger.error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
	});
};

var updateSysChannel = function (org, updateOpt) {
	logger.info('\n\n============ Update config to Channel ============\n');

	var client = null;
	var channel = null;
	var tx_id = null;
	var originalConfigBlock = null;
	var originalConfigObj = null;
	var updatedConfigBlock = null;
	var updatedConfigObj = null;
	var signatures = [];
	var channelName = "testchainid";


	return helper.getClient(org).then(_client => {
		client = _client;
		// have the clients build a channel with all peers and orderers
		channel = client.getChannel(channelName);

		return channel.getChannelConfigFromOrderer();//Get channel config from orderer
	}).then((configEnvelope) => {
		originalConfigBlock = configEnvelope.config.toBuffer();
		//Get the readable json format data for config info
		return configtx.decode(originalConfigBlock, 'common.Config');
	}).then(configEnvelopeJson => {
		originalConfigObj = JSON.parse(configEnvelopeJson);
		//Add a new org, you should prepare a related msp for the target org first
		//Build a new organisation group for application group section
		var orgName = updateOpt.orgName;
		var mspId = updateOpt.mspId;
		var mspObj = new MSP(mspId);
		mspObj.load(updateOpt.mspDir);

		var builder = new FabricConfigBuilder();
		builder.addOrganization(orgName, mspId, mspObj.getMSP());

		var orgAppGroup = builder.buildConsortiumGroup();

		//Modify the target config json with a new org group
		updatedConfigObj = originalConfigObj;
		updatedConfigObj.channel_group.groups.Consortiums.groups.SampleConsortium.groups[orgName] = orgAppGroup;

		//change the updated obj to json for encode
		var updatedConfigEnvelopeJson = JSON.stringify(updatedConfigObj);
		// Log the file
		helper.writeFile("updateConfigJson.json", updatedConfigEnvelopeJson);
		return configtx.encode(updatedConfigEnvelopeJson, 'common.Config');
	}).then(updatedConfigEnvelopeBlock => {
		updatedConfigBlock = updatedConfigEnvelopeBlock;
		// Compute the diff by configtxlator
		return configtx.compute_delta(originalConfigBlock, updatedConfigBlock, channelName);
	}).then(config_pb => {

		//Then we should sign the envelope for updating the channel config
		var signature = client.signChannelConfig(config_pb);
		signatures.push(signature);

		//The signatures list should be satisfied with the channel config modify policy


		tx_id = client.newTransactionID(true);
		let request = {
			config: config_pb,
			signatures: signatures,
			name: channelName,
			txId: tx_id
		};

		return client.updateChannel(request); //admin from current org
	}).then((results) => {
		logger.info('\n***\n completed the update \n***\n');

		logger.debug(' response ::%j', results);
		if (results.status && results.status === 'SUCCESS') {
			logger.info(util.format('Successfully update channel and received response: Status - %s', results.status));
			return { status: "Update channel successfully" };
		} else {
			throw new Error(util.format('Failed to update channel or receive valid response: %s', results.status));
		}
	}, (err) => {
		configtx.error_handler(err);
		logger.error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
	});
};

exports.updateAppChannel = updateAppChannel;
exports.updateSysChannel = updateSysChannel;
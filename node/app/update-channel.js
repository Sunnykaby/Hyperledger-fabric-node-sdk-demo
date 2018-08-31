'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('update-channel');
var Configtxlator = require('./tools/fabric-tools/configtxlator');
var FabricConfigBuilder = require('./tools/fabric-config-builder');
var MSP = require('./tools/msp-tool')
//Instantiate the configlator
var configtx = new Configtxlator();


var updateChannel = function (channelName, udpateOpt) {
	logger.info('\n\n============ Update config to Channel ============\n');

	var client = null;
	var channel = null;
	var tx_id = null;
	var originalConfigEnvelopeBlock = null;
	var originalConfigEnvelopeObj = null;
	var updatedConfigEnvelopeBlock = null;
	var updatedConfigEnvelopeObj = null;
	var signatures = [];


	return helper.getClient().then(_client => {
		client = _client;
		// have the clients build a channel with all peers and orderers
		channel = client.getChannel(channelName);

		return channel.getChannelConfig();//Get channel config from orderer?
	}).then((configEnvelope) => {
		originalConfigEnvelopeBlock = configEnvelope;
		//Get the readable json format data for config info
		return configtx.decode(configEnvelope, 'common.Config');
	}).then(configEnvelopeJson => {
		//Add a new org, you should prepare a related msp for the target org first
		//Build a new organisation group for application group section
		var orgName = udpateOpt.orgName;
		var mspId = udpateOpt.mspId;
		var mspObj = new MSP(mspId);
		mspObj.load(udpateOpt.mspDir);

		var builder = new FabricConfigBuilder();
		builder.addOrganization(orgName, mspId, mspObj.getMSP());

		var orgAppGroup = builder.buildApplicationGroup(false);

		//Modify the target config json with a new org group
		updatedConfigEnvelopeObj = originalConfigEnvelopeObj;
		updatedConfigEnvelopeObj.channel_group.groups.Application.groups[orgName] = orgAppGroup;

		//change the updated obj to json for encode
		var updatedConfigEnvelopeJson = JSON.stringify(updatedConfigEnvelopeObj);
		return configtx.encode(updatedConfigEnvelopeJson, 'commom.Config');
	}).then(updatedConfigEnvelopeBlock => {
		this.updatedConfigEnvelopeBlock = updatedConfigEnvelopeBlock;

		//Then we should sign the envelope for updating the channel config
		var signature = client.signChannelConfig(updatedConfigEnvelopeBlock);
		signatures.push(signature);

		//The signatures list should be satisfied with the channel config modify policy


		let tx_id = client.newTransactionID(true);
		let request = {
			config: updatedConfigEnvelopeBlock,
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
			return { status: "Update channel successfully"};
		} else {
			throw new Error(util.format('Failed to update channel or receive valid response: %s', results.status));
		}
	}, (err) => {
		logger.error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to update channel due to error: ' + err.stack ? err.stack : err);
	});
};

exports.updateChannel = updateChannel;

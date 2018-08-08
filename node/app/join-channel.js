'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('join-channel');


var joinChannel = function (channelName, peers,
	isAddToFile) {
	logger.info('\n\n============ Join Peers to Channel ============\n');

	var client = null;
	var channel = null;
	var tx_id = null;

	return helper.getClient().then(_client => {
		client = _client;
		// have the clients build a channel with all peers and orderers
		channel = client.getChannel(channelName);

		// get an admin based transaction
		tx_id = client.newTransactionID(true);
		let request = {
			txId: tx_id
		};

		return channel.getGenesisBlock(request); //admin from current org
	}).then((block) => {
		let genesis_block = block;

		let tx_id = client.newTransactionID(true);
		let request = {
			//targets: // this time we will leave blank so that we can use
			// all the peers assigned to the channel ...some may fail
			// if the submitter is not allowed, let's see what we get
			// targets: ['peer0.org1.example.com'],
			block: genesis_block,
			txId: tx_id
		};
		helper.addTargetsToRequest(peers, request);
		return channel.joinChannel(request); //admin from current org
	}).then((results) => {
		var proposalResponses = results;
		var all_good = true;
		var isExist = 0;
		var errors = [];
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
				one_good = true;
				logger.info('join channel proposal was good');
			} else {
				logger.error(proposalResponses[i])
				if(proposalResponses[i].details.indexOf("exists") != -1){
					logger.error('This channel exists in the peer');
					isExist++;
				}
				logger.error('join channel proposal was bad');
				errors.push(proposalResponses[i]);
			}
			all_good = all_good & one_good;
		}
		if(isExist == proposalResponses.length) return {status: "Peers have aready joined into the channel"};
		if (all_good) {
			logger.info(util.format('Successfully join channel and received ProposalResponse: Status - %s', proposalResponses[0].response.status));
			return { status: "Join channel successfully", tx_id: tx_id.getTransactionID(true) };
		} else {
			throw new Error(util.format('Failed to join channel or receive valid response: %s', errors));
		}
	}, (err) => {
		logger.error('Failed to join channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to join channel due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to join channel due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to join channel due to error: ' + err.stack ? err.stack : err);
	});
};

exports.joinChannel = joinChannel;

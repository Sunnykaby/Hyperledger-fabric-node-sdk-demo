'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('instantiate-chaincode');

/**
 * Instantiate the chaincode to the target channel
 * @param {*} channelName 
 * @param {*} chaincodeName 
 * @param {*} chaincodeVersion 
 * @param {*The called function name when the chaincode instantiate} fcn 
 * @param {*The args that called function require} args 
 */
var instantiateChaincode = function (channelName, chaincodeName, chaincodeVersion, fcn, args, org, peers, isUpgrade) {
	logger.info('\n\n============ Instantiate chaincode on channel ' + channelName +
		' ============\n');

	helper.setupChaincodeDeploy();

	var client = null;
	var channel = null;

	var eventhubs = [];
	var type = 'instantiate';
	var tx_id = null;

	return helper.getClient(org).then(_client => {
		client = _client;
		channel = client.getChannel(channelName);
		tx_id = client.newTransactionID(true);
		//If you want to set the special target event hub for org, please use this
		//let eventhub = channel.newChannelEventHub('target_peer_hostname');
		//Just load the target event hub for the target channel and org(current), and the event source is true
		eventhubs = channel.getChannelEventHubsForOrg();

		// send proposal to endorser
		var request = {
			chaincodeId: chaincodeName,
			chaincodeVersion: chaincodeVersion,
			fcn: fcn,
			args: args,
			txId: tx_id,
			chaincodeType: "golang",
		};
		helper.addTargetsToRequest(peers,request);
		// this is the longest response delay in the test, sometimes
		// x86 CI times out. set the per-request timeout to a super-long value
		return channel.sendInstantiateProposal(request, 120000);
	}, (err) => {
		throw new Error('Failed to create client ' + err);
	}).then((results) => {
		var proposalResponses = results[0];
		var proposal = results[1];
		var all_good = true;
		var isExist = 0;
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
				// special check only to test transient map support during chaincode upgrade
				one_good = true;
				logger.info(type + ' proposal was good');
			} else {
				if (proposalResponses[i].details.indexOf("exists") != -1) {
					logger.info("Chaincode is exists. Continue...");
					isExist++;
				}
				else if (proposalResponses[i].response.hasOwnProperty("message")&&proposalResponses[i].response.message.indexOf("exists") != -1) {
					logger.info("Chaincode is exists. Continue...");
					isExist++;
				}
				else {
					logger.error(type + ' proposal was bad');
				}
			}
			all_good = all_good & one_good;
		}
		if (isExist == proposalResponses.length) return "exist";
		if (all_good) {
			logger.debug(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal,
				admin: true,
				txId: tx_id
			};
			//txId must be setted when you want to use the default admin identity

			// set the transaction listener and set a timeout of 30sec
			// if the transaction did not get committed within the timeout period,
			// fail the test
			var deployId = tx_id.getTransactionID(true);

			var eventPromises = [];
			eventhubs.forEach((eh) => {
				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						eh.unregisterTxEvent(deployId);
						eh.disconnect();
						reject(new Error('REQUEST_TIMEOUT:' + eh._peer._endpoint.addr));
					}, 120000);
					eh.registerTxEvent(deployId.toString(), (tx, code, block_num) => {
						clearTimeout(handle);
						eh.unregisterTxEvent(deployId);

						if (code !== 'VALID') {
							reject(new Error('INVALID:' + code));
						} else {
							resolve('COMMITTED');
						}
					}, (err) => {
						clearTimeout(handle);
						eh.unregisterTxEvent(deployId);
						reject(err);
					});
				});
				logger.info('register eventhub %s with tx=%s', eh.getPeerAddr(), deployId);
				eventPromises.push(txPromise);
				// connect(true) to receive full blocks (user must have read rights to the channel)
				// should connect after registrations so that there is an error callback
				// to receive errors if there is a problem on the connect.
				eh.connect(true);
			});

			var sendPromise = channel.sendTransaction(request);
			return Promise.all([sendPromise].concat(eventPromises));
		} else {
			return Promise.reject("Bad Proposals")
		}
	}).then((results) => {
		if (typeof results != Array && results == "exist") {
			logger.info("The chaincode is exist in this channel");
			return { status: "chaincode exists" };
		} else {
			let sendTransaction_results = results[0]; // Promise all will return the results in order of the of Array
			let event_results = results[1];
			if (sendTransaction_results instanceof Error) {
				logger.error('Failed to order the transaction: ' + sendTransaction_results);
				throw sendTransaction_results;
			} else if (sendTransaction_results.status === 'SUCCESS') {
				logger.info('Successfully sent transaction to instantiate the chaincode to the orderer.');
				return { status: "Instantiate chaincode successfully", tx_id: tx_id.getTransactionID(true) }
			} else {
				logger.error('Failed to order the transaction to instantiate the chaincode. Error code: ' + sendTransaction_results.status);
				throw new Error('Failed to order the transaction to instantiate the chaincode. Error code: ' + sendTransaction_results.status);
			}
		}
	}, (err) => {
		return new Error('Failed to send instantiate due to error: ' + err.stack ? err.stack : err);
	}).catch((err) => {
		throw new Error('Failed to send ' + type + ' transaction and get notifications within the timeout period.' + err.stack ? err.stack : err);
	});
};

exports.instantiateChaincode = instantiateChaincode;

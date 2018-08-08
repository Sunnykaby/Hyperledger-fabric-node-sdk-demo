'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('invoke-chaincode');

/**
 * Invoke the chaincode with target function and args
 * @param {*} channelName 
 * @param {*} chaincodeName 
 * @param {*The invoke function name} fcn 
 * @param {*The invoke function args} args 
 */
var invokeChaincode = function (channelName, chaincodeName, fcn, args, org, peers) {
	logger.info(util.format('\n============ invoke transaction on channel %s ============\n', channelName));

	helper.setupChaincodeDeploy();

	var client = null;
	var channel = null;

	var eventhubs = [];
	var tx_id = null;
	var pass_results = null;

	return helper.getClient(org).then(_client => {
		client = _client;
		channel = client.getChannel(channelName);
		// an event listener can only register with a peer in its own org
		eventhubs = channel.getChannelEventHubsForOrg();
		tx_id = client.newTransactionID(true);

		// send proposal to endorser

		var request = {
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			txId: tx_id,
		};
		helper.addTargetsToRequest(peers, request);
		return channel.sendTransactionProposal(request);
	}, (err) => {
		throw new Error('Failed to create client ' + err);
	}).then((results) => {
		pass_results = results;
		var proposalResponses = pass_results[0];

		var proposal = pass_results[1];
		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			let proposal_response = proposalResponses[i];
			if (proposal_response.response && proposal_response.response.status === 200) {
				// one_good = channel.verifyProposalResponse(proposal_response);
				// if (one_good) {
				// 	logger.info('transaction proposal signature and endorser are valid');
				// }
				one_good = true;

				// check payload,if the proposal has a payload. We can check it.
				// let payload = proposal_response.response.payload.toString();
			} else {
				logger.error('transaction proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			// check all the read/write sets to see if the same, verify that each peer
			// got the same results on the proposal
			all_good = channel.compareProposalResponseResults(proposalResponses);
			if (all_good) {
				logger.info(' All proposals have a matching read/writes sets');
			}
			else {
				logger.error(' All proposals do not have matching read/write sets');
			}
		}
		if (all_good) {
			// check to see if all the results match
			logger.debug(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal,
				txId: tx_id,
				admin: true
			};
			// set the transaction listener and set a timeout of 30sec
			// if the transaction did not get committed within the timeout period,
			// fail the test
			var deployId = tx_id.getTransactionID();
			var eventPromises = [];
			eventhubs.forEach((eh) => {
				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						eh.unregisterTxEvent(deployId);
						eh.disconnect();
						reject(new Error('REQUEST_TIMEOUT:' + deployId.toString()));
					}, 120000);

					eh.registerTxEvent(deployId, (tx, code, block_num) => {
						clearTimeout(handle);
						eh.unregisterTxEvent(deployId);

						if (code !== 'VALID') {
							logger.error('The balance transfer transaction was invalid, code = ' + code);
							reject(new Error('INVALID:' + code));
						} else {
							logger.info('The balance transfer transaction has been committed on peer ' + eh.getPeerAddr());
							resolve("COMMITTED");
						}
					},
						(err) => {
							clearTimeout(handle);
							eh.unregisterTxEvent(deployId);
							reject(err);
						}
					);
				});
				eh.connect(true);
				eventPromises.push(txPromise);
			});
			var sendPromise = channel.sendTransaction(request);
			return Promise.all([sendPromise].concat(eventPromises));
		} else {
			return Promise.reject(new Error("Bad proposal"))
		}
	}).then(results => {
		let sendTransaction_results = results[0]; // Promise all will return the results in order of the of Array
		let event_results = results[1];
		if (sendTransaction_results instanceof Error) {
			logger.error('Failed to order the transaction: ' + sendTransaction_results);
			throw sendTransaction_results;
		} else if (sendTransaction_results.status === 'SUCCESS') {
			logger.info('Successfully sent transaction to invoke the chaincode to the orderer.');
			return {status: "Invoke the chaincode Successfully", tx_id: tx_id.getTransactionID(true)}
		} else {
			logger.error('Failed to order the transaction to invoke the chaincode. Error code: ' + sendTransaction_results.status);
			throw new Error('Failed to order the transaction to invoke the chaincode. Error code: ' + sendTransaction_results.status);
		}
	}, (err) => {
		logger.error('Failed to send transaction due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to send transaction due to error: ' + err.stack ? err.stack : err);
	}).catch((err) => {
		throw new Error('Failed to send transaction and get notifications within the timeout period.' + err.stack ? err.stack : err);
	});;
};

exports.invokeChaincode = invokeChaincode;

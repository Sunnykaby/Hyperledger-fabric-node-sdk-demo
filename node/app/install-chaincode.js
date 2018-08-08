'use strict';
var util = require('util');
var helper = require('./tools/helper.js');
var logger = helper.getLogger('install-chaincode');

/**
 * Install the chaincode to the target peers
 * @param {*Target chaincode name} chaincodeName 
 * @param {*Target chaincode path} chaincodePath 
 * @param {*Target chaincode version} chaincodeVersion 
 */
var installChaincode = function (chaincodeName, chaincodePath,
	chaincodeVersion,org,peers) {
	logger.info('\n\n============ Install chaincode on organizations ============\n');
	helper.setupChaincodeDeploy();

	var client = null;
	var tx_id = null;
	return helper.getClient(org).then(_client => {
		client = _client;
		tx_id = client.newTransactionID(true);
		// If the targets parameter is excluded from the request parameter list 
		// then the peers defined in the current organization of the client will be used.
		let request = {
			chaincodePath: chaincodePath,
			chaincodeId: chaincodeName,
			chaincodeVersion: chaincodeVersion,
			chaincodePackage: '',
			chaincodeType: "golang",
			txId: tx_id
		};
		helper.addTargetsToRequest(peers,request);
		return client.installChaincode(request);
	}, (err) => {
		throw new Error('Failed to create client. ' + err);
	}).then((results) => {
		var proposalResponses = results[0];
		var all_good = true;
		var errors = [];
		var isExist = 0;
		for (var i in proposalResponses) {
			logger.info(proposalResponses[i])
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
				one_good = true;
				logger.info('install proposal was good');
			} else {
				if (proposalResponses[i].hasOwnProperty("details")&&proposalResponses[i].details.indexOf("exists") != -1) {
					logger.info("Chaincode is exists. Continue...");
					isExist++;
				}
				else if (proposalResponses[i].response.hasOwnProperty("message")&&proposalResponses[i].response.message.indexOf("exists") != -1) {
					logger.info("Chaincode is exists. Continue...");
					isExist++;
				}
				else {
					logger.error('install proposal was bad');
					errors.push(proposalResponses[i]);
				}
			}
			all_good = all_good & one_good;
		}
		if (isExist == proposalResponses.length) return { status: "chaincode exists" };
		if (all_good) {
			logger.info(util.format('Successfully sent install Proposal and received ProposalResponse: Status - %s', proposalResponses[0].response.status));
			return { status: "Install chaincode successfully", tx_id: tx_id.getTransactionID(true) };
		} else {
			throw new Error(util.format('Failed to send install Proposal or receive valid response: %s', errors));
		}
	}, (err) => {
		logger.error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
	});
};

exports.installChaincode = installChaincode;

'use strict';
var helper = require('./tools/helper.js');
var logger = helper.getLogger('Query');


var queryChaincodeInfo = function (channelName, peer, chaincodeName, org) {
	logger.info('\n\n============ Query Channel info and block data ============\n');
	helper.setupChaincodeDeploy();

	var client = null;
	var channel = null;
	var tx_id = null;

	return helper.getClient(org).then(_client => {
		client = _client;
		//If you want to use the default admin identity, true is required
		return client.queryInstalledChaincodes(peer, true);
	}, (err) => {
		throw new Error('Failed to create client ' + err);
	}).then((results) => {
		logger.info(' queryInstalledChaincodes ::%j', results);
		let found = false;
		for (let i in results.chaincodes) {
			logger.debug(' queryInstalledChaincodes has found %s', results.chaincodes[i].name);
			if (results.chaincodes[i].name === chaincodeName) {
				found = true;
			}
		}
		if (found) {
			logger.info('Successfully found target chaincode in the result list');
		} else {
			logger.info('Failed to find target chaincode in the result list');
		}
		//Reload target channel
		channel = client.getChannel(channelName);
		// 	return channel.queryBlock(1);
		// }).then((results) => {
		// 	logger.info(' queryBlock with index 1 ::%j',results);

		// 	return channel.queryInfo();
		// }).then((results) => {
		// 	logger.info(' queryInfo ::%j',results);

		// 	return channel.queryBlockByHash(results.previousBlockHash);
		// }).then((results) => {
		// 	logger.debug(' queryBlockHash by the previous hash ::%j',results);

		// 	return channel.queryTransaction(query_tx_id);
		// }).then((results) => {
		// 	logger.info(' queryTransaction with tx_id [%s]::%j', query_tx_id, results);

		// 	return channel.queryBlock(1,peer);
		// }).then((results) => {
		// 	logger.info(' queryBlock with index 1 from peer [%s] ::%j',peer, results);

		// 	return channel.queryInfo(peer);
		// }).then((results) => {
		// 	logger.info(' queryInfo from peer [%s]::%j',peer,results);

		// 	return channel.queryBlockByHash(results.previousBlockHash, peer);
		// }).then((results) => {
		// 	logger.info(' queryBlockHash from peer [%s] ::%j', peer, results);

		// 	return channel.queryTransaction(query_tx_id,peer);
		// }).then((results) => {
		// 	logger.info(' queryTransaction from peer [%s] ::%j',peer, results);

		return channel.queryInstantiatedChaincodes(peer, true);
	}).then((results) => {

		logger.info(' queryBlock with admin from peer [%s]::%j', peer, results);
		// return client.queryInstalledChaincodesSpec(peer, true);
	// 	return channel.queryInstantiatedChaincodeSpecs(peer, true);

	// }).then( result => {
		
	// 	logger.info(' queryInstantiatedChaincodeSpecs with admin from peer [%s] ::%j', peer, result);

	// 	tx_id = client.newTransactionID(true);
	// 	// If the targets parameter is excluded from the request parameter list 
	// 	// then the peers defined in the current organization of the client will be used.
	// 	let request = {
	// 		targets: helper.getPeers(client, 0),
	// 		chaincodePath: result.chaincode_spec.chaincode_id.path,
	// 		chaincodeId: result.chaincode_spec.chaincode_id.name,
	// 		chaincodeVersion: result.chaincode_spec.chaincode_id.version,
	// 		chaincodePackage: '',
	// 		chaincodeType: "golang",
	// 		txId: tx_id,
	// 		pkg: result.code_package.buffer.data
	// 	};
	// 	return client.installChaincode(request);
	// }, (err) => {
	// 	throw new Error('Failed to create client. ' + err);
	// }).then((results) => {
	// 	var proposalResponses = results[0];
	// 	var all_good = true;
	// 	var errors = [];
	// 	var isExist = 0;
	// 	for (var i in proposalResponses) {
	// 		let one_good = false;
	// 		if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
	// 			one_good = true;
	// 			logger.info('install proposal was good');
	// 		} else {
	// 			if (proposalResponses[i].details.indexOf("exists") != -1) {
	// 				logger.info("Chaincode is exists. Continue...");
	// 				isExist++;
	// 			}
	// 			else {
	// 				logger.error('install proposal was bad');
	// 				errors.push(proposalResponses[i]);
	// 			}
	// 		}
	// 		all_good = all_good & one_good;
	// 	}
		return { status: "Query chaincode info successfully"};
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed, got error on query');
	});
};


exports.queryChaincodeInfo = queryChaincodeInfo;

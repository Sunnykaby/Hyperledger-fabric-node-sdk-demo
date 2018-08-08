'use strict';
var helper = require('./tools/helper.js');
var logger = helper.getLogger('Query');


var queryChannel = function (channelName, peer, query_tx_id, org) {
	logger.info('\n\n============ Query Channel info and block data ============\n');
	helper.setupChaincodeDeploy();

	var client = null;
	var channel = null;

	return helper.getClient(org).then(_client => {
		client = _client;
		//If you want to use the default admin identity, true is required
		return client.queryChannels(peer, true);
	}, (err) => {
		throw new Error('Failed to create client ' + err);
	}).then((results) => {
		logger.info(' queryChannels ::%j', results);
		let found = false;
		for (let i in results.channels) {
			logger.debug(' queryChannels has found %s', results.channels[i].channel_id);
			if (results.channels[i].channel_id === channelName) {
				found = true;
			}
		}
		if (found) {
			logger.info('Successfully found target channel in the result list');
		} else {
			logger.info('Failed to find target channel in the result list');
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

		return channel.queryBlock(1, peer, true);
	}).then((results) => {
		logger.info(' queryBlock with admin from peer [%s]::%j', peer, results);

		return channel.queryInfo(peer, true);
	}).then((results) => {
		logger.info(' queryInfo with admin from peer [%s] ::%j',peer, results);

		return channel.queryBlockByHash(results.previousBlockHash, peer, true);
	}).then((results) => {
		logger.info(' queryBlockHash with admin from peer [%s] ::%j', peer,  results);

		return channel.queryTransaction(query_tx_id, peer, true);
	}).then((results) => {
		logger.info(' queryTransaction with admin from peer [%s] ::%j', peer, results);
		return { status: "Query channel successfully"};
	}, (err) => {
		logger.error('Failed to send query due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed, got error on query');
	});
};


exports.queryChannel = queryChannel;

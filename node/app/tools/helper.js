'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
var path = require('path');
var ConfigTool = require('./config-tool.js');
var CATools = require('./ca-tools.js')
var hfc = require('fabric-client');
var fs = require("fs");

logger.setLevel('INFO');
hfc.setLogger(logger);

var configTool = new ConfigTool();
var ca = new CATools();

var sleep = function (sleep_time_ms) {
	return new Promise(resolve => setTimeout(resolve, sleep_time_ms));
}

/**
 * Check the org input and get org
 * @param {*} default_org 
 */
function checkOrg(client, default_org) {
	//If default, get the org from the config file
	if (default_org == "default") {
		var client_org = client.getClientConfig().organization;
		if (client_org == undefined || client_org == null) return default_org;
		else return client_org;
	} else {
		return default_org;
	}
}

function checkPeers(peers) {
	if (peers != undefined && peers != null && peers.length > 0) {
		return true;
	}
	else return false;
}

function addTargetsToRequest(peers, request) {
	if (checkPeers(peers)) {
		request["targets"] = peers;
	}
}

function getOrderer(client, index) {
	return 'orderer.example.com';
}

function getPeers(client, index, org) {
	return ['peer0.org1.example.com'];
}

function initNetworkConfig() {
	return Promise.resolve("Init network succussfully");
}


/**
 * Create a fabric client with the target user context config
 */
function getClient(org) {
	return new Promise((resolve, reject) => {
		return configTool.initClient(org).then(client => {
			resolve(client);
		}).catch(err => {
			reject(err);
		})
	});
}

function getCAObject() {
	return this.ca;
}

function getCaService() {
	return configTool.initCaService();
}

function setAdmin(org, enrollmentID, enrollmentSecret) {
	return this.getClient(org).then(client => {
		return ca.getAdminUser(client, enrollmentID, enrollmentSecret);
	}).then(admin => {
		// logger.info(admin);
		logger.info("Get and set a admin user with username : %s", enrollmentID);
		return Promise.resolve(admin);
	});
}

function setMember(org, memberName, enrollmentID, enrollmentSecret) {
	return this.getClient(org).then(client => {
		return ca.getMember(client, memberName, enrollmentID, enrollmentSecret, org);
	}).then(member => {
		// logger.info(member);
		logger.info("Get and set a member user with username : %s", memberName);
		return Promise.resolve(member);
	});
}

/**
 * Set the system env gopath with the target chaincode root path
 */
var setupChaincodeDeploy = function () {
	process.env.GOPATH = path.join(__dirname, "../../../artifacts");
};

var getLogger = function (moduleName) {
	var logger = log4js.getLogger(moduleName);
	logger.setLevel('INFO');
	return logger;
};

var writeFile = function (path, content) {
	fs.writeFileSync(path, content);
}

exports.getClient = getClient;
exports.getLogger = getLogger;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.checkOrg = checkOrg;
exports.initNetworkConfig = initNetworkConfig;
exports.getOrderer = getOrderer;
exports.getPeers = getPeers;
exports.getCaService = getCaService;
exports.ca = ca;
exports.setAdmin = setAdmin;
exports.setMember = setMember;
exports.addTargetsToRequest = addTargetsToRequest;
exports.writeFile = writeFile;
'use strict';
var install = require('./install-chaincode.js');
var instantiate = require('./instantiate-chaincode.js');
var invoke = require('./invoke-chaincode');
var query = require('./query-chaincode');
var createChannel = require('./create-channel.js');
var joinChannel = require('./join-channel.js');
var queryChannel = require('./query-channel.js');
var queryChaincodeInfo = require('./query-chaincode-info.js');
var enroll = require('./ca-enroll.js');
var updateChannel = require('./update-channel');
var getConfig = require('./get-channel-config');

module.exports.enroll = function (enrollReq) {
    return enroll.caEnroll(enrollReq.enrollmentId, enrollReq.enrollmentSecret, enrollReq.org);
}

module.exports.createChannel = function (createChReq) {
    return createChannel.createChannel(createChReq.chanName, createChReq.org, createChReq.isFromFile);
}

module.exports.updateAppChannel = function (updateReq) {
    return updateChannel.updateAppChannel(updateReq.chanName, updateReq.org, updateReq.uptOpt);
}

module.exports.updateSysChannel = function (updateReq) {
    return updateChannel.updateSysChannel(updateReq.org, updateReq.uptOpt);
}

module.exports.getAppChannelConfig = function (getConfigReq){
    return getConfig.getChannelConfigApp(getConfigReq.chanName, getConfigReq.org, getConfigReq.target);
}

module.exports.getSysChannelConfig = function (getConfigReq){
    return getConfig.getChannelConfigSys(getConfigReq.org);
}

module.exports.joinChannel = function (joinChReq) {
    return joinChannel.joinChannel(joinChReq.chanName, joinChReq.peers, joinChReq.isAddToFile);
}

module.exports.installChaincode = function (installReq) {
    return install.installChaincode(installReq.chaincodeId, installReq.chaincodePath, installReq.chaincodeVersion,
        installReq.org, installReq.peers);
}

module.exports.instantiateChaincode = function (instantiateReq) {
    return instantiate.instantiateChaincode(instantiateReq.chanName, instantiateReq.chaincodeId,
        instantiateReq.chaincodeVersion, instantiateReq.fcn, instantiateReq.args,instantiateReq.org,
        instantiateReq.peers,instantiateReq.isUpgrade);
}

module.exports.invokeChaincode = function (invokeReq) {
    return invoke.invokeChaincode(invokeReq.chanName, invokeReq.chaincodeId,
        invokeReq.fcn, invokeReq.args, invokeReq.org, invokeReq.peers);
}

module.exports.queryChaincode = function (queryReq) {
    return query.queryChaincode(queryReq.chanName, queryReq.chaincodeId,
        queryReq.fcn, queryReq.args, queryReq.org, queryReq.peers);
}

module.exports.queryChannel = function (queryReq) {
    return queryChannel.queryChannel(queryReq.chanName, queryReq.peer, queryReq.txid, queryReq.org);
}

module.exports.queryChaincodeInfo = function(queryReq) {
    return queryChaincodeInfo.queryChaincodeInfo(queryReq.chanName, queryReq.peer, queryReq.chainId,
        queryReq.org);
}

'use strict';
var helper = require('./tools/helper.js');
var logger = helper.getLogger('ca-enroll');

var CATools = require('./tools/ca-tools.js');
var ca = new CATools();

var caEnroll = function (enrollmentID, enrollmentSecret, org) {
	logger.info('\n\n============ Enroll a user to  chaincode on organizations ============\n');


	var client = null;
	var member1 = "member1";
	var member2 = "member2";

	return helper.getClient(org).then(_client => {
		client = _client;
		return ca.getAdminUser(client, enrollmentID, enrollmentSecret);
	}).then(admin => {
		// logger.info(admin);
		logger.info("Get and set a admin user with username : %s", enrollmentID);
		return ca.getMemberUserForOrg(client, org, admin, member1);
	}).then(member => {
		// logger.info(member);
		logger.info("Get and set a member user with username : %s", member1);
		return ca.getMember(client, member2, enrollmentID, enrollmentSecret, org)
	}).then(member => {
		// logger.info(member);
		logger.info("Get and set a member user with username : %s", member2);
		// get the CA associated with this client's organization
		let caService = client.getCertificateAuthority();
		let request = {
			enrollmentID: enrollmentID,
			enrollmentSecret: enrollmentSecret,
			profile: 'tls'
		};
		return caService.enroll(request);
	}).then((enrollment) => {
		let key = enrollment.key.toBytes();
		let cert = enrollment.certificate;
		logger.info("CA enroll admin:adminpw with key : ", key);
		logger.info("CA enroll admin:adminpw with cert : ", cert);
		// set the material on the client to be used when building endpoints for the user
		client.setTlsClientCertAndKey(cert, key);
		return { status: "Enroll a new user successfully" }
	}, (err) => {
		logger.error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
	}).catch(err => {
		logger.error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
	});
};

exports.caEnroll = caEnroll;

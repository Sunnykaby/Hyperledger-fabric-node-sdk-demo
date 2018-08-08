'use strict'

var FabricCAServices = require('fabric-ca-client');
var FabricCAClient = FabricCAServices.FabricCAClient;
var User = require('fabric-client/lib/User.js');

var CATools = class {

    constructor() {
    }

    getClientCryptoStorePath(client) {
        var clientConfig = client.getClientConfig();
        return clientConfig.credentialStore.cryptoStore.path;
    }

    getMember(client, targetUserName, userName, password, orgName) {
        return client.getUserContext(targetUserName, true).then(user => {
            return new Promise((resolve, reject) => {
                if (user && user.isEnrolled()) {
                    return resolve(user);
                }
                var member = new User(targetUserName);
                var cryptoSuite = client.getCryptoSuite();
                if (!cryptoSuite) {
                    cryptoSuite = client.newCryptoSuite();
                    if (orgName) {
                        cryptoSuite.setCryptoKeyStore(client.newCryptoKeyStore({ path: this.getClientCryptoStorePath() }));
                        client.setCryptoSuite(cryptoSuite);
                    }
                }
                member.setCryptoSuite(cryptoSuite);

                // need to enroll it with CA server
                var cop = client.getCertificateAuthority();

                return cop.enroll({
                    enrollmentID: userName,
                    enrollmentSecret: password
                }).then((enrollment) => {
                    return member.setEnrollment(enrollment.key, enrollment.certificate, orgName);
                }).then(() => {
                    var skipPersistence = false;
                    if (!client.getStateStore()) {
                        skipPersistence = true;
                    }
                    return client.setUserContext(member, skipPersistence);
                }).then(() => {
                    return resolve(member);
                }).catch((err) => {
                    reject(err);
                });
            }).catch(err => {
                return Promise.reject(err);
            });
        });
    }

    getAdminUser(client, username, password) {
        return client.getUserContext(username, true).then(user => {
            if (user) {
                return Promise.resolve(user);
            }
            //use the registed admin user identity
            return client.setUserContext({ username: username, password: password });
        }).then(admin => {
            return Promise.resolve(admin);
        });
    }

    getMemberUserForOrg(client, orgName, adminUser, userName) {
        return client.getUserContext(userName, true).then(user => {
            if (user) {
                return Promise.resolve(user);
            }
            return client.getCertificateAuthority().register({ enrollmentID: userName, affiliation: orgName }, adminUser)
        }).then(secret => {
            return client.setUserContext({ username: userName, password: secret });
        }).then(userMember => {
            return Promise.resolve(userMember);
        });
    }
}

module.exports = CATools;

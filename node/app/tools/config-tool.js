'use strict'

var fsx = require('fs-extra');
var Client = require('fabric-client');
var base_config_path = "../artifacts/connection-profile/"

var ConfigTool = class {

    constructor() {
        this._client = null;
        this._org = null;
        this._caService = null;
    }

    cleanUpConfigCache(orgName) {
        let client = Client.loadFromConfig(base_config_path + orgName + '.yaml');
        let client_config = client.getClientConfig();

        let store_path = client_config.credentialStore.path;
        fsx.removeSync(store_path);

        let crypto_path = client_config.credentialStore.cryptoStore.path;
        fsx.removeSync(crypto_path);
    }

    initClient(org) {
        // build a 'Client' instance that knows the connection profile
        //  this connection profile does not have the client information, we will
        //  load that later so that we can switch this client to be in a different
        //  organization.
        if (this._client != null && this._org == org) {
            return Promise.resolve(this._client);
        }
        var client = Client.loadFromConfig(base_config_path + 'network.yaml');
        // Load the client information for an organization.
        // The file only has the client section.
        // A real application might do this when a new user logs in.
        if (this.checkParam(org)) {
            client.loadFromConfig(base_config_path + org + '.yaml');
            this._org = org;
        }

        // tell this client instance where the state and key stores are located
        return client.initCredentialStores().then((nothing) => {
            this._client = client;
            return Promise.resolve(client);
        });
    }

    initCaService() {
        if (this._caService == null) {
            this._caService = this._client.getCertificateAuthority();
        }
        return this._caService;
    }

    getClientCryptoStorePath() {
        var clientConfig = this._client.getClientConfig();
        return clientConfig.credentialStore.cryptoStore.path;
    }

    checkParam(arg) {
        if (arg != undefined && arg != null) return true;
        else return false;
    }
}

module.exports = ConfigTool;

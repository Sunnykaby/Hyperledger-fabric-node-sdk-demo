'use strict';

var path = require('path');

var fs = require('fs');

const CACERTS              = "cacerts";
const ADMINCERTS           = "admincerts";
const SIGNCERTS            = "signcerts";
const KEYSTORE             = "keystore";
const INTERMEDIATECERTS    = "intermediatecerts";
const CRLSFOLDER           = "crls";
const CONFIGFILENAME       = "config.yaml";
const TLSCACERTS           = "tlscacerts";
const TLSINTERMEDIATECERTS = "tlsintermediatecerts";

var MSP = class {
    constructor(mspid) {
        this.mspid = mspid;
        this.config = null;
    }

    loadNul(){
        var tmpcfg = {};
        tmpcfg.admins = [""];
        tmpcfg.root_certs = [""];
        tmpcfg.tls_root_certs = [""];
        
        tmpcfg.crypto_config = this.getDefaultCryptoConfig();
        tmpcfg.name = this.mspid;

        this.config = tmpcfg;
    }

    load(dir) {
        var cacertDir = path.join(dir, CACERTS)
        var admincertDir = path.join(dir, ADMINCERTS)
        var intermediatecertsDir = path.join(dir, INTERMEDIATECERTS)
        var crlsDir = path.join(dir, CRLSFOLDER)
        var configFile = path.join(dir, CONFIGFILENAME)
        var tlscacertDir = path.join(dir, TLSCACERTS)
        var tlsintermediatecertsDir = path.join(dir, TLSINTERMEDIATECERTS)

        var cacerts = MSP.getPemMaterialFromDir(cacertDir);
        if (cacerts == null || cacerts.length == 0) {
            throw new Error('Missing cacerts for MSP');
        }

        var admincert = MSP.getPemMaterialFromDir(admincertDir);
        if (admincert == null || admincert.length == 0) {
            throw new Error('Missing admincerts for MSP');
        }

        var tmpcfg = {};
        tmpcfg.admins = admincert;
        tmpcfg.root_certs = cacerts;

        var intermediatecerts = MSP.getPemMaterialFromDir(intermediatecertsDir);
        if (intermediatecerts != null) {
            tmpcfg.intermediate_certs = intermediatecerts;
        }

        var crls = MSP.getPemMaterialFromDir(crlsDir);
        if (crls != null) {
            tmpcfg.revocation_list = crls;
        }

        var tlscacerts = MSP.getPemMaterialFromDir(tlscacertDir);
        if (tlscacerts != null && tlscacerts.length > 0) {
            tmpcfg.tls_root_certs = tlscacerts;
        }

        tmpcfg.crypto_config = this.getDefaultCryptoConfig();
        tmpcfg.name = this.mspid;

        this.config = tmpcfg;
    }

    getConfig() {
        return this.config;
    }

    getMSP() {
        var msp = {};
        msp.mod_policy = "Admins";
        msp.value = {};
        msp.value.config = this.getConfig();

        return msp;
    }

    getDefaultCryptoConfig() {
        var cryptocfg = {};
        cryptocfg['identity_identifier_hash_function'] = 'SHA256';
        cryptocfg['signature_hash_family'] = 'SHA2';

        return cryptocfg;
    }

    static getPemMaterialFromDir(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir);
            var certs = [];
            files.forEach((file_name) => {
                let file_path = path.join(dir,file_name);
                let data = fs.readFileSync(file_path);
                //certs.push(this.pemDecode(data.toString()));
                certs.push(data.toString('base64'));
            });
            return certs;
        } else {
            return null;
        }
    }
};

module.exports = MSP;

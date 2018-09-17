'use strict'
var helper = require('./helper.js');
var logger = helper.getLogger('create-channel');
var fs = require('fs');
var path = require('path');
var execFileSync = require('child_process').execFileSync;


var ChannelTool = class {
    constructor(profile_name) {
        this.CHANNEL_CREAT_PROFILE = profile_name;
    }

    _buildYamlHead(consortium, orgs) {
        var header = 'Profiles:\n' +
            '    ' + this.CHANNEL_CREAT_PROFILE + ':\n' +
            '        Consortium: ' + consortium + '\n' +
            '        Application:\n' +
            '            <<: *ApplicationDefaults\n' +
            '            Organizations:\n';
        for (var org of orgs) {
            header = header.concat('                - *', org.id, '\n');
        }

        return header;
    }

    _buildYamlFoot() {
        var footer = 'Application: &ApplicationDefaults\n' +
            '    Organizations:\n';
        return footer;
    }

    _buildYamlOrganizations(orgs, mspDirs) {
        var body = 'Organizations:\n';
        for (var org of orgs) {
            var org_str = '    - &' + org.id + '\n' +
                '        Name: ' + org.id + '\n' +
                '        ID: ' + org.id + '\n' +
                '        MSPDir: ' + mspDirs[org.id] + '\n';

            if (org.hasOwnProperty('anchor-peers')) {
                org_str += '        AnchorPeers:\n';
                var anchor_peer = '';
                for (var anchors of org['anchor-peers']) {
                    var host_port = anchors.split(':');
                    anchor_peer += '            - Host: ' + host_port[0] + '\n' +
                        '              Port: ' + host_port[1] + '\n';
                }
                org_str += anchor_peer;
            } else {
                //Set default AnchorPeer's value for each org
                org_str += '        AnchorPeers:\n' +
                    '            - Host: \n' +
                    '              Port: \n';
            }
            body += org_str + '\n';
        }
        return body;
    }

    /**
     * 
     * See the template in 'extra\Fabric-Channel\channel-create-template.yaml'
     * @param {*} consortium 
     * @param {*} orgs 
     * @param {*} mspDirs 
     */
    buildChannelCreateYaml(consortium, orgs, mspDirs) {
        var header = this._buildYamlHead(consortium, orgs);
        var footer = this._buildYamlFoot();
        var body = this._buildYamlOrganizations(orgs, mspDirs);

        return header + '\n' + body + '\n' + footer;
    }

    /**
     * @param: orgs, an array of object:
     *        {
     *             id : organziation_name 
     *             anchor-peers : [ host:port ]
     *        }
     */
    buildCreateChannelTx(channel, consortium, orgs, mspDirs) {
        var tpath = null;
        try {
            tpath = fs.mkdtempSync('/tmp/fabric-');
            logger.debug('build create channel transaction tmpdir : %s', tpath);
            var configtx = this.buildChannelCreateYaml(consortium, orgs, mspDirs);
            fs.writeFileSync(path.join(tpath, '/configtx.yaml'), configtx);
            //Set the config path for configtxgen tool
            process.env.FABRIC_CFG_PATH = tpath;

            var result = execFileSync('configtxgen', ['-profile', this.CHANNEL_CREAT_PROFILE, '-outputCreateChannelTx', tpath + '/' + channel + '.tx', '-channelID', channel]);
            logger.debug('configtxgen create channel transaction successfully');
            //logger.debug(result.toString('utf8'));
            var config = fs.readFileSync(path.join(tpath, '/' + channel + '.tx'));
            rmdir(tpath);
            return config;
        }
        catch (err) {
            logger.error('Build create channel transction failed: error : %s', err.stack ? err.stack : err);
            if (tpath != null) {
                rmdir(tpath);
            }
            return null;
        }
    }
};

function rmdir(name) {
    var files = fs.readdirSync(name);

    let length = files.length;
    for (let i = 0; i < length; i++) {
        let file = path.join(name, files[i]);
        fs.unlinkSync(file);
    }

    fs.rmdirSync(name);
}

module.exports = ChannelTool;

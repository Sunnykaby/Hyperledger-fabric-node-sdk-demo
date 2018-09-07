'use strict';

var path = require('path');
var fs = require('fs');

const READER_POLICY_KEY = "Readers";
const WRITER_POLICY_KEY = "Writers";
const ADMIN_POLICY_KEY = "Admins";
const MSP_KEY = "MSP";

var FabricConfigBuilder = class {
    constructor() {
        // Fabric config consits by group, value and policy
        this.name = null;
        this.mspid = null;
        this.msp = null;
        this.anchor_peers = [];
    }

    addOrganization(name, mspid, msp) {
        this.name = name;
        this.mspid = mspid;
        this.msp = msp;
    }

    addAnchorPeer(host, port) {
        var anchor_peer = {}
        anchor_peer.host = host;
        anchor_peer.port = port;

        this.anchor_peers.push(anchor_peer);
    }

    // anchors is array of object, which has host and p ort property exactly
    addAnchorPeerArray(anchors) {
        if (Array.isArray(anchors)) {
            this.anchor_peers.concat(anchors);
        }
    }

    /**
     * Special for system channel config, the app channel add a new feature of "FabricNodeOUs"
     */
    buildGroupMSP() {
        var memberPolicy = {
            mod_policy: "Admins",
            policy: {
                type: 1,
                value: {
                    identities: [
                        {
                            principal: {
                                msp_identifier: this.mspid,
                                role: "MEMBER"
                            },
                            principal_classification: "ROLE"
                        }
                    ],
                    rule: {
                        n_out_of: {
                            n: 1,
                            rules: [
                                {
                                    signed_by: 0
                                }
                            ]
                        }
                    }
                }
            }
        };
        var adminPolicy = {
            mod_policy: "Admins",
            policy: {
                type: 1,
                value: {
                    identities: [
                        {
                            principal: {
                                msp_identifier: this.mspid,
                                role: "ADMIN"
                            },
                            principal_classification: "ROLE"
                        }
                    ],
                    rule: {
                        n_out_of: {
                            n: 1,
                            rules: [
                                {
                                    signed_by: 0
                                }
                            ]
                        }
                    }
                }
            }
        };

        var policies = {};
        policies[ADMIN_POLICY_KEY] = adminPolicy;
        policies[READER_POLICY_KEY] = memberPolicy;
        policies[WRITER_POLICY_KEY] = memberPolicy;

        var values = {};
        values[MSP_KEY] = this.msp;

        var groupMsp = {};

        groupMsp.mod_policy = "Admins";
        groupMsp.policies = policies;
        groupMsp.values = values;

        return groupMsp;
    }

    /**
     * Just for app channel config
     */
    buildAnchor() {
        var values = {};
        var groupMsp = {};
        groupMsp.values = values;
        var anchors = {
            mod_policy: "Admins",
            value: {
                anchor_peers: this.anchor_peers
            }
        };

        groupMsp.values.AnchorPeers = anchors;
        return groupMsp;
    }

    /**
     * Build a application channel config related orgnation group config segment
     * @param {Check whether the group config segment is including the anchor or not} isAnchor 
     */
    buildApplicationGroup(isAnchor) {
        var groupMsp = this.buildGroupMSP();
        if(isAnchor){
            var anchors = {
                mod_policy: "Admins",
                value: {
                    anchor_peers: this.anchor_peers
                }
            };
            groupMsp.values.AnchorPeers = anchors;
        }
        //groupMsp.version = "1";

        return groupMsp;
    }

    /**
     * Build a system channel config related orgnation group config segment
     */
    buildConsortiumGroup() {
        return this.buildGroupMSP();
    }

    /**
     * Build a application channel config policy, default is "IMPLICIT". As test, we can change it to a "SIGNATURE" type.
     * @param {The type for policy: "IMPLICIT" or "SIGNATURE"} type 
     * @param {*} channelCreatorMSPID 
     * @param {*} isAdmin 
     */
    buildApplicationPolicy(type, channelCreatorMSPID, isAdmin) {
        switch (type) {
            case "IMPLICIT":
                var targetPolicy = "/Channel/Application/" + channelCreatorMSPID + "/Admins";
                var creatorModPolicy = {
                    mod_policy: "Admins",
                    policy: {
                        type: 3,
                        value: {
                            sub_policy: "/Channel/Application/" + channelCreatorMSPID + "/Admins"
                        }
                    }
                };
                return creatorModPolicy;
                break;
            case "SIGNATURE":
                var creatorPolicy = {
                    mod_policy: "Admins",
                    policy: {
                        type: 1,
                        value: {
                            identities: [
                                {
                                    principal: {
                                        msp_identifier: channelCreatorMSPID
                                    }
                                }
                            ],
                            rule: {
                                n_out_of: {
                                    n: 1,
                                    rules: [
                                        {
                                            signed_by: 0
                                        }
                                    ]
                                }
                            }
                        }
                    }
                };
                //default value is member, if this section is not exist
                if (isAdmin) {
                    creatorPolicy.policy.value.identities[0].principal["role"] = "ADMIN";
                }

                return creatorPolicy;
                break;
            default: break;
        }
    }
};

/**
 * Sample workflow
 */
function main(){
    
}


module.exports = FabricConfigBuilder;

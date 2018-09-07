var helper = require("./app/tools/helper.js");
var api = require("./app/api-handler.js");
var program = require('commander');
var logger = helper.getLogger();

program
    .version('0.1 Beta')
    .description('A sample fabric node sdk test program')
    .option('-m, --method <method>', 'run method for single', 'all');

program.parse(process.argv)



// Param declaration
var CHANNEL_NAME = 'channel2';
var CHAINCODE_ID = 'example02-3';
var CHAINCODE_PATH = 'github.com';
var CHAINCODE_VERSION = 'v0';
var PEERS = ["peer0.org1.example.com"];
var PEER = "peer0.org1.example.com";
var ORG = "org1"
var ENROOL_ID = "admin";
var ENROLL_SECRET = "adminpw";
var MEMBER_NAME = "member1";


//Reload the new args : Channel name


var installChaincodeRequest = {
    chaincodePath: CHAINCODE_PATH,
    chaincodeId: CHAINCODE_ID,
    chaincodeVersion: CHAINCODE_VERSION,
    org: ORG,
    peers: PEERS
};

var instantiateChaincodeRequest = {
    chanName: CHANNEL_NAME,
    chaincodeId: CHAINCODE_ID,
    chaincodeVersion: CHAINCODE_VERSION,
    fcn: 'init',
    args: ["a", "1000", "b", "1000"],
    org: ORG,
    peers: PEERS
};

var invokeChaincodeRequest = {
    chanName: CHANNEL_NAME,
    chaincodeId: CHAINCODE_ID,
    chaincodeVersion: CHAINCODE_VERSION,
    fcn: 'invoke',
    args: ["move", "b", "a", "10"],
    org: ORG,
    peers: PEERS
};

var queryChaincodeRequest = {
    chanName: CHANNEL_NAME,
    chaincodeId: CHAINCODE_ID,
    chaincodeVersion: CHAINCODE_VERSION,
    fcn: 'invoke',
    args: ["query", "a"],
    org: ORG,
    peers: PEERS
};

var createChannelRequest = {
    chanName: CHANNEL_NAME,
    org: "",
    isFromFile: true,
    org: ORG
}

var joinChannelRequest = {
    chanName: CHANNEL_NAME,
    peers: [],
    isAddToFile: false,
    org: ORG
}

var queryChannelRequest = {
    chanName: CHANNEL_NAME,
    peer: PEER,
    txid: "",
    org: ORG
}

var queryChaincodeInfoRequest = {
    chanName: CHANNEL_NAME,
    peer: PEER,
    chainId: CHAINCODE_ID,
    org: ORG
}

var enrollReq = {
    enrollmentId: ENROOL_ID,
    enrollmentSecret: ENROLL_SECRET,
    org: ORG
}

var updateRequest = {
    chanName: CHANNEL_NAME,
    org: ORG,
    uptOpt: {
        orgName: "Org3MSP",
        mspId: "Org3MSP",
        target: PEER,
        mspDir: "../net/org3-artifacts/crypto-config/peerOrganizations/org3.example.com/msp"
    }
}

function testWorkFlow() {
    try {
        //Do nothing
        helper.initNetworkConfig().then(result => {
            //Test CA feature
            //Enroll the default admin identity
            //Get a member user for local
            //Register a member user to CA
            return api.enroll(enrollReq);
        }).then(result => {
            console.log(result);
            // Set the usercontext to admin
            return helper.setAdmin(ORG, ENROOL_ID, ENROLL_SECRET);
        }).then(admin => {
            // Create channel with the related channel tx binary file
            return api.createChannel(createChannelRequest);
        }).then((result) => {
            console.log(result);
            // Make the target peer join into the target channel we just created
            return api.joinChannel(joinChannelRequest);
        }).then(result => {
            console.log(result);
            // Install chaincode to target peers
            return api.installChaincode(installChaincodeRequest);
        }).then((result) => {
            // Instantiate chaincode to target channel with peers
            return api.instantiateChaincode(instantiateChaincodeRequest);
        }).then((result) => {
            console.log(result);
            // Query the target chaincode info with target channel and peer
            return api.queryChaincodeInfo(queryChaincodeInfoRequest);
        }).then(result => {
            console.log(result);
            // invoke chaincode with target peers
            // With admin user
            return api.invokeChaincode(invokeChaincodeRequest);
        }).then((result) => {
            console.log(result)
            // Get the invoke transaction id for query
            queryChannelRequest.txid = result.tx_id;
            // query chaincode with target peers
            return api.queryChaincode(queryChaincodeRequest)
        }).then((result) => {
            console.log(result);
            //Query the target channel info 
            return api.queryChannel(queryChannelRequest);
        }).then(result => {
            console.log(result);
            // update channel as update options
        //     return api.updateChannel(updateRequest);
        // }).then( result => {
        //     console.log(result);
            // Set the usercontext to member
            return helper.setMember(ORG, MEMBER_NAME, ENROOL_ID, ENROLL_SECRET);
        }).then(member => {
            // invoke chaincode with target peers\
            // With member user
            return api.invokeChaincode(invokeChaincodeRequest);
        }).then((result) => {
            console.log(result)
            // query chaincode with target peers
            return api.queryChaincode(queryChaincodeRequest)
        }).then(result => {
            console.log(result)
            console.log("All Steps Completed Sucessfully");
            process.exit();
        }).catch(err => {
            console.error(err);
            return;
        });
    } catch (e) {
        console.log(
            '\n\n*******************************************************************************' +
            '\n*******************************************************************************' +
            '\n*                                          ' +
            '\n* Error!!!!!' +
            '\n*                                          ' +
            '\n*******************************************************************************' +
            '\n*******************************************************************************\n');
        console.log(e);
        return;
    }
}

switch (program.method) {
    case "all":
        testWorkFlow();
        break;
    case "ca":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                //Test CA feature
                //Enroll the default admin identity
                //Get a member user for local
                //Register a member user to CA
                return api.enroll(enrollReq);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "createChannel":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // Create channel with the related channel tx binary file
                return api.createChannel(createChannelRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "joinChannel":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // Make the target peer join into the target channel we just created
                return api.joinChannel(joinChannelRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "install":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // Install chaincode to target peers
                return api.installChaincode(installChaincodeRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "instantiate":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // Instantiate chaincode to target channel with peers
                return api.instantiateChaincode(instantiateChaincodeRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "queryChaincodeInfo":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // Query the target chaincode info with target channel and peer
                return api.queryChaincodeInfo(queryChaincodeInfoRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "invoke":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // invoke chaincode with target peers
                // With admin user
                return api.invokeChaincode(invokeChaincodeRequest);
            }).then(result => {
                queryChannelRequest.txid = result.tx_id;
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "query":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                // query chaincode with target peers
                return api.queryChaincode(queryChaincodeRequest)
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "queryChannelInfo":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                //Query the target channel info 
                return api.queryChannel(queryChannelRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    case "updateChannel":
        try {
            //Do nothing
            helper.initNetworkConfig().then(result => {
                //Update the target channel info 
                return api.updateChannel(updateRequest);
            }).then(result => {
                console.log(result);
                process.exit();
            }).catch(err => {
                console.error(err);
                return;
            });
        } catch (e) {
            console.log(e);
            return;
        }
        break;
    default:
        console.log("Not support the method : %s", program.method);
}
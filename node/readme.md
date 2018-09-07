## NODE JS SDK Sample

Here is a sample application that utilizes the Hyperledger Fabric NODE JS SDK to 

* Connect to the fabric network using a set of config files
* Connect to a channel
* Install chaincode written in the "go" programming language
* Instantiate chaincode on a set of specific peers on a specific channel
* Invoke chaincode

It demonstrates how you could utilize the **__fabric-client__** Node.js SDK APIs.

The "network.yaml" file located in the parent directory mirrors your existing fabric environment. Namely it describes

* A client
* Channels
* An organization
* Orderers
* Peers 

It also describes where the security certificates with which to connect with your environment are located.

### Step 1: Install prerequisites

* **Node.js** v 6x

### Step 2: Modify configuration files

In the current directory "app-test.js", change the `CHANNEL_NAME` to the channel you wish to utilize to run the sample. The default channel is provided as 'default'.
Or, you can add a param for the command when you run the sample: `node app-test.js [channelName]`. 

Notice, if you want to run the sample on a new channel which is not included in the `network.yaml`, you should download a new `network.yaml` config file.  

### Step 3: Run the sample application

To run the application, execute the following node command: `node app-test.js [channelName]`.

"All Done"


### Some Notice

#### User context
If you don't want to use a user context with CA. And you can use a default admin user identity with client configuration in the Connection Profile. And to use the default admin identity, you should make the `useAdmin` to be true, for any function you want to call via `client` or `channel`.


### Code Style
Follow a guide [node-style-guide](https://github.com/norfish/yueliao/wiki/NodeJS%E7%BC%96%E7%A0%81%E8%A7%84%E8%8C%83)

### Reference

* [hyperledger-fabric-docker-compose](https://github.com/yeasy/docker-compose-files/tree/master/hyperledger_fabric/v1.2.0)

### CA and user role

Also related to identities, you should make a decision on whether Fabric-CA should be part of your solution. This is a server with REST APIs that supports dynamic identity management with registration, enrollment (getting certificates), revocation and re-enrollment. So it is very useful in providing user identities on the fly. Note that user identities provisioned this way are only of the MEMBER role, which means it won't be able to perform certain operations reserved for the ADMIN role:

* create/update channel
* install/instantiate chaincode
* query installed/instantiated chaincodes


### Grpc bugs

If you found some bugs of `ALPN` about grpc.

you can do these as follow:

* update ./node_modules/grpc/deps/grpc/src/core/lib/security/security_connector/security_connector.cc
* change line “if (p == nullptr)” to “if (false)”
* change line “if (!grpc_chttp2_is_alpn_version_supported(p->value.data, p->value.length))” to “if (p != NULL && !grpc_chttp2_is_alpn_version_supported(p->value.data, p->value.length))”
* npm rebuild --unsafe-perm --build-from-source


### Connection errors

#### 14 UNAVAILABLE: EOF

if you see some error like `Error: Error: 14 UNAVAILABLE: EOF`, you can set these two env for your terminal:
```
export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG
```
It will show more detail Information for you to debug the connection error of `grpc` module.


### TODO

* Make up related object manually
    * Peer: tlsOptions, hostname
    * Orderer: tlsOptions, hostname
* Enhance the config data analysis 
    * Get related info from connection profile
* Multi organization support
    * Change the organization
* Create channel without preparation
    * Create channeltx by nodejs
* Modify Connection profile
    * After create Channel, update the connection profile
    * After add org, update the connection profile


### A new org

All the main steps are shown in the `./net/eyfn.sh`. 

* Using the remote mode, setup the network

* Generate the new organation's crypto materials

```
cd net/org3-artifacts
cryptogen generate --config=./org3-crypto.yaml
```
Then, it will create `crypto-config` for org3.

* Setup the org3's container

```
IMAGE_TAG=1.2.0 docker-compose -f docker-compose-org3.yaml up -d
```

* Run the update-channel test to add a target org


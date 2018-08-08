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
Follow a guide [node-style-guide](https://github.com/dead-horse/node-style-gui)

### Reference

* [hyperledger-fabric-docker-compose](https://github.com/yeasy/docker-compose-files/tree/master/hyperledger_fabric/v1.2.0)

### CA and user role

Also related to identities, you should make a decision on whether Fabric-CA should be part of your solution. This is a server with REST APIs that supports dynamic identity management with registration, enrollment (getting certificates), revocation and re-enrollment. So it is very useful in providing user identities on the fly. Note that user identities provisioned this way are only of the MEMBER role, which means it won't be able to perform certain operations reserved for the ADMIN role:

* create/update channel
* install/instantiate chaincode
* query installed/instantiated chaincodes

If you want to get the target chaincode source code, you can add this function into the `fabric-client/lib/Channel.js`.

```javascript
	queryInstantiatedChaincodeSpecs(target, useAdmin) {
		logger.debug('queryInstantiatedChaincodes - start');
		const targets = this._getTargetForQuery(target);
		const signer = this._clientContext._getSigningIdentity(useAdmin);
		const txId = new TransactionID(signer, useAdmin);
		const request = {
			targets: targets,
			chaincodeId: Constants.LSCC,
			txId: txId,
			signer: signer,
			fcn: 'getdepspec',
			args: ["channel2","example02-3"]
		};
		return this.sendTransactionProposal(request)
			.then(
				function (results) {
					const responses = results[0];
					logger.debug('queryInstantiatedChaincodes - got response');
					logger.info("::%j",responses)
					if (responses && Array.isArray(responses)) {
						//will only be one response as we are only querying one peer
						if (responses.length > 1) {
							return Promise.reject(new Error('Too many results returned'));
						}
						const response = responses[0];
						if (response instanceof Error) {
							return Promise.reject(response);
						}
						if (response.response) {
							logger.debug('queryInstantiatedChaincodes - response status :: %d', response.response.status);
							const queryTrans = _ccProto.ChaincodeDeploymentSpec.decode(response.response.payload);
							logger.info("::%j",queryTrans);
							return Promise.resolve(queryTrans);
						}
						// no idea what we have, lets fail it and send it back
						return Promise.reject(response);
					}
					return Promise.reject(new Error('Payload results are missing from the query'));
				}
			).catch(
				function (err) {
					logger.error('Failed Instantiated Chaincodes Query. Error: %s', err.stack ? err.stack : err);
					return Promise.reject(err);
				}
			);
	}
```
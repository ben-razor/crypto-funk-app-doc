### Porting Crypto Punks To Nervos

The big selling point of Nervos is interoperability.

Nervos is a dual layer system. A proof of work Layer 1 provides security while layer 2 allows fast DApps to be deployed using code for existing blockchain platforms. At present, DApps for the Ethereum Virtual Machine are supported. Nervos plan to provide support for more platforms in the future.

An additional strength of deploying to Nervos is that it allows mixing and matching of wallets from various blockchains for use with the deployed DApp. 

### Porting Crypto Punks to Nervos

What better way to demonstrate the potential of Nervos network's interoperability than to port the legendary early example of Non Fungible Token 
(NFT) artwork, **Crypto Punks**.

[Crypto Punks Website](https://www.larvalabs.com/cryptopunks)

[Crypto Punks Github](https://github.com/larvalabs/cryptopunks)

We call the ported app **Crypto Funk**. You can view it's source on GitHub:

[Crypto Funk Github](https://github.com/ben-razor/crypto-funk-app)

To port the app, we took the following steps.

### 1. Prepare the contract for porting

The [Solidity Smart Contract](https://github.com/larvalabs/cryptopunks/blob/master/contracts/CryptoPunksMarket.sol) for Crypto Punks is open source under the MIT licence but the artwork is not covered by the licence.

The smart contract contains SHA-256 hash of the image containing all the crypto punks so that a buyer can verify the image they have is official.

The ownership is assigned by mapping an index into the image to an Ethereum address.

```solidity
contract CryptoPunksMarket {

    // You can use this hash to verify the image file containing all the punks
    string public imageHash = "ac39af4793119ee46bbff351d8cb6b5f23da60222126add4268e261199a2921b";
    
    //mapping (address => uint) public addressToPunkIndex;
    mapping (uint => address) public punkIndexToAddress;
```

The first step was to remove the Crypto Punk hash and allow a hash to provided when the contract is deployed, along with the number of images (totalSupply) the source image contains:

```solidity
contract CryptoFunkMarket {

    // You can use this hash to verify the image file containing all the punks
    // openssl dgst -sha256 <your-image-name.png\jpg\etc...>
    string public imageHash;
    
    constructor(string memory _name, string memory _symbol, string memory _imageHash, uint256 _totalSupply) public payable {
        owner = msg.sender;
        totalSupply = _totalSupply;                        // Update total supply
        punksRemainingToAssign = totalSupply;
        name = _name;                                   // Set the name for display purposes
        imageHash = _imageHash;
    }
```

With these changes made and some updates to run on more recent versions of solidity. We are ready to port to Nervos.

### 2. Modify the Ethereum contract to run on Nervos

This is an easy one. No changes need to be made to the contract as Nervos provides an EVM compatible engine called **Polyjuice**. Contracts are written in standard Ethereum Solidity using the nice tooling Ethereum has available, and then run without changes on Nervos.

### 3. Modify the front end code

Most of the changes needed to port an Ethereum DApp to Nervos involve front end code. The Crypto Funk port was written using [ReactJS](https://reactjs.org/).

Creating a React app is simple. At a command line we type:

```bash
npx create-react-app crypto-funk-app
cd crypto-funk-app
npm start
```

DApps on the web communicate with Ethereum using a library called web3.js. 

Nervos DApps are no different but as Nervos has a different system design to Ethereum, it must provide it's own interface. In web3.js, this means supplying a custom *provider*.

```bash
yarn add @polyjuice-provider/web3@0.0.1-rc7 nervos-godwoken-integration@0.0.6
```

This command installs two modules. The first is for the Polyjuice provider. The second is for integration with **Godwoken**. Godwoken is the Nervos layer two network where the ported Ethereum app will be deployed.

The packages are brought into your React application by using imports:

```javascript
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';
```

### WARNING: Javascript Features used in these libraries are not supported by create-react-app

> :warning: At the time of writing the libraries errored due to new Javascript features that create-react-app is not set up to understand:
```
Support for the experimental syntax 'classProperties' isn't currently enabled

You may need an additional loader to handle the result of these loaders.
| 
| class BridgeRPCHandler {
>   client;
| 
|   constructor(forceBridgeUrl) {
```

We tried multiple techniques to get around these errors but none of them would work. In the end we deleted and modified the offending elements in the nervos-godwoken-integration source in order to be able to complete the port in a reasonable time.

```
./node_modules/nervos-godwoken-integration/lib/bridge/force-bridge-handler.js 49:151
Module parse failed: Unexpected token (49:151)
File was processed with these loaders:
 * ./node_modules/react-scripts/node_modules/babel-loader/lib/index.js
You may need an additional loader to handle the result of these loaders.
| 
|           const rawTx = result.rawTransaction;
>           rawTx.value = ethers_1.ethers.BigNumber.from(((_rawTx$value = rawTx.value) === null || _rawTx$value === void 0 ? void 0 : _rawTx$value.hex) ?? 0);
|           result.rawTransaction = rawTx;
|         }
```

This was changed to 
```javascript
{
    const rawTx = result.rawTransaction;
    let val = 0;
    if(rawTx && rawTx.value) {
        val = rawTx.value.hex;
    }
    rawTx.value = ethers_1.ethers.BigNumber.from(val);
    result.rawTransaction = rawTx;
}
```

```
./node_modules/nervos-godwoken-integration/lib/address/index.js 57:9
Module parse failed: Unexpected token (57:9)
File was processed with these loaders:
 * ./node_modules/react-scripts/node_modules/babel-loader/lib/index.js
You may need an additional loader to handle the result of these loaders.
| 
| class AddressTranslator {
>   _config;
|   _deploymentConfig;
    constructor(config) {
        if (config) {
            this._config = config;
        }
|
```

This was changed to:

```javascript
class AddressTranslator {
    constructor(config) {
        if (config) {
            this._config = config;
        }
```

Most of the problems centered around the use of class properties and ES2020 optional chaining. There were a number of other examples that needed changing in similar ways. The source code for these changes can be found here:

[Modified Godwoken integration source code](https://github.com/ben-razor/crypto-funk-app-doc/tree/main/modified-src/nervos-godwoken-integration/lib)

> :warning: **We would not recommend using this code. Better to wait for the libraries to be supplied with more widely supported Javascript features employed, or for the methods to support these features within React to be documented.** 

### 4. Continuing to modify the front end code

Once the errors in the Godwoken integration node modules are patched, we can set to integrating these modules into the ported front end code.

First we add the web3 node module that will be used to communicate with the Nervos network:

```bash
yarn add web3
```

```javascript
import Web3 from 'web3';
```

We then create a function to create a web3 object configured with a Polyjuice provider (Note that you need a wallet like [MetaMask](https://metamask.io/) installed as this provides window.ethereum to your Javascript app in the browser):

```javascript

const CONFIG = {
	WEB3_PROVIDER_URL: 'https://godwoken-testnet-web3-rpc.ckbapp.dev',
	ROLLUP_TYPE_HASH: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
	ETH_ACCOUNT_LOCK_CODE_HASH: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22'
};

async function createWeb3() {
    if (window.ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}
```


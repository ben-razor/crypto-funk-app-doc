## How to port a Classic Ethereum DApp To Nervos Network

Ethereum as a platform has been a launchpad for popular DApps from DeFi to NFTs and more. As blockchain technology develops, interoperability of different chains will become ever more important. [Nervos Network](https://www.nervos.org/) has created a new platform for DApps that enables the interoperability of DApps created for different blockchains.

In this article, we take you through the process of porting an existing DApp from Ethereum to Nervos.

Nervos is a dual layer system. A proof of work Layer 1 provides security while layer 2 allows fast DApps to be deployed using code from existing blockchains. At present, DApps for the Ethereum Virtual Machine are supported. Nervos plans to provide support for more platforms in the future.

An additional strength of deploying to Nervos is that it allows mixing and matching of wallets from various blockchains for use with the deployed DApp.

### Porting Crypto Punks to Nervos

What better way to demonstrate the potential of Nervos network's interoperability than to port the legendary early example of Non Fungible Token 
(NFT) artwork, **Crypto Punks**.

[Crypto Punks Website](https://www.larvalabs.com/cryptopunks)

[Crypto Punks Github](https://github.com/larvalabs/cryptopunks)

We call the ported app **Crypto Funk**. You can view the source on GitHub:

[Crypto Funk Source Code on Github](https://github.com/ben-razor/crypto-funk-app-doc/tree/main/crypto-funk-app-tutorial/src)

In this tutorial we will focus on 3 source files:

1. [The ported Ethereum contract](https://github.com/ben-razor/crypto-funk-app-doc/blob/main/crypto-funk-app-tutorial/contracts/CryptoFunkMarket.sol)
2. [The main React App.js](https://github.com/ben-razor/crypto-funk-app-doc/blob/main/crypto-funk-app-tutorial/src/App.js)
3. [The contract wrapper CryptoFunkWrapper.js](https://github.com/ben-razor/crypto-funk-app-doc/blob/main/crypto-funk-app-tutorial/src/lib/contracts/CryptoFunkWrapper.js)

To port the app, we take the following steps.

### 1. Prepare the contract for porting

The [Solidity Smart Contract](https://github.com/larvalabs/cryptopunks/blob/master/contracts/CryptoPunksMarket.sol) for Crypto Punks is open source under the MIT licence but the artwork is not covered by the licence, so we need to remove the data that is specific to the artwork and provide a way for users of the contract to provide their own artwork.

The smart contract contains a SHA-256 hash of the image containing all the crypto punks so that a buyer can verify the image they have is official.

The ownership is assigned by mapping an index into the image to an Ethereum address.

```solidity
contract CryptoPunksMarket {

    // You can use this hash to verify the image file containing all the punks
    string public imageHash = "ac39af4793119ee46bbff351d8cb6b5f23da60222126add4268e261199a2921b";
    
    //mapping (address => uint) public addressToPunkIndex;
    mapping (uint => address) public punkIndexToAddress;
```

The first step is to remove the Crypto Punk hash and allow a hash of the image to be provided when the contract is deployed, along with the number of NFTs (totalSupply) the image contains:

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

With these changes made we are ready to port to Nervos.

### 2. Modify the Ethereum contract to run on Nervos

This is an easy one. No changes need to be made to the contract as Nervos provides an EVM compatible engine called **Polyjuice**. Contracts are written in standard Ethereum Solidity using the nice tooling Ethereum has available, and then run without changes on Nervos.

Ethereum [Truffle](https://www.trufflesuite.com/tutorial) is used to compile the contract. This generates a JSON file with the same name as your contract, this defines the allowed methods of the contract, and will be imported later when creating the front end for the DApp.

### 3. Modify the front end code

Most of the changes needed to port an Ethereum DApp to Nervos involve front end code. The Crypto Funk port was written using [ReactJS](https://reactjs.org/).

Creating a React app is simple. At a command line we type:

```bash
npx create-react-app crypto-funk-app
cd crypto-funk-app
yarn start
```

#### Set up imports

DApps on the web communicate with Ethereum using a library called web3.js. 

We add the web3 module that will be used to communicate with the Nervos network on the command line:

```bash
yarn add web3
```

And add this to the includes in App.js:

```javascript
import Web3 from 'web3';
```

Nervos DApps are no different but as Nervos has a different system design to Ethereum, it must provide its own interface. In web3.js, this means supplying a custom *provider*.

```bash
yarn add @polyjuice-provider/web3@0.0.1-rc7
```

The package is brought into your React application by using an import in App.js:

```javascript
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
```

A quirk to watch out for is that although contract methods will be called with an Ethereum address. Addresses returned by the contract are Godwoken addresses. Nervos suggest importing nervos-godwoken-integration@0.0.6. This allows Ethereum addresses to be converted into Godwoken addresses. This didn't play well with React so the module is included in the Crypto Funk source and imported locally:

```javascript
import { AddressTranslator } from './nervos-godwoken-integration';
```

#### Create deployment functions

Now we can create a function to create a web3 object configured with a Polyjuice provider (Note that you need a wallet like [MetaMask](https://metamask.io/) installed as this provides window.ethereum to your JavaScript app in the browser):

```javascript

const CONFIG = {
	WEB3_PROVIDER_URL: 'https://godwoken-testnet-web3-rpc.ckbapp.dev',
	ROLLUP_TYPE_HASH: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
	ETH_ACCOUNT_LOCK_CODE_HASH: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22'
};

/**
 * Configure Web3 to interact with Nervos L2 network.
 * 
 * @returns A Web3 object configured for use with Nervos L2 network
 */
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
        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}
```

Next we create a helper file called CryptoFunkWrapper.js, we include the JSON outputted by the Truffle compiler in Step 2, and then add a function to use the web3 interface to deploy our contract:

```javascript 
import * as CryptoFunkMarket from './CryptoFunkMarket.json';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

/**
 * Class with helper methods to deploy and interact with the Crypto Funk contract.
 */
export class CryptoFunkWrapper {

    constructor(web3) {
        this.address = null;
        this.web3 = web3;
        this.contract = new web3.eth.Contract(CryptoFunkMarket.abi);
    }

    async deploy(fromAddress, name, symbol, hash, img_count) {
        const deployTx = await (this.contract
            .deploy({
                data: CryptoFunkMarket.bytecode,
                arguments: [name, symbol, hash, img_count]
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            })
        );

        this.useDeployed(deployTx.contractAddress);

        return deployTx.transactionHash;
    }

    useDeployed(contractAddress) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
```

Back in our main App.js file we use the helpers from CryptoFunkWrapper.js to deploy the contract:

```javascript
function App() {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState();
    const [accounts, setAccounts] = useState([]);
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);

    /** Initialize web3 and get user accounts from connected wallet */
    useEffect(() => {
        if (web3) { return; }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [window.ethereum.selectedAddress];
            setAccounts(_accounts);

            (async () => {
                window.ethereum.on("accountsChanged", async function() {
                    let newAccounts = [window.ethereum.selectedAddress];
                    setAccounts(newAccounts);
                });
            })();
        })();
    });

    const account = accounts[0];

    /** Initialize the app with a previously loaded contract if one is available */
    useEffect(() => {
        if(web3 && CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS) {
            setExistingContractAddress(CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS);
        }
    }, [web3])

    /** Deploy The crypto funk contract */
    async function deployContract() {
        const _contract = new CryptoFunkWrapper(web3);

        try {
            setTransactionInProgress(true);

            await _contract.deploy(account,
                "CRYPTOFUNK",
                "???",
                "f50027cdefc8f564d4c1fac14b5a656c5e452476e490acac827dd00e5d9b0f8e",
                4
            );

            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    /** Helper to update things when the contract address is changed on init or deploy */
    const setExistingContractAddress = async function (contractAddress) {
        const _contract = new CryptoFunkWrapper(web3);
        _contract.useDeployed(contractAddress.trim());
        setContract(_contract);
    }

   return (
        <div>
            <div className="center-panel">
                <h1>Crypto Funk</h1>
                <p>Really exclusive, high quality NFT artworks</p>

                <div class="contractDeploymentPanel">
                    <button onClick={deployContract} disabled={!account}>Deploy contract</button>
                    <br />
                    <hr />
                    Deployed contract address: <b>{contract?.address || '-'}</b> <br />
                    <ToastContainer />
                </div>

            </div>
        </div>
    );
 
}
```

### 5. Deploying the contract

In order to deploy the contract, MetaMask must be configured to point at the Godwoken network:

[Configuring a Custom RPC in MetaMask](https://metamask.zendesk.com/hc/en-us/articles/360043227612-How-to-add-custom-Network-RPC)

At the time of writing the following details should be used to connect to the Godwoken testnet:

**Network Name**: Godwoken Testnet

**New RPC URL**: http://godwoken-testnet-web3-rpc.ckbapp.dev

**Chain ID**: 71393

The app is started by running:

```bash
yarn start
```

A button within the app calls deployContract() and after following through the MetaMask instructions, your DApp will be deployed.

**Deployment Complete!**

### 6. Using the deployed contract

Once the contract has been deployed, we are returned an address (_contract.address) and we can use this on the front end to interact with the contract.

We add the following code to App.js to load the contract using the returned contract address.

```javascript
   const CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS = '0xEf948E02165551c7b9EfFCE1d5dACA0D270D5aA3';
```

```javascript
    useEffect(() => {
        if(web3) {
            setExistingContractAddress(CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS);
        }
    }, [web3]
```

### 7. Interacting With The Deployed Contract

We can now interact with the contract exactly as if it was an Ethereum contract running on the ethereum network.

Firstly, in our helper file called CryptoFunkWrapper.js, we set up helper functions to wrap the methods of the contract.

```javascript
   async punksRemainingToAssign(fromAddress) {
        const data = await this.contract.methods.punksRemainingToAssign().call({ from: fromAddress });
        return parseInt(data, 10);
    }

```

And then in our App.js we call these helper functions and update the interface:

```javascript
    const updatePunkOwners = async function() {
        let punkIndexToAddressNew = [];
        for(let i = 0; i < 4; i++) {
            let address = await contract.punkIndexToAddress(i);
            punkIndexToAddressNew[i] = address;
        }
        setPunkIndexToAddress(punkIndexToAddressNew);
    }
```

If you need to see how this all fits together don't forget to check the source in [App.js](https://github.com/ben-razor/crypto-funk-app-doc/blob/main/crypto-funk-app-tutorial/src/App.js) and [CryptoFunkWrapper.js](https://github.com/ben-razor/crypto-funk-app-doc/blob/main/crypto-funk-app-tutorial/src/lib/contracts/CryptoFunkWrapper.js). This also shows how the other contract methods link up to display the completed UI.

Only the getPunk method to claim Crypto Funks with no owner is implemented in this tutorial. All the other methods follow the same pattern so you're free to create your own set of classic NFTs and add in the code to trade them.

### 8. Wrapping Up

There is much more we could get into about how the UI interacts with the various features of the contract. But once the process of connecting to the Nervos network through the Godwoken provider is done, all the tutorials and source code and tools of Ethereum are available to use with few changes. Hopefully these together will provide a base for developing some amazing DApps on Nervos Network.

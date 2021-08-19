### Porting Crypto Punks To Nervos

The big selling point of Nervos is interoperability.

Nervos is a dual layer system. A proof of work Layer 1 provides security while layer 2 allows fast DApps to be deployed using code for existing blockchain platforms. At present, DApps for the Ethereum Virtual Machine are supported. Nervos plan to provide support for more platforms in the future.

An additional strength of deploying to Nervos is that it allows mixing and matching of wallets from various blockchains for use with the deployed DApp. 

### Porting Crypto Punks to Nervos

What better way to demonstrate the potential of Nervos network's interoperability than to port a legendary and early example of Non Fungible Token 
(NFT) artwork, **Crypto Punks***.

[Crypto Punks Website](https://www.larvalabs.com/cryptopunks)
[Crypto Punks Github](https://github.com/larvalabs/cryptopunks)

We will call the ported app **Crypto Funk**

[Crypto Funk Github](https://github.com/ben-razor/crypto-funk-app)

### 1. Prepare the contract for porting

The [Solidity Smart Contract](https://github.com/larvalabs/cryptopunks/blob/master/contracts/CryptoPunksMarket.sol) for Crypto Punks is open source under the MIT licence but the artwork is not covered by the licence.

The smart contract contains SHA-256 hash of the image containing all the crypto punks so that a buyer can verify the image they have is official.

The ownership is assigned by mapping an index into the image to an ethereum address.

```solidity
contract CryptoPunksMarket {

    // You can use this hash to verify the image file containing all the punks
    string public imageHash = "ac39af4793119ee46bbff351d8cb6b5f23da60222126add4268e261199a2921b";
    
    //mapping (address => uint) public addressToPunkIndex;
    mapping (uint => address) public punkIndexToAddress;
```

The first step was to remove the Crypto Punk has and allow a hash to provided when the contract is deployed, along with the number of images (totalSupply) it contains:

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

This is an easy one. No changes need to be made to the contract as Nervos provides an EVM compatible engine called **Polyjuice**.

The tooling 

### 3. Modify the front end code

Most of the changes needed to port an Ethereum DApp to Nervos involve the front end code.

DApps on the web communicate with Ethereum using a library called web3.js. 

Nervos DApps are no different but as Nervos has a different system design to Ethereum, it must provide it's own interface. In web3.js, this means supplying a custom *provider*.

```javascript

```


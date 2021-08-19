## Crypto Funk

A Nervos Godwoken port of Cryptopunks with modification to allow suppling of custom image data.

Only getPunk is implemented in UI.

### Screenshots of getPunk process

![Pre request](https://github.com/ben-razor/nervos-hackathon/blob/main/7-port-app/getPunk-screenshot-1-pre.png)
![Start request](https://github.com/ben-razor/nervos-hackathon/blob/main/7-port-app/getPunk-screenshot-2-start-req.png)
![Sign request](https://github.com/ben-razor/nervos-hackathon/blob/main/7-port-app/getPunk-screenshot-3-sign-req.png)
![Request complete](https://github.com/ben-razor/nervos-hackathon/blob/main/7-port-app/getPunk-screenshot-4-req-complete.png)

### Link to github repo of app ported to Godwoken
https://github.com/ben-razor/crypto-funk-app

### Deployment transaction hash
0xa7dc1f296a2137d222894e7b528e0d0889abcf5b817b7480f67bb0429ceab1fa

### Deployed contract address
0xEf948E02165551c7b9EfFCE1d5dACA0D270D5aA3

### Contract ABI
	[
		{
		  "inputs": [
		    {
		      "internalType": "string",
		      "name": "_name",
		      "type": "string"
		    },
		    {
		      "internalType": "string",
		      "name": "_symbol",
		      "type": "string"
		    },
		    {
		      "internalType": "string",
		      "name": "_imageHash",
		      "type": "string"
		    },
		    {
		      "internalType": "uint256",
		      "name": "_totalSupply",
		      "type": "uint256"
		    }
		  ],
		  "payable": true,
		  "stateMutability": "payable",
		  "type": "constructor"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "to",
		      "type": "address"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "Assign",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "value",
		      "type": "uint256"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "fromAddress",
		      "type": "address"
		    }
		  ],
		  "name": "PunkBidEntered",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "value",
		      "type": "uint256"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "fromAddress",
		      "type": "address"
		    }
		  ],
		  "name": "PunkBidWithdrawn",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "value",
		      "type": "uint256"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "fromAddress",
		      "type": "address"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "toAddress",
		      "type": "address"
		    }
		  ],
		  "name": "PunkBought",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "PunkNoLongerForSale",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "minValue",
		      "type": "uint256"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "toAddress",
		      "type": "address"
		    }
		  ],
		  "name": "PunkOffered",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "from",
		      "type": "address"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "to",
		      "type": "address"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "PunkTransfer",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "from",
		      "type": "address"
		    },
		    {
		      "indexed": true,
		      "internalType": "address",
		      "name": "to",
		      "type": "address"
		    },
		    {
		      "indexed": false,
		      "internalType": "uint256",
		      "name": "value",
		      "type": "uint256"
		    }
		  ],
		  "name": "Transfer",
		  "type": "event"
		},
		{
		  "constant": true,
		  "inputs": [
		    {
		      "internalType": "address",
		      "name": "",
		      "type": "address"
		    }
		  ],
		  "name": "balanceOf",
		  "outputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "decimals",
		  "outputs": [
		    {
		      "internalType": "uint8",
		      "name": "",
		      "type": "uint8"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "imageHash",
		  "outputs": [
		    {
		      "internalType": "string",
		      "name": "",
		      "type": "string"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "name",
		  "outputs": [
		    {
		      "internalType": "string",
		      "name": "",
		      "type": "string"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [
		    {
		      "internalType": "address",
		      "name": "",
		      "type": "address"
		    }
		  ],
		  "name": "pendingWithdrawals",
		  "outputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "name": "punkBids",
		  "outputs": [
		    {
		      "internalType": "bool",
		      "name": "hasBid",
		      "type": "bool"
		    },
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "internalType": "address",
		      "name": "bidder",
		      "type": "address"
		    },
		    {
		      "internalType": "uint256",
		      "name": "value",
		      "type": "uint256"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "name": "punkIndexToAddress",
		  "outputs": [
		    {
		      "internalType": "address",
		      "name": "",
		      "type": "address"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "name": "punksOfferedForSale",
		  "outputs": [
		    {
		      "internalType": "bool",
		      "name": "isForSale",
		      "type": "bool"
		    },
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "internalType": "address",
		      "name": "seller",
		      "type": "address"
		    },
		    {
		      "internalType": "uint256",
		      "name": "minValue",
		      "type": "uint256"
		    },
		    {
		      "internalType": "address",
		      "name": "onlySellTo",
		      "type": "address"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "punksRemainingToAssign",
		  "outputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "standard",
		  "outputs": [
		    {
		      "internalType": "string",
		      "name": "",
		      "type": "string"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "symbol",
		  "outputs": [
		    {
		      "internalType": "string",
		      "name": "",
		      "type": "string"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": true,
		  "inputs": [],
		  "name": "totalSupply",
		  "outputs": [
		    {
		      "internalType": "uint256",
		      "name": "",
		      "type": "uint256"
		    }
		  ],
		  "payable": false,
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "getPunk",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "address",
		      "name": "to",
		      "type": "address"
		    },
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "transferPunk",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "punkNoLongerForSale",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "internalType": "uint256",
		      "name": "minSalePriceInWei",
		      "type": "uint256"
		    }
		  ],
		  "name": "offerPunkForSale",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "internalType": "uint256",
		      "name": "minSalePriceInWei",
		      "type": "uint256"
		    },
		    {
		      "internalType": "address",
		      "name": "toAddress",
		      "type": "address"
		    }
		  ],
		  "name": "offerPunkForSaleToAddress",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "buyPunk",
		  "outputs": [],
		  "payable": true,
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [],
		  "name": "withdraw",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "enterBidForPunk",
		  "outputs": [],
		  "payable": true,
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    },
		    {
		      "internalType": "uint256",
		      "name": "minPrice",
		      "type": "uint256"
		    }
		  ],
		  "name": "acceptBidForPunk",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "constant": false,
		  "inputs": [
		    {
		      "internalType": "uint256",
		      "name": "punkIndex",
		      "type": "uint256"
		    }
		  ],
		  "name": "withdrawBidForPunk",
		  "outputs": [],
		  "payable": false,
		  "stateMutability": "nonpayable",
		  "type": "function"
		}
	  ]

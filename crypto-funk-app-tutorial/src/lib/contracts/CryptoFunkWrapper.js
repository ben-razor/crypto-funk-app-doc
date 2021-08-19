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

    async punksRemainingToAssign(fromAddress) {
        const data = await this.contract.methods.punksRemainingToAssign().call({ from: fromAddress });
        return parseInt(data, 10);
    }

    async punkIndexToAddress(index) {
        const data = await this.contract.methods.punkIndexToAddress(index).call();
        return data;
    }

    async punksOfferedForSale(index) {
        const data = await this.contract.methods.punksOfferedForSale(index).call();
        return data;
    }

    async punkBids(index) {
        const data = await this.contract.methods.punkBids(index).call();
        return data;
    }

    async getPunk(index, fromAddress) {
        const tx = await this.contract.methods.getPunk(index).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }
}

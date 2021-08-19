import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState, Fragment } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';
import { CryptoFunkWrapper } from './lib/contracts/CryptoFunkWrapper';
import CompiledContractArtifact from './build/contracts/ERC20.json';
import { CONFIG } from './config.js';
import BigInt from 'big-integer';

const SUDT_PROXY_CONTRACT_ADDRESS = '0xC517f5b092154072EF94ddFcAA02D920e4F6aEdF';
const SUDT_CKETH_ADDRESS = '0x5e4229de7f1a6304099385638e4ef3e85ab7a02b0ed4d4a95783ebd982edb691';
const CKETH_ETH_ADDRESS = '0x0670009F6126e57C679E90aEE46861D28DA2F703';
const CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS = '0xEf948E02165551c7b9EfFCE1d5dACA0D270D5aA3';

const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
const providerConfig = {
    rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
    ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
    web3Url: godwokenRpcUrl
};

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

async function createWeb3() {
    // Modern dapp browsers...
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

function App() {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState();
    const [accounts, setAccounts] = useState([]);
    const [l2Balance, setL2Balance] = useState();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState('');
    const [storedValue, setStoredValue] = useState();
    const [deployTxHash, setDeployTxHash] = useState();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [newStoredNumberInputValue, setNewStoredNumberInputValue] = useState();
    const [punkIndexToAddress, setPunkIndexToAddress] = useState([]);
    const [punksOfferedForSale, setPunksOfferedForSale] = useState([]);
    const [punkBids, setPunkBids] = useState([]);

    const updatePunkOwners = async function() {
        let punkIndexToAddressNew = [];
        for(let i = 0; i < 4; i++) {
            let address = await contract.punkIndexToAddress(i);
            punkIndexToAddressNew[i] = address;
        }
        setPunkIndexToAddress(punkIndexToAddressNew);
    }

    const updatePunksOfferered = async function() {
        let punksOfferedForSaleNew = [];
        for(let i = 0; i < 4; i++) {
            let offer = await contract.punksOfferedForSale(i);
            punksOfferedForSaleNew[i] = offer;
        }
        setPunksOfferedForSale(punksOfferedForSaleNew);
    }

    const updatePunkBids = async function() {
        let punkBidsNew = [];
        for(let i = 0; i < 4; i++) {
            let bid = await contract.punkBids(i);
            punkBidsNew[i] = bid;
        }
        setPunkBids(punkBidsNew);
    }

    useEffect(() => {
        if(contract) {
            updatePunkOwners();
            updatePunksOfferered();
            updatePunkBids();
        }
    }, [accounts[0], contract]);

    useEffect(() => {
        if (accounts[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts[0];

    async function deployContract() {
        const _contract = new CryptoFunkWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account,
            "CRYPTOFUNK",
            "☮",
            "f50027cdefc8f564d4c1fac14b5a656c5e452476e490acac827dd00e5d9b0f8e",
            4
            );

            setDeployTxHash(transactionHash);
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

    async function getStoredValue() {
        let value = await contract.punkIndexToAddress();
        toast('Successfully read latest stored value.', { type: 'success' });

        setStoredValue(value);
    }

    const setExistingContractAddress = async function (contractAddress) {
        setTransactionInProgress(true);
        const _contract = new CryptoFunkWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setStoredValue(undefined);
    }

    async function getPunk(index) {
        try {
            setTransactionInProgress(true);
            await contract.getPunk(index, account);

            let punkIndexToAddressNew = [];
            for(let i = 0; i < 4; i++) {
                if(i === index) {
                    punkIndexToAddressNew[i] = account;
                }
                else {
                    punkIndexToAddressNew[i] = punkIndexToAddress[i];
                }
            }
            setPunkIndexToAddress(punkIndexToAddressNew);

            toast(
                'Congratulations! You are now proud owner of a Crypto Funk!!',
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

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [window.ethereum.selectedAddress];
            setAccounts(_accounts);

            if (_accounts && _accounts[0]) {
                let res = await _web3.eth.getBalance(_accounts[0]);
                const _l2Balance = BigInt(res).value;
                setL2Balance(_l2Balance);
            }

        })();
    });

    useEffect(() => {
        if(web3) {
            setExistingContractAddress(CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS);
        }
    }, [web3])

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    let punkNames = ['Sharon', 'BalloonFace', 'Don Snow', 'Yso Angry'];
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    function isAddress(address) {
        return address && address !== zeroAddress;
    }
    function getPunkPanel(name, index) {
        let price = 0;
        let offer = punksOfferedForSale[index];
        if(offer && offer.isForSale) {
            price = offer.minValue;
        }
        let bidPrice = 0;
        let bid = punkBids[index];
        if(bid && bid.hasBid) {
            bidPrice = bid.value;
        }
        let owner = punkIndexToAddress[index];
        let owned = false;
        if(owner && owner !== zeroAddress) {
            owned = true;
        }
        return <div className="nft-details" key={index}>
            <div className={"image-nft image-" + index}></div>
            <div>{name}</div>
            { punkIndexToAddress.length > 0 &&
                <div className="nft-controls">
                    <div className="punkOwner">
                    {!owned &&
                        <button onClick={() => getPunk(index)}>Get</button>
                    }
                    {owned && (isAddress(punkIndexToAddress[index]) ? <div>Yours</div> : <div>Owned</div>)}
                    </div>
                    <div className="punksOfferedForSale">Sell for: {price}</div>
                    <div className="punkBid">Bid: {bidPrice}</div>
                </div>
            }
        </div>
    }
        
    async function getDepositAddress(ethAddress) {
        const addressTranslator = new AddressTranslator();
        const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, ethAddress);
        return depositAddress;
    }

    async function getPolyjuiceAddress(ethAddress) {
        const addressTranslator = new AddressTranslator();
        const polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(ethAddress);
        return polyjuiceAddress;
    }

    const [paymentEthAddr, setPaymentEthAddr] = useState('');
    const [paymentPolyjuiceAddr, setPaymentPolyjuiceAddr] = useState('');
    const [paymentBalance, setPaymentBalance] = useState(0);
    const [depositAddr, setDepositAddr] = useState('');

    function handlePaymentEthAddrChanged(event) {
        console.log(event.target.value)
        setPaymentEthAddr(event.target.value);
    }

    async function getPolyjuiceBalance() {
        const contract = new web3.eth.Contract(CompiledContractArtifact.abi, SUDT_PROXY_CONTRACT_ADDRESS);
        let balance = await contract.methods.balanceOf(polyjuiceAddress).call({
            from: paymentEthAddr
        });
        console.log(balance);
        return balance;
    }

    function handlePaymentEthAddrSubmit(event) {
        async function handlePaymentEthAddrSubmit() {
            let depositAddrNew = await getDepositAddress(paymentEthAddr);
            setDepositAddr(depositAddrNew.addressString);
            let polyjuiceAddr = await getPolyjuiceAddress(paymentEthAddr);
            setPaymentPolyjuiceAddr(polyjuiceAddr);

            let erc20Balance = await getPolyjuiceBalance();
            setPaymentBalance(erc20Balance);
        }
        handlePaymentEthAddrSubmit();
       event.preventDefault();
    }


    return (
    <div>
        <div className="center-panel">
            <h1>Crypto Funk</h1>
            <p>Really exclusive, high quality NFT artworks</p>

            <Fragment>
                <div className="image-panel">
                { 
                    punkNames.map((name, index) => {
                        return getPunkPanel(name, index);
                    })
                }
                </div>
            </Fragment> 

            { !punkIndexToAddress.length &&
                <Fragment>
                    <h3>CHILL OUT</h3>
                    <p>A contract is loading...</p>
                </Fragment>
            }
            <div className="forceBridgeExample">
                <p>
                    Hey dude, you wanna get funky with your Eth? I got what you need.
                </p>
                <form onSubmit={handlePaymentEthAddrSubmit}>
                    <input type="text" size="" onChange={handlePaymentEthAddrChanged} placeholder="Enter Ethereum address" />
                    <input type="submit" value="Create ckEth deposit address" />
                </form>

                {depositAddr &&
                    <div>
                        <p>
                            Deposit address: {depositAddr && 
                                <div>
                                    <p className="depositAddr">{depositAddr}</p>
                                    <p>
                                        Use the <a href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000">force bridge</a> to convert to your eth to magic ckEth.
                                    </p>
                                    <p>
                                        (Enter this deposit address for the recipient)
                                    </p>
                                </div>
                            }
                        </p>
                        <p>
                            Polyjuice address: {paymentPolyjuiceAddr && 
                                <div>
                                    <p className="depositAddr">{paymentPolyjuiceAddr}</p>
                                </div>
                            }
                        </p>
                        <p>
                            ERC20 balance: {paymentBalance && 
                                <div>
                                    <p>{paymentBalance}</p>
                                </div>
                            }
                        </p>
                    </div>
                }
            </div>


        </div>

        <div class="contractDeploymentPanel">
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
            Nervos Layer 2 balance:{' '}
            <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br />
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            Deploy transaction hash: <b>{deployTxHash || '-'}</b>
            <br />
            <hr />
            <p>
                The button below will deploy a CryptoFunk smart contract where you can buy and  
                trade crypto funks.
            </p>
            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            <button onClick={getStoredValue} disabled={!contract}>
                Get stored value
            </button>
            {storedValue ? <>&nbsp;&nbsp;Stored value: {storedValue.toString()}</> : null}
            <br />
            <br />
            <input
                type="number"
                onChange={e => setNewStoredNumberInputValue(parseInt(e.target.value, 10))}
            />
            <br />
            <br />
            <br />
            <br />
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <ToastContainer />
        </div>

        </div>
    );
}

export default App;

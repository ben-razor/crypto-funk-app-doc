/** React and UI imports */
import './App.css';
import React, { useEffect, useState, Fragment } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/** DApp related imports */
import Web3 from 'web3';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { CryptoFunkWrapper } from './lib/contracts/CryptoFunkWrapper';

/** Config required by Polyjuice to create a provider */
const CONFIG = {
	WEB3_PROVIDER_URL: 'https://godwoken-testnet-web3-rpc.ckbapp.dev',
	ROLLUP_TYPE_HASH: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
	ETH_ACCOUNT_LOCK_CODE_HASH: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22'
};

/** Address of previously deployed contract */
const CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS = '0xEf948E02165551c7b9EfFCE1d5dACA0D270D5aA3';

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

/** React app entry point */
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
        })();
    });

    const account = accounts[0];

    /** Initialize the app with a previously loaded contract if one is available */
    useEffect(() => {
        if(web3 && CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS) {
            setExistingContractAddress(CRYPTO_FUNK_SUPER_OFFICIAL_ADDRESS);
        }
    }, [web3])

    /** Display a toast when transactions are in progress */
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
    }, [transactionInProgress]);

    /** Deploy The crypto funk contract */
    async function deployContract() {
        const _contract = new CryptoFunkWrapper(web3);

        try {
            setTransactionInProgress(true);

            await _contract.deploy(account,
                "CRYPTOFUNK",
                "☮",
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

    /**
     * A set of methods to interact with the deployed contract.
     */
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

    let punkNames = ['Sharon', 'BalloonFace', 'Don Snow', 'Yso Angry'];
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    function isAddress(address) {
        return address && address !== zeroAddress;
    }

    /** UI Helper function to draw the details for a Crypto Funk */
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

    /** Render the UI */
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

                <div class="contractDeploymentPanel">
                    <button onClick={deployContract} disabled={!account}>
                        Deploy contract
                    </button>
                    <br />
                    <hr />
                    Deployed contract address: <b>{contract?.address || '-'}</b> <br />
                    <ToastContainer />
                </div>

            </div>
        </div>
    );
}

export default App;

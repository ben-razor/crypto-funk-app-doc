"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressTranslator = void 0;
const pw_core_1 = __importStar(require("@lay2/pw-core"));
const base_1 = require("@ckb-lumos/base");
const config_json_1 = __importDefault(require("../config/config.json"));
const helpers_1 = require("./helpers");
const helpers_2 = require("@ckb-lumos/helpers");
class AddressTranslator {
    _config;
    _deploymentConfig;
    constructor(config) {
        if (config) {
            this._config = config;
        }
        else {
            this._config = {
                CKB_URL: config_json_1.default.ckb_url,
                INDEXER_URL: config_json_1.default.indexer_url,
                deposit_lock_script_type_hash: config_json_1.default.deposit_lock.script_type_hash,
                eth_account_lock_script_type_hash: config_json_1.default.eth_account_lock.script_type_hash,
                rollup_type_script: config_json_1.default.chain.rollup_type_script,
                rollup_type_hash: config_json_1.default.rollup_script_hash,
                portal_wallet_lock_hash: config_json_1.default.portal_wallet_lock_hash,
            };
        }
        this._deploymentConfig = helpers_1.generateDeployConfig(this._config.deposit_lock_script_type_hash, this._config.eth_account_lock_script_type_hash);
    }
    getDepositionLockArgs(ownerLockHash, layer2_lock_args, cancelTimeout = "0xc00000000002a300") {
        const rollup_type_hash = helpers_1.getRollupTypeHash(this._config.rollup_type_script);
        const depositionLockArgs = {
            owner_lock_hash: ownerLockHash,
            layer2_lock: {
                code_hash: this._deploymentConfig.eth_account_lock.code_hash,
                hash_type: this._deploymentConfig.eth_account_lock.hash_type,
                args: rollup_type_hash + layer2_lock_args.slice(2),
            },
            cancel_timeout: cancelTimeout, // relative timestamp, 2 days
        };
        return depositionLockArgs;
    }
    async getLayer2DepositAddress(web3, ethAddr) {
        let provider;
        if (await this.checkDefaultWeb3AccountPresent(web3)) {
            provider = new pw_core_1.Web3ModalProvider(web3);
        }
        else {
            provider = new pw_core_1.RawProvider('0x23211b1f333aece687eebc5b90be6b55962f5bf0433edd23e1c73d93a67f70e5');
        }
        const collector = new pw_core_1.IndexerCollector(this._config.INDEXER_URL);
        await new pw_core_1.default(this._config.CKB_URL).init(provider, collector);
        const pwAddr = new pw_core_1.Address(ethAddr, pw_core_1.AddressType.eth);
        const ownerLockHash = pwAddr.toLockScript().toHash();
        const depositionLockArgs = this.getDepositionLockArgs(ownerLockHash, pwAddr.lockArgs);
        const serializedArgs = helpers_1.serializeArgs(depositionLockArgs, this._config.rollup_type_script);
        const depositionLock = helpers_1.generateDepositionLock(this._deploymentConfig, serializedArgs);
        const script = pw_core_1.Script.fromRPC(depositionLock);
        const depositAddr = pw_core_1.Address.fromLockScript(script);
        return depositAddr;
    }
    ethAddressToCkbAddress(ethAddress, isTestnet = false) {
        const script = {
            code_hash: this._config.portal_wallet_lock_hash,
            hash_type: "type",
            args: ethAddress,
        };
        const { predefined } = require("@ckb-lumos/config-manager");
        const address = helpers_2.generateAddress(script, isTestnet
            ? {
                config: predefined.AGGRON4,
            }
            : undefined);
        return address;
    }
    ethAddressToGodwokenShortAddress(ethAddress) {
        if (ethAddress.length !== 42 || !ethAddress.startsWith("0x")) {
            throw new Error("eth address format error!");
        }
        const layer2Lock = {
            code_hash: this._config.eth_account_lock_script_type_hash,
            hash_type: "type",
            args: this._config.rollup_type_hash + ethAddress.slice(2).toLowerCase(),
        };
        const scriptHash = base_1.utils.computeScriptHash(layer2Lock);
        const shortAddress = scriptHash.slice(0, 42);
        return shortAddress;
    }
    async checkDefaultWeb3AccountPresent(web3) {
        const accounts = await web3.eth.getAccounts();
        return Boolean(accounts?.[0]);
    }
}
exports.AddressTranslator = AddressTranslator;

import { Address } from "@lay2/pw-core";
import { HexString } from "@ckb-lumos/base";
import { IAddressTranslatorConfig } from "./types";
export declare class AddressTranslator {
    private _config;
    private _deploymentConfig;
    constructor(config?: IAddressTranslatorConfig);
    private getDepositionLockArgs;
    getLayer2DepositAddress(web3: any, ethAddr: string): Promise<Address>;
    ethAddressToCkbAddress(ethAddress: HexString, isTestnet?: boolean): HexString;
    ethAddressToGodwokenShortAddress(ethAddress: HexString): HexString;
    private checkDefaultWeb3AccountPresent;
}

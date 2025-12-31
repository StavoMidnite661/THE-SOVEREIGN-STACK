
// This service interacts with the POSCreditToken smart contract.
import 'server-only';
import Web3, { Contract, ContractAbi } from 'web3';
import type { Web3Account } from 'web3-eth-accounts';
import POSCreditTokenABI from './abi/POSCreditToken.json';
import sFIATABI from './abi/sFIAT.json';

const POLYGON_WS_URL = process.env.POLYGON_WS_URL || 'wss://polygon-mainnet.infura.io/ws/v3/b11abfb7dc7d40fbbd0bcf19a5266e66';
const POSCR_CONTRACT_ADDRESS = process.env.POSCR_CONTRACT_ADDRESS || '0x72958c15ad0d2b21d4b21918da68e26d01bdc16a';
// You must set this env var to the private key of a wallet that has funding and is authorized to burn tokens.
const GATEWAY_OPERATOR_PRIVATE_KEY = process.env.GATEWAY_OPERATOR_PRIVATE_KEY;
const SFIAT_CONTRACT_ADDRESS = process.env.SFIAT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

class SOVRService {
  private web3: Web3;
  private poscrTokenContract: Contract<ContractAbi>;
  private sFiatContract: Contract<ContractAbi>;
  private operatorAccount: Web3Account | null = null;

  constructor() {
    console.log("SOVRService initialized for POSCreditToken");

    // web3@4: let URL decide provider (ws/http)
    this.web3 = new Web3(POLYGON_WS_URL);

    this.poscrTokenContract = new this.web3.eth.Contract(
      POSCreditTokenABI as ContractAbi,
      POSCR_CONTRACT_ADDRESS
    );

    this.sFiatContract = new this.web3.eth.Contract(
        sFIATABI as ContractAbi,
        SFIAT_CONTRACT_ADDRESS
    );

    if (GATEWAY_OPERATOR_PRIVATE_KEY) {
      if (!GATEWAY_OPERATOR_PRIVATE_KEY.startsWith('0x')) {
        throw new Error('GATEWAY_OPERATOR_PRIVATE_KEY must be 0x-prefixed');
      }
      const account = this.web3.eth.accounts.privateKeyToAccount(GATEWAY_OPERATOR_PRIVATE_KEY);
      this.operatorAccount = account;
      this.web3.eth.accounts.wallet.add(account);
      this.web3.eth.defaultAccount = account.address;
      console.log(`SOVRService operator account set to: ${account.address}`);
    } else {
        console.error("GATEWAY_OPERATOR_PRIVATE_KEY is not set. Transactions will fail.");
    }
  }

  async getPOSCRBalance(address: string): Promise<string> {
    const balance = await this.poscrTokenContract.methods.balanceOf(address).call();
    return this.web3.utils.fromWei(String(balance), 'ether');
  }

  async burnForPOSPurchase(fromAddress: string, amount: string, retailerId: string, complianceDataHash: string): Promise<any> {
    if (!this.operatorAccount) {
        throw new Error("Gateway operator private key is not configured.");
    }
    console.log(`Burning ${amount} POSCR for retailer ${retailerId}`);
    
    // The contract's burnForPOSPurchase seems to imply the burner is the msg.sender.
    // This architecture assumes the Gateway itself is the operator/burner.
    // The `fromAddress` parameter from the UI might be used for logging/auditing but the transaction is sent by the operator.
    
    const amountInWei = this.web3.utils.toWei(amount, 'ether');

    // The ABI expects bytes32, so we need to ensure the hash is correctly formatted.
    const formattedComplianceHash = complianceDataHash.startsWith('0x') ? complianceDataHash : `0x${complianceDataHash}`;
    if (formattedComplianceHash.length !== 66) {
        throw new Error("Invalid complianceDataHash format. Must be a 32-byte hex string with 0x prefix.");
    }

    const tx = this.poscrTokenContract.methods.burnForPOSPurchase(amountInWei, retailerId, formattedComplianceHash);
    
    const gas = await tx.estimateGas({ from: this.operatorAccount.address });
    const gasPrice = await this.web3.eth.getGasPrice();

    console.log(`Sending burn transaction from ${this.operatorAccount.address}`);
    
    const signedTx = await this.web3.eth.accounts.signTransaction(
        {
            to: POSCR_CONTRACT_ADDRESS,
            data: tx.encodeABI(),
            gas,
            gasPrice,
        },
        this.operatorAccount.privateKey
    );

    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Burn transaction successful:', receipt.transactionHash);

    return { success: true, txHash: receipt.transactionHash };
  }

  async mintsFIAT(toAddress: string, amount: string): Promise<any> {
    if (!this.operatorAccount) {
        throw new Error("Gateway operator private key is not configured.");
    }
    console.log(`Minting ${amount} sFIAT to ${toAddress}`);

    const amountInWei = this.web3.utils.toWei(amount, 'ether');
    const tx = this.sFiatContract.methods.mint(toAddress, amountInWei);

    const gas = await tx.estimateGas({ from: this.operatorAccount.address });
    const gasPrice = await this.web3.eth.getGasPrice();

    console.log(`Sending mint transaction from ${this.operatorAccount.address}`);

    const signedTx = await this.web3.eth.accounts.signTransaction(
        {
            to: SFIAT_CONTRACT_ADDRESS,
            data: tx.encodeABI(),
            gas,
            gasPrice,
        },
        this.operatorAccount.privateKey
    );

    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Mint transaction successful:', receipt.transactionHash);

    return { success: true, txHash: receipt.transactionHash };
  }
}

export const sovrService = new SOVRService();

    
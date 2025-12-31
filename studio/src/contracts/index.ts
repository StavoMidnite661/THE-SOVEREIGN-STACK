/**
 * Credit Terminal Contract Exports
 * 
 * This module provides access to Credit Terminal contract ABIs and addresses
 * for the Studio app to interact with the authorization engine.
 */

// Contract ABIs
import AttestorOracleEIP712ABI from './AttestorOracleEIP712.json';
import CreditEventRegistryABI from './CreditEventRegistry.json';

// Deployed Addresses
import addresses from './addresses.json';

// Type definitions
export interface ContractAddresses {
  SOVRToken: string;
  sFIAT: string;
  ReserveManager: string;
  SOVRPrivatePool: string;
  SOVRProgrammablePool: string;
  SOVRHybridRouter_v2: string;
  AttestorOracleEIP712: string;
  TWAPHelper: string;
  CreditEventRegistry: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  contracts: ContractAddresses;
}

// Credit Event Types (matches CreditEventRegistry.sol)
export enum CreditEventType {
  CREDIT_DEPOSITED = 0,
  VALUE_CREATED = 1,
  CREDIT_PROOF_ATTESTED = 2,
  ATTESTATION_VERIFIED = 3,
  CREDIT_UNLOCKED = 4,
  MERCHANT_VALUE_REQUESTED = 5,
  MERCHANT_VALUE_ISSUED = 6,
  GIFT_CARD_CREATED = 7,
  SPEND_AUTHORIZED = 8,
  SPEND_EXECUTED = 9,
  SPEND_SETTLED = 10,
  SPEND_FAILED = 11,
  USER_REWARD_EARNED = 12,
  CASHBACK_ISSUED = 13,
  BALANCE_RECONCILED = 14,
  AUDIT_LOG_CREATED = 15,
}

// Get addresses for a specific network
export function getAddresses(network: 'base' | 'baseSepolia' | 'localhost'): NetworkConfig {
  return addresses[network] as NetworkConfig;
}

// Get address for a specific contract on a specific network
export function getContractAddress(
  network: 'base' | 'baseSepolia' | 'localhost',
  contract: keyof ContractAddresses
): string {
  return addresses[network].contracts[contract];
}

// Export ABIs
export const ABIs = {
  AttestorOracleEIP712: AttestorOracleEIP712ABI.abi,
  CreditEventRegistry: CreditEventRegistryABI.abi,
};

// Default export
export default {
  addresses,
  ABIs,
  getAddresses,
  getContractAddress,
  CreditEventType,
};

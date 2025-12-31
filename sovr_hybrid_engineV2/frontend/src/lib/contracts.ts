// SOVR Contract Addresses on Base Mainnet
// Source of truth: /deployment/BASE_ACTIVE_ADDRESSES.json
export const CONTRACTS = {
  base: {
    SOVR: '0x65e75d0fc656a2e81ef17e9a2a8da58d82390422' as const,
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
    sFIAT: '0x2c98e9c8ba005dc690d98e2e31a4811c094e0be3' as const,
    ReserveManager: '0xed3db8f97024a3be5f5ae22f27024e5e94fad64a' as const,
    SOVRPrivatePool: '0x18d4a13a0116b360efddb72aa626721cfa2a8228' as const,
    ProgrammablePool: '0x4f9b7a45b5234ca1cc96980d2cb0f49768d26622' as const,
    SOVRHybridRouter: '0x200dbb33ff5ff1a75d9d7f49b88e8361349eda4d' as const, // V2 - deployed Dec 5, 2025
    AttestorOracle: '0xaca71bc598139d9167414ae666f7cd9377b871f7' as const,
    TWAPHelper: '0xf60090f7b6006593ca818aa71f9bffc7460ccb0c' as const, // Deployed Dec 5, 2025
  },
  baseSepolia: {
    SOVR: '0x0000000000000000000000000000000000000000' as const,
    sFIAT: '0x0000000000000000000000000000000000000000' as const,
    SOVRHybridRouter: '0x0000000000000000000000000000000000000000' as const,
  },
} as const;

export function getAddress(contract: keyof typeof CONTRACTS.base, chainId: number): `0x${string}` {
  if (chainId === 8453) return CONTRACTS.base[contract];
  throw new Error(`Chain ${chainId} not supported`);
}


import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'SOVR Credit Terminal',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || 'demo',
  chains: [
    base,
    baseSepolia,
    ...(process.env.NODE_ENV === 'development' ? [hardhat] : []),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_BASE || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA || 'https://sepolia.base.org'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
  ssr: true,
});

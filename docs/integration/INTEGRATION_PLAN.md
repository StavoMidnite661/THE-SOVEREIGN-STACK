# Integration Plan: Studio App + Credit Terminal

## 1. System Components
*   **Credit Terminal** (`sovr_hybrid_engineV2`): The "On-Chain" Logic (Hardhat Smart Contracts).
*   **Studio App** (`studio`): The "Off-Chain" User Interface (Next.js).

## 2. Integration Strategy
The **Studio** will act as the frontend dashboard for the **Credit Terminal**'s smart contracts.

### Step 1: The Bridge (ABI Export)
We need to make the Studio "aware" of the Credit Terminal's contracts.
1.  **Compile Contracts**: Run `npx hardhat compile` in `sovr_hybrid_engineV2`.
2.  **Export Artifacts**: We will create a script to copy the generated JSON ABIs (Application Binary Interfaces) from `sovr_hybrid_engineV2/artifacts` directly into `studio/src/abis`.
3.  **Export Addresses**: When you deploy (locally or to testnet), the deploy script must save the contract addresses to `studio/src/config/contracts.json`.

### Step 2: The Logic (Ethers.js Hooks)
In the **Studio App**, we will create a custom hook `useCreditTerminal.ts`:
```typescript
import { ethers } from 'ethers';
import CreditTerminalABI from '@/abis/CreditTerminal.json';
import ContractAddresses from '@/config/contracts.json';

export const useCreditTerminal = () => {
    // Connect to specific contract
    const getContract = (provider) => {
        return new ethers.Contract(
            ContractAddresses.CreditTerminal,
            CreditTerminalABI,
            provider
        );
    }
    
    // Example Read Action
    const getPoolBalance = async () => {
        // ... implementation
    }
}
```

### Step 3: The Workflow (Local Dev)
1.  **Terminal 1**: Run `npx hardhat node` in `sovr_hybrid_engineV2`. This starts a local blockchain on `http://127.0.0.1:8545`.
2.  **Terminal 2**: Run `npx hardhat run scripts/deploy_local.js --network localhost`. This deploys contracts and updates the 'address' file in Studio.
3.  **Terminal 3**: Run `npm run dev` in `studio`. The app will now connect to the contracts running in Terminal 1.

## 3. Immediate Action Plan
We need to create the "glue" scripts.

1.  **Create Export Script**: A script in `sovr_hybrid_engineV2` to copy ABIs to `studio`.
2.  **Create Config File**: Ensure `studio` has a place to store contract addresses.
3.  **Connect**: Write a simple test page in Studio to query the contract.

# TigerBeetle Treasury & Web3 Integration Guide

## 1. Can it be used as a Treasury?
**YES.** TigerBeetle is architected specifically for this use case. Use the `ledger` field to segregate assets.

### Treasury Data Model Strategy
Instead of creating different "tables" for different assets, you use the `ledger` ID in TigerBeetle.

| Asset | Ledger ID | Example Account ID |
| :--- | :--- | :--- |
| **USD** | `1` | `1001` (Alice's USD Account) |
| **EUR** | `2` | `1002` (Alice's EUR Account) |
| **ETH** (Internal) | `100` | `1003` (Alice's ETH Balance) |
| **USDC** (Internal) | `101` | `1004` (Alice's USDC Balance) |
| **SOVR Token** | `999` | `1005` (Alice's SOVR Balance) |

### Key Features for Treasury
*   **Double-Entry**: Every movement of funds must come *from* somewhere. You will create a "Root Treasury Account" for each Ledger.
    *   *Deposit*: Debit `Bank_Settlement_Account` -> Credit `User_Account`
    *   *Withdrawal*: Debit `User_Account` -> Credit `Bank_Settlement_Account`
*   **Liquidity Management**: You can query the balance of your `Bank_Settlement_Account` instantly to know your total liability for any asset.

## 2. Web3 Integration Architecture
TigerBeetle is the **Off-Chain State Channel**. It does not speak to the blockchain directly; your application acts as the bridge.

### Workflow: Deposit (Blockchain -> TigerBeetle)
1.  **User** sends 1 ETH to your **Treasury Smart Contract**.
2.  **Indexer Service** (your Node.js app) detects the `Deposit` event on-chain.
3.  **Indexer** maps the `sender_address` (0xabc...) to a `user_id` (UUID).
4.  **Indexer** calculates the amount in Wei (e.g., `1000000000000000000`).
5.  **Indexer** calls TigerBeetle:
    ```javascript
    client.createTransfers([{
        id: uuidv4(),
        debit_account_id: TREASURY_ETH_VAULT_ID,
        credit_account_id: USER_ETH_ACCOUNT_ID,
        amount: 1000000000000000000n,
        ledger: 100, // ETH Ledger
        code: 1 // Deposit Transaction Type
    }])
    ```

### Workflow: Withdrawal (TigerBeetle -> Blockchain)
1.  **User** requests withdrawal of 1 ETH via API.
2.  **API** checks balance in TigerBeetle.
3.  **API** creates a **Pending Transfer** in TigerBeetle (Holds the funds):
    ```javascript
    client.createTransfers([{
        flags: { pending: true }, // LOCKED FUNDS
        debit_account_id: USER_ETH_ACCOUNT_ID,
        credit_account_id: TREASURY_ETH_VAULT_ID,
        amount: 1000000000000000000n,
        ledger: 100
    }])
    ```
4.  **API** submits the withdrawal transaction to the Ethereum Blockchain.
5.  **Listener** waits for Blockchain confirmation.
    *   *If Success*: **Post** the pending transfer in TigerBeetle (Finalize).
    *   *If Fail/Revert*: **Void** the pending transfer in TigerBeetle (Return funds to user).

### Handling Addresses
TigerBeetle IDs are 128-bit integers (UUIDs). Ethereum addresses are 160-bit.
*   **Do not** try to store the ETH address as the Account ID.
*   **Do** store a mapping in your SQL DB (Postgres):
    `TABLE crypto_addresses ( userId UUID, chain VARCHAR, address VARCHAR )`
*   Use the `userId` to look up the TigerBeetle Account ID.

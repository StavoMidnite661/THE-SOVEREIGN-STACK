# Studio App - SOVR Ecosystem Gateway

This is the Studio App for the SOVR ecosystem, serving as the primary user interface for financial operations. It integrates with the Credit Terminal, Oracle Ledger, and TigerBeetle to provide a seamless experience for users.

## Project Overview

The Studio App is the main interface for the SOVR ecosystem, providing users with access to:
- **Credit Terminal Integration**: Authorization and transaction management
- **Oracle Ledger**: Balance queries and financial data
- **TigerBeetle**: High-speed transaction processing
- **FIC Monitoring**: Real-time financial intelligence

### Technical Stack
- **Frontend:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS with `shadcn/ui` for component primitives
- **AI:** Google's Genkit for integrating generative AI models and flows
- **Backend Services:** Firebase for authentication and database
- **Financial Integrations:** Credit Terminal, Oracle Ledger, TigerBeetle

## SOVR Ecosystem Integration

### Architecture Overview

The Studio App integrates with the SOVR ecosystem through the following components:

1. **Credit Terminal**: Authorization engine for all financial transactions
2. **Oracle Ledger**: Central financial truth system with double-entry accounting
3. **TigerBeetle**: High-performance clearing engine for fast transaction processing
4. **FIC**: Financial Intelligence Center for real-time monitoring and fraud detection

### Integration Points

#### 1. Credit Terminal Integration

The Studio App connects to the Credit Terminal for:
- Transaction authorization
- Attestation verification
- Credit operations

**API Endpoints:**
- `POST /api/credit/transfer` - Create new transfers
- `GET /api/credit/balance` - Query account balances
- `GET /api/credit/transactions` - List transaction history

#### 2. Oracle Ledger Integration

The Studio App queries the Oracle Ledger for:
- Account balances
- Transaction history
- Financial reporting

**API Endpoints:**
- `GET /api/oracle-ledger/balance` - Query account balance
- `GET /api/oracle-ledger/transactions` - List transactions

#### 3. TigerBeetle Integration

The Studio App displays real-time data from TigerBeetle:
- Current balances
- Pending transactions
- Transaction status

**API Endpoints:**
- `GET /api/tigerbeetle/balance` - Real-time balance
- `GET /api/tigerbeetle/transactions` - Recent transactions

#### 4. FIC Integration

The Studio App receives alerts and monitoring data from FIC:
- Fraud alerts
- Compliance notifications
- Risk scores

**API Endpoints:**
- `GET /api/fic/alerts` - Recent alerts
- `GET /api/fic/risk-score` - Current risk score

## Getting Started

### Prerequisites

- Node.js (v20.x or later recommended)
- npm (v10.x or later) or yarn
- A Firebase project set up

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root of the project and add your configuration:

   ```.env.local
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...

   # Credit Terminal
   CREDIT_TERMINAL_URL=http://localhost:3002
   CREDIT_TERMINAL_API_KEY=...

   # Oracle Ledger
   ORACLE_LEDGER_URL=http://localhost:3001
   ORACLE_LEDGER_API_KEY=...

   # TigerBeetle
   TIGERBEETLE_CLUSTER_ID=0
   TIGERBEETLE_ADDRESSES=127.0.0.1:3000

   # FIC
   FIC_URL=http://localhost:3003
   FIC_API_KEY=...

   # Other services
   ...
   ```

### Running the Development Server

To run the Next.js frontend application:

```bash
npm run dev
```

This will start the development server on `http://localhost:9002`.

To run the Genkit AI flows in development mode:

```bash
npm run genkit:dev
```

## Available Scripts

This project includes several scripts to help with development and maintenance:

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs the linter to check for code quality issues.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
- `npm run test`: Executes the test suite using Jest.
- `npm run genkit:dev`: Starts the Genkit development server.
- `npm run genkit:watch`: Starts the Genkit server with file watching enabled.

## Project Structure

- `src/app/`: Main application code, following the Next.js App Router structure.
- `src/app/page.tsx`: The entry point and main page of the application.
- `src/components/`: Shared React components.
- `src/ai/`: Houses all Genkit-related AI flows and configurations.
- `public/`: Static assets like images and fonts.

## SOVR Ecosystem Workflow

### User Flow

1. **User Authentication**: User logs in via Firebase
2. **Dashboard Display**: Studio App shows account balance from Oracle Ledger
3. **Transaction Initiation**: User initiates a transaction
4. **Credit Terminal Authorization**: Transaction sent to Credit Terminal for approval
5. **TigerBeetle Processing**: Transaction processed by TigerBeetle
6. **Oracle Ledger Update**: Transaction recorded in Oracle Ledger
7. **FIC Monitoring**: Transaction monitored by FIC for fraud
8. **Confirmation**: User receives confirmation

### Technical Flow

```
User → Studio App → Credit Terminal → TigerBeetle → Oracle Ledger → FIC
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CREDIT_TERMINAL_URL` | URL of the Credit Terminal service |
| `CREDIT_TERMINAL_API_KEY` | API key for Credit Terminal authentication |
| `ORACLE_LEDGER_URL` | URL of the Oracle Ledger service |
| `ORACLE_LEDGER_API_KEY` | API key for Oracle Ledger authentication |
| `TIGERBEETLE_CLUSTER_ID` | TigerBeetle cluster ID |
| `TIGERBEETLE_ADDRESSES` | Comma-separated list of TigerBeetle replica addresses |
| `FIC_URL` | URL of the FIC service |
| `FIC_API_KEY` | API key for FIC authentication |

## Testing

Run the test suite:

```bash
# Unit tests
npm test -- --testPathPattern=unit

# Integration tests
npm test -- --testPathPattern=integration

# All tests
npm test
```

## Contributing

Contributions are welcome! Please open an issue to discuss any major changes before submitting a pull request. Ensure that all new code is covered by tests and that the linter passes.

## License

This project is licensed under the terms of the SOVR ecosystem license.
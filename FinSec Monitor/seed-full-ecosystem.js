// Seed script for Complete SOVR Ecosystem monitoring  
// Run with: node seed-full-ecosystem.js

const BASE_URL = 'http://localhost:3000/api';

async function seedFullEcosystem() {
  console.log('🚀 Seeding FULL SOVR Ecosystem monitoring data...\n');

  try {
    // ========== SERVERS ==========
    console.log('📦 Creating servers...');
    
    // Studio Server
    const studioServer = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SOVR Studio (USD Gateway)',
        host: 'localhost',
        port: 9002,
        type: 'HTTP',
        description: 'Next.js USD Gateway with Stripe integration',
        tags: ['sovr', 'gateway', 'stripe', 'production']
      })
    }).then(r => r.json());
    console.log('  ✅ SOVR Studio (USD Gateway)');

    // Hybrid Engine Hardhat Node
    const hybridServer = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SOVR Hybrid Engine (Credit Terminal)',
        host: 'localhost',
        port: 8545,
        type: 'TCP',
        description: 'Hardhat blockchain node for Credit System',
        tags: ['sovr', 'blockchain', 'hardhat']
      })
    }).then(r => r.json());
    console.log('  ✅ SOVR Hybrid Engine (Credit Terminal)');

    // Credit Terminal Frontend
    const creditFrontend = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Credit Terminal Frontend',
        host: 'localhost',
        port: 3002,
        type: 'HTTP',
        description: 'Credit Terminal React frontend',
        tags: ['sovr', 'frontend', 'credit']
      })
    }).then(r => r.json());
    console.log('  ✅ Credit Terminal Frontend');

    // CL Trader Backend
    const clTraderBackend = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'CL Trader (UltraSOVR)',
        host: 'localhost',
        port: 8766,
        type: 'TCP',
        description: 'Trading engine with AI agents (WebSocket)',
        tags: ['sovr', 'trading', 'ai', 'websocket']
      })
    }).then(r => r.json());
    console.log('  ✅ CL Trader (UltraSOVR)');

    // CL Trader Dashboard
    const clTraderDashboard = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'CL Trader Dashboard',
        host: 'localhost',
        port: 3001,
        type: 'HTTP',
        description: 'Trading dashboard frontend',
        tags: ['sovr', 'trading', 'dashboard']
      })
    }).then(r => r.json());
    console.log('  ✅ CL Trader Dashboard');

    // Oracle Ledger Frontend
    const oracleFrontend = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Oracle Ledger Frontend',
        host: 'localhost',
        port: 5173,
        type: 'HTTP',
        description: 'Oracle Ledger Vite React frontend',
        tags: ['sovr', 'oracle', 'ledger', 'frontend']
      })
    }).then(r => r.json());
    console.log('  ✅ Oracle Ledger Frontend');

    // Oracle Ledger API
    const oracleApi = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Oracle Ledger API',
        host: 'localhost',
        port: 3001,
        type: 'HTTP',
        description: 'Oracle Ledger Express API (Stripe/ACH/Direct Deposits)',
        tags: ['sovr', 'oracle', 'api', 'stripe', 'ach']
      })
    }).then(r => r.json());
    console.log('  ✅ Oracle Ledger API');

    // Oracle Ledger Hardhat Node
    const oracleHardhat = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Oracle Ledger Hardhat Node',
        host: 'localhost',
        port: 8545,
        type: 'TCP',
        description: 'Oracle Ledger local blockchain node',
        tags: ['sovr', 'oracle', 'blockchain', 'hardhat']
      })
    }).then(r => r.json());
    console.log('  ✅ Oracle Ledger Hardhat Node');

    console.log('\n✨ Full SOVR Ecosystem setup complete!');
    console.log('\n📊 Summary:');
    console.log('   • 8 Servers added:');
    console.log('     - SOVR Studio (USD Gateway)');
    console.log('     - SOVR Hybrid Engine (Credit Terminal)');
    console.log('     - Credit Terminal Frontend');
    console.log('     - CL Trader (UltraSOVR)');
    console.log('     - CL Trader Dashboard');
    console.log('     - Oracle Ledger Frontend');
    console.log('     - Oracle Ledger API');
    console.log('     - Oracle Ledger Hardhat Node');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedFullEcosystem();

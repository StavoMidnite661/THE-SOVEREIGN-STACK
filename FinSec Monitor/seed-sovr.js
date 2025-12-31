// Seed script for SOVR Ecosystem monitoring
// Run with: node seed-sovr.js

const BASE_URL = 'http://localhost:3000/api';

async function seedSOVREcosystem() {
  console.log('🚀 Seeding SOVR Ecosystem monitoring data...\n');

  try {
    // ========== 1. Create Servers ==========
    console.log('📦 Creating servers...');
    
    // Studio Server (USD Gateway)
    const studioServer = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SOVR Studio (USD Gateway)',
        host: 'localhost',
        port: 9002,
        type: 'HTTP',
        description: 'Next.js USD Gateway with Stripe integration and SOVR Attestor',
        tags: ['sovr', 'gateway', 'stripe', 'production']
      })
    }).then(r => r.json());
    console.log('  ✅ Created: SOVR Studio Server');

    // Hybrid Engine Server (Credit Terminal)
    const hybridServer = await fetch(`${BASE_URL}/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SOVR Hybrid Engine (Credit Terminal)',
        host: 'localhost',
        port: 8545,
        type: 'TCP',
        description: 'Hardhat local blockchain node for SOVR Credit System',
        tags: ['sovr', 'blockchain', 'hardhat', 'smart-contracts']
      })
    }).then(r => r.json());
    console.log('  ✅ Created: SOVR Hybrid Engine Server');

    // ========== 2. Create Applications ==========
    console.log('\n📱 Creating applications...');

    // Studio App
    const studioApp = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'USD Gateway Web App',
        type: 'WEB',
        endpoint: 'http://localhost:9002',
        serverId: studioServer.id,
        description: 'SOVR USD Gateway frontend for checkout flows',
        tags: ['frontend', 'next.js', 'stripe']
      })
    }).then(r => r.json());
    console.log('  ✅ Created: USD Gateway Web App');

    // Studio API
    const studioApi = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'USD Gateway API',
        type: 'API',
        endpoint: 'http://localhost:9002/api/checkout',
        serverId: studioServer.id,
        description: 'Checkout and payment processing API',
        tags: ['api', 'checkout', 'payments']
      })
    }).then(r => r.json());
    console.log('  ✅ Created: USD Gateway API');

    // Hybrid Engine
    const hybridApp = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Credit Terminal (Blockchain)',
        type: 'DATABASE',
        endpoint: 'http://localhost:8545',
        serverId: hybridServer.id,
        description: 'Local Hardhat blockchain for SOVR Credit System',
        tags: ['blockchain', 'ethereum', 'hardhat']
      })
    }).then(r => r.json());
    console.log('  ✅ Created: Credit Terminal Blockchain');

    // ========== 3. Create API Endpoints ==========
    console.log('\n🔗 Creating API endpoints...');

    // Studio Health Check
    await fetch(`${BASE_URL}/api-endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Studio Home Page',
        url: 'http://localhost:9002',
        method: 'GET',
        applicationId: studioApp.id,
        expectedStatus: 200,
        timeout: 10000,
        interval: 30000
      })
    });
    console.log('  ✅ Created: Studio Home Page endpoint');

    // Checkout API
    await fetch(`${BASE_URL}/api-endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Checkout API',
        url: 'http://localhost:9002/api/checkout',
        method: 'POST',
        applicationId: studioApi.id,
        expectedStatus: 200,
        timeout: 15000,
        interval: 60000
      })
    });
    console.log('  ✅ Created: Checkout API endpoint');

    // Stripe Webhook
    await fetch(`${BASE_URL}/api-endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stripe Webhook Handler',
        url: 'http://localhost:9002/api/webhooks/stripe',
        method: 'POST',
        applicationId: studioApi.id,
        expectedStatus: 200,
        timeout: 10000,
        interval: 120000
      })
    });
    console.log('  ✅ Created: Stripe Webhook endpoint');

    // Hardhat JSON-RPC
    await fetch(`${BASE_URL}/api-endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hardhat JSON-RPC',
        url: 'http://localhost:8545',
        method: 'POST',
        applicationId: hybridApp.id,
        expectedStatus: 200,
        timeout: 5000,
        interval: 30000
      })
    });
    console.log('  ✅ Created: Hardhat JSON-RPC endpoint');

    // ========== 4. Create Webhooks ==========
    console.log('\n🪝 Creating webhooks...');

    await fetch(`${BASE_URL}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stripe Payment Events',
        url: 'http://localhost:9002/api/webhooks/stripe',
        applicationId: studioApi.id,
        events: ['payment.success', 'payment.failed', 'checkout.completed']
      })
    });
    console.log('  ✅ Created: Stripe Payment Events webhook');

    console.log('\n✨ SOVR Ecosystem monitoring setup complete!');
    console.log('\n📊 Summary:');
    console.log('   • 2 Servers (Studio + Hybrid Engine)');
    console.log('   • 3 Applications');
    console.log('   • 4 API Endpoints');
    console.log('   • 1 Webhook');
    console.log('\n🔄 Monitoring will begin automatically!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedSOVREcosystem();

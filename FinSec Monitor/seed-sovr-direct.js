const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function seed() {
  console.log('🚀 Adding SOVR servers directly to database...\n');

  try {
    // First, ensure we have a default user
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'admin@sovr.io',
          name: 'SOVR Admin',
        }
      });
      console.log('✅ Created default user:', user.id);
    } else {
      console.log('✅ Using existing user:', user.id);
    }

    // Create Studio Server
    const studioServer = await db.server.create({
      data: {
        name: 'SOVR Studio (USD Gateway)',
        host: 'localhost',
        port: 9002,
        type: 'HTTP',
        description: 'Next.js USD Gateway with Stripe integration',
        tags: JSON.stringify(['sovr', 'gateway', 'stripe']),
        userId: user.id,
      }
    });
    console.log('✅ Created Studio server:', studioServer.id);

    // Create Hybrid Engine Server
    const hybridServer = await db.server.create({
      data: {
        name: 'SOVR Hybrid Engine (Credit Terminal)',
        host: 'localhost',
        port: 8545,
        type: 'TCP',
        description: 'Hardhat blockchain for SOVR Credit System',
        tags: JSON.stringify(['sovr', 'blockchain', 'hardhat']),
        userId: user.id,
      }
    });
    console.log('✅ Created Hybrid Engine server:', hybridServer.id);

    // Create Studio App
    const studioApp = await db.application.create({
      data: {
        name: 'USD Gateway Web App',
        type: 'WEB',
        endpoint: 'http://localhost:9002',
        serverId: studioServer.id,
        tags: JSON.stringify(['frontend', 'next.js']),
      }
    });
    console.log('✅ Created USD Gateway app:', studioApp.id);

    // Create Hybrid App
    const hybridApp = await db.application.create({
      data: {
        name: 'Credit Terminal Blockchain',
        type: 'DATABASE',
        endpoint: 'http://localhost:8545',
        serverId: hybridServer.id,
        tags: JSON.stringify(['blockchain', 'ethereum']),
      }
    });
    console.log('✅ Created Credit Terminal app:', hybridApp.id);

    // Create Endpoints
    await db.apiEndpoint.create({
      data: {
        name: 'Studio Home',
        url: 'http://localhost:9002',
        method: 'GET',
        applicationId: studioApp.id,
        expectedStatus: 200,
        timeout: 10000,
        interval: 30000,
      }
    });
    console.log('✅ Created Studio Home endpoint');

    await db.apiEndpoint.create({
      data: {
        name: 'Checkout API',
        url: 'http://localhost:9002/api/checkout',
        method: 'POST',
        applicationId: studioApp.id,
        expectedStatus: 200,
        timeout: 15000,
        interval: 60000,
      }
    });
    console.log('✅ Created Checkout API endpoint');

    await db.apiEndpoint.create({
      data: {
        name: 'Hardhat RPC',
        url: 'http://localhost:8545',
        method: 'POST',
        applicationId: hybridApp.id,
        expectedStatus: 200,
        timeout: 5000,
        interval: 30000,
      }
    });
    console.log('✅ Created Hardhat RPC endpoint');

    // Verify
    const allServers = await db.server.findMany({ select: { name: true, host: true, port: true } });
    console.log('\n📊 All servers in database:');
    console.table(allServers);

    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

seed();

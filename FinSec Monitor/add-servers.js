     const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addServers() {
  try {
    // Get the first user (or create one if none exists)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@finsec.local',
          name: 'Admin User'
        }
      });
      console.log('✅ Created default user:', user.id);
    }

    // Add CL Trader (UltraSOVR) backend
    const clTrader = await prisma.server.upsert({
      where: { 
        host_port: {
          host: 'localhost',
          port: 8766
        }
      },
      update: {
        name: 'CL Trader (UltraSOVR)',
        type: 'TCP',
        description: 'UltraSOVR Trading Engine - Multi-Agent Algorithmic Trading System',
        isActive: true,
        tags: JSON.stringify(['trading', 'websocket', 'python', 'ai-agents'])
      },
      create: {
        name: 'CL Trader (UltraSOVR)',
        host: 'localhost',
        port: 8766,
        type: 'TCP',
        description: 'UltraSOVR Trading Engine - Multi-Agent Algorithmic Trading System',
        isActive: true,
        tags: JSON.stringify(['trading', 'websocket', 'python', 'ai-agents']),
        userId: user.id
      }
    });
    console.log('✅ Added CL Trader (UltraSOVR):', clTrader.id);

    // Add CL Trader Dashboard
    const clDashboard = await prisma.server.upsert({
      where: { 
        host_port: {
          host: 'localhost',
          port: 3001
        }
      },
      update: {
        name: 'CL Trader Dashboard',
        type: 'HTTP',
        description: 'UltraSOVR Trading Dashboard - Real-time WebSocket streaming interface',
        isActive: true,
        tags: JSON.stringify(['trading', 'dashboard', 'nextjs', 'frontend'])
      },
      create: {
        name: 'CL Trader Dashboard',
        host: 'localhost',
        port: 3001,
        type: 'HTTP',
        description: 'UltraSOVR Trading Dashboard - Real-time WebSocket streaming interface',
        isActive: true,
        tags: JSON.stringify(['trading', 'dashboard', 'nextjs', 'frontend']),
        userId: user.id
      }
    });
    console.log('✅ Added CL Trader Dashboard:', clDashboard.id);

    console.log('\n🎉 Successfully added 2 new servers!');
    console.log('Refresh your FinSec Monitor dashboard to see them.');
    
  } catch (error) {
    console.error('❌ Error adding servers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addServers();

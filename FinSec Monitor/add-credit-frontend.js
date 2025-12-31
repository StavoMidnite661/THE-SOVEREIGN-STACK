const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCreditTerminalFrontend() {
  try {
    // Get the first user
    let user = await prisma.user.findFirst();
    if (!user) {
      console.error('❌ No user found. Run add-servers.js first.');
      return;
    }

    // Add Credit Terminal Frontend
    const frontend = await prisma.server.upsert({
      where: { 
        host_port: {
          host: 'localhost',
          port: 3002
        }
      },
      update: {
        name: 'Credit Terminal Frontend',
        type: 'HTTP',
        description: 'SOVR Hybrid Engine Web Interface - Agent-driven credit terminal',
        isActive: true,
        tags: JSON.stringify(['sovr', 'credit', 'frontend', 'nextjs', 'web3'])
      },
      create: {
        name: 'Credit Terminal Frontend',
        host: 'localhost',
        port: 3002,
        type: 'HTTP',
        description: 'SOVR Hybrid Engine Web Interface - Agent-driven credit terminal',
        isActive: true,
        tags: JSON.stringify(['sovr', 'credit', 'frontend', 'nextjs', 'web3']),
        userId: user.id
      }
    });
    console.log('✅ Added Credit Terminal Frontend:', frontend.id);

    console.log('\n🎉 Successfully added Credit Terminal Frontend!');
    console.log('Refresh your FinSec Monitor dashboard to see it.');
    
  } catch (error) {
    console.error('❌ Error adding server:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCreditTerminalFrontend();

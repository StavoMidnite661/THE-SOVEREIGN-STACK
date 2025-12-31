const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAdditionalData() {
  try {
    console.log('🌱 Seeding additional data...');

    // Get existing applications
    const apps = await prisma.application.findMany();
    if (apps.length === 0) {
      console.log('❌ No applications found. Please run the main seed script first.');
      return;
    }

    console.log(`📱 Found ${apps.length} applications`);

    // Create sample API endpoints
    const endpoint1 = await prisma.apiEndpoint.create({
      data: {
        name: 'Get User Profile',
        url: 'https://api.example.com/users/{id}',
        method: 'GET',
        headers: JSON.stringify({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ***'
        }),
        expectedStatus: 200,
        timeout: 30000,
        interval: 60000,
        applicationId: apps.find(a => a.name.includes('User'))?.id || apps[0].id
      }
    });

    const endpoint2 = await prisma.apiEndpoint.create({
      data: {
        name: 'Process Payment',
        url: 'https://api.example.com/payments',
        method: 'POST',
        headers: JSON.stringify({
          'Content-Type': 'application/json',
          'X-API-Key': '***'
        }),
        body: '{"amount": 100.00, "currency": "USD"}',
        expectedStatus: 200,
        timeout: 30000,
        interval: 60000,
        applicationId: apps.find(a => a.name.includes('Payment'))?.id || apps[0].id
      }
    });

    const endpoint3 = await prisma.apiEndpoint.create({
      data: {
        name: 'Health Check',
        url: 'https://api.example.com/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 10000,
        interval: 30000,
        applicationId: apps.find(a => a.name.includes('Payment'))?.id || apps[0].id
      }
    });

    // Create sample webhooks
    const webhook1 = await prisma.webhook.create({
      data: {
        name: 'Payment Events',
        url: 'https://webhook.example.com/payments',
        secret: 'whsec_payment_secret_123',
        events: JSON.stringify(['payment.success', 'payment.failed', 'payment.refunded']),
        applicationId: apps.find(a => a.name.includes('Payment'))?.id || apps[0].id
      }
    });

    const webhook2 = await prisma.webhook.create({
      data: {
        name: 'User Activity',
        url: 'https://analytics.example.com/events',
        secret: 'whsec_user_activity_456',
        events: JSON.stringify(['user.login', 'user.logout', 'user.register']),
        applicationId: apps.find(a => a.name.includes('User'))?.id || apps[0].id
      }
    });

    const webhook3 = await prisma.webhook.create({
      data: {
        name: 'Order Processing',
        url: 'https://orders.example.com/webhook',
        events: JSON.stringify(['order.created', 'order.updated', 'order.cancelled']),
        applicationId: apps.find(a => a.name.includes('E-Commerce'))?.id || apps[0].id
      }
    });

    // Create sample API responses
    await prisma.apiResponse.createMany({
      data: [
        {
          status: 200,
          responseTime: 145,
          size: 1024,
          headers: JSON.stringify({
            'content-type': 'application/json',
            'x-request-id': 'req-123'
          }),
          apiEndpointId: endpoint1.id
        },
        {
          status: 500,
          responseTime: 2341,
          size: 512,
          headers: JSON.stringify({
            'content-type': 'application/json'
          }),
          error: 'Internal server error',
          apiEndpointId: endpoint2.id
        },
        {
          status: 200,
          responseTime: 23,
          size: 256,
          headers: JSON.stringify({
            'content-type': 'application/json'
          }),
          apiEndpointId: endpoint3.id
        }
      ]
    });

    // Create sample webhook deliveries
    await prisma.webhookDelivery.createMany({
      data: [
        {
          eventId: 'evt_payment_success_123',
          status: 'SUCCESS',
          response: 'Webhook received successfully',
          responseTime: 145,
          attempts: 1,
          webhookId: webhook1.id
        },
        {
          eventId: 'evt_user_login_456',
          status: 'SUCCESS',
          response: 'Event processed',
          responseTime: 89,
          attempts: 1,
          webhookId: webhook2.id
        },
        {
          eventId: 'evt_order_created_789',
          status: 'FAILED',
          response: 'Connection timeout',
          responseTime: 5000,
          attempts: 3,
          webhookId: webhook3.id
        }
      ]
    });

    console.log('✅ Additional data seeded successfully!');
    console.log(`📊 Created:
    - 3 API endpoints
    - 3 webhooks
    - 3 API responses
    - 3 webhook deliveries`);

  } catch (error) {
    console.error('❌ Error seeding additional data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdditionalData();
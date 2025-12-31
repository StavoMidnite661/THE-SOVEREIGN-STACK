
import { db } from '../lib/db';
import { MonitoringService } from '../lib/monitoring.service';

async function verifyFix() {
  console.log('1. Starting Verification of createAlert fix...');

  try {
    // 1. Get a valid user to satisfy Foreign Key constraints
    const user = await db.user.findFirst();
    if (!user) {
      console.log('No users found in DB. Creating a temporary test user...');
      // Simplistic fallback or just fail if we can't create one easily without more context
      // Assuming a seeded DB or at least one user exists in a "functioning" app.
      // If none, we'll try to create one.
      await db.user.create({
        data: {
          email: 'test-admin@sovr.io',
          name: 'Test Admin',
          // Add other required fields if any (schema showed email, name, dates)
        }
      });
    }

    const validUser = await db.user.findFirst();
    if (!validUser) {
        throw new Error('Could not find or create a valid user for testing.');
    }
    console.log(`2. Using User ID: ${validUser.id}`);

    // 2. Instantiate Service
    const service = MonitoringService.getInstance();

    // 3. Call private createAlert (casting to any to access private member)
    console.log('3. Calling createAlert()...');
    await (service as any).createAlert(
        'Verification Alert',
        'Verifying the TypeScript fix for acknowledgedAt',
        'medium', // Lowercase to test case insensitivity logic
        'VerificationScript',
        validUser.id
    );

    console.log('SUCCESS: createAlert executed without error.');
    
    // 4. Verify it actually persisted
    const alert = await db.alert.findFirst({
        where: { name: 'Verification Alert' },
        orderBy: { createdAt: 'desc' }
    });

    if (alert) {
        console.log('CONFIRMED: Alert found in database:', alert.id);
    } else {
        console.error('WARNING: Method finished but Alert not found in DB.');
    }

  } catch (error) {
    console.error('FAILURE: Test failed with error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

verifyFix();

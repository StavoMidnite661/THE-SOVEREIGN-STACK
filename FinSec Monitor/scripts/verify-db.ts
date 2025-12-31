
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Connecting to database...')
    const servers = await prisma.server.findMany()
    console.log(`Successfully connected. Found ${servers.length} servers.`)
    
    // Create a dummy server if none exist to prove write capability
    if (servers.length === 0) {
      console.log('Creating test server...')
      // We need a user first
      let user = await prisma.user.findFirst()
      if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test Admin'
            }
        })
      }
      
      await prisma.server.create({
        data: {
          name: 'Test Server',
          host: 'localhost',
          port: 8080,
          userId: user.id
        }
      })
      console.log('Successfully created test server.')
    }
  } catch (e) {
    console.error('Verification failed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

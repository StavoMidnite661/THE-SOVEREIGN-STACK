import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (serverId) {
      whereClause.serverId = serverId;
    }
    
    if (status && status !== 'all') {
      whereClause.healthChecks = {
        some: {
          status: status.toUpperCase()
        }
      };
    }

    const applications = await db.application.findMany({
      where: whereClause,
      include: {
        server: {
          select: {
            id: true,
            name: true,
            host: true,
            port: true
          }
        },
        healthChecks: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        },
        metrics: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        },
        apiEndpoints: {
          include: {
            responses: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 5
            }
          }
        },
        webhooks: {
          include: {
            deliveries: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 10
            }
          }
        },
        _count: {
          select: {
            apiEndpoints: true,
            webhooks: true,
            healthChecks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, endpoint, apiKey, tags, serverId } = body;

    const application = await db.application.create({
      data: {
        name,
        type: type.toUpperCase(),
        description,
        endpoint,
        apiKey,
        tags: tags ? JSON.stringify(tags) : null,
        serverId
      },
      include: {
        server: true,
        healthChecks: true,
        metrics: true,
        apiEndpoints: true,
        webhooks: true
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, description, endpoint, apiKey, tags, serverId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const application = await db.application.update({
      where: { id },
      data: {
        name,
        type: type.toUpperCase(),
        description,
        endpoint,
        apiKey,
        tags: tags ? JSON.stringify(tags) : null,
        serverId,
        updatedAt: new Date()
      },
      include: {
        server: true,
        healthChecks: true,
        metrics: true,
        apiEndpoints: true,
        webhooks: true
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Delete related records first
    await db.healthCheck.deleteMany({
      where: { applicationId: id }
    });

    await db.metric.deleteMany({
      where: { applicationId: id }
    });

    await db.apiEndpoint.deleteMany({
      where: { applicationId: id }
    });

    await db.webhook.deleteMany({
      where: { applicationId: id }
    });

    // Delete the application
    await db.application.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
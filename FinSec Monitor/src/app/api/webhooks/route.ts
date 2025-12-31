import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause: any = {};
    
    if (applicationId) {
      whereClause.applicationId = applicationId;
    }
    
    if (status && status !== 'all') {
      whereClause.deliveries = {
        some: {
          status: status.toUpperCase()
        }
      };
    }

    const webhooks = await db.webhook.findMany({
      where: whereClause,
      include: {
        application: {
          select: {
            id: true,
            name: true,
            endpoint: true
          }
        },
        deliveries: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            deliveries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, secret, events, applicationId } = body;

    const webhook = await db.webhook.create({
      data: {
        name,
        url,
        secret,
        events: events ? JSON.stringify(events) : null,
        applicationId
      },
      include: {
        application: true,
        deliveries: true
      }
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, url, secret, events, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    const webhook = await db.webhook.update({
      where: { id },
      data: {
        name,
        url,
        secret,
        events: events ? JSON.stringify(events) : null,
        isActive,
        updatedAt: new Date()
      },
      include: {
        application: true,
        deliveries: true
      }
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
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
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    // Delete related records first
    await db.webhookDelivery.deleteMany({
      where: { webhookId: id }
    });

    // Delete the webhook
    await db.webhook.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
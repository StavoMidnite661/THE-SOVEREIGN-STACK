import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause: any = {};
    
    if (severity && severity !== 'all') {
      whereClause.severity = severity.toUpperCase();
    }
    
    if (acknowledged !== null && acknowledged !== undefined) {
      whereClause.isTriggered = acknowledged === 'true';
    }

    const alerts = await db.alert.findMany({
      where: whereClause,
      include: {
        notifications: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, condition, severity, userId } = body;

    const alert = await db.alert.create({
      data: {
        name,
        description,
        condition: JSON.stringify(condition),
        severity: severity ? severity.toUpperCase() : 'MEDIUM',
        userId: userId || 'default-user'
      },
      include: {
        notifications: true,
        user: true
      }
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, condition, severity, isTriggered, acknowledgedAt } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const alert = await db.alert.update({
      where: { id },
      data: {
        name,
        description,
        condition: condition ? JSON.stringify(condition) : undefined,
        severity: severity ? severity.toUpperCase() : undefined,
        isTriggered,
        acknowledgedAt: acknowledgedAt ? new Date(acknowledgedAt) : undefined,
        updatedAt: new Date()
      },
      include: {
        notifications: true,
        user: true
      }
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
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
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Delete related notifications first
    await db.alertNotification.deleteMany({
      where: { alertId: id }
    });

    // Delete the alert
    await db.alert.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
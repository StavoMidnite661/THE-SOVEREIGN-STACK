import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');

    let whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.healthChecks = {
        some: {
          status: status.toUpperCase()
        }
      };
    }

    const servers = await db.server.findMany({
      where: whereClause,
      include: {
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
        applications: {
          include: {
            healthChecks: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 1
            }
          }
        },
        _count: {
          select: {
            applications: true,
            healthChecks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, host, port, type, description, tags, userId } = body;

    const server = await db.server.create({
      data: {
        name,
        host,
        port,
        type: type.toUpperCase(),
        description,
        tags: tags ? JSON.stringify(tags) : null,
        userId: userId || 'default-user'
      },
      include: {
        healthChecks: true,
        metrics: true,
        applications: true
      }
    });

    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.error('Error creating server:', error);
    return NextResponse.json(
      { error: 'Failed to create server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, host, port, type, description, tags, userId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }

    const server = await db.server.update({
      where: { id },
      data: {
        name,
        host,
        port,
        type: type.toUpperCase(),
        description,
        tags: tags ? JSON.stringify(tags) : null,
        userId: userId || 'default-user',
        updatedAt: new Date()
      },
      include: {
        healthChecks: true,
        metrics: true,
        applications: true
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error('Error updating server:', error);
    return NextResponse.json(
      { error: 'Failed to update server' },
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
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }

    // Delete related records first
    await db.healthCheck.deleteMany({
      where: { serverId: id }
    });

    await db.metric.deleteMany({
      where: { serverId: id }
    });

    await db.application.deleteMany({
      where: { serverId: id }
    });

    // Delete the server
    await db.server.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause: any = {};
    
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            servers: true,
            dashboards: true,
            alerts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform to include status (simulated)
    const teamMembers = users.map(user => ({
      ...user,
      status: Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'busy' : 'offline',
      avatar: null
    }));

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const user = await db.user.create({
      data: {
        email,
        name,
        role: role || 'member'
      },
      include: {
        _count: {
          select: {
            servers: true,
            dashboards: true,
            alerts: true
          }
        }
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            servers: true,
            dashboards: true,
            alerts: true
          }
        }
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user has associated resources
    const user = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            servers: true,
            dashboards: true,
            alerts: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't delete if user has resources
    if (user._count.servers > 0 || user._count.dashboards > 0 || user._count.alerts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with associated resources' },
        { status: 400 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
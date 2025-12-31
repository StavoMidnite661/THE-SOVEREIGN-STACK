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
      whereClause.responses = {
        some: {
          status: parseInt(status)
        }
      };
    }

    const apiEndpoints = await db.apiEndpoint.findMany({
      where: whereClause,
      include: {
        application: {
          select: {
            id: true,
            name: true,
            endpoint: true
          }
        },
        healthChecks: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        },
        responses: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            responses: true,
            healthChecks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(apiEndpoints);
  } catch (error) {
    console.error('Error fetching API endpoints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API endpoints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, method, headers, body: requestBody, expectedStatus, timeout, interval, applicationId } = body;

    const apiEndpoint = await db.apiEndpoint.create({
      data: {
        name,
        url,
        method: method.toUpperCase(),
        headers: headers ? JSON.stringify(headers) : null,
        body: requestBody,
        expectedStatus: expectedStatus || 200,
        timeout: timeout || 30000,
        interval: interval || 60000,
        applicationId
      },
      include: {
        application: true,
        healthChecks: true,
        responses: true
      }
    });

    return NextResponse.json(apiEndpoint, { status: 201 });
  } catch (error) {
    console.error('Error creating API endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create API endpoint' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, url, method, headers, body: requestBody, expectedStatus, timeout, interval, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'API endpoint ID is required' },
        { status: 400 }
      );
    }

    const apiEndpoint = await db.apiEndpoint.update({
      where: { id },
      data: {
        name,
        url,
        method: method.toUpperCase(),
        headers: headers ? JSON.stringify(headers) : null,
        body: requestBody,
        expectedStatus,
        timeout,
        interval,
        isActive,
        updatedAt: new Date()
      },
      include: {
        application: true,
        healthChecks: true,
        responses: true
      }
    });

    return NextResponse.json(apiEndpoint);
  } catch (error) {
    console.error('Error updating API endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to update API endpoint' },
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
        { error: 'API endpoint ID is required' },
        { status: 400 }
      );
    }

    // Delete related records first
    await db.healthCheck.deleteMany({
      where: { apiEndpointId: id }
    });

    await db.apiResponse.deleteMany({
      where: { apiEndpointId: id }
    });

    // Delete the API endpoint
    await db.apiEndpoint.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'API endpoint deleted successfully' });
  } catch (error) {
    console.error('Error deleting API endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete API endpoint' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverId, applicationId, apiEndpointId, status, responseTime, message } = body;

    const healthCheck = await db.healthCheck.create({
      data: {
        status: status.toUpperCase(),
        responseTime,
        message,
        serverId,
        applicationId,
        apiEndpointId
      }
    });

    // Update server/application status based on latest health check
    if (serverId) {
      await db.server.update({
        where: { id: serverId },
        data: {
          updatedAt: new Date()
        }
      });
    }

    if (applicationId) {
      await db.application.update({
        where: { id: applicationId },
        data: {
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(healthCheck, { status: 201 });
  } catch (error) {
    console.error('Error creating health check:', error);
    return NextResponse.json(
      { error: 'Failed to create health check' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    const applicationId = searchParams.get('applicationId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let whereClause: any = {};
    
    if (serverId) whereClause.serverId = serverId;
    if (applicationId) whereClause.applicationId = applicationId;

    const healthChecks = await db.healthCheck.findMany({
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
        application: {
          select: {
            id: true,
            name: true,
            type: true,
            endpoint: true
          }
        },
        apiEndpoint: {
          select: {
            id: true,
            name: true,
            url: true,
            method: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return NextResponse.json(healthChecks);
  } catch (error) {
    console.error('Error fetching health checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health checks' },
      { status: 500 }
    );
  }
}
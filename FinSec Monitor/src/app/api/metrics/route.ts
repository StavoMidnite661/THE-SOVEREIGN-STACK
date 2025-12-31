import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, unit, tags, serverId, applicationId } = body;

    const metric = await db.metric.create({
      data: {
        name,
        value: parseFloat(value),
        unit,
        tags: tags ? JSON.stringify(tags) : null,
        serverId,
        applicationId
      }
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    const applicationId = searchParams.get('applicationId');
    const metricName = searchParams.get('name');
    const timeRange = searchParams.get('timeRange') || '1h';
    const limit = parseInt(searchParams.get('limit') || '100');

    let whereClause: any = {};
    
    if (serverId) whereClause.serverId = serverId;
    if (applicationId) whereClause.applicationId = applicationId;
    if (metricName) whereClause.name = metricName;

    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setHours(now.getHours() - 1);
    }

    whereClause.timestamp = {
      gte: startTime
    };

    const metrics = await db.metric.findMany({
      where: whereClause,
      include: {
        server: {
          select: {
            id: true,
            name: true,
            host: true
          }
        },
        application: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
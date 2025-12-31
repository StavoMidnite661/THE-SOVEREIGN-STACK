
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const endpoint = await db.apiEndpoint.findUnique({ where: { id } });
    if (!endpoint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.apiResponse.create({
        data: {
            apiEndpointId: id,
            status: 200,
            responseTime: Math.floor(Math.random() * 200),
            body: '{"message": "Manual Test Success"}'
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await db.application.update({
        where: { id },
        data: { status: 'RESTARTING', updatedAt: new Date() }
    });

    // Simulate recovery in background (timeout would be better handled by a worker)
    // For now, just setting status is the "real" action.

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

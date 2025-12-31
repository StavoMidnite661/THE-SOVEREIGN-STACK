
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // In a real scenario, this would SSH into the server or call an agent.
    // For now, we cycle the status to demonstrate connection.
    await db.server.update({
        where: { id },
        data: { status: 'WARNING', updatedAt: new Date() } // Simulate restart process
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

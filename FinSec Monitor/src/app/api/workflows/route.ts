import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    const workflows = await db.workflow.findMany({
      where: whereClause,
      include: {
        executions: {
          orderBy: {
            startedAt: 'desc'
          },
          take: 1,
          include: {
            steps: {
              orderBy: {
                startedAt: 'asc'
              }
            }
          }
        },
        _count: {
          select: {
            executions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, definition, isActive } = body;

    const workflow = await db.workflow.create({
      data: {
        name,
        description,
        definition: JSON.stringify(definition),
        isActive: isActive !== false
      },
      include: {
        executions: {
          include: {
            steps: true
          }
        }
      }
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, definition, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const workflow = await db.workflow.update({
      where: { id },
      data: {
        name,
        description,
        definition: definition ? JSON.stringify(definition) : undefined,
        isActive,
        updatedAt: new Date()
      },
      include: {
        executions: {
          include: {
            steps: true
          }
        }
      }
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
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
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Delete related records first
    const executions = await db.workflowExecution.findMany({
      where: { workflowId: id }
    });

    for (const execution of executions) {
      await db.workflowStep.deleteMany({
        where: { executionId: execution.id }
      });
    }

    await db.workflowExecution.deleteMany({
      where: { workflowId: id }
    });

    // Delete the workflow
    await db.workflow.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
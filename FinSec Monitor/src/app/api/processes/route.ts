import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/db';

const execAsync = promisify(exec);

interface ProcessInfo {
  pid: string;
  name: string;
  port: number | null;
  status: 'running' | 'stopped';
  cpu?: string;
  memory?: string;
  command?: string;
}

export async function GET(request: NextRequest) {
  try {
    const processes: ProcessInfo[] = [];
    
    // Get all monitored servers with their ports
    const servers = await db.server.findMany({
      select: { id: true, name: true, host: true, port: true }
    });

    // Check each server's port to see if something is running
    for (const server of servers) {
      const portCheck = await checkPort(server.port);
      processes.push({
        pid: portCheck.pid || '-',
        name: server.name,
        port: server.port,
        status: portCheck.inUse ? 'running' : 'stopped',
        command: portCheck.command || '-'
      });
    }

    // Also get general system processes on common dev ports
    const additionalPorts = [3000, 3001, 5000, 5173, 4200, 8000, 8080];
    for (const port of additionalPorts) {
      // Skip if already checked as a server
      if (servers.some(s => s.port === port)) continue;
      
      const portCheck = await checkPort(port);
      if (portCheck.inUse) {
        processes.push({
          pid: portCheck.pid || '-',
          name: `Process on :${port}`,
          port: port,
          status: 'running',
          command: portCheck.command || '-'
        });
      }
    }

    return NextResponse.json({
      processes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting processes:', error);
    return NextResponse.json({ error: 'Failed to get processes', processes: [] }, { status: 500 });
  }
}

async function checkPort(port: number): Promise<{ inUse: boolean; pid?: string; command?: string }> {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: Use netstat to find process on port
      const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
      const lines = stdout.trim().split('\n');
      if (lines.length > 0 && lines[0].trim()) {
        const parts = lines[0].trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        // Get process name from PID
        try {
          const { stdout: taskInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
          const processName = taskInfo.split(',')[0]?.replace(/"/g, '') || 'Unknown';
          return { inUse: true, pid, command: processName };
        } catch {
          return { inUse: true, pid, command: 'Unknown' };
        }
      }
    } else {
      // Linux/Mac: Use lsof
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      const pid = stdout.trim().split('\n')[0];
      if (pid) {
        const { stdout: psInfo } = await execAsync(`ps -p ${pid} -o comm=`);
        return { inUse: true, pid, command: psInfo.trim() };
      }
    }
    
    return { inUse: false };
  } catch (error) {
    // If command fails, port is likely not in use
    return { inUse: false };
  }
}

// POST to kill a process
export async function POST(request: NextRequest) {
  try {
    const { action, pid } = await request.json();
    
    if (action === 'kill' && pid) {
      const isWindows = process.platform === 'win32';
      const cmd = isWindows ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;
      
      await execAsync(cmd);
      return NextResponse.json({ success: true, message: `Process ${pid} terminated` });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to kill process' }, { status: 500 });
  }
}

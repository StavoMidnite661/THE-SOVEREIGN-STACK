import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/db';

const execAsync = promisify(exec);

// Map of known server start commands
const SERVER_COMMANDS: Record<string, { start: string; cwd: string; url?: string }> = {
  'SOVR Studio (USD Gateway)': {
    start: 'npm run dev',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\studio',
    url: 'http://localhost:9002'
  },
  'SOVR Hybrid Engine (Credit Terminal)': {
    start: 'npx hardhat node',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\sovr_hybrid_engineV2'
    // No URL - this is a blockchain node (JSON-RPC on port 8545)
  },
  'Credit Terminal Frontend': {
    start: 'npm run dev',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\sovr_hybrid_engineV2\\frontend',
    url: 'http://localhost:3002'
  },
  'CL Trader (UltraSOVR)': {
    start: 'start_servers.bat',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\CLI Trader Agents\\CLI_Trader_Agent'
    // Starts trading engine with all AI agents in live mode (WebSocket :8766)
  },
  'CL Trader Dashboard': {
    start: 'npm run dev',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\CLI Trader Agents\\CLI_Trader_Agent\\ari-harem',
    url: 'http://localhost:3001'
  },
  'Oracle Ledger Frontend': {
    start: 'npm run dev',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\ORACLE-LEDGER-main',
    url: 'http://localhost:5173'
  },
  'Oracle Ledger API': {
    start: 'npm run dev:backend',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\ORACLE-LEDGER-main',
    url: 'http://localhost:3001'
  },
  'Oracle Ledger Hardhat Node': {
    start: 'npx hardhat node',
    cwd: 'D:\\SOVR_Development_Holdings_LLC\\The Soverign Stack\\ORACLE-LEDGER-main'
    // No URL - blockchain node on port 8545
  }
};

// Store for running processes
const runningProcesses: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serverId, serverName } = body;

    if (!action || !serverId) {
      return NextResponse.json({ error: 'Missing action or serverId' }, { status: 400 });
    }

    // Get server info
    const server = await db.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Normalize name lookup
    const command = SERVER_COMMANDS[server.name.trim()] || SERVER_COMMANDS[server.name];
    
    // Debug log
    if (!command) {
      console.log(`Server '${server.name}' (len=${server.name.length}) not found in commands:`, Object.keys(SERVER_COMMANDS));
    }
    
    switch (action) {
      case 'start': {
        if (!command) {
          return NextResponse.json({ 
            error: `No start command configured for ${server.name}. Add it to SERVER_COMMANDS.`,
            message: 'Server not configured for remote start'
          }, { status: 400 });
        }

        // Check if already running by pinging the port
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          await fetch(command.url || `http://${server.host}:${server.port}`, { 
            signal: controller.signal 
          });
          clearTimeout(timeout);
          return NextResponse.json({ 
            message: `${server.name} is already running`,
            status: 'running',
            url: command.url
          });
        } catch {
          // Not running, proceed to start
        }

        // On Windows, open a new terminal window with proper escaping
        const isWindows = process.platform === 'win32';
        
        if (isWindows) {
          // Try Windows Terminal first (modern), fall back to CMD
          // Windows Terminal command format: wt -w 0 nt -d "path" --title "title" cmd /k "command"
          const wtCmd = `wt -w 0 nt -d "${command.cwd}" --title "${server.name}" cmd /k "${command.start}"`;
          const cmdFallback = `start "${server.name}" /D "${command.cwd}" cmd /k "${command.start}"`;
          
          console.log(`[Server Start] Attempting to launch ${server.name}`);
          console.log(`[Server Start] Working directory: ${command.cwd}`);
          console.log(`[Server Start] Command: ${command.start}`);
          
          // Try Windows Terminal first
          exec('wt --version', (wtCheckError) => {
            const finalCmd = wtCheckError ? cmdFallback : wtCmd;
            
            if (wtCheckError) {
              console.log('[Server Start] Windows Terminal not found, using CMD');
            } else {
              console.log('[Server Start] Using Windows Terminal');
            }
            
            console.log(`[Server Start] Executing: ${finalCmd}`);
            
            exec(finalCmd, (error) => {
              if (error) {
                console.error('[Server Start] Failed to launch terminal:', error);
                // Last resort: try PowerShell
                const psCmd = `Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '${command.cwd}'; ${command.start}"`;
                exec(`powershell -Command "${psCmd}"`, (psError) => {
                  if (psError) {
                    console.error('[Server Start] PowerShell fallback also failed:', psError);
                  }
                });
              } else {
                console.log(`[Server Start] Successfully launched ${server.name}`);
              }
            });
          });
        } else {
          // On Mac/Linux, try to open in a new terminal window
          console.log(`[Server Start] Launching ${server.name} on Unix-like system`);
          
          // Try different terminal emulators
          const terminals = [
            { name: 'gnome-terminal', cmd: `gnome-terminal -- bash -c "cd '${command.cwd}' && ${command.start}; exec bash"` },
            { name: 'xterm', cmd: `xterm -hold -e "cd '${command.cwd}' && ${command.start}"` },
            { name: 'Terminal', cmd: `osascript -e 'tell application "Terminal" to do script "cd '${command.cwd}' && ${command.start}'"'` } // macOS
          ];
          
          let launched = false;
          for (const terminal of terminals) {
            if (!launched) {
              exec(`which ${terminal.name}`, (checkError) => {
                if (!checkError && !launched) {
                  launched = true;
                  console.log(`[Server Start] Using ${terminal.name}`);
                  exec(terminal.cmd, (error) => {
                    if (error) {
                      console.error(`[Server Start] Failed with ${terminal.name}:`, error);
                      launched = false;
                    }
                  });
                }
              });
            }
          }
          
          // Fallback: detached process
          if (!launched) {
            console.log('[Server Start] No terminal found, running detached');
            const child = spawn('bash', ['-c', `cd "${command.cwd}" && ${command.start}`], {
              detached: true,
              stdio: 'ignore'
            });
            child.unref();
          }
        }

        return NextResponse.json({ 
          message: `Starting ${server.name} in new terminal window...`,
          status: 'starting',
          url: command.url
        });
      }

      case 'stop': {
        const proc = runningProcesses.get(serverId);
        if (!proc) {
          return NextResponse.json({ 
            message: 'Server is not running (or was started externally)',
            status: 'stopped'
          });
        }

        try {
          process.kill(proc.pid);
          runningProcesses.delete(serverId);
          return NextResponse.json({ 
            message: `Stopped ${server.name}`,
            status: 'stopped'
          });
        } catch (e) {
          runningProcesses.delete(serverId);
          return NextResponse.json({ 
            message: 'Process already terminated',
            status: 'stopped'
          });
        }
      }

      case 'check': {
        // Check if server is responding
        // For Hybrid Engine (Hardhat), we need to send a valid JSON-RPC request or it returns a parse error
        const isJsonRpc = server.port === 8545; // Simple heuristic for now
        const url = command?.url || `http://${server.host}:${server.port}`;
        
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          
          const fetchOptions: RequestInit = { 
            signal: controller.signal,
          };

          if (isJsonRpc) {
            fetchOptions.method = 'POST';
            fetchOptions.headers = { 'Content-Type': 'application/json' };
            fetchOptions.body = JSON.stringify({ jsonrpc: '2.0', method: 'web3_clientVersion', params: [], id: 1 });
          } else {
            fetchOptions.method = 'GET';
          }

          const response = await fetch(url, fetchOptions);
          clearTimeout(timeout);
          
          return NextResponse.json({
            status: 'running',
            httpStatus: response.status,
            url: isJsonRpc ? null : url // Don't return URL for JSON-RPC services to prevent opening in browser
          });
        } catch (e) {
          return NextResponse.json({
            status: 'stopped',
            url: isJsonRpc ? null : url
          });
        }
      }

      case 'open': {
        // Only return a URL if one is explicitly configured or if it's an unknown server (fallback)
        let url: string | null = null;
        
        if (command) {
            // Known server - only use configured URL
            url = command.url ?? null;
        } else {
            // Unknown server - try best guess
            url = `http://${server.host}:${server.port}`;
        }

        if (!url) {
            return NextResponse.json({ 
                error: 'This server is a backend service / blockchain node and has no web interface.',
                action: 'toast' // Tell frontend to show toast instead of opening window
            });
        }

        return NextResponse.json({
          action: 'open',
          url
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Server control error:', error);
    return NextResponse.json({ error: 'Failed to control server' }, { status: 500 });
  }
}

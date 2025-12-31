import { NextRequest, NextResponse } from 'next/server';
import { VALSystem } from '../../../../../val/index';
import { ethers } from 'ethers';

// Initializing VAL System as a dynamic singleton for development
let valSystem: VALSystem | null = null;

function getVALSystem() {
  if (!valSystem) {
    // Mock private key for the attestor (not for real funds)
    const ATTESTOR_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat #0
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545'); // Local provider
    
    valSystem = new VALSystem(ATTESTOR_PK, provider, {
      // Configuration can be added here if needed
    });
    console.log('✅ VAL System Initialized for Terminal API');
  }
  return valSystem;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant, amount, email, userId } = body;

    // Basic Validation
    if (!merchant || !amount || !email || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (merchant === 'instacart') {
      console.log(`[SpendAPI] Processing Instacart fulfillment for ${userId} ($${amount})`);
      
      const val = getVALSystem();
      const spendEngine = val.getSpendEngine();

      const result = await spendEngine.spendCredit({
        userId,
        merchant: 'instacart',
        amount: parseFloat(amount),
        metadata: { email }
      });

      const safeJson = JSON.stringify(result, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      );
      return new NextResponse(safeJson, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // fallback for other merchants (non-VAL yet)
    return NextResponse.json({ error: 'Merchant not yet supported in VAL' }, { status: 400 });

  } catch (error) {
    console.error('Spend API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

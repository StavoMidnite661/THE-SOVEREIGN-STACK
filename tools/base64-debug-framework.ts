/**
 * SOVR Foundation - Base64 Logic Debugging Framework
 * Network Guardian - Hour 8 Implementation
 * 
 * Protocol analysis tools for diagnosing Base64 encoding/decoding issues
 * in Oracle Ledger API communications and data serialization
 */

import crypto from 'crypto';

interface Base64DebugResult {
  input: string;
  output: string;
  success: boolean;
  error?: string;
  metadata: {
    timestamp: string;
    operation: 'encode' | 'decode';
    length: number;
    characterSet: string;
    paddingInfo?: {
      hasPadding: boolean;
      paddingCount: number;
    };
    entropy: number;
  };
}

interface ProtocolAnalysis {
  protocol: string;
  version: string;
  features: string[];
  security: {
    encryption: boolean;
    authentication: boolean;
    integrity: boolean;
  };
  base64Usage: {
    encoding: string[];
    decoding: string[];
    validation: string[];
  };
  issues: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: string;
    description: string;
    recommendation: string;
  }>;
}

class Base64DebugFramework {
  private debugLogs: Base64DebugResult[] = [];
  private protocolSimulations: Map<string, ProtocolAnalysis> = new Map();

  /**
   * Enhanced Base64 encoding with debugging
   */
  encodeWithDebug(input: string, options: {
    addChecksum?: boolean;
    simulateProtocol?: string;
    encoding?: 'standard' | 'urlSafe' | 'mime';
  } = {}): Base64DebugResult {
    const timestamp = new Date().toISOString();
    const { addChecksum = false, simulateProtocol, encoding = 'standard' } = options;

    try {
      let encoded: string;
      
      switch (encoding) {
        case 'urlSafe':
          encoded = this.encodeUrlSafe(input);
          break;
        case 'mime':
          encoded = this.encodeMime(input);
          break;
        default:
          encoded = Buffer.from(input, 'utf8').toString('base64');
      }

      // Add checksum if requested
      if (addChecksum) {
        const checksum = crypto.createHash('sha256').update(input).digest('hex').substring(0, 8);
        encoded = `${encoded}.${checksum}`;
      }

      const result: Base64DebugResult = {
        input,
        output: encoded,
        success: true,
        metadata: {
          timestamp,
          operation: 'encode',
          length: encoded.length,
          characterSet: this.analyzeCharacterSet(encoded),
          paddingInfo: this.analyzePadding(encoded),
          entropy: this.calculateEntropy(encoded)
        }
      };

      this.debugLogs.push(result);
      
      // Simulate protocol if requested
      if (simulateProtocol) {
        this.simulateProtocolProcessing(encoded, simulateProtocol, 'encode');
      }

      return result;
    } catch (error) {
      const result: Base64DebugResult = {
        input,
        output: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp,
          operation: 'encode',
          length: 0,
          characterSet: 'unknown',
          entropy: 0
        }
      };

      this.debugLogs.push(result);
      return result;
    }
  }

  /**
   * Enhanced Base64 decoding with validation
   */
  decodeWithDebug(input: string, options: {
    validateChecksum?: boolean;
    simulateProtocol?: string;
    encoding?: 'standard' | 'urlSafe' | 'mime';
    strict?: boolean;
  } = {}): Base64DebugResult {
    const timestamp = new Date().toISOString();
    const { validateChecksum = false, simulateProtocol, encoding = 'standard', strict = false } = options;

    try {
      let data = input;
      let checksum: string | undefined;

      // Extract checksum if present
      if (validateChecksum && input.includes('.')) {
        const parts = input.split('.');
        if (parts.length === 2) {
          data = parts[0];
          checksum = parts[1];
        }
      }

      let decoded: string;
      
      switch (encoding) {
        case 'urlSafe':
          decoded = this.decodeUrlSafe(data);
          break;
        case 'mime':
          decoded = this.decodeMime(data);
          break;
        default:
          decoded = Buffer.from(data, 'base64').toString('utf8');
      }

      // Validate checksum if present
      if (validateChecksum && checksum) {
        const calculatedChecksum = crypto.createHash('sha256').update(decoded).digest('hex').substring(0, 8);
        if (calculatedChecksum !== checksum) {
          throw new Error(`Checksum validation failed: expected ${checksum}, got ${calculatedChecksum}`);
        }
      }

      const result: Base64DebugResult = {
        input,
        output: decoded,
        success: true,
        metadata: {
          timestamp,
          operation: 'decode',
          length: decoded.length,
          characterSet: this.analyzeCharacterSet(data),
          paddingInfo: this.analyzePadding(data),
          entropy: this.calculateEntropy(data)
        }
      };

      this.debugLogs.push(result);
      
      // Simulate protocol if requested
      if (simulateProtocol) {
        this.simulateProtocolProcessing(data, simulateProtocol, 'decode');
      }

      return result;
    } catch (error) {
      const result: Base64DebugResult = {
        input,
        output: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp,
          operation: 'decode',
          length: 0,
          characterSet: 'unknown',
          entropy: 0
        }
      };

      this.debugLogs.push(result);
      return result;
    }
  }

  /**
   * Oracle Ledger API protocol simulation
   */
  simulateOracleLedgerAPI(data: string, operation: 'encode' | 'decode'): void {
    const analysis: ProtocolAnalysis = {
      protocol: 'Oracle Ledger API v2.0',
      version: '2.0.0',
      features: [
        'mTLS authentication',
        'Request signing',
        'Idempotency support',
        'Rate limiting',
        'PCI audit logging'
      ],
      security: {
        encryption: true,
        authentication: true,
        integrity: true
      },
      base64Usage: {
        encoding: [
          'Journal entry serialization',
          'Transaction data encoding',
          'API response wrapping'
        ],
        decoding: [
          'Request payload parsing',
          'Certificate data handling',
          'Audit log processing'
        ],
        validation: [
          'Input sanitization',
          'Data integrity checks',
          'Character set validation'
        ]
      },
      issues: []
    };

    // Simulate common issues
    if (data.length > 1024 * 1024) { // 1MB limit
      analysis.issues.push({
        severity: 'HIGH',
        category: 'Size Limit',
        description: 'Data exceeds 1MB processing limit',
        recommendation: 'Implement data chunking or compression'
      });
    }

    if (data.includes('+') || data.includes('/')) {
      analysis.issues.push({
        severity: 'MEDIUM',
        category: 'URL Safety',
        description: 'Standard Base64 contains URL-unsafe characters',
        recommendation: 'Use URL-safe Base64 encoding for API calls'
      });
    }

    if (!data.endsWith('==') && !data.endsWith('=') && (data.length % 4) !== 0) {
      analysis.issues.push({
        severity: 'LOW',
        category: 'Padding',
        description: 'Base64 data missing proper padding',
        recommendation: 'Ensure proper Base64 padding for compatibility'
      });
    }

    this.protocolSimulations.set('oracle-ledger', analysis);
  }

  /**
   * Financial transaction protocol analysis
   */
  simulateFinancialTransaction(data: string): void {
    const analysis: ProtocolAnalysis = {
      protocol: 'Financial Transaction Protocol',
      version: '1.2.0',
      features: [
        'Double-entry bookkeeping',
        'Real-time validation',
        'Audit trail',
        'Compliance reporting'
      ],
      security: {
        encryption: true,
        authentication: true,
        integrity: true
      },
      base64Usage: {
        encoding: [
          'Transaction payload',
          'Account references',
          'Amount encoding'
        ],
        decoding: [
          'API requests',
          'Response processing',
          'Audit logging'
        ],
        validation: [
          'Amount precision',
          'Account validation',
          'Business rules'
        ]
      },
      issues: []
    };

    // Check for financial-specific issues
    if (data.includes('NaN') || data.includes('null')) {
      analysis.issues.push({
        severity: 'CRITICAL',
        category: 'Data Integrity',
        description: 'Invalid financial data detected',
        recommendation: 'Implement strict data validation'
      });
    }

    const decimalPattern = /\d+\.\d{3,}/;
    if (decimalPattern.test(data)) {
      analysis.issues.push({
        severity: 'HIGH',
        category: 'Precision',
        description: 'More than 2 decimal places detected',
        recommendation: 'Limit to 2 decimal places for currency'
      });
    }

    this.protocolSimulations.set('financial-tx', analysis);
  }

  /**
   * Get comprehensive debug report
   */
  getDebugReport(): {
    totalOperations: number;
    successRate: number;
    commonErrors: Array<{ error: string; count: number }>;
    protocolAnalyses: ProtocolAnalysis[];
    recommendations: string[];
  } {
    const totalOperations = this.debugLogs.length;
    const successfulOperations = this.debugLogs.filter(log => log.success).length;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

    // Count common errors
    const errorCounts = new Map<string, number>();
    this.debugLogs
      .filter(log => !log.success && log.error)
      .forEach(log => {
        const error = log.error!;
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      });

    const commonErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count);

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      totalOperations,
      successRate,
      commonErrors,
      protocolAnalyses: Array.from(this.protocolSimulations.values()),
      recommendations
    };
  }

  // Private helper methods
  private encodeUrlSafe(input: string): string {
    return Buffer.from(input, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private decodeUrlSafe(input: string): string {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  private encodeMime(input: string): string {
    return Buffer.from(input, 'utf8').toString('base64');
  }

  private decodeMime(input: string): string {
    return Buffer.from(input, 'base64').toString('utf8');
  }

  private analyzeCharacterSet(data: string): string {
    const hasUrlSafe = /^[A-Za-z0-9\-_]+$/.test(data);
    const hasStandard = /^[A-Za-z0-9+/=]+$/.test(data);
    
    if (hasUrlSafe) return 'URL-safe Base64';
    if (hasStandard) return 'Standard Base64';
    return 'Unknown/Custom';
  }

  private analyzePadding(data: string): { hasPadding: boolean; paddingCount: number } {
    const paddingMatch = data.match(/=+$/);
    return {
      hasPadding: !!paddingMatch,
      paddingCount: paddingMatch ? paddingMatch[0].length : 0
    };
  }

  private calculateEntropy(data: string): number {
    if (data.length === 0) return 0;
    
    const frequency: { [key: string]: number } = {};
    for (const char of data) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const count of Object.values(frequency)) {
      const probability = count / data.length;
      entropy -= probability * Math.log2(probability);
    }
    
    return Math.round(entropy * 100) / 100;
  }

  private simulateProtocolProcessing(data: string, protocol: string, operation: 'encode' | 'decode'): void {
    switch (protocol) {
      case 'oracle-ledger':
        this.simulateOracleLedgerAPI(data, operation);
        break;
      case 'financial-tx':
        this.simulateFinancialTransaction(data);
        break;
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze success rate
    const totalOperations = this.debugLogs.length;
    const successfulOperations = this.debugLogs.filter(log => log.success).length;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

    if (successRate < 95) {
      recommendations.push('Low success rate detected - review error patterns and improve validation');
    }

    // Analyze entropy
    const avgEntropy = this.debugLogs
      .filter(log => log.success)
      .reduce((sum, log) => sum + log.metadata.entropy, 0) / Math.max(1, successfulOperations);

    if (avgEntropy < 3) {
      recommendations.push('Low entropy detected - data may not be properly randomized');
    }

    // Protocol-specific recommendations
    const oracleLedgerAnalysis = this.protocolSimulations.get('oracle-ledger');
    if (oracleLedgerAnalysis && oracleLedgerAnalysis.issues.length > 0) {
      recommendations.push('Oracle Ledger API protocol issues detected - review encoding standards');
    }

    // General recommendations
    recommendations.push('Use URL-safe Base64 for API communications');
    recommendations.push('Implement proper error handling and validation');
    recommendations.push('Monitor Base64 operation success rates');
    recommendations.push('Add checksums for critical data integrity');

    return recommendations;
  }
}

// CLI tool for testing
function main() {
  const framework = new Base64DebugFramework();

  console.log('🔍 Base64 Logic Debugging Framework');
  console.log('=====================================');

  // Test cases
  const testData = [
    'Hello World',
    '{"amount": 100.50, "account": "1000"}',
    'SOVR Foundation Financial Transaction Data',
    'Large data payload with special characters: éñ@#$%^&*()_+{}|:<>?[]\\;\'",./`~'
  ];

  console.log('\n📊 Running Base64 encoding/decoding tests...\n');

  testData.forEach((data, index) => {
    console.log(`Test ${index + 1}: "${data}"`);
    
    // Standard encoding/decoding
    const encodeResult = framework.encodeWithDebug(data, { simulateProtocol: 'oracle-ledger' });
    console.log(`✅ Encoded: ${encodeResult.output}`);
    
    const decodeResult = framework.decodeWithDebug(encodeResult.output, { simulateProtocol: 'oracle-ledger' });
    console.log(`✅ Decoded: ${decodeResult.output}`);
    console.log(`🔒 Entropy: ${encodeResult.metadata.entropy}`);
    console.log('');
  });

  // Generate report
  const report = framework.getDebugReport();
  
  console.log('📋 Debug Report Summary');
  console.log('======================');
  console.log(`Total Operations: ${report.totalOperations}`);
  console.log(`Success Rate: ${report.successRate.toFixed(2)}%`);
  
  if (report.commonErrors.length > 0) {
    console.log('\n⚠️  Common Errors:');
    report.commonErrors.forEach(error => {
      console.log(`  - ${error.error} (${error.count} occurrences)`);
    });
  }
  
  console.log('\n💡 Recommendations:');
  report.recommendations.forEach(rec => {
    console.log(`  - ${rec}`);
  });
}

// Export for use in other modules
export { Base64DebugFramework, Base64DebugResult, ProtocolAnalysis };

// Run CLI if called directly
if (require.main === module) {
  main();
}
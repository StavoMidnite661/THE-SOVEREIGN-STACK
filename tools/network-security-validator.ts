#!/usr/bin/env node

/**
 * SOVR Foundation - Network Security Validator
 * Network Guardian - Hour 8 Implementation
 * 
 * Comprehensive Docker network security validation and audit tool
 * Validates mTLS configuration, network isolation, and service security
 */

import { exec } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface SecurityValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'INFO';
  message: string;
  details?: any;
  remediation?: string;
}

interface NetworkSecurityReport {
  timestamp: string;
  dockerComposeFile: string;
  environmentFile: string;
  results: SecurityValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    info: number;
  };
  compliance: {
    pciDss: boolean;
    sox: boolean;
    dockerSecurity: boolean;
    networkIsolation: boolean;
  };
}

class NetworkSecurityValidator {
  private dockerComposeFile: string;
  private environmentFile: string;
  private results: SecurityValidationResult[] = [];

  constructor(dockerComposeFile: string = 'docker-compose.secure.yml', environmentFile: string = '.env.secure') {
    this.dockerComposeFile = dockerComposeFile;
    this.environmentFile = environmentFile;
  }

  async runValidation(): Promise<NetworkSecurityReport> {
    console.log('🔍 Starting Network Security Validation...');
    console.log('=' .repeat(60));

    // Load configuration files
    const dockerCompose = this.loadDockerCompose();
    const environment = this.loadEnvironment();

    // Run all validation tests
    await this.validateDockerConfiguration(dockerCompose);
    await this.validateNetworkIsolation(dockerCompose);
    await this.validateCredentials(environment);
    await this.validateMTLSConfiguration(dockerCompose, environment);
    await this.validateServiceAuthentication(dockerCompose);
    await this.validatePortExposures(dockerCompose);
    await this.validateCertificateManagement(dockerCompose);
    await this.validateAuditLogging(dockerCompose);

    // Generate report
    return this.generateReport();
  }

  private loadDockerCompose(): any {
    try {
      const content = readFileSync(this.dockerComposeFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.addResult('CONFIGURATION', 'Docker Compose Load', 'FAIL', 
        `Failed to load Docker Compose file: ${error.message}`);
      return {};
    }
  }

  private loadEnvironment(): any {
    try {
      if (!existsSync(this.environmentFile)) {
        this.addResult('CONFIGURATION', 'Environment File', 'FAIL', 
          'Environment file not found');
        return {};
      }

      const content = readFileSync(this.environmentFile, 'utf8');
      const env: any = {};
      
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, value] = trimmed.split('=', 2);
          env[key.trim()] = value.trim();
        }
      });

      return env;
    } catch (error) {
      this.addResult('CONFIGURATION', 'Environment Load', 'FAIL', 
        `Failed to load environment file: ${error.message}`);
      return {};
    }
  }

  private async validateDockerConfiguration(config: any): Promise<void> {
    console.log('📋 Validating Docker Configuration...');

    // Check version
    if (config.version !== '3.8') {
      this.addResult('DOCKER_CONFIG', 'Compose Version', 'WARNING', 
        `Expected version 3.8, found: ${config.version}`,
        'Update to Docker Compose 3.8 for security features');
    } else {
      this.addResult('DOCKER_CONFIG', 'Compose Version', 'PASS', 
        'Using secure Docker Compose version 3.8');
    }

    // Validate network configuration
    const networks = config.networks || {};
    if (!networks['sovr-internal-net']) {
      this.addResult('NETWORK_CONFIG', 'Internal Network', 'FAIL', 
        'Internal network not defined',
        'Define sovr-internal-net for service isolation');
    } else {
      this.addResult('NETWORK_CONFIG', 'Internal Network', 'PASS', 
        'Internal network properly configured');
    }

    if (networks['sovr-external-net']) {
      this.addResult('NETWORK_CONFIG', 'External Network', 'PASS', 
        'External network defined for API gateway');
    }
  }

  private async validateNetworkIsolation(config: any): Promise<void> {
    console.log('🌐 Validating Network Isolation...');

    const services = config.services || {};
    const networks = config.networks || {};

    // Check that no services have public port mappings
    for (const [serviceName, service] of Object.entries(services) as [string, any][]) {
      if (service.ports) {
        this.addResult('NETWORK_ISOLATION', `Service Ports - ${serviceName}`, 'FAIL', 
          `${serviceName} has exposed ports: ${JSON.stringify(service.ports)}`,
          'Remove public port mappings for security');
      } else {
        this.addResult('NETWORK_ISOLATION', `Service Ports - ${serviceName}`, 'PASS', 
          `${serviceName} has no public port exposure`);
      }

      // Verify internal network assignment
      if (!service.networks) {
        this.addResult('NETWORK_ISOLATION', `Network Assignment - ${serviceName}`, 'WARNING', 
          `${serviceName} not assigned to specific network`,
          'Assign services to internal networks for isolation');
      } else {
        const hasInternalNetwork = service.networks.includes('sovr-internal-net');
        if (hasInternalNetwork) {
          this.addResult('NETWORK_ISOLATION', `Network Assignment - ${serviceName}`, 'PASS', 
            `${serviceName} properly isolated on internal network`);
        }
      }
    }

    // Check network subnet configurations
    for (const [networkName, network] of Object.entries(networks) as [string, any][]) {
      if (network.ipam?.config?.[0]?.subnet) {
        const subnet = network.ipam.config[0].subnet;
        this.addResult('NETWORK_ISOLATION', `Subnet - ${networkName}`, 'INFO', 
          `${networkName} uses subnet: ${subnet}`);
      }
    }
  }

  private async validateCredentials(env: any): Promise<void> {
    console.log('🔐 Validating Credential Security...');

    // Check for hardcoded passwords
    const passwordFields = ['POSTGRES_PASSWORD', 'REDIS_PASSWORD', 'GRAFANA_PASSWORD'];
    
    for (const field of passwordFields) {
      const value = env[field];
      
      if (!value) {
        this.addResult('CREDENTIALS', field, 'FAIL', 
          `${field} not found in environment`,
          'Set secure password in environment file');
      } else if (value.includes('GENERATE_')) {
        this.addResult('CREDENTIALS', field, 'WARNING', 
          `${field} uses placeholder value`,
          'Generate and set actual secure password');
      } else if (value.length < 32) {
        this.addResult('CREDENTIALS', field, 'FAIL', 
          `${field} password too short (minimum 32 characters)`,
          'Use passwords of at least 32 characters');
      } else {
        this.addResult('CREDENTIALS', field, 'PASS', 
          `${field} meets security requirements`);
      }
    }

    // Check JWT secret
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.includes('GENERATE_')) {
      this.addResult('CREDENTIALS', 'JWT Secret', 'FAIL', 
        'JWT secret not properly configured',
        'Generate 256-bit JWT secret');
    } else {
      this.addResult('CREDENTIALS', 'JWT Secret', 'PASS', 
        'JWT secret configured');
    }
  }

  private async validateMTLSConfiguration(config: any, env: any): Promise<void> {
    console.log('🔒 Validating mTLS Configuration...');

    const services = config.services || {};
    
    // Check Oracle Ledger mTLS configuration
    const oracleLedger = services['oracle-ledger-mock'];
    if (oracleLedger) {
      const envVars = oracleLedger.environment || {};
      
      if (envVars.MTLS_ENABLED === 'true') {
        this.addResult('MTLS', 'Oracle Ledger mTLS', 'PASS', 
          'mTLS enabled for Oracle Ledger service');
      } else {
        this.addResult('MTLS', 'Oracle Ledger mTLS', 'FAIL', 
          'mTLS not enabled for Oracle Ledger service',
          'Set MTLS_ENABLED=true');
      }

      // Check certificate paths
      const certPaths = [envVars.SSL_CERT_PATH, envVars.SSL_KEY_PATH, envVars.SSL_CA_PATH];
      if (certPaths.every(path => path && path.startsWith('/app/certs'))) {
        this.addResult('MTLS', 'Certificate Paths', 'PASS', 
          'Certificate paths properly configured');
      } else {
        this.addResult('MTLS', 'Certificate Paths', 'FAIL', 
          'Certificate paths not properly configured',
          'Configure SSL_CERT_PATH, SSL_KEY_PATH, SSL_CA_PATH');
      }
    }

    // Check service-to-service authentication
    if (env.SERVICE_TOKEN && !env.SERVICE_TOKEN.includes('GENERATE_')) {
      this.addResult('MTLS', 'Service Token', 'PASS', 
        'Service-to-service token configured');
    } else {
      this.addResult('MTLS', 'Service Token', 'FAIL', 
        'Service-to-service token not configured',
        'Generate secure service token');
    }
  }

  private async validateServiceAuthentication(config: any): Promise<void> {
    console.log('🔑 Validating Service Authentication...');

    const services = config.services || {};

    // Check for authentication configuration
    for (const [serviceName, service] of Object.entries(services) as [string, any][]) {
      const envVars = service.environment || {};
      
      // Check for service token configuration
      if (envVars.SERVICE_TOKEN) {
        this.addResult('AUTH', `Service Token - ${serviceName}`, 'PASS', 
          `${serviceName} has service token configured`);
      } else {
        this.addResult('AUTH', `Service Token - ${serviceName}`, 'WARNING', 
          `${serviceName} missing service token`,
          'Configure SERVICE_TOKEN for service authentication');
      }

      // Check for rate limiting
      if (envVars.API_RATE_LIMIT) {
        this.addResult('AUTH', `Rate Limiting - ${serviceName}`, 'PASS', 
          `${serviceName} has rate limiting configured`);
      } else {
        this.addResult('AUTH', `Rate Limiting - ${serviceName}`, 'WARNING', 
          `${serviceName} missing rate limiting',
          'Configure API_RATE_LIMIT for DoS protection');
      }
    }
  }

  private async validatePortExposures(config: any): Promise<void> {
    console.log('🚪 Validating Port Exposures...');

    const services = config.services || {};
    let exposedPorts = 0;
    let internalOnlyPorts = 0;

    for (const [serviceName, service] of Object.entries(services) as [string, any][]) {
      if (service.ports) {
        exposedPorts += service.ports.length;
        this.addResult('PORTS', `Public Exposure - ${serviceName}`, 'FAIL', 
          `${serviceName} exposes ${service.ports.length} public port(s)`,
          'Remove public port mappings for security');
      } else {
        internalOnlyPorts++;
        this.addResult('PORTS', `Internal Only - ${serviceName}`, 'PASS', 
          `${serviceName} has no public port exposure`);
      }
    }

    this.addResult('PORTS', 'Port Exposure Summary', exposedPorts === 0 ? 'PASS' : 'FAIL', 
      `${exposedPorts} public ports, ${internalOnlyPorts} internal-only services`);
  }

  private async validateCertificateManagement(config: any): Promise<void> {
    console.log('📜 Validating Certificate Management...');

    const services = config.services || {};

    // Check for certificate volume mounts
    for (const [serviceName, service] of Object.entries(services) as [string, any][]) {
      const volumes = service.volumes || [];
      const certVolumes = volumes.filter((vol: string) => vol.includes('/certs'));
      
      if (certVolumes.length > 0) {
        this.addResult('CERTIFICATES', `Cert Mount - ${serviceName}`, 'PASS', 
          `${serviceName} has certificate volume mounts: ${certVolumes.length}`);
      } else {
        this.addResult('CERTIFICATES', `Cert Mount - ${serviceName}`, 'WARNING', 
          `${serviceName} missing certificate mounts',
          'Mount certificate volumes for mTLS');
      }
    }
  }

  private async validateAuditLogging(config: any): Promise<void> {
    console.log('📊 Validating Audit Logging...');

    const services = config.services || {};

    // Check for audit logging in Oracle Ledger
    const oracleLedger = services['oracle-ledger-mock'];
    if (oracleLedger) {
      const envVars = oracleLedger.environment || {};
      
      if (envVars.AUDIT_LOG_ENABLED === 'true') {
        this.addResult('AUDIT', 'Oracle Ledger Logging', 'PASS', 
          'Audit logging enabled for Oracle Ledger');
      } else {
        this.addResult('AUDIT', 'Oracle Ledger Logging', 'WARNING', 
          'Audit logging not enabled',
          'Enable AUDIT_LOGGING for PCI compliance');
      }
    }

    // Check for PCI compliance mode
    if (config.services?.postgres?.environment?.POSTGRES_HOST_AUTH_METHOD === 'scram-sha-256') {
      this.addResult('COMPLIANCE', 'PostgreSQL Auth', 'PASS', 
        'PostgreSQL using secure authentication (scram-sha-256)');
    }
  }

  private addResult(category: string, test: string, status: SecurityValidationResult['status'], 
                   message: string, remediation?: string): void {
    const result: SecurityValidationResult = {
      category,
      test,
      status,
      message,
      remediation
    };

    this.results.push(result);
    this.printResult(result);
  }

  private printResult(result: SecurityValidationResult): void {
    const icon = {
      'PASS': '✅',
      'FAIL': '❌', 
      'WARNING': '⚠️',
      'INFO': 'ℹ️'
    }[result.status];

    console.log(`${icon} ${result.category}: ${result.test}`);
    console.log(`   ${result.message}`);
    if (result.remediation) {
      console.log(`   🔧 Fix: ${result.remediation}`);
    }
  }

  private generateReport(): NetworkSecurityReport {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      warnings: this.results.filter(r => r.status === 'WARNING').length,
      info: this.results.filter(r => r.status === 'INFO').length
    };

    const compliance = {
      pciDss: this.results.filter(r => r.category === 'COMPLIANCE' && r.status === 'PASS').length > 0,
      sox: summary.failed === 0 && summary.warnings === 0,
      dockerSecurity: summary.failed === 0,
      networkIsolation: this.results.filter(r => r.category === 'NETWORK_ISOLATION' && r.status === 'PASS').length > 0
    };

    const report: NetworkSecurityReport = {
      timestamp: new Date().toISOString(),
      dockerComposeFile: this.dockerComposeFile,
      environmentFile: this.environmentFile,
      results: this.results,
      summary,
      compliance
    };

    this.printSummary(report);
    return report;
  }

  private printSummary(report: NetworkSecurityReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECURITY VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`ℹ️  Info: ${report.summary.info}`);
    console.log('\n🏛️  COMPLIANCE STATUS:');
    console.log(`PCI DSS: ${report.compliance.pciDss ? '✅' : '❌'}`);
    console.log(`SOX: ${report.compliance.sox ? '✅' : '❌'}`);
    console.log(`Docker Security: ${report.compliance.dockerSecurity ? '✅' : '❌'}`);
    console.log(`Network Isolation: ${report.compliance.networkIsolation ? '✅' : '❌'}`);
    
    if (report.summary.failed === 0) {
      console.log('\n🎉 ALL CRITICAL SECURITY CHECKS PASSED!');
    } else {
      console.log(`\n⚠️  ${report.summary.failed} CRITICAL ISSUES FOUND - IMMEDIATE ACTION REQUIRED`);
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const dockerFile = args[0] || 'docker-compose.secure.yml';
  const envFile = args[1] || '.env.secure';

  try {
    const validator = new NetworkSecurityValidator(dockerFile, envFile);
    const report = await validator.runValidation();
    
    // Exit with error code if critical issues found
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { NetworkSecurityValidator, SecurityValidationResult, NetworkSecurityReport };
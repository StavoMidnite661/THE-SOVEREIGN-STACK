# TIGERBEETLE AS CENTRAL TRUTH - SOVR ECOSYSTEM ARCHITECTURE

## Executive Summary

**TigerBeetle is the PRIMARY source of truth** for the SOVR ecosystem. This document clarifies the architecture where TigerBeetle serves as the central ledger system, with all other components (Oracle Ledger, FIC, Credit Terminal, Studio App) integrated around it.

## Architecture Clarification

### **Corrected Architecture (TigerBeetle as Central Truth)**

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SYSTEMS                                 │
│  (Banks, Payment Processors, Crypto Exchanges, Users)                      │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            CREDIT TERMINAL                                    │
│  - API Gateway                                                             │
│  - Authentication & Authorization                                          │
│  - Rate Limiting & Request Validation                                       │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            TIGERBEETLE                                       │
│  (PRIMARY SOURCE OF TRUTH)                                                │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  TigerBeetle Cluster (Replicated)                                      │  │
│  │  - Account Ledger (Primary Storage)                                     │  │
│  │  - Transfer Ledger (Transaction Processing)                             │  │
│  │  - High-Performance Engine (10,000+ TPS)                               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            ORACLE LEDGER                                    │
│  (Secondary - Audit & Reporting)                                           │
│  - Double-Entry Accounting Mirror                                         │
│  - Regulatory Compliance Reports                                          │
│  - Historical Archive                                                     │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            FIC (FINANCIAL INTELLIGENCE CENTER)               │
│  - Real-Time Monitoring                                                   │
│  - Fraud Detection                                                        │
│  - Alert Management                                                       │
│  - Compliance Tracking                                                    │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            STUDIO APP                                       │
│  - User Interface                                                         │
│  - Dashboard & Reporting                                                 │
│  - Transaction Initiation                                                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Key Clarifications

### 1. TigerBeetle is the PRIMARY Source of Truth

**TigerBeetle** is the central ledger system that:
- Stores all account balances
- Processes all transfers
- Maintains the authoritative record
- Provides real-time transaction processing

### 2. Oracle Ledger is SECONDARY (Audit & Reporting)

**Oracle Ledger** serves as:
- A mirror of TigerBeetle for audit purposes
- A reporting system for regulatory compliance
- A historical archive for long-term records
- NOT the primary source of truth

### 3. Data Flow (Corrected)

1. **Transaction Initiated** by external system or user
2. **Received by Credit Terminal** (authentication, validation)
3. **Processed by TigerBeetle** (primary ledger update)
4. **Synced to Oracle Ledger** (for audit trail)
5. **Monitored by FIC** (fraud detection, alerts)
6. **Displayed in Studio App** (user interface)

### 4. Account Structure

All accounts are managed in TigerBeetle:

```
# Asset Accounts
1000: Cash-ODFI-LLC
1010: Cash-Vault-USDC
1050: ACH-Settlement-Account
1060: Stripe-Clearing-Account

# Liability Accounts
2100: ACH-Clearing-LLC
2180: Direct-Deposit-Liabilities
2300: AP

# Income/Expense Accounts
4000: Token-Realization-Gain/Loss
6000: Payroll-Expense
6100: Ops-Expense
```

## Implementation Details

### TigerBeetle Configuration

```yaml
# TigerBeetle Cluster Configuration
tigerbeetle:
  cluster_id: 1
  replication_factor: 3
  cluster_size: 3
  nodes:
    - host: tb-node-1
      port: 3000
    - host: tb-node-2
      port: 3000
    - host: tb-node-3
      port: 3000
  
  # Ledgers
  ledgers:
    - id: 1
      name: "Account Ledger"
      accounts: 1000-9999
    - id: 2
      name: "Transfer Ledger"
      accounts: 1000-9999
```

### Credit Terminal Integration

```typescript
// src/credit-terminal/tigerbeetle-integration.ts
import { TigerBeetle } from 'tigerbeetle-node';
import { OracleLedger } from '@sovr/oracle-ledger';

export class CreditTerminal {
  private tigerBeetle: TigerBeetle;
  private oracleLedger: OracleLedger;
  
  constructor() {
    // TigerBeetle is PRIMARY
    this.tigerBeetle = new TigerBeetle({
      clusterId: 1,
      replicationFactor: 3,
      nodes: [
        { host: 'tb-node-1', port: 3000 },
        { host: 'tb-node-2', port: 3000 },
        { host: 'tb-node-3', port: 3000 },
      ],
    });
    
    // Oracle Ledger is SECONDARY (for audit)
    this.oracleLedger = new OracleLedger();
  }
  
  async processTransaction(transaction: Transaction) {
    // Step 1: Process in TigerBeetle (PRIMARY)
    const tbResult = await this.tigerBeetle.createTransfer({
      id: transaction.id,
      debitAccount: transaction.debitAccount,
      creditAccount: transaction.creditAccount,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      userData: transaction.userData,
    });
    
    // Step 2: Sync to Oracle Ledger (SECONDARY - for audit)
    await this.oracleLedger.recordTransaction({
      id: transaction.id,
      debitAccount: transaction.debitAccount,
      creditAccount: transaction.creditAccount,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      status: 'COMPLETED',
      source: 'TIGERBEETLE',
    });
    
    return tbResult;
  }
  
  async getBalance(accountId: string) {
    // Always query TigerBeetle (PRIMARY)
    return await this.tigerBeetle.getAccountBalance(accountId);
  }
}
```

### FIC Integration (Monitoring)

```typescript
// src/fic/tigerbeetle-monitor.ts
import { TigerBeetle } from 'tigerbeetle-node';
import { FraudDetection } from './fraud-detection';

export class FICMonitor {
  private tigerBeetle: TigerBeetle;
  private fraudDetection: FraudDetection;
  
  constructor() {
    this.tigerBeetle = new TigerBeetle({
      clusterId: 1,
      replicationFactor: 3,
      nodes: [
        { host: 'tb-node-1', port: 3000 },
        { host: 'tb-node-2', port: 3000 },
        { host: 'tb-node-3', port: 3000 },
      ],
    });
    
    this.fraudDetection = new FraudDetection();
  }
  
  async monitorTransactions() {
    // Subscribe to TigerBeetle events (PRIMARY)
    this.tigerBeetle.on('transfer', async (transfer) => {
      // Analyze for fraud
      const riskScore = await this.fraudDetection.analyze(transfer);
      
      // Generate alerts if needed
      if (riskScore > 0.8) {
        await this.generateAlert(transfer, riskScore);
      }
    });
  }
  
  async generateAlert(transfer: Transfer, riskScore: number) {
    // Store alert in FIC database
    await this.alertService.create({
      transferId: transfer.id,
      severity: riskScore > 0.9 ? 'CRITICAL' : 'WARNING',
      type: 'FRAUD_DETECTION',
      details: `High risk transaction: ${transfer.id}`,
    });
  }
}
```

## Migration Strategy

### From Current State to TigerBeetle-Centric

#### Phase 1: TigerBeetle Deployment

1. **Deploy TigerBeetle Cluster**
   - 3-5 nodes with replication factor = 3
   - Configure account ledger and transfer ledger
   - Set up monitoring and alerting

2. **Integrate Credit Terminal**
   - Route all transactions through TigerBeetle
   - Implement dual-write to Oracle Ledger (for audit)
   - Test transaction processing

3. **Verify Data Consistency**
   - Compare balances between systems
   - Validate transaction records
   - Ensure no data loss

#### Phase 2: System Integration

1. **Update FIC**
   - Point monitoring to TigerBeetle
   - Configure fraud detection rules
   - Set up real-time alerts

2. **Update Studio App**
   - Query balances from TigerBeetle
   - Display transactions from TigerBeetle
   - Maintain Oracle Ledger for reporting

3. **Update External Integrations**
   - Route all external transactions through Credit Terminal
   - Ensure all systems write to TigerBeetle first
   - Maintain Oracle Ledger sync for compliance

#### Phase 3: Cutover

1. **Final Validation**
   - Run parallel processing for 1 week
   - Compare all records
   - Verify no discrepancies

2. **Full Cutover**
   - Make TigerBeetle the sole source of truth
   - Disable direct writes to Oracle Ledger
   - Maintain Oracle Ledger as read-only mirror

3. **Monitoring**
   - Watch for any issues
   - Verify performance metrics
   - Ensure compliance requirements met

## Benefits of TigerBeetle-Centric Architecture

### 1. Performance

- **10,000+ Transactions Per Second**
- **Sub-millisecond Latency**
- **Scalable to Handle Growth**
- **No Bottlenecks**

### 2. Reliability

- **Replicated Cluster** (no single point of failure)
- **Automatic Recovery** from failures
- **Data Consistency** guaranteed
- **High Availability** (99.99% uptime)

### 3. Compliance

- **All transactions** recorded in TigerBeetle
- **Complete audit trail** maintained
- **Regulatory requirements** met
- **Oracle Ledger** available for reporting

### 4. Flexibility

- **Can be added incrementally**
- **Non-disruptive** to existing systems
- **Optional** for low-volume use cases
- **Future-proof** architecture

## Monitoring & Alerting

### Key Metrics

| Metric | Description | Threshold |
|--------|-------------|-----------|
| TPS | Transactions per second | > 10,000 |
| Latency | Average processing time | < 10ms |
| Cluster Health | Node availability | 100% |
| Error Rate | Failed transactions | < 0.01% |
| Sync Lag | Time between TB and OL | < 1 minute |

### Alert Rules

| Alert | Severity | Action |
|-------|----------|--------|
| TigerBeetle node down | CRITICAL | Failover to replica |
| High latency (>50ms) | WARNING | Investigate performance |
| Sync lag > 5 minutes | CRITICAL | Manual intervention |
| Error rate > 0.1% | WARNING | Review failed transactions |
| Cluster quorum lost | CRITICAL | Emergency failover |

## Disaster Recovery

### Backup Strategy

- **TigerBeetle**: Replicated cluster (no separate backup needed)
- **Oracle Ledger**: Daily encrypted backups
- **Sync Logs**: Hourly backups of sync operations

### Recovery Procedures

1. **TigerBeetle Node Failure**
   - Automatic failover to replica
   - Replace failed node
   - Restore from cluster

2. **Cluster Failure**
   - Restore from latest backup
   - Rebuild cluster
   - Re-sync with Oracle Ledger

3. **Oracle Ledger Failure**
   - Restore from backup
   - Re-sync from TigerBeetle
   - Validate all transactions

## Security Considerations

### Authentication & Authorization

- **TLS 1.3** for all communications
- **Mutual TLS (mTLS)** for internal services
- **Role-based access control** for TigerBeetle
- **Audit logging** for all operations

### Data Protection

- **Encryption at rest** for sensitive data
- **Encryption in transit** for all communications
- **Secure key management** for TigerBeetle
- **Data masking** for display purposes

## Performance Optimization

### TigerBeetle Tuning

- **Cluster size**: 3-5 nodes for production
- **Replication factor**: 3 for fault tolerance
- **Batch size**: 100-1000 transactions per batch
- **Memory allocation**: 4GB-8GB per node

### Credit Terminal Tuning

- **Connection pooling**: Reuse TigerBeetle connections
- **Batch processing**: Group transactions where possible
- **Async processing**: Non-blocking I/O for high throughput
- **Load balancing**: Distribute across TigerBeetle nodes

## Cost Analysis

### TigerBeetle Costs

- **Licensing**: Open source (no cost)
- **Hardware**: 3-5 servers (moderate cost)
- **Maintenance**: Minimal (self-healing cluster)
- **Support**: Community support (low cost)

### Oracle Ledger Costs

- **Licensing**: Existing (no additional cost)
- **Hardware**: Existing (no additional cost)
- **Maintenance**: Existing (no additional cost)
- **Support**: Existing (no additional cost)

### Total Cost

- **Initial**: Moderate (TigerBeetle hardware)
- **Ongoing**: Low (minimal maintenance)
- **ROI**: High (10x performance improvement)

## Risk Assessment

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TigerBeetle failure | Low | Medium | Replicated cluster |
| Sync failure | Low | High | Automatic retry |
| Data corruption | Very Low | High | Regular validation |
| Performance degradation | Medium | Medium | Load testing |
| Compliance violation | Low | High | Oracle Ledger audit |

## Timeline

### Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. TigerBeetle Setup | 2 weeks | Cluster deployed, accounts configured |
| 2. Credit Terminal Integration | 3 weeks | TigerBeetle service integrated |
| 3. FIC Integration | 2 weeks | Monitoring configured |
| 4. Studio App Updates | 2 weeks | UI updated to use TigerBeetle |
| 5. Testing | 3 weeks | Unit tests, integration tests, load tests |
| 6. Deployment | 1 week | Production deployment, monitoring setup |
| 7. Optimization | 2 weeks | Performance tuning, final adjustments |

**Total**: 15 weeks

## Conclusion

### **TigerBeetle is the PRIMARY Source of Truth**

The corrected architecture makes TigerBeetle the central ledger system, with:

1. **All transactions** processed in TigerBeetle first
2. **All balances** maintained in TigerBeetle
3. **All monitoring** performed on TigerBeetle data
4. **Oracle Ledger** serving as a secondary mirror for audit and reporting

This architecture provides:
- **Superior performance** (10,000+ TPS)
- **High reliability** (replicated cluster)
- **Full compliance** (complete audit trail)
- **Scalability** (handles growth seamlessly)

### Next Steps

1. **Deploy TigerBeetle Cluster** (3-5 nodes)
2. **Integrate Credit Terminal** (route all transactions through TigerBeetle)
3. **Update FIC** (monitor TigerBeetle events)
4. **Update Studio App** (query TigerBeetle for data)
5. **Test thoroughly** (unit, integration, load testing)
6. **Monitor performance** (set up alerts and monitoring)
7. **Optimize** (tune performance based on real-world usage)

This architecture ensures that **TigerBeetle is the single source of truth** for the entire SOVR ecosystem, with all other components integrated around it.
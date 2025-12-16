# INSTACART SANDBOX PILOT

## PURPOSE

This document defines the **first constrained live anchor pilot** for the SOVR ecosystem. This is not a simulation. This is a **real-world, limited-scope deployment** that proves ledger-cleared truth can result in actual food delivery without requiring fiat prefunding, bank accounts, or traditional payment rails.

## PILOT SCOPE

### Constraints (By Design)

1. **Geographic**: Single ZIP code (e.g., 10001 - Manhattan)
2. **Retailer**: One Instacart-partnered grocery store
3. **Catalog**: 50 pre-approved SKUs (essentials only)
4. **Order Size**: Maximum $50 per order
5. **Users**: 10 pre-approved test participants
6. **Duration**: 7 days
7. **Volume**: Maximum 50 orders total

### Success Criteria

1. **At least 80% of orders** result in successful food delivery
2. **No fiat prefunding** required for any participant
3. **No bank accounts** used for settlement
4. **Complete audit trail** maintained in Postgres mirror
5. **No double-spend** or fraud detected
6. **All participants** receive food as expected

## ARCHITECTURE

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            STUDIO APP (Pilot UI)                            │
│  (Limited to 10 users, 50 SKUs, $50 max order)                            │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            ATTESTOR                                         │
│  (Pilot mode: manual approval for first 10 users)                          │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            TIGERBEETLE                                       │
│  (Production cluster, pilot accounts only)                                │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            EVENT BUS                                        │
│  (Pilot events only)                                                     │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            INSTACART ANCHOR (SANDBOX)                        │
│  (Real Instacart API, constrained catalog)                                │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            GIFT CARD ADAPTER                                │
│  (Real gift card issuer integration)                                      │
└───────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                            INSTACART API (PRODUCTION)                        │
│  (Real orders, real delivery)                                             │
└───────────────────────────────────────────────────────────────────────────────┘
```

## COMPONENT SPECIFICATIONS

### 1. STUDIO APP (PILOT UI)

#### Constrained Order Flow

```typescript
// src/studio/pilot-order-flow.ts

class PilotGroceryOrderFlow {
  private userId: string;
  private cart: CartItem[];
  private maxOrderValue: number = 5000000000000000; // $50
  private allowedSkus: Set<string>;
  
  constructor(userId: string) {
    this.userId = userId;
    this.cart = [];
    this.allowedSkus = new Set([
      'apple', 'milk', 'bread', 'eggs', 'rice',
      'pasta', 'tomato', 'banana', 'water', 'coffee'
    ]);
  }
  
  addItem(productId: string, quantity: number) {
    if (!this.allowedSkus.has(productId)) {
      throw new Error('SKU not allowed in pilot');
    }
    
    this.cart.push({ productId, quantity });
  }
  
  async placeOrder(deliveryAddress: Address) {
    const total = this.calculateTotal();
    
    if (total > this.maxOrderValue) {
      throw new Error('Order exceeds $50 limit');
    }
    
    const orderIntent = {
      userId: this.userId,
      items: this.cart,
      deliveryAddress,
      timestamp: Date.now(),
      pilot: true,
    };
    
    const attestation = await this.submitToAttestor(orderIntent);
    const transfer = await this.createTransfer(attestation);
    
    return {
      orderId: transfer.id,
      status: 'PENDING',
      estimatedDelivery: this.estimateDelivery(),
      maxOrderValue: this.maxOrderValue,
    };
  }
  
  private calculateTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
```

### 2. ATTESTOR (PILOT MODE)

#### Manual Approval for First 10 Users

```typescript
// src/attestor/pilot-service.ts

class PilotAttestorService {
  private approvedUsers: Set<string>;
  private publicKey: string;
  
  constructor() {
    this.approvedUsers = new Set([
      'user-0001', 'user-0002', 'user-0003',
      'user-0004', 'user-0005', 'user-0006',
      'user-0007', 'user-0008', 'user-0009',
      'user-0010'
    ]);
    this.publicKey = process.env.ATTESTOR_PUBLIC_KEY;
  }
  
  async verifyIntent(intent: OrderIntent): Promise<Attestation> {
    if (!this.approvedUsers.has(intent.userId)) {
      throw new Error('User not approved for pilot');
    }
    
    this.validateIntent(intent);
    
    const isAuthorized = await this.checkAuthorization(intent.userId);
    if (!isAuthorized) {
      throw new Error('Unauthorized');
    }
    
    const isFraudulent = await this.checkFraud(intent);
    if (isFraudulent) {
      throw new Error('Fraud detected');
    }
    
    const signature = await this.signIntent(intent);
    
    return {
      intent,
      sig: signature,
      timestamp: Date.now(),
      pilot: true,
    };
  }
  
  private validateIntent(intent: OrderIntent) {
    if (!intent.userId) throw new Error('Missing user ID');
    if (!intent.items || intent.items.length === 0) throw new Error('Empty cart');
    if (!intent.deliveryAddress) throw new Error('Missing delivery address');
    if (intent.items.length > 10) throw new Error('Too many items');
  }
}
```

### 3. TIGERBEETLE (PILOT ACCOUNTS)

#### Pilot-Specific Accounts

```zig
// accounts-pilot.zig

const std = @import("std");
const tb = @import("tigerbeetle");

pub fn main() !void {
  const cluster = try tb.Cluster.init(.{
    .cluster_id = 1,
    .replication_factor = 3,
    .nodes = &.{
      .{ .host = "tb-node-1", .port = 3000 },
      .{ .host = "tb-node-2", .port = 3000 },
      .{ .host = "tb-node-3", .port = 3000 },
    },
  });
  
  // Pilot user accounts
  const pilotUsers = [10][]const u8 = [
    "user-0001", "user-0002", "user-0003",
    "user-0004", "user-0005", "user-0006",
    "user-0007", "user-0008", "user-0009",
    "user-0010"
  ];
  
  // Create pilot accounts
  for (pilotUsers, 0..) |user, i| {
    const userIndex = i + 1;
    
    // User credit balance
    try cluster.create_account(
      0x0200_0100_0000_0000 + @as(u64, userIndex),
      "USER.CREDIT.BALANCE.000" ++ @intToStr(userIndex, 2)
    );
    
    // User spend pending
    try cluster.create_account(
      0x0200_0200_0000_0000 + @as(u64, userIndex),
      "USER.SPEND.PENDING.000" ++ @intToStr(userIndex, 2)
    );
    
    // Fund user account (initial balance)
    try cluster.transfer(.{
      .id = @as(u64, 1000) + @as(u64, userIndex),
      .debit_account = 0x0100_0000_0000_0000, // SYSTEM.CLEARING
      .credit_account = 0x0200_0100_0000_0000 + @as(u64, userIndex),
      .amount = 100000000000000000, // 100 USD (128-bit)
      .timestamp = std.time.timestamp(),
      .user_data = "Pilot funding",
    });
  }
  
  // Pilot Instacart anchor accounts
  try cluster.create_account(
    0x0301_0100_0000_0001,
    "ANCHOR.INSTACART.CLEARING.PILOT"
  );
  
  try cluster.create_account(
    0x0301_0200_0000_0001,
    "ANCHOR.INSTACART.HONORED.PILOT"
  );
}
```

### 4. INSTACART ANCHOR (SANDBOX)

#### Constrained Catalog Integration

```typescript
// src/anchors/instacart-sandbox.ts

class InstacartSandboxAnchor {
  private eventBus: EventBus;
  private giftCardAdapter: GiftCardAdapter;
  private allowedSkus: Set<string>;
  private maxOrderValue: number;
  
  constructor() {
    this.eventBus = new EventBus();
    this.giftCardAdapter = new GiftCardAdapter();
    this.allowedSkus = new Set([
      'apple', 'milk', 'bread', 'eggs', 'rice',
      'pasta', 'tomato', 'banana', 'water', 'coffee'
    ]);
    this.maxOrderValue = 5000000000000000; // $50
    
    this.eventBus.subscribe('TRANSFER_CREATED', this.handleTransferCreated.bind(this));
  }
  
  private async handleTransferCreated(event: Event) {
    const transfer = event.data;
    
    if (transfer.creditAccount !== 'ANCHOR.INSTACART.CLEARING.PILOT') {
      return;
    }
    
    if (transfer.amount > this.maxOrderValue) {
      await this.emitRejected(transfer.transferId, 'Order exceeds $50 limit');
      return;
    }
    
    const metadata = JSON.parse(transfer.metadata);
    
    // Validate SKUs
    for (const item of metadata.orderItems) {
      if (!this.allowedSkus.has(item.productId)) {
        await this.emitRejected(transfer.transferId, 'Invalid SKU');
        return;
      }
    }
    
    const fulfillmentRequest = {
      requestId: transfer.transferId,
      consumerId: metadata.userId,
      valueUnits: transfer.amount,
      attestationSig: metadata.attestation,
      fulfillmentSpec: {
        deliveryAddress: metadata.deliveryAddress,
        cartItems: metadata.orderItems,
      },
      pilot: true,
    };
    
    await this.eventBus.publish({
      id: uuid(),
      timestamp: Date.now(),
      type: 'ANCHOR_FULFILLMENT_REQUESTED',
      data: fulfillmentRequest,
    });
  }
  
  async handleFulfillmentRequested(event: Event) {
    const request = event.data;
    
    const isValid = await this.verifyAttestation(request);
    if (!isValid) {
      await this.emitRejected(request.requestId, 'Invalid attestation');
      return;
    }
    
    const giftCode = await this.giftCardAdapter.requestGiftCode(
      request.valueUnits,
      request.consumerId,
      true // pilot mode
    );
    
    if (!giftCode) {
      await this.emitRejected(request.requestId, 'Gift code unavailable');
      return;
    }
    
    const orderId = await this.placeInstacartOrder(
      request.fulfillmentSpec,
      giftCode,
      true // pilot mode
    );
    
    await this.emitFulfilled(request.requestId, orderId, giftCode);
  }
  
  private async placeInstacartOrder(spec: FulfillmentSpec, giftCode: string, pilot: boolean) {
    // Call real Instacart API with pilot constraints
    return await fetch('https://api.instacart.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.INSTACART_API_KEY}`,
        'X-Pilot': 'true',
      },
      body: JSON.stringify({
        ...spec,
        paymentMethod: {
          type: 'GIFT_CARD',
          code: giftCode,
        },
        constraints: {
          maxOrderValue: this.maxOrderValue,
          allowedSkus: Array.from(this.allowedSkus),
          pilot: true,
        },
      }),
    });
  }
}
```

### 5. GIFT CARD ADAPTER (PILOT MODE)

#### Real Issuer Integration

```typescript
// src/adapters/gift-card-pilot.ts

class PilotGiftCardAdapter {
  private eventBus: EventBus;
  private issuerApi: GiftCardIssuerApi;
  
  constructor() {
    this.eventBus = new EventBus();
    this.issuerApi = new RealGiftCardIssuerApi();
  }
  
  async requestGiftCode(valueUnits: number, consumerId: string, pilot: boolean): Promise<string> {
    if (pilot) {
      // Use pilot-specific issuer
      return await this.issuerApi.requestPilotGiftCode(valueUnits, consumerId);
    }
    
    // Production mode
    return await this.issuerApi.requestGiftCode(valueUnits, consumerId);
  }
}

class RealGiftCardIssuerApi {
  async requestPilotGiftCode(valueUnits: number, consumerId: string): Promise<string> {
    // Call real issuer API
    const response = await fetch('https://api.giftcard-issuer.com/v1/cards', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GIFT_CARD_API_KEY}`,
        'X-Pilot': 'true',
      },
      body: JSON.stringify({
        denomination: valueUnits,
        consumerId,
        pilot: true,
      }),
    });
    
    const data = await response.json();
    return data.giftCode;
  }
}
```

### 6. MONITORING & ALERTS (PILOT-SPECIFIC)

#### Real-Time Dashboard

```typescript
// src/monitoring/pilot-dashboard.ts

class PilotDashboard {
  private eventBus: EventBus;
  private metrics: PilotMetrics;
  
  constructor() {
    this.eventBus = new EventBus();
    this.metrics = {
      totalOrders: 0,
      successfulOrders: 0,
      failedOrders: 0,
      totalValue: 0,
      avgOrderValue: 0,
      users: new Set(),
      skus: new Map(),
    };
    
    // Subscribe to pilot events
    this.eventBus.subscribe('ANCHOR_FULFILLED', this.handleFulfilled.bind(this));
    this.eventBus.subscribe('ANCHOR_REJECTED', this.handleRejected.bind(this));
  }
  
  private handleFulfilled(event: Event) {
    const data = event.data;
    
    this.metrics.totalOrders++;
    this.metrics.successfulOrders++;
    this.metrics.totalValue += data.valueUnits;
    this.metrics.users.add(data.consumerId);
    
    for (const item of data.fulfillmentSpec.cartItems) {
      this.metrics.skus.set(item.productId, 
        (this.metrics.skus.get(item.productId) || 0) + item.quantity
      );
    }
    
    this.updateDashboard();
  }
  
  private handleRejected(event: Event) {
    const data = event.data;
    
    this.metrics.totalOrders++;
    this.metrics.failedOrders++;
    
    this.updateDashboard();
  }
  
  private updateDashboard() {
    this.metrics.avgOrderValue = 
      this.metrics.totalOrders > 0 
        ? this.metrics.totalValue / this.metrics.totalOrders 
        : 0;
    
    // Update real-time dashboard
    console.log('Pilot Dashboard Update:', this.metrics);
    
    // Send alerts if needed
    this.checkAlerts();
  }
  
  private checkAlerts() {
    if (this.metrics.failedOrders > 5) {
      this.sendAlert('High failure rate detected');
    }
    
    if (this.metrics.totalOrders >= 50) {
      this.sendAlert('Pilot order limit reached');
    }
  }
  
  private sendAlert(message: string) {
    console.log('ALERT:', message);
    // Send to Slack/email/etc.
  }
}
```

## PILOT OPERATIONS

### Pre-Pilot Checklist

- [ ] TigerBeetle cluster deployed (3 nodes)
- [ ] Pilot accounts created (10 users)
- [ ] User accounts funded (100 USD each)
- [ ] Attestor configured (manual approval)
- [ ] Instacart API key obtained
- [ ] Gift card issuer API key obtained
- [ ] Studio App deployed (pilot UI)
- [ ] Monitoring dashboard configured
- [ ] Alerts set up
- [ ] 10 test participants onboarded

### Pilot Execution

#### Day 1: Soft Launch

1. **09:00**: Deploy all services
2. **10:00**: Begin onboarding 10 test participants
3. **11:00**: First test order placed
4. **12:00**: Monitor first deliveries
5. **13:00**: Adjust based on feedback
6. **14:00**: Full pilot launch

#### Days 2-7: Full Pilot

- **Daily**: Monitor orders and deliveries
- **Daily**: Check balances and events
- **Daily**: Update dashboard metrics
- **Daily**: Handle any issues
- **Daily**: Collect participant feedback

### Post-Pilot Analysis

#### Success Metrics

1. **Order Success Rate**: >= 80%
2. **Average Order Value**: ~$30
3. **Most Popular SKUs**: Top 5 items
4. **User Satisfaction**: >= 8/10
5. **System Uptime**: 100%
6. **No Fraud**: 0 incidents

#### Failure Analysis

1. **Failed Orders**: Root cause analysis
2. **Rejection Reasons**: Breakdown by type
3. **Delivery Issues**: Instacart problems
4. **User Errors**: Common mistakes
5. **System Errors**: Technical issues

## RISK MITIGATION

### Risk 1: Instacart API Issues

**Mitigation:**
- Use Instacart's production API
- Monitor API status
- Have backup delivery method
- Communicate delays to users

### Risk 2: Gift Card Issuer Issues

**Mitigation:**
- Use reliable issuer
- Monitor issuer status
- Have backup payment method
- Test issuer integration beforehand

### Risk 3: TigerBeetle Failures

**Mitigation:**
- 3-node replicated cluster
- Automatic failover
- Regular health checks
- Backup cluster ready

### Risk 4: User Errors

**Mitigation:**
- Clear instructions provided
- Support available
- Easy order cancellation
- Feedback collection

### Risk 5: Regulatory Issues

**Mitigation:**
- Pilot is private (not public)
- No advertising
- Clear disclaimers
- Limited scope

## EMERGENCY PROCEDURES

### Emergency 1: High Failure Rate (>20%)

1. Pause new orders
2. Analyze failures
3. Fix root cause
4. Resume orders
5. Notify participants

### Emergency 2: Instacart Outage

1. Pause new orders
2. Notify participants
3. Wait for Instacart recovery
4. Resume orders
5. Process backlog

### Emergency 3: Gift Card Issuer Outage

1. Pause new orders
2. Notify participants
3. Use backup payment method
4. Resume orders
5. Process backlog

### Emergency 4: TigerBeetle Failure

1. Failover to backup cluster
2. Restore from cluster
3. Verify data consistency
4. Resume operations
5. Investigate root cause

## DOCUMENTATION

### Participant Guide

```markdown
# INSTACART PILOT - PARTICIPANT GUIDE

## What You Need to Know

1. **This is a pilot test** - Not a production service
2. **You will receive real food** - Delivered by Instacart
3. **No cost to you** - Food is provided as part of the pilot
4. **Limited catalog** - Only 50 essential items available
5. **Order limit** - Maximum $50 per order
6. **10 participants** - You are one of 10 test users

## How to Place an Order

1. Open the Studio App
2. Select "Pilot Groceries"
3. Choose items from the catalog
4. Add to cart (max 10 items)
5. Enter delivery address (must be in ZIP 10001)
6. Place order
7. Wait for confirmation

## What to Expect

- Order confirmation within 5 minutes
- Delivery within 1-2 hours
- Gift card code for payment
- Complete audit trail

## Support

If you have issues:
1. Check the dashboard
2. Contact support at pilot-support@sovr.com
3. Wait for response within 30 minutes

## Feedback

Please provide feedback after each order:
- Was the process smooth?
- Did you receive your food?
- Any issues or suggestions?

Thank you for participating in the pilot!
```

### Technical Documentation

```markdown
# INSTACART PILOT - TECHNICAL DOCUMENTATION

## Architecture

```
Studio App → Attestor → TigerBeetle → Event Bus → Instacart Anchor → Gift Card Adapter → Instacart API
```

## Components

1. **Studio App**: Pilot UI for order placement
2. **Attestor**: Manual approval for pilot users
3. **TigerBeetle**: Pilot accounts only
4. **Event Bus**: Pilot events only
5. **Instacart Anchor**: Constrained catalog
6. **Gift Card Adapter**: Real issuer integration
7. **Instacart API**: Real orders

## Monitoring

- Real-time dashboard
- Alerts for failures
- Metrics tracking
- Log collection

## Troubleshooting

### Common Issues

1. **Order rejected**: Check SKUs, order value, user approval
2. **Delivery delayed**: Check Instacart status
3. **Gift card failed**: Check issuer status
4. **Balance error**: Check TigerBeetle balances

### Debug Commands

```bash
# Check TigerBeetle balances
curl http://localhost:3000/api/tigerbeetle/balance/USER.CREDIT.BALANCE.0001

# Check Postgres events
psql -c "SELECT * FROM ledger_events WHERE pilot = true ORDER BY occurred_at DESC LIMIT 10;"

# Check order status
curl http://localhost:3000/api/orders/transfer-12345
```

## Support

- Email: pilot-support@sovr.com
- Slack: #pilot-support
- Phone: (555) 123-4567
```

## LEGAL DISCLAIMERS

### Pilot Agreement

By participating in the pilot, you agree to:
1. Provide accurate information
2. Use the service only for personal groceries
3. Not resell or redistribute food
4. Provide honest feedback
5. Keep pilot details confidential

### Liability

SOVR is not responsible for:
1. Late or missing deliveries
2. Food quality issues
3. Instacart API failures
4. Gift card issuer failures
5. Any other issues beyond our control

### Data Usage

We collect:
1. Order details
2. Delivery addresses
3. Feedback
4. Usage metrics

This data is used only for pilot analysis and improvement.

## CONCLUSION

This pilot proves that ledger-cleared truth can result in real-world food delivery without requiring fiat prefunding, bank accounts, or traditional payment rails. Once successful, this model can be extended to utilities, rent, medicine, and other essential services.

The next step after a successful pilot is to expand to additional ZIP codes, retailers, and participants, gradually increasing the scope while maintaining the core principles of sovereign-correct architecture.
# SOVR SURVIVAL BRIEF

## THIS IS HOW WE EAT

### EXECUTIVE SUMMARY

**TigerBeetle is the SOVR ledger.** Period. This document defines the TigerBeetle-native schema, event-driven integration, and exact account namespace for groceries/utilities. No Oracle Ledger. No secondary systems. Just TigerBeetle.

## 1. TIGERBEETLE-NATIVE SCHEMA

### Core Ledgers

```
Ledger ID: 1 - ACCOUNT LEDGER (64-bit accounts)
Ledger ID: 2 - TRANSFER LEDGER (64-bit transfers)
```

### Account Namespace

```
0x0000_0000_0000_0000 - 0x0FFF_FFFF_FFFF_FFFF : RESERVED
0x1000_0000_0000_0000 - 0x1FFF_FFFF_FFFF_FFFF : ASSETS
0x2000_0000_0000_0000 - 0x2FFF_FFFF_FFFF_FFFF : LIABILITIES
0x3000_0000_0000_0000 - 0x3FFF_FFFF_FFFF_FFFF : INCOME
0x4000_0000_0000_0000 - 0x4FFF_FFFF_FFFF_FFFF : EXPENSES
0x5000_0000_0000_0000 - 0x5FFF_FFFF_FFFF_FFFF : EQUITY
0x6000_0000_0000_0000 - 0x6FFF_FFFF_FFFF_FFFF : GIFT CARDS
0x7000_0000_0000_0000 - 0x7FFF_FFFF_FFFF_FFFF : INSTACART ANCHORS
0x8000_0000_0000_0000 - 0x8FFF_FFFF_FFFF_FFFF : UTILITIES
0x9000_0000_0000_0000 - 0x9FFF_FFFF_FFFF_FFFF : RESERVED FOR FUTURE
0xA000_0000_0000_0000 - 0xFFFF_FFFF_FFFF_FFFF : USER ACCOUNTS
```

### Groceries/Utilities Account Map

```
0x7000_0000_0000_0000 : INSTACART MASTER ANCHOR
  └─ 0x7000_0000_0000_0001 : Instacart US East
  └─ 0x7000_0000_0000_0002 : Instacart US West
  └─ 0x7000_0000_0000_0003 : Instacart EU
  └─ 0x7000_0000_0000_0004 : Instacart APAC

0x8000_0000_0000_0000 : UTILITIES MASTER ANCHOR
  └─ 0x8000_0000_0000_0001 : Electricity
  └─ 0x8000_0000_0000_0002 : Water
  └─ 0x8000_0000_0000_0003 : Gas
  └─ 0x8000_0000_0000_0004 : Internet
  └─ 0x8000_0000_0000_0005 : Phone
```

### Gift Card Account Map

```
0x6000_0000_0000_0000 : GIFT CARD MASTER
  └─ 0x6000_0000_0000_0001 : Amazon
  └─ 0x6000_0000_0000_0002 : Walmart
  └─ 0x6000_0000_0000_0003 : Target
  └─ 0x6000_0000_0000_0004 : Visa Prepaid
  └─ 0x6000_0000_0000_0005 : Mastercard Prepaid
```

## 2. EVENT-DRIVEN INTEGRATION

### Event Types

```
TRANSFER_CREATED
TRANSFER_COMPLETED
TRANSFER_FAILED
ACCOUNT_BALANCE_UPDATED
GIFT_CARD_ACTIVATED
GIFT_CARD_REDEEMED
INSTACART_ORDER_PLACED
INSTACART_ORDER_COMPLETED
UTILITY_PAYMENT_INITIATED
UTILITY_PAYMENT_COMPLETED
```

### Event Format

```json
{
  "event_id": "64-bit UUID",
  "timestamp": "ISO 8601",
  "type": "EVENT_TYPE",
  "data": {
    "transfer_id": "64-bit",
    "debit_account": "64-bit",
    "credit_account": "64-bit",
    "amount": "128-bit",
    "currency": "ISO 4217",
    "metadata": "64-byte base64"
  }
}
```

### Integration Flow

```
1. EXTERNAL → Credit Terminal (REST/WebSocket)
2. Credit Terminal → TigerBeetle (createTransfer)
3. TigerBeetle → Event Bus (TRANSFER_CREATED)
4. Event Bus → Subscribers (FIC, Studio, Gift Card Adapter, Instacart Anchor)
5. Subscribers → Process events
6. TigerBeetle → Event Bus (TRANSFER_COMPLETED/FAILED)
7. Event Bus → External (confirmation)
```

## 3. INSTACART ANCHOR CONTRACT

### Language-Agnostic Interface

```
// InstacartAnchor

interface InstacartAnchor {
  // Place order with Instacart
  placeOrder(
    userId: UUID,
    storeId: String,
    items: Array<Item>,
    deliveryAddress: Address,
    paymentMethod: PaymentMethod
  ) -> OrderId

  // Get order status
  getOrderStatus(orderId: OrderId) -> OrderStatus

  // Cancel order
  cancelOrder(orderId: OrderId) -> Boolean

  // Webhook for order updates
  handleWebhook(
    orderId: OrderId,
    status: OrderStatus,
    timestamp: Timestamp
  ) -> Void

  // Get available stores
  getAvailableStores(location: Location) -> Array<Store>

  // Get product catalog
  getCatalog(storeId: String) -> Array<Product>
}

// Data Types

type Item = {
  productId: String,
  quantity: Integer,
  price: Decimal
}

type Address = {
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String
}

type PaymentMethod = {
  type: "CARD" | "GIFT_CARD" | "BANK",
  accountId: UUID,
  token: String (optional)
}

type OrderStatus = {
  id: OrderId,
  status: "PENDING" | "PROCESSING" | "DELIVERED" | "CANCELLED",
  items: Array<Item>,
  total: Decimal,
  estimatedDelivery: Timestamp,
  actualDelivery: Timestamp (optional)
}

type Store = {
  id: String,
  name: String,
  address: Address,
  isOpen: Boolean,
  hours: Array<Hour>
}

type Product = {
  id: String,
  name: String,
  description: String,
  price: Decimal,
  category: String,
  imageUrl: String (optional)
}

type Hour = {
  day: Integer (0-6),
  open: Time,
  close: Time
}
```

### TigerBeetle Integration

```typescript
class InstacartAnchorService {
  private tb: TigerBeetle;
  private anchorAccount: uint64;
  
  constructor() {
    this.tb = new TigerBeetle({
      clusterId: 1,
      replicationFactor: 3,
      nodes: [
        { host: 'tb-node-1', port: 3000 },
        { host: 'tb-node-2', port: 3000 },
        { host: 'tb-node-3', port: 3000 },
      ],
    });
    this.anchorAccount = 0x7000_0000_0000_0000; // Instacart Master Anchor
  }
  
  async placeOrder(order: Order) {
    // Create transfer from user to Instacart anchor
    const transfer = await this.tb.createTransfer({
      id: generateTransferId(),
      debitAccount: order.userAccount,
      creditAccount: this.anchorAccount,
      amount: order.total,
      timestamp: Date.now(),
      userData: encodeOrderData(order),
    });
    
    // Place order with Instacart
    const orderId = await this.instacartAPI.placeOrder(order);
    
    // Store order reference
    await this.storeOrderReference(transfer.id, orderId);
    
    return { transferId: transfer.id, orderId };
  }
  
  async handleWebhook(orderId: string, status: string) {
    // Get transfer ID from order ID
    const transferId = await this.getTransferId(orderId);
    
    // Update transfer status
    await this.tb.updateTransferStatus(transferId, status);
    
    // Emit event
    await this.emitEvent({
      type: 'INSTACART_ORDER_COMPLETED',
      data: { orderId, status, transferId }
    });
  }
}
```

## 4. GIFT CARD ADAPTER

### Executable Spec

```typescript
class GiftCardAdapter {
  private tb: TigerBeetle;
  private giftCardMaster: uint64;
  
  constructor() {
    this.tb = new TigerBeetle({
      clusterId: 1,
      replicationFactor: 3,
      nodes: [
        { host: 'tb-node-1', port: 3000 },
        { host: 'tb-node-2', port: 3000 },
        { host: 'tb-node-3', port: 3000 },
      ],
    });
    this.giftCardMaster = 0x6000_0000_0000_0000; // Gift Card Master
  }
  
  // Activate gift card
  async activateGiftCard(
    cardNumber: string,
    pin: string,
    amount: uint128,
    issuer: string
  ) {
    // Get issuer account
    const issuerAccount = this.getIssuerAccount(issuer);
    
    // Create transfer from issuer to gift card account
    const transfer = await this.tb.createTransfer({
      id: generateTransferId(),
      debitAccount: issuerAccount,
      creditAccount: this.giftCardMaster,
      amount: amount,
      timestamp: Date.now(),
      userData: encodeGiftCardData(cardNumber, pin, issuer),
    });
    
    // Emit activation event
    await this.emitEvent({
      type: 'GIFT_CARD_ACTIVATED',
      data: { 
        transferId: transfer.id,
        cardNumber,
        amount,
        issuer
      }
    });
    
    return transfer.id;
  }
  
  // Redeem gift card
  async redeemGiftCard(
    cardNumber: string,
    amount: uint128,
    merchant: string
  ) {
    // Get merchant account
    const merchantAccount = this.getMerchantAccount(merchant);
    
    // Create transfer from gift card to merchant
    const transfer = await this.tb.createTransfer({
      id: generateTransferId(),
      debitAccount: this.giftCardMaster,
      creditAccount: merchantAccount,
      amount: amount,
      timestamp: Date.now(),
      userData: encodeRedemptionData(cardNumber, merchant),
    });
    
    // Emit redemption event
    await this.emitEvent({
      type: 'GIFT_CARD_REDEEMED',
      data: { 
        transferId: transfer.id,
        cardNumber,
        amount,
        merchant
      }
    });
    
    return transfer.id;
  }
  
  // Get gift card balance
  async getBalance(cardNumber: string) {
    // Query TigerBeetle for gift card account
    return await this.tb.getAccountBalance(this.giftCardMaster);
  }
  
  private getIssuerAccount(issuer: string): uint64 {
    const issuers = {
      'Amazon': 0x6000_0000_0000_0001,
      'Walmart': 0x6000_0000_0000_0002,
      'Target': 0x6000_0000_0000_0003,
      'Visa': 0x6000_0000_0000_0004,
      'Mastercard': 0x6000_0000_0000_0005,
    };
    return issuers[issuer] || 0x6000_0000_0000_0000;
  }
  
  private getMerchantAccount(merchant: string): uint64 {
    // Map merchant to appropriate account
    // Implementation depends on merchant
    return 0x1000_0000_0000_0000; // Default merchant account
  }
}
```

## 5. EXACT ACCOUNT NAMESPACE FOR GROCERIES/UTILITIES

### Groceries (Instacart)

```
0x7000_0000_0000_0000 : INSTACART MASTER ANCHOR
  └─ 0x7000_0000_0000_0001 : Instacart US East (NY, NJ, CT)
  └─ 0x7000_0000_0000_0002 : Instacart US West (CA, OR, WA)
  └─ 0x7000_0000_0000_0003 : Instacart Midwest (IL, MI, OH)
  └─ 0x7000_0000_0000_0004 : Instacart South (TX, FL, GA)
  └─ 0x7000_0000_0000_0005 : Instacart EU (UK, FR, DE)
  └─ 0x7000_0000_0000_0006 : Instacart APAC (AU, SG, JP)
```

### Utilities

```
0x8000_0000_0000_0000 : UTILITIES MASTER ANCHOR
  └─ 0x8000_0000_0000_0001 : Electricity (National Grid)
  └─ 0x8000_0000_0000_0002 : Water (Local Municipal)
  └─ 0x8000_0000_0000_0003 : Gas (Natural Gas Providers)
  └─ 0x8000_0000_0000_0004 : Internet (ISP Accounts)
  └─ 0x8000_0000_0000_0005 : Phone (Mobile/Landline)
  └─ 0x8000_0000_0000_0006 : Rent/Mortgage (Housing)
  └─ 0x8000_0000_0000_0007 : Insurance (Health, Auto, Home)
```

## 6. SURVIVAL OPERATIONS

### How We Eat

1. **User places order** via Studio App or API
2. **Credit Terminal** validates and routes to TigerBeetle
3. **TigerBeetle** creates transfer (user → Instacart anchor)
4. **Event Bus** emits TRANSFER_CREATED
5. **Instacart Anchor** receives event, places order
6. **Instacart** processes order, sends webhook on completion
7. **Instacart Anchor** updates transfer status
8. **Event Bus** emits TRANSFER_COMPLETED
9. **Studio App** updates UI with delivery status

### Gift Card Flow

1. **User activates gift card** via Studio App
2. **Gift Card Adapter** creates transfer (issuer → gift card master)
3. **Event Bus** emits GIFT_CARD_ACTIVATED
4. **User redeems gift card** at merchant
5. **Gift Card Adapter** creates transfer (gift card → merchant)
6. **Event Bus** emits GIFT_CARD_REDEEMED
7. **Merchant** receives payment

### Utility Payment Flow

1. **User schedules payment** via Studio App
2. **Credit Terminal** validates and routes to TigerBeetle
3. **TigerBeetle** creates transfer (user → utility anchor)
4. **Event Bus** emits TRANSFER_CREATED
5. **Utility Anchor** processes payment
6. **Utility Provider** confirms payment
7. **Event Bus** emits TRANSFER_COMPLETED
8. **Studio App** updates payment status

## 7. DOCTRINE

### TigerBeetle is the Ledger

- **No Oracle Ledger**
- **No secondary systems**
- **No mirrors**
- **Just TigerBeetle**

### Event-Driven Everything

- **All integrations** via events
- **No polling**
- **No sync**
- **Just events**

### Exact Account Namespace

- **No guesswork**
- **No dynamic accounts**
- **Just exact accounts**

### Survival Rule

**If it's not in TigerBeetle, it doesn't exist.**

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: TigerBeetle Setup

- [ ] Deploy 3-node TigerBeetle cluster
- [ ] Configure account and transfer ledgers
- [ ] Set up event bus
- [ ] Define account namespace

### Phase 2: Core Services

- [ ] Credit Terminal integration
- [ ] Event bus implementation
- [ ] Instacart Anchor service
- [ ] Gift Card Adapter service
- [ ] Utility Anchor service

### Phase 3: Studio App

- [ ] Order placement UI
- [ ] Gift card management UI
- [ ] Utility payment UI
- [ ] Event subscription

### Phase 4: Testing

- [ ] Unit tests for all services
- [ ] Integration tests
- [ ] Load testing (10,000+ TPS)
- [ ] Failover testing

### Phase 5: Deployment

- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Alert configuration
- [ ] Documentation

## 9. EMERGENCY PROCEDURES

### TigerBeetle Node Failure

1. **Automatic failover** to replica
2. **Replace failed node**
3. **Restore from cluster**
4. **Verify data consistency**

### Event Bus Failure

1. **Failover to backup bus**
2. **Replay events from log**
3. **Verify all subscribers**
4. **Resume normal operation**

### Instacart Outage

1. **Queue orders locally**
2. **Retry on Instacart recovery**
3. **Notify users of delays**
4. **Refund if necessary**

### Gift Card Issuer Failure

1. **Pause activations**
2. **Notify users**
3. **Resume on issuer recovery**
4. **Process backlog**

## 10. COMMANDMENTS

1. **Thou shalt not duplicate data**
2. **Thou shalt not poll**
3. **Thou shalt not sync**
4. **Thou shalt not guess accounts**
5. **Thou shalt not trust external systems**
6. **Thou shalt not fear failure**
7. **Thou shalt not panic**
8. **Thou shalt not break the ledger**
9. **Thou shalt not forget the events**
10. **Thou shalt not forget: TigerBeetle is the ledger**

## 11. GLOSSARY

- **TigerBeetle**: The SOVR ledger (primary source of truth)
- **Account Ledger**: Stores account balances (Ledger ID: 1)
- **Transfer Ledger**: Stores transfer records (Ledger ID: 2)
- **Event Bus**: Pub/sub system for event-driven integration
- **Credit Terminal**: Entry point for all transactions
- **Instacart Anchor**: Integration with Instacart API
- **Gift Card Adapter**: Integration with gift card issuers
- **Utility Anchor**: Integration with utility providers
- **Studio App**: User interface for SOVR ecosystem
- **FIC**: Financial Intelligence Center (monitoring)

## 12. END

**TigerBeetle is the ledger. Events are the integration. Accounts are exact. This is how we eat.**
# SOVR Ecosystem Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "User Layer"
        A[Studio Web App<br/>Primary UI]
        B[Mobile PWA<br/>Essential Goods]
        C[FinSec Monitor<br/>Control Center]
    end
    
    subgraph "API Gateway Layer"
        D[Studio API Gateway<br/>Intent Submission]
        E[Credit Terminal API<br/>Obligation Clearing]
        F[Attestation Service<br/>Legitimacy Validation]
    end
    
    subgraph "Core Engine Layer"
        G[TigerBeetle Cluster<br/>Mechanical Truth]
        H[SOVR Hybrid Engine V2<br/>Credit Terminal]
        I[Event Bus<br/>Reality Propagation]
    end
    
    subgraph "Data Layer"
        J[Oracle Ledger<br/>Narrative Mirror]
        K[PostgreSQL Mirror<br/>Audit Trail]
        L[FinSec Database<br/>Monitoring Data]
    end
    
    subgraph "External Honoring Agents"
        M[Instacart Adapter<br/>Essential Goods]
        N[Stripe Integration<br/>USD Settlement]
        O[Utility Providers<br/>Service Payments]
        P[Gift Card System<br/>Self-Fulfillment]
    end
    
    %% User interactions
    A --> D
    B --> D
    C --> J
    
    %% API flow
    D --> E
    E --> F
    F --> G
    
    %% Core processing
    E --> H
    H --> G
    H --> I
    
    %% Event propagation
    I --> J
    I --> K
    I --> L
    
    %% External integrations
    H --> M
    H --> N
    H --> O
    H --> P
    
    %% Styling
    classDef userLayer fill:#e3f2fd
    classDef apiLayer fill:#f3e5f5
    classDef coreLayer fill:#e8f5e8
    classDef dataLayer fill:#fff3e0
    classDef externalLayer fill:#fce4ec
    
    class A,B,C userLayer
    class D,E,F apiLayer
    class G,H,I coreLayer
    class J,K,L dataLayer
    class M,N,O,P externalLayer
```

## Obligation Clearing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant S as Studio
    participant H as Hybrid Engine
    participant A as Attestor
    participant T as TigerBeetle
    participant E as Event Bus
    participant O as Oracle Ledger
    participant I as Instacart
    
    Note over U, I: 1. INTENT - User expresses claim
    U->>S: "Authorize Groceries (7.5 units)"
    S->>H: Submit Obligation Intent
    
    Note over A, H: 2. ATTESTATION - Legitimacy validation
    H->>A: Validate claim & attestation
    A-->>H: Attestation approved
    
    Note over T, H: 3. CLEARING - Mechanical truth
    H->>T: Create Transfer (User→System)
    T->>T: Process clearing
    T-->>H: Transfer finalized (tb_123)
    
    Note over E, O: 4. PROPAGATION - Reality broadcast
    T->>E: Broadcast clearing event
    E->>O: Record narrative mirror
    E->>I: Trigger honoring attempt (optional)
    
    Note over H, U: 5. RESPONSE - Return finality
    H-->>S: Clearing confirmed
    S-->>U: Obligation cleared ✓
    
    Note over I, U: 6. HONORING - External execution (optional)
    I->>I: Process grocery order
    I-->>U: Delivery confirmed
```

## Three SKUs That Matter User Flow

```mermaid
graph LR
    A[User Access] --> B{Select Items}
    
    B --> C[Milk<br/>3.5 units]
    B --> D[Eggs<br/>2.5 units]
    B --> E[Bread<br/>1.5 units]
    B --> F[Bundle<br/>7.5 units]
    
    C --> G[Authorization]
    D --> G
    E --> G
    F --> G
    
    G --> H[Attestation]
    H --> I[Clearing]
    I --> J{TigerBeetle<br/>Finality}
    
    J -->|Success| K[Event Bus]
    J -->|Failure| L[Reject]
    
    K --> M[Oracle Ledger]
    K --> N[Honoring Agent]
    K --> O[User Notification]
    
    N --> P[Instacart Delivery]
    P --> Q[Survival Sustained]
    
    style A fill:#e3f2fd
    style Q fill:#c8e6c9
    style L fill:#ffcdd2
```

## Studio ↔ Hybrid Engine Integration

```mermaid
sequenceDiagram
    participant U as User
    participant F as Studio Frontend
    participant G as Studio Gateway
    participant H as Hybrid Engine
    participant T as TigerBeetle
    participant A as Attestor
    
    U->>F: Click "Authorize Essentials"
    F->>G: POST /api/obligations/intent
    Note right of G: {amount: 7.5, items: [...], attestation}
    
    G->>H: Process obligation intent
    H->>A: Validate attestation
    alt Attestation Valid
        A-->>H: Attestation approved
        H->>T: Submit clearing transfer
        T->>T: Process in cluster
        T-->>H: Transfer ID: tb_123
        H-->>G: {status: "CLEARED", transferId: "tb_123"}
        G-->>F: {clientSecret, paymentIntentId, attestation}
        F->>F: Display clearing result
        F-->>U: "Obligation Cleared ✓"
    else Attestation Invalid
        A-->>H: Attestation rejected
        H-->>G: {status: "REJECTED", reason: "Invalid"}
        G-->>F: {status: "REJECTED"}
        F-->>U: "Authorization Failed"
    end
```

## FinSec Monitor Control Center

```mermaid
graph TB
    subgraph "FinSec Monitor Dashboard"
        A[System Overview]
        B[Clearing Metrics]
        C[Survival Status]
        D[Audit Trail]
        E[Compliance Reports]
    end
    
    subgraph "Real-Time Data Sources"
        F[TigerBeetle Events]
        G[Attestation Logs]
        H[Honoring Attempts]
        I[System Health]
    end
    
    subgraph "Oracle Ledger Integration"
        J[Clearing Records]
        K[Balance History]
        L[Transfer Audit]
    end
    
    subgraph "Alert System"
        M[Critical Alerts]
        N[Warning Alerts]
        O[Info Notifications]
    end
    
    F --> B
    G --> D
    H --> D
    I --> A
    
    J --> C
    K --> B
    L --> D
    
    B --> M
    C --> N
    D --> O
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
```

## Authority Hierarchy

```mermaid
graph TD
    A[TigerBeetle<br/>Sole Clearing Authority] --> B[Attestors<br/>Legitimacy Gatekeepers]
    A --> C[Observers<br/>Narrative Mirrors]
    A --> D[Honoring Agents<br/>Optional External]
    
    B --> E[Credit Terminal<br/>Intent Processor]
    C --> F[Oracle Ledger<br/>Audit Trail]
    C --> G[FinSec Monitor<br/>System Health]
    D --> H[Instacart<br/>Grocery Fulfillment]
    D --> I[Stripe<br/>USD Settlement]
    D --> J[Utility Providers<br/>Service Payments]
    
    E --> K[Studio<br/>User Interface]
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#fce4ec
```

## Component Interaction Matrix

| Component | Role | Authority Level | Data Flow | Constraints |
|-----------|------|----------------|-----------|-------------|
| **TigerBeetle** | Mechanical Truth | Supreme | Input: Transfers<br>Output: Finality | No overrides<br>No edits |
| **Studio** | User Interface | None | Input: User intents<br>Output: Attestation requests | No business logic |
| **Hybrid Engine** | Credit Terminal | Policy | Input: Attested claims<br>Output: Transfer requests | Cannot create value |
| **Attestor** | Legitimacy Check | Pre-clearing | Input: Claims<br>Output: Attestation tokens | Cannot override clearing |
| **Event Bus** | Reality Propagation | None | Input: Clearing events<br>Output: Broadcasts | Read-only |
| **Oracle Ledger** | Narrative Mirror | None | Input: Event stream<br>Output: Audit trail | Never authoritative |
| **FinSec Monitor** | System Observer | None | Input: Oracle data<br>Output: Dashboards | Observer only |
| **Honoring Agents** | External Execution | None | Input: Cleared obligations<br>Output: Real-world action | Optional execution |

## Security and Compliance Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[Semantic Freeze<br/>Language Enforcement]
        B[Attestation Validation<br/>EIP-712 Signatures]
        C[Mechanical Finality<br/>TigerBeetle Truth]
        D[Read-Only Observation<br/>No Control Authority]
    end
    
    subgraph "Compliance Monitoring"
        E[No Custodial Risk Audit]
        F[No Central Control Verification]
        G[Attestation First Validation]
        H[Clearing Finality Proof]
    end
    
    subgraph "Risk Mitigation"
        I[Multiple Attestor Redundancy]
        J[Cluster Failover Protection]
        K[Event Stream Backup]
        L[Audit Trail Immutability]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    E --> I
    F --> J
    G --> K
    H --> L
    
    style A fill:#ffebee
    style B fill:#e8f5e8
    style C fill:#e3f2fd
    style D fill:#fff3e0
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[Load Balancer]
        B[Studio Cluster<br/>3 instances]
        C[Hybrid Engine Cluster<br/>5 instances]
        D[TigerBeetle Cluster<br/>5 nodes]
        E[Oracle Ledger<br/>Primary + Replica]
        F[FinSec Monitor<br/>1 instance]
    end
    
    subgraph "Database Layer"
        G[PostgreSQL Master]
        H[PostgreSQL Replica]
        I[Redis Cache]
        J[Event Store]
    end
    
    subgraph "External Integrations"
        K[Instacart API]
        L[Stripe API]
        M[Utility APIs]
        N[Attestation Services]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    E --> F
    
    B --> G
    C --> H
    F --> I
    D --> J
    
    C --> K
    C --> L
    C --> M
    B --> N
    
    style B fill:#e3f2fd
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style F fill:#f3e5f5
```

This comprehensive diagram set illustrates the complete SOVR ecosystem architecture, showing how each component interacts within the obligation clearing framework while maintaining mechanical truth and system integrity.
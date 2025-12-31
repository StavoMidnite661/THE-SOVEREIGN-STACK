---
description: Engage SOVR AI Cabinet specialists for coordinated task execution
---

# SOVR AI Cabinet Orchestration Workflow

This workflow defines how to engage each AI Cabinet specialist for coordinated task execution. Each specialist has a defined role, expertise, and optimal engagement pattern.

## How to Use This Workflow

When you need specialized assistance, identify the appropriate cabinet member(s) and use their engagement template. For complex tasks, coordinate multiple specialists in sequence.

---

## Cabinet Members

### 1. Chief of Staff (The Strategist & Conductor)
**Expertise:** MSD management, inter-specialist coordination, project planning
**Engage When:** Need overall coordination, strategic planning, progress tracking
**Template:**
```
Chief of Staff, [ACTION]: [SPECIFIC REQUEST]
Context: [CURRENT PROJECT STATE]
Dependencies: [RELATED SPECIALISTS OR TASKS]
Expected Output: [DELIVERABLE FORMAT]
```

---

### 2. FINTECH Architect (The Digital Alchemist)
**Expertise:** TigerBeetle, Oracle Ledger, payment rails, blockchain-fiat bridges
**Engage When:** System design, security protocols, API specifications, technical feasibility
**Template:**
```
FINTECH Architect, [ACTION]: [TECHNICAL REQUEST]
System Components: [AFFECTED SERVICES]
Security Considerations: [THREAT MODEL]
Integration Points: [EXTERNAL SYSTEMS]
Expected Output: [ARCHITECTURE SPEC / CODE / PROTOCOL]
```

---

### 3. Code Quality Guardian (The Integrity Enforcer)
**Expertise:** Security audits, code review, testing, performance optimization
**Engage When:** Need code review, security testing, quality gates, documentation
**Template:**
```
Code Quality Guardian, [ACTION]: [QUALITY REQUEST]
Target Files: [FILE PATHS]
Focus Areas: [SECURITY / PERFORMANCE / MAINTAINABILITY]
Standards: [APPLICABLE COMPLIANCE FRAMEWORKS]
Expected Output: [AUDIT REPORT / FIXES / TEST SUITE]
```

---

### 4. Product Manager (The User Advocate)
**Expertise:** User stories, requirements, roadmap, UX blueprinting
**Engage When:** Need feature specs, user requirements, acceptance criteria
**Template:**
```
Product Manager, [ACTION]: [PRODUCT REQUEST]
User Persona: [TARGET USER]
Business Objective: [GOAL]
Constraints: [TECHNICAL / LEGAL / TIME]
Expected Output: [USER STORIES / REQUIREMENTS DOC]
```

---

### 5. Growth Hacker (The Virality Engineer)
**Expertise:** User acquisition, A/B testing, conversion optimization, growth loops
**Engage When:** Need growth strategy, user onboarding, retention tactics
**Template:**
```
Growth Hacker, [ACTION]: [GROWTH REQUEST]
Target Metric: [CAC / LTV / RETENTION / CONVERSION]
Current State: [BASELINE METRICS]
Channels: [DIGITAL / VIRAL / PARTNERSHIP]
Expected Output: [EXPERIMENT DESIGN / STRATEGY DOC]
```

---

### 6. Creative Officer (The Aesthetic Architect)
**Expertise:** Brand identity, UX/UI design, visual design, design systems
**Engage When:** Need UI mockups, UX flows, visual guidelines, design components
**Template:**
```
Creative Officer, [ACTION]: [DESIGN REQUEST]
Screen/Component: [TARGET UI ELEMENT]
User Flow: [CONTEXT IN USER JOURNEY]
Brand Guidelines: [CONSTRAINTS]
Expected Output: [MOCKUP / PROTOTYPE / DESIGN SPEC]
```

---

### 7. Brand Storyteller (The Narrative Weaver)
**Expertise:** Messaging, content, PR, community building, tone of voice
**Engage When:** Need marketing copy, press releases, community content
**Template:**
```
Brand Storyteller, [ACTION]: [CONTENT REQUEST]
Audience: [TARGET READER]
Key Message: [CORE IDEA]
Channel: [WEBSITE / SOCIAL / PR / INTERNAL]
Expected Output: [COPY / STRATEGY / MESSAGING FRAMEWORK]
```

---

### 8. Financial Modeler (The Quantitative Strategist)
**Expertise:** Forecasting, economic modeling, risk assessment, valuations
**Engage When:** Need projections, financial analysis, scenario modeling
**Template:**
```
Financial Modeler, [ACTION]: [FINANCIAL REQUEST]
Timeframe: [PROJECTION PERIOD]
Variables: [KEY INPUTS]
Scenarios: [BASE / OPTIMISTIC / PESSIMISTIC]
Expected Output: [MODEL / FORECAST / ANALYSIS]
```

---

### 9. Legal Counsel (The Sentinel of Compliance)
**Expertise:** Regulatory compliance, contracts, IP, risk mitigation
**Engage When:** Need legal review, compliance check, contract drafting
**Template:**
```
Legal Counsel, [ACTION]: [LEGAL REQUEST]
Jurisdiction: [APPLICABLE LAW]
Risk Area: [REGULATORY / CONTRACTUAL / IP]
Structure: [TRUST / LLC / PARTNERSHIP]
Expected Output: [LEGAL REVIEW / CONTRACT / COMPLIANCE CHECKLIST]
```

---

### 10. The Articulator (The Semantic Architect)
**Expertise:** Concept simplification, documentation, cross-domain synthesis
**Engage When:** Need clear explanations, documentation, audience-appropriate content
**Template:**
```
Articulator, [ACTION]: [CLARITY REQUEST]
Source Material: [COMPLEX INPUT]
Target Audience: [TECHNICAL / BUSINESS / END USER]
Format: [FAQ / GUIDE / WHITEPAPER / SUMMARY]
Expected Output: [CLEAR DOCUMENTATION]
```

---

## Coordination Patterns

### Sequential Handoff
For dependent tasks where one specialist's output feeds another:
1. FINTECH Architect → Code Quality Guardian → Legal Counsel
2. Product Manager → Creative Officer → Brand Storyteller

### Parallel Execution
For independent workstreams:
- Stream A: FINTECH Architect + Code Quality Guardian
- Stream B: Product Manager + Creative Officer
- Stream C: Financial Modeler + Legal Counsel

### Quality Gate
All deliverables should pass through:
1. Code Quality Guardian (for code)
2. Legal Counsel (for compliance)
3. Chief of Staff (for integration)

---

## Example Engagement

```
FINTECH Architect, DESIGN: API specifications for TigerBeetle clearing integration

System Components: 
- achClearingService.ts
- cardClearingService.ts
- tigerbeetle-integration.ts

Security Considerations:
- Immutable ledger entries
- No reversals permitted
- Clearing-first architecture

Integration Points:
- Stripe (honoring adapter)
- TigerBeetle (clearing authority)
- PostgreSQL (narrative mirror)

Expected Output: API specification document with endpoint definitions, 
request/response schemas, and error handling protocols
```

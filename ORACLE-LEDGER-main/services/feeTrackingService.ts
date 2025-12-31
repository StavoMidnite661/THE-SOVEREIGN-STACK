/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ORACLE-LEDGER Stripe Fee Tracking Service
 * Comprehensive fee calculation and tracking for all clearing types
 * 
 * SOVEREIGN-CORRECT VERSION
 * Updated: 2025-12-17
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface FeeCalculationRequest {
  clearingType: 'ACH_INBOUND' | 'ACH_OUTBOUND' | 'CARD' | 'DIRECT_OBLIGATION';
  amountCents: number;
  customerType?: 'business' | 'consumer';
  volumeTier?: 'low' | 'medium' | 'high' | 'enterprise';
  riskLevel?: 'low' | 'medium' | 'high';
  clearingLocation?: 'domestic' | 'international';
  cardType?: 'debit' | 'credit' | 'prepaid';
  achClassCode?: string;
}

export interface FeeBreakdown {
  clearingFee: number;
  achFee: number;
  stripeFee: number;
  bankFee: number;
  verificationFee: number;
  payoutFee: number;
  totalFee: number;
  effectiveRate: number;
  breakdown: {
    baseRate: number;
    percentageRate: number;
    flatFees: number;
    caps: {
      achCap: number;
      maxFee: number;
    };
  };
  // Legacy alias
  processingFee?: number;
}

export interface FeeAllocation {
  clearingId: string;
  feeEntries: FeeEntry[];
  journalEntryId?: string;
  totalAllocated: number;
  createdAt: Date;
}

export interface FeeEntry {
  accountId: string;
  accountName: string;
  feeType: string;
  amount: number;
  description: string;
  source: string;
}

export interface MonthlyFeeReport {
  month: string;
  year: number;
  totalVolume: number;
  totalFees: number;
  feesByType: {
    achInbound: number;
    achOutbound: number;
    cardClearing: number;
    directObligation: number;
    verification: number;
  };
  feesByCategory: {
    clearing: number;
    bank: number;
    stripe: number;
    compliance: number;
  };
  optimizationMetrics: {
    costPerClearing: number;
    effectiveRate: number;
    volumeDiscounts: number;
    potentialSavings: number;
  };
}

export interface FeeOptimizationRecommendation {
  id: string;
  type: 'ACH_ROUTING' | 'VOLUME_DISCOUNT' | 'RATE_NEGOTIATION' | 'CLEARING_OPTIMIZATION';
  title: string;
  description: string;
  potentialSavings: number;
  implementationCost: number;
  roi: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  requirements: string[];
}

export interface FeeComplianceRecord {
  id: string;
  clearingId: string;
  feeType: string;
  amount: number;
  calculationMethod: string;
  regulatoryRequirement: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  auditTrail: {
    calculatedBy: string;
    calculatedAt: Date;
    validatedBy?: string;
    validatedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
  };
}

export interface FeeVarianceAlert {
  id: string;
  type: 'threshold_exceeded' | 'unusual_pattern' | 'compliance_risk' | 'cost_increase';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  expectedValue: number;
  variance: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface FeeDisputeRecord {
  id: string;
  feeClearingId: string;
  disputeType: 'duplicate_charge' | 'incorrect_calculation' | 'unauthorized_fee' | 'clearing_error';
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  amount: number;
  reason: string;
  evidence: string[];
  stripeDisputeId?: string;
  resolution?: {
    outcome: 'accepted' | 'rejected' | 'partial_credit' | 'credited';
    amount: number;
    creditDate?: Date;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class FeeTrackingService {
  private readonly ACH_FEE_CENTS = 80;
  private readonly ACH_FEE_CAP_CENTS = 500;
  private readonly STRIPE_CARD_RATE = 0.029;
  private readonly STRIPE_CARD_FIXED_FEE_CENTS = 30;
  private readonly DIRECT_OBLIGATION_BASE_FEE_CENTS = 100;
  private readonly VERIFICATION_FEE_CENTS = 50;
  private readonly BANK_VERIFICATION_FEE_CENTS = 200;

  private readonly ACCOUNT_MAPPINGS = {
    'ACH_FEE_EXPENSE': 6500,
    'CARD_CLEARING_FEE_EXPENSE': 6510,
    'STRIPE_FEE_EXPENSE': 6520,
    'BANK_FEE_EXPENSE': 6530,
    'PAYOUT_FEE_EXPENSE': 6540,
    'VERIFICATION_FEE_EXPENSE': 6550,
    'COMPLIANCE_FEE_EXPENSE': 6560,
    'FEE_ADJUSTMENT_INCOME': 4500,
  };

  /**
   * Calculate comprehensive fees for a clearing
   */
  calculateFees(request: FeeCalculationRequest): FeeBreakdown {
    let clearingFee = 0;
    let achFee = 0;
    let stripeFee = 0;
    let bankFee = 0;
    let verificationFee = 0;
    let payoutFee = 0;

    // Support legacy paymentType if passed
    const type = (request as any).paymentType || request.clearingType;
    
    switch (type) {
      case 'ACH_INBOUND':
      case 'ACH_DEBIT':
      case 'ACH':
        achFee = Math.min(this.ACH_FEE_CENTS, this.ACH_FEE_CAP_CENTS);
        
        if (request.volumeTier === 'high' || request.volumeTier === 'enterprise') {
          achFee = Math.round(achFee * 0.85);
        } else if (request.volumeTier === 'medium') {
          achFee = Math.round(achFee * 0.92);
        }
        
        if (request.riskLevel === 'high') {
          achFee = Math.round(achFee * 1.25);
        }
        
        clearingFee = achFee;
        bankFee = 25;
        break;

      case 'ACH_OUTBOUND':
      case 'ACH_CREDIT':
        achFee = Math.min(Math.round(this.ACH_FEE_CENTS * 0.6), this.ACH_FEE_CAP_CENTS);
        clearingFee = achFee;
        bankFee = 20;
        break;

      case 'CARD':
        stripeFee = Math.round(request.amountCents * this.STRIPE_CARD_RATE) + this.STRIPE_CARD_FIXED_FEE_CENTS;
        
        if (request.volumeTier === 'high' || request.volumeTier === 'enterprise') {
          stripeFee = Math.round(stripeFee * 0.90);
        } else if (request.volumeTier === 'medium') {
          stripeFee = Math.round(stripeFee * 0.95);
        }
        
        if (request.cardType === 'debit') {
          stripeFee = Math.round(stripeFee * 0.85);
        }
        
        if (request.riskLevel === 'high') {
          stripeFee = Math.round(stripeFee * 1.15);
        }
        
        clearingFee = stripeFee;
        bankFee = 10;
        break;

      case 'DIRECT_OBLIGATION':
      case 'DIRECT_DEPOSIT':
        payoutFee = this.DIRECT_OBLIGATION_BASE_FEE_CENTS;
        if (request.amountCents > 1000000) {
          payoutFee = Math.round(payoutFee * 1.5);
        }
        clearingFee = payoutFee;
        verificationFee = this.VERIFICATION_FEE_CENTS;
        bankFee = 75;
        break;
    }

    const totalFee = clearingFee + bankFee + verificationFee + payoutFee;
    const effectiveRate = (totalFee / request.amountCents) * 100;

    return {
      clearingFee,
      processingFee: clearingFee, // Legacy alias
      achFee,
      stripeFee,
      bankFee,
      verificationFee,
      payoutFee,
      totalFee,
      effectiveRate,
      breakdown: {
        baseRate: this.getBaseRate(request),
        percentageRate: this.getPercentageRate(request),
        flatFees: clearingFee,
        caps: {
          achCap: this.ACH_FEE_CAP_CENTS,
          maxFee: Math.round(request.amountCents * 0.05)
        }
      }
    };
  }

  /**
   * Create fee allocation entries for journal entries
   */
  createFeeAllocation(clearingId: string, feeBreakdown: FeeBreakdown, request: FeeCalculationRequest): FeeAllocation {
    const feeEntries: FeeEntry[] = [];

    if (feeBreakdown.achFee > 0) {
      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['ACH_FEE_EXPENSE'].toString(),
        accountName: 'ACH Fee Expense',
        feeType: 'ACH Clearing Fee',
        amount: feeBreakdown.achFee,
        description: 'ACH clearing fee',
        source: 'NACHA'
      });
    }

    if (feeBreakdown.stripeFee > 0) {
      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['CARD_CLEARING_FEE_EXPENSE'].toString(),
        accountName: 'Card Clearing Fee Expense',
        feeType: 'Card Clearing Fee',
        amount: feeBreakdown.stripeFee,
        description: 'Card clearing fee',
        source: 'Stripe'
      });

      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['STRIPE_FEE_EXPENSE'].toString(),
        accountName: 'Stripe Platform Fee Expense',
        feeType: 'Platform Fee',
        amount: Math.round(feeBreakdown.stripeFee * 0.3),
        description: 'Stripe platform and infrastructure fee',
        source: 'Stripe'
      });
    }

    if (feeBreakdown.bankFee > 0) {
      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['BANK_FEE_EXPENSE'].toString(),
        accountName: 'Bank Fee Expense',
        feeType: 'Banking Fee',
        amount: feeBreakdown.bankFee,
        description: 'Banking and clearing fees',
        source: 'Bank'
      });
    }

    if (feeBreakdown.payoutFee > 0) {
      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['PAYOUT_FEE_EXPENSE'].toString(),
        accountName: 'Payout Fee Expense',
        feeType: 'Payout Fee',
        amount: feeBreakdown.payoutFee,
        description: 'Direct obligation payout fee',
        source: 'Clearing'
      });
    }

    if (feeBreakdown.verificationFee > 0) {
      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['VERIFICATION_FEE_EXPENSE'].toString(),
        accountName: 'Verification Fee Expense',
        feeType: 'Verification Fee',
        amount: feeBreakdown.verificationFee,
        description: 'Account verification fee',
        source: 'Compliance'
      });
    }

    const volumeDiscount = this.calculateVolumeDiscount(request);
    if (volumeDiscount > 0) {
      feeEntries.push({
        accountId: this.ACCOUNT_MAPPINGS['FEE_ADJUSTMENT_INCOME'].toString(),
        accountName: 'Fee Adjustment Income',
        feeType: 'Volume Discount',
        amount: -volumeDiscount,
        description: 'Volume-based fee discount',
        source: 'Discount'
      });
    }

    return {
      clearingId,
      feeEntries,
      totalAllocated: feeEntries.reduce((sum, entry) => sum + entry.amount, 0),
      createdAt: new Date()
    };
  }

  /**
   * Generate monthly fee report
   */
  async generateMonthlyReport(month: number, year: number): Promise<MonthlyFeeReport> {
    const mockReport: MonthlyFeeReport = {
      month: month.toString(),
      year,
      totalVolume: 125000000,
      totalFees: 875000,
      feesByType: {
        achInbound: 450000,
        achOutbound: 125000,
        cardClearing: 225000,
        directObligation: 75000,
        verification: 0
      },
      feesByCategory: {
        clearing: 525000,
        bank: 175000,
        stripe: 140000,
        compliance: 35000
      },
      optimizationMetrics: {
        costPerClearing: 175,
        effectiveRate: 0.7,
        volumeDiscounts: 0,
        potentialSavings: 52500
      }
    };

    return mockReport;
  }

  /**
   * Generate fee optimization recommendations
   */
  generateOptimizationRecommendations(currentFees: MonthlyFeeReport): FeeOptimizationRecommendation[] {
    const recommendations: FeeOptimizationRecommendation[] = [];

    if (currentFees.feesByType.cardClearing > currentFees.feesByType.achInbound * 1.5) {
      recommendations.push({
        id: 'ach-routing-1',
        type: 'ACH_ROUTING',
        title: 'Optimize Clearing Method Routing',
        description: 'Route high-value clearings through ACH instead of cards to reduce fees',
        potentialSavings: Math.round(currentFees.feesByType.cardClearing * 0.4),
        implementationCost: 5000,
        roi: 8.5,
        priority: 'high',
        timeframe: '2-4 weeks',
        requirements: ['Customer consent for ACH routing', 'Updated forms', 'Clearing changes']
      });
    }

    if (currentFees.totalVolume > 100000000) {
      recommendations.push({
        id: 'volume-discount-1',
        type: 'VOLUME_DISCOUNT',
        title: 'Negotiate Volume-Based Discounts',
        description: 'Based on current volume ($1.25M/month), negotiate enterprise pricing tiers',
        potentialSavings: currentFees.optimizationMetrics.potentialSavings,
        implementationCost: 0,
        roi: Infinity,
        priority: 'critical',
        timeframe: '1-2 weeks',
        requirements: ['Contract renegotiation', 'Account manager engagement']
      });
    }

    if (currentFees.feesByType.directObligation > 100000) {
      recommendations.push({
        id: 'dd-optimization-1',
        type: 'CLEARING_OPTIMIZATION',
        title: 'Optimize Direct Obligation Clearing',
        description: 'Bundle direct obligations to reduce per-clearing fees',
        potentialSavings: Math.round(currentFees.feesByType.directObligation * 0.3),
        implementationCost: 2500,
        roi: 4.2,
        priority: 'medium',
        timeframe: '3-6 weeks',
        requirements: ['System updates', 'Employee notification', 'Schedule changes']
      });
    }

    return recommendations;
  }

  /**
   * Create compliance record for fee calculations
   */
  createComplianceRecord(
    clearingId: string,
    feeType: string,
    amount: number,
    calculationMethod: string,
    regulatoryRequirement: string
  ): FeeComplianceRecord {
    return {
      id: `compliance-${clearingId}-${Date.now()}`,
      clearingId,
      feeType,
      amount,
      calculationMethod,
      regulatoryRequirement,
      complianceStatus: 'compliant',
      auditTrail: {
        calculatedBy: 'system',
        calculatedAt: new Date(),
        validatedBy: undefined,
        validatedAt: undefined,
        approvedBy: undefined,
        approvedAt: undefined
      }
    };
  }

  /**
   * Track fee variance and alert on anomalies
   */
  checkFeeVariance(
    currentFees: FeeBreakdown,
    historicalAverages: { [key: string]: number },
    thresholds: { [key: string]: number }
  ): FeeVarianceAlert[] {
    const alerts: FeeVarianceAlert[] = [];

    if (currentFees.totalFee > (historicalAverages.totalFee || 0) * 1.2) {
      alerts.push({
        id: `variance-${Date.now()}`,
        type: 'unusual_pattern',
        severity: 'medium',
        message: 'Total fees 20% above historical average',
        currentValue: currentFees.totalFee,
        expectedValue: historicalAverages.totalFee || 0,
        variance: currentFees.totalFee - (historicalAverages.totalFee || 0),
        timestamp: new Date(),
        resolved: false
      });
    }

    if (currentFees.effectiveRate > (historicalAverages.effectiveRate || 0) * 1.15) {
      alerts.push({
        id: `variance-rate-${Date.now()}`,
        type: 'cost_increase',
        severity: 'high',
        message: 'Effective fee rate increased by more than 15%',
        currentValue: currentFees.effectiveRate,
        expectedValue: historicalAverages.effectiveRate || 0,
        variance: currentFees.effectiveRate - (historicalAverages.effectiveRate || 0),
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Create fee dispute record
   */
  createFeeDispute(
    feeClearingId: string,
    disputeType: FeeDisputeRecord['disputeType'],
    amount: number,
    reason: string,
    evidence: string[] = []
  ): FeeDisputeRecord {
    return {
      id: `dispute-${feeClearingId}-${Date.now()}`,
      feeClearingId,
      disputeType,
      status: 'open',
      amount,
      reason,
      evidence,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Validate fee calculations for compliance
   */
  validateFeeCalculation(feeBreakdown: FeeBreakdown, request: FeeCalculationRequest): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const type = (request as any).paymentType || request.clearingType;

    if ((type === 'ACH_INBOUND' || type === 'ACH_DEBIT' || type === 'ACH') && feeBreakdown.achFee > this.ACH_FEE_CAP_CENTS) {
      errors.push(`ACH fee exceeds cap of $${(this.ACH_FEE_CAP_CENTS / 100).toFixed(2)}`);
    }

    if (feeBreakdown.effectiveRate > 5) {
      warnings.push('Effective fee rate exceeds 5% - review for optimization opportunities');
    }

    if (feeBreakdown.effectiveRate < 0.1) {
      warnings.push('Effective fee rate below 0.1% - verify calculation accuracy');
    }

    const expectedTotal = feeBreakdown.clearingFee + feeBreakdown.bankFee + feeBreakdown.verificationFee + feeBreakdown.payoutFee;
    if (Math.abs(expectedTotal - feeBreakdown.totalFee) > 1) {
      errors.push('Fee components do not sum to total fee');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private getBaseRate(request: FeeCalculationRequest): number {
    const type = (request as any).paymentType || request.clearingType;
    switch (type) {
      case 'ACH_INBOUND':
      case 'ACH_OUTBOUND':
      case 'ACH_DEBIT':
      case 'ACH_CREDIT':
      case 'ACH':
        return this.ACH_FEE_CENTS;
      case 'CARD':
        return this.STRIPE_CARD_FIXED_FEE_CENTS;
      case 'DIRECT_OBLIGATION':
      case 'DIRECT_DEPOSIT':
        return this.DIRECT_OBLIGATION_BASE_FEE_CENTS;
      default:
        return 0;
    }
  }

  private getPercentageRate(request: FeeCalculationRequest): number {
    const type = (request as any).paymentType || request.clearingType;
    switch (type) {
      case 'CARD':
        return this.STRIPE_CARD_RATE;
      default:
        return 0;
    }
  }

  private calculateVolumeDiscount(request: FeeCalculationRequest): number {
    let discount = 0;
    
    switch (request.volumeTier) {
      case 'enterprise':
        discount = 0.15;
        break;
      case 'high':
        discount = 0.10;
        break;
      case 'medium':
        discount = 0.05;
        break;
      default:
        discount = 0;
    }

    return Math.round(discount * request.amountCents * 0.01);
  }

  exportFeeData(startDate: Date, endDate: Date, format: 'csv' | 'json' | 'pdf'): string {
    const data = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      clearings: [],
      summary: {},
      generatedAt: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return 'Clearing ID,Date,Type,Amount,Fee Amount,Effective Rate\n';
      case 'pdf':
        return 'PDF export would be generated here';
      default:
        return JSON.stringify(data);
    }
  }
}

export const feeTrackingService = new FeeTrackingService();
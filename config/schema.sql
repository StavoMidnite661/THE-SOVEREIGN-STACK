-- ⚠️ CANON NOTICE - AUTHORITY LEVEL: ZERO
--
-- This schema is NOT authoritative.
-- PostgreSQL is not currently wired into the SOVR execution path.
-- This file exists only as a placeholder for future narrative persistence.
-- Do not modify without binding to NarrativeMirrorService.
--
-- CURRENT EXECUTION PATH:
-- 1. TigerBeetle = SOLE MECHANICAL TRUTH (clearing authority)
-- 2. NarrativeMirrorService = In-memory observation (TypeScript)
-- 3. PostgreSQL = Dormant infrastructure (not yet bound)
--
-- SCHEMA STATUS: OBSERVER-ONLY PLACEHOLDER
-- Do not treat as active ledger schema.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE LEDGER TABLES
-- =============================================================================

-- Chart of accounts (mirrors Oracle Ledger constants.ts)
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Asset', 'Liability', 'Equity', 'Income', 'Expense')),
    entity VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert core accounts from Oracle Ledger
INSERT INTO accounts (id, name, type, entity) VALUES
-- Assets
(1000, 'Cash-ODFI-LLC', 'Asset', 'SOVR Development Holdings LLC'),
(1010, 'Cash-Vault-USDC', 'Asset', 'Trust'),
(1050, 'ACH-Settlement-Account', 'Asset', 'LLC'),
(1060, 'Stripe-Clearing-Account', 'Asset', 'LLC'),
(1200, 'Intercompany-Receivable-Trust', 'Asset', 'Trust'),
(1300, 'AR', 'Asset', 'LLC'),

-- Liabilities  
(2100, 'ACH-Clearing-LLC', 'Liability', 'LLC'),
(2180, 'Direct-Deposit-Liabilities', 'Liability', 'LLC'),
(2200, 'Intercompany-Payable', 'Liability', 'LLC'),
(2300, 'AP', 'Liability', 'LLC'),
(2400, 'Payroll-Liability', 'Liability', 'LLC'),

-- Anchor-specific liabilities
(2500, 'ANCHOR_GROCERY_OBLIGATION', 'Liability', 'LLC'),
(2501, 'ANCHOR_UTILITY_OBLIGATION', 'Liability', 'LLC'),
(2502, 'ANCHOR_FUEL_OBLIGATION', 'Liability', 'LLC'),
(2503, 'ANCHOR_MOBILE_OBLIGATION', 'Liability', 'LLC'),
(2504, 'ANCHOR_HOUSING_OBLIGATION', 'Liability', 'LLC'),
(2505, 'ANCHOR_MEDICAL_OBLIGATION', 'Liability', 'LLC'),

-- Equity
(3000, 'LLC-Equity', 'Equity', 'LLC'),
(3100, 'Trust-Capital', 'Equity', 'Trust'),

-- Income
(4000, 'Token-Realization-Gain/Loss', 'Income', 'LLC'),

-- Expenses
(6000, 'Payroll-Expense', 'Expense', 'LLC'),
(6100, 'Ops-Expense', 'Expense', 'LLC'),
(6150, 'ACH-Processing-Fees', 'Expense', 'LLC'),
(6160, 'Stripe-Processing-Fees', 'Expense', 'LLC'),
(6170, 'Bank-Charges', 'Expense', 'LLC'),
(6180, 'Payment-Card-Fees', 'Expense', 'LLC'),
(6200, 'Purchase-Expense', 'Expense', 'LLC'),
(6300, 'ANCHOR_FULFILLMENT_EXPENSE', 'Expense', 'LLC');

-- Journal entries (main ledger table)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('CHAIN', 'NACHA', 'PO', 'AR', 'AP', 'PURCHASE', 'PAYROLL', 'INTERCOMPANY', 'PAYMENT', 'ANCHOR', 'ATTESTATION')),
    status VARCHAR(20) NOT NULL DEFAULT 'Posted' CHECK (status IN ('Posted', 'Pending')),
    
    -- Blockchain references
    tx_hash VARCHAR(66),
    block_number BIGINT,
    chain_confirmations INTEGER DEFAULT 0,
    
    -- Credit Terminal references  
    event_id VARCHAR(100),
    attestation_hash VARCHAR(66),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    -- Constraints
    CONSTRAINT chk_description_not_empty CHECK (length(trim(description)) > 0),
    CONSTRAINT chk_date_not_future CHECK (date <= CURRENT_DATE)
);

-- Journal entry lines (double-entry accounting)
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    line_type VARCHAR(10) NOT NULL CHECK (line_type IN ('DEBIT', 'CREDIT')),
    amount DECIMAL(19,4) NOT NULL CHECK (amount >= 0),
    description TEXT,
    line_number INTEGER NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_line_number_positive CHECK (line_number > 0)
);

-- Account balances (materialized view for performance)
CREATE TABLE account_balances (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id),
    current_balance DECIMAL(19,4) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_balance_not_negative CHECK (current_balance >= 0)
);

-- =============================================================================
-- ANCHOR SYSTEM TABLES
-- =============================================================================

-- Anchor authorizations (spend permissions)
CREATE TABLE anchor_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    anchor_type VARCHAR(20) NOT NULL CHECK (anchor_type IN ('GROCERY', 'UTILITY', 'FUEL', 'MOBILE', 'HOUSING', 'MEDICAL')),
    units BIGINT NOT NULL CHECK (units > 0),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    
    -- Authorization lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'AUTHORIZED' CHECK (status IN ('AUTHORIZED', 'FULFILLED', 'EXPIRED', 'FAILED')),
    authorized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    -- Attestation
    attestation_signature VARCHAR(132),
    attestation_hash VARCHAR(66),
    
    -- Fulfillment tracking
    fulfillment_proof_hash VARCHAR(66),
    provider_order_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anchor fulfillments (completed transactions)
CREATE TABLE anchor_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authorization_id UUID NOT NULL REFERENCES anchor_authorizations(id),
    event_id VARCHAR(100) NOT NULL,
    proof_hash VARCHAR(66) NOT NULL,
    fulfillment_type VARCHAR(20) NOT NULL CHECK (fulfillment_type IN ('GIFT_CARD', 'DIRECT_CREDIT', 'PAYMENT')),
    provider_order_id VARCHAR(255),
    fulfilled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id),
    UNIQUE(proof_hash)
);

-- Anchor obligations (outstanding commitments)
CREATE TABLE anchor_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anchor_type VARCHAR(20) NOT NULL,
    obligation_account_id INTEGER NOT NULL REFERENCES accounts(id),
    total_authorized BIGINT NOT NULL DEFAULT 0,
    total_fulfilled BIGINT NOT NULL DEFAULT 0,
    total_expired BIGINT NOT NULL DEFAULT 0,
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_no_negative_obligations CHECK (total_fulfilled + total_expired <= total_authorized),
    UNIQUE(anchor_type)
);

-- Insert anchor obligations records
INSERT INTO anchor_obligations (anchor_type, obligation_account_id) VALUES
('GROCERY', 2500),
('UTILITY', 2501),
('FUEL', 2502),
('MOBILE', 2503),
('HOUSING', 2504),
('MEDICAL', 2505);

-- =============================================================================
-- SYSTEM TABLES
-- =============================================================================

-- Event correlation (track events across systems)
CREATE TABLE event_correlations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    source_system VARCHAR(50) NOT NULL,
    correlation_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_correlations_event_id (event_id),
    INDEX idx_event_correlations_source (source_system, created_at)
);

-- Audit log (immutable system events)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System health checks
CREATE TABLE health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY')),
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_health_checks_service_time (service_name, checked_at)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Journal entries indexes
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entries_source ON journal_entries(source);
CREATE INDEX idx_journal_entries_event_id ON journal_entries(event_id);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);

-- Journal entry lines indexes
CREATE INDEX idx_journal_entry_lines_journal_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX idx_journal_entry_lines_type ON journal_entry_lines(line_type);

-- Anchor authorization indexes
CREATE INDEX idx_anchor_authorizations_user ON anchor_authorizations(user_address);
CREATE INDEX idx_anchor_authorizations_anchor_type ON anchor_authorizations(anchor_type);
CREATE INDEX idx_anchor_authorizations_status ON anchor_authorizations(status);
CREATE INDEX idx_anchor_authorizations_expires_at ON anchor_authorizations(expires_at);
CREATE INDEX idx_anchor_authorizations_created_at ON anchor_authorizations(created_at);

-- Audit log indexes
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- =============================================================================
-- TRIGGERS FOR AUTOMATION
-- =============================================================================

-- Function to update account balances
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO account_balances (account_id, current_balance, last_updated)
        VALUES (NEW.account_id, 
                CASE 
                    WHEN NEW.line_type = 'DEBIT' THEN NEW.amount 
                    ELSE -NEW.amount 
                END,
                CURRENT_TIMESTAMP)
        ON CONFLICT (account_id) 
        DO UPDATE SET 
            current_balance = account_balances.current_balance + 
                CASE 
                    WHEN NEW.line_type = 'DEBIT' THEN NEW.amount 
                    ELSE -NEW.amount 
                END,
            last_updated = CURRENT_TIMESTAMP;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update balances on journal line insert
CREATE TRIGGER trigger_update_balance
    AFTER INSERT ON journal_entry_lines
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance();

-- Function to update anchor obligations
CREATE OR REPLACE FUNCTION update_anchor_obligations()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'FULFILLED' THEN
        UPDATE anchor_obligations 
        SET total_fulfilled = total_fulfilled + NEW.units,
            last_updated = CURRENT_TIMESTAMP
        WHERE anchor_type = NEW.anchor_type;
    ELSIF TG_OP = 'INSERT' AND NEW.status = 'EXPIRED' THEN
        UPDATE anchor_obligations 
        SET total_expired = total_expired + NEW.units,
            last_updated = CURRENT_TIMESTAMP
        WHERE anchor_type = NEW.anchor_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update obligations on status change
CREATE TRIGGER trigger_update_obligations
    AFTER UPDATE ON anchor_authorizations
    FOR EACH ROW
    EXECUTE FUNCTION update_anchor_obligations();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trigger_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_anchor_authorizations_updated_at
    BEFORE UPDATE ON anchor_authorizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_account_balances_updated_at
    BEFORE UPDATE ON account_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

-- Current account balances view
CREATE VIEW v_account_balances AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.entity,
    COALESCE(ab.current_balance, 0) as current_balance,
    ab.last_updated
FROM accounts a
LEFT JOIN account_balances ab ON a.id = ab.account_id
WHERE a.is_active = true;

-- Anchor obligation summary view
CREATE VIEW v_anchor_obligations AS
SELECT 
    ao.anchor_type,
    a.name as obligation_account_name,
    ao.total_authorized,
    ao.total_fulfilled,
    ao.total_expired,
    (ao.total_authorized - ao.total_fulfilled - ao.total_expired) as outstanding_obligation,
    ao.last_updated
FROM anchor_obligations ao
JOIN accounts a ON ao.obligation_account_id = a.id;

-- Journal entries with lines view
CREATE VIEW v_journal_entries_detailed AS
SELECT 
    je.id,
    je.journal_id,
    je.date,
    je.description,
    je.source,
    je.status,
    je.tx_hash,
    je.event_id,
    jel.line_number,
    a.name as account_name,
    a.type as account_type,
    jel.line_type,
    jel.amount,
    jel.description as line_description
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts a ON jel.account_id = a.id
ORDER BY je.date DESC, je.created_at, jel.line_number;

-- =============================================================================
-- CONSTRAINTS AND CHECKS
-- =============================================================================

-- Ensure journal entries always balance (total debits = total credits)
CREATE OR REPLACE FUNCTION validate_journal_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
    total_debits DECIMAL(19,4);
    total_credits DECIMAL(19,4);
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT COALESCE(SUM(amount), 0) INTO total_debits
        FROM journal_entry_lines 
        WHERE journal_entry_id = NEW.journal_entry_id AND line_type = 'DEBIT';
        
        SELECT COALESCE(SUM(amount), 0) INTO total_credits
        FROM journal_entry_lines 
        WHERE journal_entry_id = NEW.journal_entry_id AND line_type = 'CREDIT';
        
        IF total_debits != total_credits THEN
            RAISE EXCEPTION 'Journal entry % does not balance: Debits=%, Credits=%', 
                NEW.journal_entry_id, total_debits, total_credits;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate balance on journal line insert
CREATE TRIGGER trigger_validate_balance
    AFTER INSERT ON journal_entry_lines
    FOR EACH ROW
    EXECUTE FUNCTION validate_journal_entry_balance();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Initialize account balances to zero
INSERT INTO account_balances (account_id)
SELECT id FROM accounts 
ON CONFLICT (account_id) DO NOTHING;

-- =============================================================================
-- PERMISSIONS (for production)
-- =============================================================================

-- Grant permissions (adjust for your user/role setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO sovr_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sovr_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO sovr_app;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE accounts IS 'Chart of accounts - mirrors Oracle Ledger constants.ts';
COMMENT ON TABLE journal_entries IS 'Main journal entries table - immutable once posted';
COMMENT ON TABLE journal_entry_lines IS 'Double-entry accounting lines - enforces debits = credits';
COMMENT ON TABLE anchor_authorizations IS 'User spend authorizations for anchor fulfillment';
COMMENT ON TABLE anchor_fulfillments IS 'Completed anchor fulfillments';
COMMENT ON TABLE anchor_obligations IS 'Outstanding anchor commitments by type';
COMMENT ON TABLE event_correlations IS 'Cross-system event tracking for audit trail';
COMMENT ON TABLE audit_log IS 'Immutable audit log for compliance and forensics';
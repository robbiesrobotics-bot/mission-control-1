-- Org Dashboard Schema (PostgreSQL)
-- Multi-company management layer on top of Mission Control

BEGIN;

-- ============================================================================
-- org.companies
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.companies (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    owners          TEXT NOT NULL DEFAULT '[]',
    stripe_account_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_companies_slug ON org.companies(slug);
CREATE INDEX IF NOT EXISTS idx_org_companies_stripe ON org.companies(stripe_account_id);

-- ============================================================================
-- org.projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.projects (
    id                BIGSERIAL PRIMARY KEY,
    company_id        BIGINT NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    description       TEXT,
    status            TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    stripe_product_id TEXT,
    github_repo       TEXT,
    live_url          TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_projects_company ON org.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_org_projects_status ON org.projects(status);
CREATE INDEX IF NOT EXISTS idx_org_projects_stripe ON org.projects(stripe_product_id);

-- ============================================================================
-- org.contacts (must exist before deals due to FK)
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.contacts (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    role            TEXT,
    is_partner      INTEGER NOT NULL DEFAULT 0,
    is_team_member  INTEGER NOT NULL DEFAULT 0,
    company_name    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_contacts_company ON org.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_email ON org.contacts(email);
CREATE INDEX IF NOT EXISTS idx_org_contacts_partner ON org.contacts(is_partner);

-- ============================================================================
-- org.deals
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.deals (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    project_id          BIGINT REFERENCES org.projects(id) ON DELETE SET NULL,
    name                TEXT NOT NULL,
    value               NUMERIC NOT NULL DEFAULT 0,
    stage               TEXT NOT NULL DEFAULT 'prospecting'
                                    CHECK (stage IN (
                                        'prospecting', 'qualification', 'proposal',
                                        'negotiation', 'closed_won', 'closed_lost'
                                    )),
    expected_close_date DATE,
    owner_contact_id    BIGINT REFERENCES org.contacts(id) ON DELETE SET NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_deals_company ON org.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_org_deals_stage ON org.deals(stage);
CREATE INDEX IF NOT EXISTS idx_org_deals_project ON org.deals(project_id);

-- ============================================================================
-- org.invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.invoices (
    id                BIGSERIAL PRIMARY KEY,
    company_id        BIGINT NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    deal_id           BIGINT REFERENCES org.deals(id) ON DELETE SET NULL,
    amount            NUMERIC NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    due_date          DATE,
    paid_date         DATE,
    stripe_invoice_id TEXT UNIQUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_invoices_company ON org.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_org_invoices_status ON org.invoices(status);
CREATE INDEX IF NOT EXISTS idx_org_invoices_stripe ON org.invoices(stripe_invoice_id);

-- ============================================================================
-- org.expenses
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.expenses (
    id          BIGSERIAL PRIMARY KEY,
    company_id  BIGINT NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    project_id  BIGINT REFERENCES org.projects(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount      NUMERIC NOT NULL,
    category    TEXT NOT NULL DEFAULT 'general'
                            CHECK (category IN (
                                'general', 'infrastructure', 'contractor',
                                'software', 'marketing', 'legal', 'travel', 'other'
                            )),
    vendor      TEXT,
    date        DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_expenses_company ON org.expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_org_expenses_project ON org.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_org_expenses_category ON org.expenses(category);
CREATE INDEX IF NOT EXISTS idx_org_expenses_date ON org.expenses(date);

-- ============================================================================
-- org.stripe_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.stripe_events (
    id              BIGSERIAL PRIMARY KEY,
    stripe_event_id TEXT NOT NULL UNIQUE,
    company_id      BIGINT REFERENCES org.companies(id) ON DELETE SET NULL,
    project_id      BIGINT REFERENCES org.projects(id) ON DELETE SET NULL,
    amount          NUMERIC,
    type            TEXT NOT NULL,
    processed       INTEGER NOT NULL DEFAULT 0,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_stripe_events_stripe_id ON org.stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_org_stripe_events_company ON org.stripe_events(company_id);
CREATE INDEX IF NOT EXISTS idx_org_stripe_events_processed ON org.stripe_events(processed);

-- ============================================================================
-- org.user_company_access
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.user_company_access (
    user_id       TEXT NOT NULL,
    company_id    BIGINT NOT NULL REFERENCES org.companies(id) ON DELETE CASCADE,
    access_level  TEXT NOT NULL DEFAULT 'member'
                                CHECK (access_level IN ('owner', 'admin', 'member', 'viewer')),
    ownership_pct NUMERIC NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_org_uca_user ON org.user_company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_org_uca_company ON org.user_company_access(company_id);
CREATE INDEX IF NOT EXISTS idx_org_uca_access ON org.user_company_access(access_level);

-- ============================================================================
-- org.audit_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS org.audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT,
    action      TEXT NOT NULL,
    resource    TEXT NOT NULL,
    resource_id BIGINT,
    company_id  BIGINT REFERENCES org.companies(id) ON DELETE SET NULL,
    metadata    TEXT NOT NULL DEFAULT '{}',
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_audit_user ON org.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_org_audit_company ON org.audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_org_audit_action ON org.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_org_audit_created ON org.audit_log(created_at);

COMMIT;

-- ============================================================================
-- Functions + Triggers (run after table creation)
-- ============================================================================

CREATE OR REPLACE FUNCTION org.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org.companies_updated_at
    BEFORE UPDATE ON org.companies
    FOR EACH ROW EXECUTE FUNCTION org.set_updated_at();

CREATE TRIGGER org.projects_updated_at
    BEFORE UPDATE ON org.projects
    FOR EACH ROW EXECUTE FUNCTION org.set_updated_at();

CREATE TRIGGER org.deals_updated_at
    BEFORE UPDATE ON org.deals
    FOR EACH ROW EXECUTE FUNCTION org.set_updated_at();

CREATE TRIGGER org.contacts_updated_at
    BEFORE UPDATE ON org.contacts
    FOR EACH ROW EXECUTE FUNCTION org.set_updated_at();

CREATE TRIGGER org.invoices_updated_at
    BEFORE UPDATE ON org.invoices
    FOR EACH ROW EXECUTE FUNCTION org.set_updated_at();

CREATE TRIGGER org.expenses_updated_at
    BEFORE UPDATE ON org.expenses
    FOR EACH ROW EXECUTE FUNCTION org.set_updated_at();

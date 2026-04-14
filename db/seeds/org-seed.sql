-- db/seeds/org-seed.sql
-- Seed data for all 6 companies

BEGIN;

-- ============================================================================
-- Companies
-- ============================================================================

INSERT INTO org.companies (name, slug, owners, stripe_account_id) VALUES
(
  'Robbies Robotics',
  'robbies-robotics',
  '[{"user_id": "user_rob", "name": "Rob", "ownership_pct": 100}]',
  NULL
),
(
  'Calcifire Consulting',
  'calcifire-consulting',
  '[{"user_id": "user_rob", "name": "Rob", "ownership_pct": 50}, {"user_id": "user_alex_caruso", "name": "Alex Caruso", "ownership_pct": 50}]',
  NULL
),
(
  'LivingAssistedApp',
  'livingassistedapp',
  '[{"user_id": "user_rob", "name": "Rob", "ownership_pct": 50}, {"user_id": "user_keisha_gist", "name": "Keisha Gist", "ownership_pct": 50}]',
  NULL
),
(
  'MixMasterRob Inc',
  'mixmasterrob-inc',
  '[{"user_id": "user_rob", "name": "Rob", "ownership_pct": 100}]',
  NULL
),
(
  'Sanchez Family Ventures',
  'sanchez-family-ventures',
  '[{"user_id": "user_rob", "name": "Rob", "ownership_pct": 25}, {"user_id": "user_sloane", "name": "Sloane", "ownership_pct": 25}, {"user_id": "user_sierra", "name": "Sierra", "ownership_pct": 25}, {"user_id": "user_leanna", "name": "Leanna", "ownership_pct": 25}]',
  NULL
),
(
  'A.L.I.C.E. Dev Shop',
  'alice-dev-shop',
  '[{"user_id": "user_rob", "name": "Rob", "ownership_pct": 100}]',
  NULL
);

-- ============================================================================
-- User Company Access
-- Rob is the common thread across all companies
-- ============================================================================

-- Robbies Robotics
INSERT INTO org.user_company_access (user_id, company_id, access_level, ownership_pct) VALUES
  ('user_rob', 1, 'owner', 100);

-- Calcifire Consulting
INSERT INTO org.user_company_access (user_id, company_id, access_level, ownership_pct) VALUES
  ('user_rob', 2, 'admin', 50),
  ('user_alex_caruso', 2, 'admin', 50);

-- LivingAssistedApp
INSERT INTO org.user_company_access (user_id, company_id, access_level, ownership_pct) VALUES
  ('user_rob', 3, 'admin', 50),
  ('user_keisha_gist', 3, 'admin', 50);

-- MixMasterRob Inc
INSERT INTO org.user_company_access (user_id, company_id, access_level, ownership_pct) VALUES
  ('user_rob', 4, 'owner', 100);

-- Sanchez Family Ventures
INSERT INTO org.user_company_access (user_id, company_id, access_level, ownership_pct) VALUES
  ('user_rob', 5, 'admin', 25),
  ('user_sloane', 5, 'member', 25),
  ('user_sierra', 5, 'member', 25),
  ('user_leanna', 5, 'member', 25);

-- A.L.I.C.E. Dev Shop
INSERT INTO org.user_company_access (user_id, company_id, access_level, ownership_pct) VALUES
  ('user_rob', 6, 'owner', 100);

-- ============================================================================
-- Sample Projects (one per company as examples)
-- ============================================================================

INSERT INTO org.projects (company_id, name, description, status) VALUES
  (1, 'Robbie OS', 'Custom robotics operating system for autonomous agents', 'active'),
  (2, 'Q4 Tax Workflow', 'Automated tax calculation workflow for mid-market clients', 'active'),
  (3, 'Caregiver App v2', 'Mobile app for in-home caregiver scheduling and notes', 'active'),
  (4, 'MixMaster Pro', 'Professional DJ mixing software suite', 'active'),
  (5, 'Portfolio Website', 'Family business portfolio and investment tracker', 'active'),
  (6, 'Agent SDK', 'Internal SDK for building A.L.I.C.E. agents', 'active');

-- ============================================================================
-- Sample Contacts
-- ============================================================================

INSERT INTO org.contacts (company_id, name, email, phone, role, is_partner, is_team_member, company_name) VALUES
  -- Robbies Robotics
  (1, 'Rob', 'rob@robbiesrobotics.com', NULL, 'Founder', 0, 1, 'Robbies Robotics'),
  -- Calcifire Consulting
  (2, 'Rob', 'rob@robbiesrobotics.com', NULL, 'Co-founder', 0, 1, 'Calcifire Consulting'),
  (2, 'Alex Caruso', 'alex@calcifire.com', NULL, 'Co-founder', 0, 1, 'Calcifire Consulting'),
  -- LivingAssistedApp
  (3, 'Rob', 'rob@robbiesrobotics.com', NULL, 'Co-founder', 0, 1, 'LivingAssistedApp'),
  (3, 'Keisha Gist', 'keisha@livingassisted.com', NULL, 'Co-founder', 0, 1, 'LivingAssistedApp'),
  -- MixMasterRob Inc
  (4, 'Rob', 'rob@mixmasterrob.com', NULL, 'Founder', 0, 1, 'MixMasterRob Inc'),
  -- Sanchez Family Ventures
  (5, 'Rob', 'rob@robbiesrobotics.com', NULL, 'Partner', 0, 1, 'Sanchez Family Ventures'),
  (5, 'Sloane', 'sloane@sanchezfamily.com', NULL, 'Partner', 1, 0, 'Sanchez Family Ventures'),
  (5, 'Sierra', 'sierra@sanchezfamily.com', NULL, 'Partner', 1, 0, 'Sanchez Family Ventures'),
  (5, 'Leanna', 'leanna@sanchezfamily.com', NULL, 'Partner', 1, 0, 'Sanchez Family Ventures'),
  -- A.L.I.C.E. Dev Shop
  (6, 'Rob', 'rob@robbiesrobotics.com', NULL, 'Founder', 0, 1, 'A.L.I.C.E. Dev Shop');

-- ============================================================================
-- Sample Deals (one per company)
-- ============================================================================

INSERT INTO org.deals (company_id, project_id, name, value, stage, expected_close_date, owner_contact_id) VALUES
  (1, 1, 'Robbie OS Enterprise License', 50000, 'negotiation', '2026-06-30', 1),
  (2, 2, 'Q4 Tax Workflow SaaS Subscription', 24000, 'proposal', '2026-05-15', 3),
  (3, 3, 'LivingAssisted Enterprise Rollout', 75000, 'qualification', '2026-07-01', 5),
  (4, 4, 'MixMaster Pro Annual License', 12000, 'closed_won', '2026-03-31', 6),
  (5, 5, 'SFV Website Redesign', 8000, 'proposal', '2026-05-30', 7),
  (6, 6, 'Agent SDK Enterprise Seat', 36000, 'negotiation', '2026-06-15', 11);

-- ============================================================================
-- Sample Invoices
-- ============================================================================

INSERT INTO org.invoices (company_id, deal_id, amount, status, due_date, paid_date) VALUES
  (1, 1, 50000, 'pending', '2026-06-30', NULL),
  (4, 4, 12000, 'paid', '2026-04-15', '2026-04-10'),
  (6, 6, 18000, 'pending', '2026-06-01', NULL);

-- ============================================================================
-- Sample Expenses
-- ============================================================================

INSERT INTO org.expenses (company_id, project_id, description, amount, category, vendor, date) VALUES
  (1, 1, 'AWS hosting — Robbie OS dev environment', 849.99, 'infrastructure', 'Amazon Web Services', '2026-04-01'),
  (1, 1, 'Contract developer — sensor integration', 5000.00, 'contractor', 'Toptal', '2026-04-07'),
  (2, 2, 'Tax API license — Pro plan', 299.00, 'software', 'Avalara', '2026-03-15'),
  (3, 3, 'Figma enterprise seat', 45.00, 'software', 'Figma', '2026-04-01'),
  (6, 6, 'OpenAI API credits', 500.00, 'infrastructure', 'OpenAI', '2026-04-05'),
  (6, 6, 'GitHub Copilot seat', 19.00, 'software', 'GitHub', '2026-04-01');

COMMIT;

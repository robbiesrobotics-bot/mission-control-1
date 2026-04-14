/**
 * lib/org/db.ts
 * Database access layer for the org schema.
 * Uses Mission Control's existing better-sqlite3 instance.
 */

import type Database from 'better-sqlite3'
import { getDb } from '@/lib/db'  // MC's existing DB accessor

// Re-export the MC db instance; org tables live in the same DB file (org.* prefix)
export function getOrgDb(): Database.Database {
  return getDb()
}

// ─── Companies ───────────────────────────────────────────────────────────────

export function getCompanies() {
  const db = getOrgDb()
  return db.prepare("SELECT * FROM org.companies ORDER BY name").all()
}

export function getCompanyBySlug(slug: string) {
  const db = getOrgDb()
  return db.prepare("SELECT * FROM org.companies WHERE slug = ?").get(slug)
}

export function getCompanyById(id: number) {
  const db = getOrgDb()
  return db.prepare("SELECT * FROM org.companies WHERE id = ?").get(id)
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function getProjectsByCompany(companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT * FROM org.projects WHERE company_id = ? ORDER BY created_at DESC"
  ).all(companyId)
}

export function getProjectById(id: number) {
  const db = getOrgDb()
  return db.prepare("SELECT * FROM org.projects WHERE id = ?").get(id)
}

// ─── Deals ───────────────────────────────────────────────────────────────────

export function getDealsByCompany(companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT d.*, p.name as project_name FROM org.deals d LEFT JOIN org.projects p ON d.project_id = p.id WHERE d.company_id = ? ORDER BY d.created_at DESC"
  ).all(companyId)
}

export function getDealById(id: number) {
  const db = getOrgDb()
  return db.prepare("SELECT * FROM org.deals WHERE id = ?").get(id)
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export function getContactsByCompany(companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT * FROM org.contacts WHERE company_id = ? ORDER BY name"
  ).all(companyId)
}

export function getPartnersByCompany(companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT * FROM org.contacts WHERE company_id = ? AND is_partner = 1 ORDER BY name"
  ).all(companyId)
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function getInvoicesByCompany(companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT * FROM org.invoices WHERE company_id = ? ORDER BY created_at DESC"
  ).all(companyId)
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export function getExpensesByCompany(companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT e.*, p.name as project_name FROM org.expenses e LEFT JOIN org.projects p ON e.project_id = p.id WHERE e.company_id = ? ORDER BY e.date DESC"
  ).all(companyId)
}

// ─── User Access ─────────────────────────────────────────────────────────────

export function getUserAccess(userId: string) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT uca.*, c.name as company_name, c.slug FROM org.user_company_access uca JOIN org.companies c ON uca.company_id = c.id WHERE uca.user_id = ?"
  ).all(userId)
}

export function getUserAccessForCompany(userId: string, companyId: number) {
  const db = getOrgDb()
  return db.prepare(
    "SELECT * FROM org.user_company_access WHERE user_id = ? AND company_id = ?"
  ).get(userId, companyId)
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

export function logOrgAudit(params: {
  userId?: string
  action: string
  resource: string
  resourceId?: number
  companyId?: number
  metadata?: Record<string, unknown>
  ipAddress?: string
}) {
  const db = getOrgDb()
  db.prepare(`
    INSERT INTO org.audit_log (user_id, action, resource, resource_id, company_id, metadata, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.userId || null,
    params.action,
    params.resource,
    params.resourceId || null,
    params.companyId || null,
    JSON.stringify(params.metadata || {}),
    params.ipAddress || null
  )
}

// ─── Stripe Events ───────────────────────────────────────────────────────────

export function upsertStripeEvent(params: {
  stripeEventId: string
  companyId?: number
  projectId?: number
  amount?: number
  type: string
}) {
  const db = getOrgDb()
  db.prepare(`
    INSERT INTO org.stripe_events (stripe_event_id, company_id, project_id, amount, type, processed)
    VALUES (?, ?, ?, ?, ?, 0)
    ON CONFLICT(stripe_event_id) DO UPDATE SET
      company_id = excluded.company_id,
      project_id = excluded.project_id,
      amount = excluded.amount,
      type = excluded.type
  `).run(params.stripeEventId, params.companyId || null, params.projectId || null, params.amount || null, params.type)
}

export function markStripeEventProcessed(stripeEventId: string) {
  const db = getOrgDb()
  db.prepare("UPDATE org.stripe_events SET processed = 1 WHERE stripe_event_id = ?").run(stripeEventId)
}

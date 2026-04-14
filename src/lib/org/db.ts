/**
 * src/lib/org/db.ts
 * Database helpers for the org schema (org.* tables).
 * Uses Mission Control's existing better-sqlite3 connection.
 */

import { getDatabase } from '@/lib/db'

export interface Company {
  id: number
  name: string
  slug: string
  owners: string // JSON string
  stripe_account_id: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  company_id: number
  name: string
  description: string | null
  status: string
  stripe_product_id: string | null
  github_repo: string | null
  live_url: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: number
  company_id: number
  deal_id: number | null
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  due_date: string | null
  paid_date: string | null
  stripe_invoice_id: string | null
  created_at: string
  updated_at: string
}

export interface Owner {
  user_id: string
  name: string
  ownership_pct: number
}

export function getCompanyBySlug(slug: string): Company | null {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM org.companies WHERE slug = ?')
    .get(slug) as Company | null
}

export function getCompanyOwners(companyId: number): Owner[] {
  const db = getDatabase()
  const row = db
    .prepare('SELECT owners FROM org.companies WHERE id = ?')
    .get(companyId) as { owners: string } | undefined
  if (!row) return []
  try {
    return JSON.parse(row.owners) as Owner[]
  } catch {
    return []
  }
}

export function getProjectsByCompany(companyId: number): Project[] {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM org.projects WHERE company_id = ? ORDER BY created_at DESC')
    .all(companyId) as Project[]
}

export function getInvoicesByCompany(companyId: number): Invoice[] {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM org.invoices WHERE company_id = ? ORDER BY created_at DESC')
    .all(companyId) as Invoice[]
}

export function getPaidInvoicesByCompany(companyId: number): Invoice[] {
  const db = getDatabase()
  return db
    .prepare("SELECT * FROM org.invoices WHERE company_id = ? AND status = 'paid' ORDER BY paid_date ASC")
    .all(companyId) as Invoice[]
}

export function getMonthlyRevenue(
  companyId: number,
  months: number = 12
): Array<{ month: string; total: number; rob_share: number }> {
  const db = getDatabase()
  const owners = getCompanyOwners(companyId)
  const robPct = owners.find((o) => o.name === 'Rob')?.ownership_pct ?? 100

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months + 1)
  startDate.setDate(1)
  const startStr = startDate.toISOString().slice(0, 10)

  const rows = db
    .prepare(
      `SELECT paid_date, amount FROM org.invoices
       WHERE company_id = ? AND status = 'paid' AND paid_date >= ?
       ORDER BY paid_date ASC`
    )
    .all(companyId, startStr) as Array<{ paid_date: string; amount: number }>

  // Group by month
  const byMonth: Record<string, number> = {}
  for (const row of rows) {
    const month = row.paid_date.slice(0, 7) // YYYY-MM
    byMonth[month] = (byMonth[month] ?? 0) + row.amount
  }

  // Fill in all months in range
  const result: Array<{ month: string; total: number; rob_share: number }> = []
  const cur = new Date(startStr)
  const now = new Date()
  while (cur <= now) {
    const key = cur.toISOString().slice(0, 7)
    const total = byMonth[key] ?? 0
    result.push({
      month: key,
      total,
      rob_share: Math.round(total * (robPct / 100) * 100) / 100,
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return result
}

export function getRevenueByProject(
  companyId: number
): Array<{
  project_id: number
  project_name: string
  client: string
  total: number
  rob_pct: number
  rob_take: number
  status: string
}> {
  const db = getDatabase()
  const owners = getCompanyOwners(companyId)
  const robPct = owners.find((o) => o.name === 'Rob')?.ownership_pct ?? 100

  const rows = db
    .prepare(
      `SELECT
         p.id AS project_id,
         p.name AS project_name,
         COALESCE(c.company_name, 'Direct') AS client,
         COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS total,
         p.status
       FROM org.projects p
       LEFT JOIN org.contacts c ON c.project_id IS NULL AND c.company_id = p.company_id
       LEFT JOIN org.invoices i ON i.company_id = p.company_id
       WHERE p.company_id = ?
       GROUP BY p.id
       ORDER BY total DESC`
    )
    .all(companyId) as Array<{
    project_id: number
    project_name: string
    client: string
    total: number
    status: string
  }>

  return rows.map((r) => ({
    ...r,
    rob_pct: robPct,
    rob_take: Math.round(r.total * (robPct / 100) * 100) / 100,
  }))
}

export function getTotalRevenue(companyId: number): number {
  const db = getDatabase()
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM org.invoices WHERE company_id = ? AND status = 'paid'"
    )
    .get(companyId) as { total: number }
  return row.total
}

export function insertInvoice(
  companyId: number,
  amount: number,
  status: string,
  dueDate?: string,
  paidDate?: string
): number {
  const db = getDatabase()
  const result = db
    .prepare(
      `INSERT INTO org.invoices (company_id, amount, status, due_date, paid_date)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(companyId, amount, status, dueDate ?? null, paidDate ?? null)
  return result.lastInsertRowid as number
}

/**
 * Insert a manual revenue entry. Records the amount and date as a paid invoice.
 * Returns the inserted invoice ID.
 */
export function insertRevenueEntry(
  companyId: number,
  amount: number,
  _description: string,
  date: string,
  _projectId?: number
): number {
  const db = getDatabase()
  const result = db
    .prepare(
      `INSERT INTO org.invoices (company_id, amount, status, paid_date)
       VALUES (?, ?, 'paid', ?)`
    )
    .run(companyId, amount, date)
  return result.lastInsertRowid as number
}

// === DEALS ===
export interface Deal {
  id: number
  company_id: number
  project_id: number | null
  name: string
  value: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  expected_close_date: string | null
  owner_contact_id: number | null
  notes: string | null
  created_at: string
  updated_at: string
  project_name?: string
}

export interface Contact {
  id: number
  company_id: number
  name: string
  email: string | null
  phone: string | null
  role: string | null
  is_partner: boolean
  is_team_member: boolean
  company_name: string | null
  created_at: string
  updated_at: string
}

export function getDealsByCompany(companyId: number): Deal[] {
  const db = getDatabase()
  return db
    .prepare(
      `SELECT d.*, p.name as project_name
       FROM org.deals d
       LEFT JOIN org.projects p ON p.id = d.project_id
       WHERE d.company_id = ?
       ORDER BY d.updated_at DESC`
    )
    .all(companyId) as Deal[]
}

export function getContactsByCompany(companyId: number): Contact[] {
  const db = getDatabase()
  return db
    .prepare(
      `SELECT * FROM org.contacts WHERE company_id = ? ORDER BY name ASC`
    )
    .all(companyId) as Contact[]
}

export function insertDeal(
  companyId: number,
  data: {
    name: string
    value: number
    stage: string
    project_id?: number | null
    expected_close_date?: string | null
    notes?: string | null
  }
): number {
  const db = getDatabase()
  const result = db
    .prepare(
      `INSERT INTO org.deals (company_id, name, value, stage, project_id, expected_close_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      companyId,
      data.name,
      data.value,
      data.stage,
      data.project_id ?? null,
      data.expected_close_date ?? null,
      data.notes ?? null
    )
  return result.lastInsertRowid as number
}

export function updateDeal(
  dealId: number,
  data: Partial<{
    name: string
    value: number
    stage: string
    project_id: number | null
    expected_close_date: string | null
    notes: string | null
  }>
): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: unknown[] = []
  if (data.name !== undefined) {
    fields.push('name = ?')
    values.push(data.name)
  }
  if (data.value !== undefined) {
    fields.push('value = ?')
    values.push(data.value)
  }
  if (data.stage !== undefined) {
    fields.push('stage = ?')
    values.push(data.stage)
  }
  if ('project_id' in data) {
    fields.push('project_id = ?')
    values.push(data.project_id)
  }
  if ('expected_close_date' in data) {
    fields.push('expected_close_date = ?')
    values.push(data.expected_close_date)
  }
  if ('notes' in data) {
    fields.push('notes = ?')
    values.push(data.notes)
  }
  if (fields.length === 0) return
  values.push(dealId)
  db.prepare(`UPDATE org.deals SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteDeal(dealId: number): void {
  const db = getDatabase()
  db.prepare(`DELETE FROM org.deals WHERE id = ?`).run(dealId)
}

export function getDealById(dealId: number): Deal | null {
  const db = getDatabase()
  return db
    .prepare(
      `SELECT d.*, p.name as project_name
       FROM org.deals d
       LEFT JOIN org.projects p ON p.id = d.project_id
       WHERE d.id = ?`
    )
    .get(dealId) as Deal | null
}

export function insertContact(
  companyId: number,
  data: {
    name: string
    email?: string | null
    phone?: string | null
    role?: string | null
    is_partner?: boolean
    is_team_member?: boolean
    company_name?: string | null
  }
): number {
  const db = getDatabase()
  const result = db
    .prepare(
      `INSERT INTO org.contacts (company_id, name, email, phone, role, is_partner, is_team_member, company_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      companyId,
      data.name,
      data.email ?? null,
      data.phone ?? null,
      data.role ?? null,
      data.is_partner ? 1 : 0,
      data.is_team_member ? 1 : 0,
      data.company_name ?? null
    )
  return result.lastInsertRowid as number
}

export function updateContact(
  contactId: number,
  data: Partial<{
    name: string
    email: string | null
    phone: string | null
    role: string | null
    is_partner: boolean
    is_team_member: boolean
    company_name: string | null
  }>
): void {
  const db = getDatabase()
  const fields: string[] = []
  const values: unknown[] = []
  if (data.name !== undefined) {
    fields.push('name = ?')
    values.push(data.name)
  }
  if (data.email !== undefined) {
    fields.push('email = ?')
    values.push(data.email)
  }
  if (data.phone !== undefined) {
    fields.push('phone = ?')
    values.push(data.phone)
  }
  if (data.role !== undefined) {
    fields.push('role = ?')
    values.push(data.role)
  }
  if ('is_partner' in data) {
    fields.push('is_partner = ?')
    values.push(data.is_partner ? 1 : 0)
  }
  if ('is_team_member' in data) {
    fields.push('is_team_member = ?')
    values.push(data.is_team_member ? 1 : 0)
  }
  if ('company_name' in data) {
    fields.push('company_name = ?')
    values.push(data.company_name)
  }
  if (fields.length === 0) return
  values.push(contactId)
  db.prepare(`UPDATE org.contacts SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteContact(contactId: number): void {
  const db = getDatabase()
  db.prepare(`DELETE FROM org.contacts WHERE id = ?`).run(contactId)
}

export function getContactById(contactId: number): Contact | null {
  const db = getDatabase()
  return db.prepare(`SELECT * FROM org.contacts WHERE id = ?`).get(contactId) as Contact | null
}

export function getProjectsByCompanyForSelect(
  companyId: number
): Array<{ id: number; name: string }> {
  const db = getDatabase()
  return db
    .prepare(
      `SELECT id, name FROM org.projects WHERE company_id = ? AND status = 'active' ORDER BY name ASC`
    )
    .all(companyId) as Array<{ id: number; name: string }>
}

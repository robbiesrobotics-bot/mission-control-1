/**
 * lib/org/companies.ts
 * Company data access and business logic.
 */

import { getCompanyBySlug, getCompanyById, getCompanies } from './db'

export interface Company {
  id: number
  name: string
  slug: string
  owners: Array<{ user_id: string; name: string; ownership_pct: number }>
  stripe_account_id: string | null
  created_at: string
  updated_at: string
}

export interface CompanySummary {
  id: number
  name: string
  slug: string
  owner_count: number
  total_ownership: number
}

/**
 * Get all companies with summary data.
 */
export function listCompanies(): CompanySummary[] {
  const companies = getCompanies() as Company[]
  return companies.map((c) => {
    const owners = typeof c.owners === 'string' ? JSON.parse(c.owners) : c.owners ?? []
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      owner_count: owners.length,
      total_ownership: owners.reduce((s: number, o: { ownership_pct: number }) => s + o.ownership_pct, 0),
    }
  })
}

/**
 * Get a single company by slug, with parsed owners.
 */
export function getCompany(slugOrId: string | number): Company | null {
  const company = typeof slugOrId === 'string'
    ? getCompanyBySlug(slugOrId)
    : getCompanyById(slugOrId as number)
  if (!company) return null

  const c = company as Company
  return {
    ...c,
    owners: typeof c.owners === 'string' ? JSON.parse(c.owners) : (c.owners ?? []),
  }
}

/**
 * Resolve the primary owner (highest ownership %) for a company.
 */
export function getPrimaryOwner(company: Company): Company['owners'][0] | null {
  if (!company.owners.length) return null
  return [...company.owners].sort((a, b) => b.ownership_pct - a.ownership_pct)[0]
}

// ─── Slug utilities ─────────────────────────────────────────────────────────

const SLUG_BLACKLIST = new Set(['new', 'dashboard', 'api', 'admin', 'settings'])

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 2 || slug.length > 48) return false
  if (!/^[a-z0-9-]+$/.test(slug)) return false
  if (SLUG_BLACKLIST.has(slug)) return false
  return true
}

export function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

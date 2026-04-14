/**
 * GET /api/org/companies/[slug]/financials
 * Returns totalRevenue, robShare, monthly[], byProject[]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, getCompanyOwners, getMonthlyRevenue, getRevenueByProject, getTotalRevenue } from '@/lib/org/db'
import { calculateSplits } from '@/lib/org/split'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const owners = getCompanyOwners(company.id)
  const totalRevenue = getTotalRevenue(company.id)
  const monthly = getMonthlyRevenue(company.id, 12)
  const byProject = getRevenueByProject(company.id)

  // Calculate Rob's share
  const robOwner = owners.find((o) => o.name === 'Rob')
  const robPct = robOwner?.ownership_pct ?? 100
  const robShare = Math.round(totalRevenue * (robPct / 100) * 100) / 100

  // Owner splits for visualization
  const ownerSplits = calculateSplits(totalRevenue, owners)

  return NextResponse.json({
    companyId: company.id,
    companyName: company.name,
    totalRevenue,
    robShare,
    robPct,
    monthly,
    byProject,
    owners: ownerSplits,
  })
}

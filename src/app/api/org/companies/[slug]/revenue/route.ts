/**
 * POST /api/org/companies/[slug]/revenue
 * Manual revenue entry (create an invoice with optional project association).
 * Body: { amount: number, description: string, date: string (YYYY-MM-DD), project_id?: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, insertRevenueEntry } from '@/lib/org/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  let body: {
    amount?: number
    description?: string
    date?: string
    project_id?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { amount, description, date, project_id } = body

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }
  if (typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be in YYYY-MM-DD format' }, { status: 400 })
  }

  // Insert as a paid invoice by default (manual revenue entries are already received)
  const invoiceId = insertRevenueEntry(company.id, amount, description, date, project_id)

  return NextResponse.json(
    {
      success: true,
      invoiceId,
      entry: {
        id: invoiceId,
        company_id: company.id,
        amount,
        description: description.trim(),
        date,
        status: 'paid',
      },
    },
    { status: 201 }
  )
}

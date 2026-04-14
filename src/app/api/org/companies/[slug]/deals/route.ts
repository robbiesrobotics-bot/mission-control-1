import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, getDealsByCompany, insertDeal } from '@/lib/org/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }
  const deals = getDealsByCompany(company.id)
  return NextResponse.json({ deals })
}

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
    name?: string
    value?: number
    stage?: string
    project_id?: number | null
    expected_close_date?: string | null
    notes?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, value, stage, project_id, expected_close_date, notes } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (typeof value !== 'number' || value < 0) {
    return NextResponse.json({ error: 'value must be a non-negative number' }, { status: 400 })
  }
  const validStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  if (!stage || !validStages.includes(stage)) {
    return NextResponse.json({ error: 'stage must be one of: ' + validStages.join(', ') }, { status: 400 })
  }

  const dealId = insertDeal(company.id, {
    name: name.trim(),
    value,
    stage,
    project_id: project_id ?? null,
    expected_close_date: expected_close_date ?? null,
    notes: notes ?? null,
  })

  return NextResponse.json({ success: true, dealId }, { status: 201 })
}

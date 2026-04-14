import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, getDealById, updateDeal, deleteDeal } from '@/lib/org/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  const dealId = parseInt(id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 })
  }

  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const deal = getDealById(dealId)
  if (!deal || deal.company_id !== company.id) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  let body: Partial<{
    name: string
    value: number
    stage: string
    project_id: number | null
    expected_close_date: string | null
    notes: string | null
  }>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 })
  }
  if (body.value !== undefined && (typeof body.value !== 'number' || body.value < 0)) {
    return NextResponse.json({ error: 'value must be a non-negative number' }, { status: 400 })
  }
  if (body.stage !== undefined) {
    const validStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    if (!validStages.includes(body.stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }
  }

  updateDeal(dealId, body)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  const dealId = parseInt(id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 })
  }

  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const deal = getDealById(dealId)
  if (!deal || deal.company_id !== company.id) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  deleteDeal(dealId)
  return NextResponse.json({ success: true })
}

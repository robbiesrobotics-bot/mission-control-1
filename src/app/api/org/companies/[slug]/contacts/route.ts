import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, getContactsByCompany, insertContact } from '@/lib/org/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }
  const contacts = getContactsByCompany(company.id)
  return NextResponse.json({ contacts })
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
    email?: string | null
    phone?: string | null
    role?: string | null
    is_partner?: boolean
    is_team_member?: boolean
    company_name?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name } = body
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const contactId = insertContact(company.id, {
    name: name.trim(),
    email: body.email ?? null,
    phone: body.phone ?? null,
    role: body.role ?? null,
    is_partner: body.is_partner ?? false,
    is_team_member: body.is_team_member ?? false,
    company_name: body.company_name ?? null,
  })

  return NextResponse.json({ success: true, contactId }, { status: 201 })
}

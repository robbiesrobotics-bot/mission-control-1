import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, getContactById, updateContact, deleteContact } from '@/lib/org/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  const contactId = parseInt(id, 10)
  if (isNaN(contactId)) {
    return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 })
  }

  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const contact = getContactById(contactId)
  if (!contact || contact.company_id !== company.id) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  let body: Partial<{
    name: string
    email: string | null
    phone: string | null
    role: string | null
    is_partner: boolean
    is_team_member: boolean
    company_name: string | null
  }>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 })
  }

  updateContact(contactId, body)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  const contactId = parseInt(id, 10)
  if (isNaN(contactId)) {
    return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 })
  }

  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const contact = getContactById(contactId)
  if (!contact || contact.company_id !== company.id) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  deleteContact(contactId)
  return NextResponse.json({ success: true })
}

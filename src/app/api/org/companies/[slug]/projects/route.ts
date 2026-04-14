import { NextRequest, NextResponse } from 'next/server'
import { getCompanyBySlug, getProjectsByCompanyForSelect } from '@/lib/org/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const company = getCompanyBySlug(slug)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }
  const projects = getProjectsByCompanyForSelect(company.id)
  return NextResponse.json({ projects })
}

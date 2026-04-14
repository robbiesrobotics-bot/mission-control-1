/**
 * lib/org/auth.ts
 * JWT-based auth middleware for the org dashboard.
 * Verifies HS256 tokens and enforces company-level access control.
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import type { Db } from './db'

const JWT_SECRET = process.env.AUTH_JWT_SECRET || ''
const JWT_ALGORITHM = 'HS256'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JWTPayload {
  user_id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  companies: Array<{ slug: string; access_level: string; ownership_pct: number }>
  iat?: number
  exp?: number
}

export interface AuthResult {
  user: JWTPayload
}

export interface AuthError {
  error: string
  status: number
}

// ─── Token Verification ──────────────────────────────────────────────────────

export function verifyToken(token: string): JWTPayload {
  if (!JWT_SECRET) {
    throw new Error('AUTH_JWT_SECRET is not configured')
  }
  return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as JWTPayload
}

export function extractToken(req: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Fall back to cookie
  return req.cookies.get('org_session')?.value || null
}

// ─── Middleware Helpers ──────────────────────────────────────────────────────

/**
 * Require a valid JWT on the request.
 * Returns the decoded payload or a 401 NextResponse.
 */
export function requireAuth(req: NextRequest): AuthResult | NextResponse {
  const token = extractToken(req)
  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const user = verifyToken(token)
    return { user }
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Require that the authenticated user has access to the given company slug.
 * Returns the user payload or a 403 NextResponse.
 */
export function requireOrgAccess(
  req: NextRequest,
  companySlug: string
): AuthResult | NextResponse {
  const authResult = requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult
  const hasAccess = user.companies.some((c) => c.slug === companySlug)

  if (!hasAccess) {
    return new NextResponse(
      JSON.stringify({ error: 'You do not have access to this organization' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return { user }
}

/**
 * Require that the authenticated user has one of the specified roles
 * for the given company slug.
 */
export function requireRole(
  req: NextRequest,
  companySlug: string,
  ...roles: Array<'owner' | 'admin' | 'member' | 'viewer'>
): AuthResult | NextResponse {
  const authResult = requireOrgAccess(req, companySlug)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult
  const companyAccess = user.companies.find((c) => c.slug === companySlug)

  if (!companyAccess || !roles.includes(companyAccess.access_level as any)) {
    return new NextResponse(
      JSON.stringify({ error: 'Insufficient permissions for this action' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return { user }
}

// ─── Role Hierarchy ──────────────────────────────────────────────────────────

const ROLE_RANK: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
}

/**
 * Check if roleA implies at least the permissions of roleB.
 * e.g. isAtLeast('admin', 'member') → true
 */
export function isAtLeast(roleA: string, roleB: string): boolean {
  return (ROLE_RANK[roleA] ?? 0) >= (ROLE_RANK[roleB] ?? 0)
}

// ─── API Route Helper ───────────────────────────────────────────────────────

/**
 * Call this at the top of any org API route handler:
 *
 * export async function GET(req: NextRequest) {
 *   const auth = requireAuth(req)
 *   if (auth instanceof NextResponse) return auth
 *   const { user } = auth
 *   // ...
 * }
 */
export type { NextRequest, NextResponse }

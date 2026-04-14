/**
 * lib/org/split.ts
 * Partner split calculation engine.
 * Computes revenue splits based on ownership percentages per company.
 */

export interface OwnerShare {
  user_id: string
  name: string
  ownership_pct: number
}

export interface SplitResult {
  gross: number
  splits: Array<{
    user_id: string
    name: string
    ownership_pct: number
    amount: number
  }>
  total_pct: number
  unallocated: number
}

/**
 * Calculate partner splits for a given revenue amount and list of owners.
 * Returns a breakdown of how much each partner should receive.
 */
export function calculateSplits(revenueAmount: number, owners: OwnerShare[]): SplitResult {
  const totalPct = owners.reduce((sum, o) => sum + o.ownership_pct, 0)
  const unallocated = Math.max(0, 100 - totalPct)

  const splits = owners.map((owner) => ({
    user_id: owner.user_id,
    name: owner.name,
    ownership_pct: owner.ownership_pct,
    amount: Math.round((revenueAmount * owner.ownership_pct) / 10000) / 100, // to 2 decimal places
  }))

  return {
    gross: revenueAmount,
    splits,
    total_pct: totalPct,
    unallocated,
  }
}

/**
 * Calculate net income (revenue - expenses) and split among owners.
 */
export function calculateNetSplits(
  revenue: number,
  expenses: number,
  owners: OwnerShare[]
): SplitResult & { net: number } {
  const net = revenue - expenses
  const splits = calculateSplits(net, owners)
  return {
    ...splits,
    net,
  }
}

/**
 * Validate that ownership percentages sum to 100.
 */
export function validateOwnership(owners: OwnerShare[]): { valid: boolean; error?: string } {
  const total = owners.reduce((sum, o) => sum + o.ownership_pct, 0)

  if (Math.abs(total - 100) > 0.01) {
    return {
      valid: false,
      error: `Ownership percentages sum to ${total}%, expected 100%`,
    }
  }

  if (owners.some((o) => o.ownership_pct < 0)) {
    return { valid: false, error: 'Ownership percentage cannot be negative' }
  }

  return { valid: true }
}

/**
 * src/lib/org/split.ts
 * Partner split calculator.
 */

import type { Owner } from './db'

export interface OwnerSplit {
  name: string
  percentage: number
  amount: number
  color: string
}

// Predefined partner colors (sky blue for Rob, others cycle through palette)
const PARTNER_COLORS = [
  '#38BDF8', // sky-400 — Rob (always)
  '#A78BFA', // violet-400
  '#34D399', // emerald-400
  '#FB923C', // orange-400
  '#F472B6', // pink-400
  '#FBBF24', // amber-400
]

/**
 * Calculate each owner's dollar share from a total amount.
 * Rob's segment is always sky blue.
 */
export function calculateSplits(
  totalAmount: number,
  owners: Owner[]
): OwnerSplit[] {
  if (!owners || owners.length === 0) {
    return [{ name: 'Rob', percentage: 100, amount: totalAmount, color: '#38BDF8' }]
  }

  return owners.map((owner, index) => ({
    name: owner.name,
    percentage: owner.ownership_pct,
    amount: Math.round(totalAmount * (owner.ownership_pct / 100) * 100) / 100,
    color: owner.name === 'Rob' ? '#38BDF8' : PARTNER_COLORS[(index + 1) % PARTNER_COLORS.length],
  }))
}

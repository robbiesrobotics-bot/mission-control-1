'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import { DealKanban } from '@/components/org/crm/deal-kanban'
import { AddDealModal } from '@/components/org/crm/add-deal-modal'
import type { Deal } from '@/lib/org/db'

export default function DealsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/org/companies/${slug}/deals`)
      if (res.ok) {
        const data = await res.json()
        setDeals(data.deals ?? [])
      }
    } catch {
      // silent
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading deals...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Deal Pipeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} across {new Set(deals.map(d => d.stage)).size} stage{new Set(deals.map(d => d.stage)).size !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-void-cyan/20 text-void-cyan border border-void-cyan/30 px-3 py-1.5 text-sm font-medium hover:bg-void-cyan/30 transition-colors"
        >
          + Add Deal
        </button>
      </div>
      <DealKanban companySlug={slug} deals={deals} />
      {showAddModal && (
        <AddDealModal
          companySlug={slug}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchDeals() }}
        />
      )}
    </div>
  )
}

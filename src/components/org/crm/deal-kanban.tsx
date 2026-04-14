'use client'

import { useState } from 'react'
import { Deal } from '@/lib/org/db'
import { DealCard } from './deal-card'
import { AddDealModal } from './add-deal-modal'
import { cn } from '@/lib/utils'

interface DealKanbanProps {
  companySlug: string
  deals: Deal[]
}

type ColumnKey = 'lead' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

interface Column {
  key: ColumnKey
  label: string
  stages: Deal['stage'][]
}

const COLUMNS: Column[] = [
  { key: 'lead', label: 'Lead', stages: ['prospecting', 'qualification'] },
  { key: 'proposal', label: 'Proposal', stages: ['proposal'] },
  { key: 'negotiation', label: 'Negotiation', stages: ['negotiation'] },
  { key: 'closed_won', label: 'Closed Won', stages: ['closed_won'] },
  { key: 'closed_lost', label: 'Closed Lost', stages: ['closed_lost'] },
]

const COLUMN_HEADERS: Record<ColumnKey, { label: string; dotColor: string }> = {
  lead: { label: 'Lead', dotColor: 'bg-gray-400' },
  proposal: { label: 'Proposal', dotColor: 'bg-void-amber' },
  negotiation: { label: 'Negotiation', dotColor: 'bg-void-violet' },
  closed_won: { label: 'Closed Won', dotColor: 'bg-void-mint' },
  closed_lost: { label: 'Closed Lost', dotColor: 'bg-void-crimson' },
}

interface AddModalState {
  open: boolean
  defaultStage?: string
}

export function DealKanban({ companySlug, deals }: DealKanbanProps) {
  const [addModal, setAddModal] = useState<AddModalState>({ open: false })

  return (
    <div>
      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colDeals = deals.filter(d => col.stages.includes(d.stage))
          const { label, dotColor } = COLUMN_HEADERS[col.key]

          return (
            <div
              key={col.key}
              className="flex-shrink-0 w-72 bg-surface-0/50 rounded-xl border border-border"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground">
                    {colDeals.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddModal({ open: true, defaultStage: col.stages[0] })}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-surface-2"
                  title={`Add ${label} deal`}
                >
                  +
                </button>
              </div>

              {/* Column Body */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {colDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                {colDeals.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No deals
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Deal Modal */}
      {addModal.open && (
        <AddDealModal
          companySlug={companySlug}
          defaultStage={addModal.defaultStage}
          onClose={() => setAddModal({ open: false })}
          onSuccess={() => setAddModal({ open: false })}
        />
      )}
    </div>
  )
}

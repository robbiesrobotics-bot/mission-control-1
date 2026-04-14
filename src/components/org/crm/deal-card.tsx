'use client'

import { Deal } from '@/lib/org/db'
import { Badge } from '@/components/org/ui/badge'
import { cn } from '@/lib/utils'

const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Lead',
  qualification: 'Lead',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

function StageBadge({ stage }: { stage: string }) {
  if (stage === 'closed_won') return <Badge variant="success">{STAGE_LABELS[stage]}</Badge>
  if (stage === 'closed_lost') return <Badge variant="destructive">{STAGE_LABELS[stage]}</Badge>
  if (stage === 'proposal') return <Badge variant="warning">{STAGE_LABELS[stage]}</Badge>
  if (stage === 'negotiation') {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-void-violet/20 text-void-violet border border-void-violet/30">
        {STAGE_LABELS[stage]}
      </span>
    )
  }
  return <Badge variant="secondary">{STAGE_LABELS[stage]}</Badge>
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface DealCardProps {
  deal: Deal
  className?: string
}

export function DealCard({ deal, className }: DealCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-1 border border-border rounded-lg p-4',
        'transition-all duration-150',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
        'cursor-default',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-sm leading-tight text-foreground">{deal.name}</h3>
        <StageBadge stage={deal.stage} />
      </div>

      {deal.project_name && (
        <p className="text-xs text-muted-foreground mb-2">{deal.project_name}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-sm font-semibold text-foreground">
          {formatCurrency(deal.value)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(deal.expected_close_date)}
        </span>
      </div>

      {deal.notes && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{deal.notes}</p>
      )}
    </div>
  )
}

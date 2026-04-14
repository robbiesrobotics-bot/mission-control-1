'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export interface HealthBadgeProps {
  name: string
  status: HealthStatus
  lastChecked?: string
  details?: string
  className?: string
}

const STATUS_CONFIG: Record<HealthStatus, {
  dot: string
  label: string
  bg: string
  border: string
  text: string
  tooltipBg: string
}> = {
  healthy: {
    dot: 'bg-void-mint',
    label: 'Healthy',
    bg: 'bg-void-mint/10',
    border: 'border-void-mint/30',
    text: 'text-void-mint',
    tooltipBg: 'bg-void-mint',
  },
  degraded: {
    dot: 'bg-void-amber',
    label: 'Degraded',
    bg: 'bg-void-amber/10',
    border: 'border-void-amber/30',
    text: 'text-void-amber',
    tooltipBg: 'bg-void-amber',
  },
  down: {
    dot: 'bg-void-crimson',
    label: 'Down',
    bg: 'bg-void-crimson/10',
    border: 'border-void-crimson/30',
    text: 'text-void-crimson',
    tooltipBg: 'bg-void-crimson',
  },
  unknown: {
    dot: 'bg-muted-foreground/40',
    label: 'Unknown',
    bg: 'bg-surface-1',
    border: 'border-surface-2',
    text: 'text-muted-foreground',
    tooltipBg: 'bg-muted-foreground',
  },
}

export function HealthBadge({ name, status, lastChecked, details, className }: HealthBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = STATUS_CONFIG[status]

  return (
    <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors',
          config.bg,
          config.border,
          config.text,
          className
        )}
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
        <span className="whitespace-nowrap">{name}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 z-50 min-w-[180px] fade-in">
          <div className="bg-surface-1 border border-surface-2 rounded-md px-3 py-2.5 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
              <span className="text-sm font-semibold text-foreground">{config.label}</span>
            </div>
            {lastChecked && (
              <p className="text-xs text-muted-foreground">
                Last checked: {lastChecked}
              </p>
            )}
            {details && (
              <p className="text-xs text-muted-foreground mt-1">{details}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

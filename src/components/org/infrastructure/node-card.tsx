'use client'

import { cn } from '@/lib/utils'

export type NodeStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export interface NodeInfo {
  name: string
  hostname: string
  ip?: string
  status: NodeStatus
  lastSeen: string
  loadedModels?: string[]
  role?: string
}

export interface NodeCardProps {
  node: NodeInfo
  className?: string
}

const STATUS_CONFIG: Record<NodeStatus, { dot: string; label: string; text: string }> = {
  healthy: { dot: 'bg-void-mint', label: 'Healthy', text: 'text-void-mint' },
  degraded: { dot: 'bg-void-amber', label: 'Degraded', text: 'text-void-amber' },
  down: { dot: 'bg-void-crimson', label: 'Down', text: 'text-void-crimson' },
  unknown: { dot: 'bg-muted-foreground/40', label: 'Unknown', text: 'text-muted-foreground' },
}

export function NodeCard({ node, className }: NodeCardProps) {
  const statusConfig = STATUS_CONFIG[node.status]

  return (
    <div
      className={cn(
        'bg-surface-0 border border-surface-2 rounded-md p-4 flex flex-col gap-3',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{node.name}</h3>
          {node.role && (
            <p className="text-xs text-muted-foreground mt-0.5">{node.role}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn('w-2 h-2 rounded-full', statusConfig.dot)} />
          <span className={cn('text-xs font-medium', statusConfig.text)}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Connection info */}
      <div className="space-y-1">
        {node.hostname && (
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground shrink-0">
              <rect x="1" y="2" width="14" height="12" rx="1.5" />
              <path d="M5 14v2M11 14v2M4 16h8" />
            </svg>
            <span className="text-xs font-mono text-muted-foreground truncate">{node.hostname}</span>
          </div>
        )}
        {node.ip && (
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground shrink-0">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 1.5v13M1.5 8h13" />
            </svg>
            <span className="text-xs font-mono text-muted-foreground">{node.ip}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground shrink-0">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4v4l2.5 2.5" />
          </svg>
          <span className="text-xs text-muted-foreground">Last seen: {node.lastSeen}</span>
        </div>
      </div>

      {/* Models */}
      {node.loadedModels && node.loadedModels.length > 0 && (
        <div>
          <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Models</p>
          <div className="flex flex-wrap gap-1">
            {node.loadedModels.map((model) => (
              <span
                key={model}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-surface-1 border border-surface-2 text-muted-foreground"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

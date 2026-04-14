'use client'

import { HealthBadge, HealthStatus } from './health-badge'

export interface Pipeline {
  name: string
  status: HealthStatus
  lastChecked: string
  details?: string
}

export interface StatusGridProps {
  pipelines: Pipeline[]
  onRefresh: () => void
  isRefreshing: boolean
  className?: string
}

const PIPELINE_ORDER = [
  'Flux (Image Gen)',
  'LTX Video',
  'Voice (Whisper + Kokoro)',
  'ACE-Step Music',
  'Ollama',
]

function sortPipelines(pipelines: Pipeline[]): Pipeline[] {
  return [...pipelines].sort((a, b) => {
    const ai = PIPELINE_ORDER.findIndex(p => a.name.startsWith(p.split(' ')[0])) ?? 99
    const bi = PIPELINE_ORDER.findIndex(p => b.name.startsWith(p.split(' ')[0])) ?? 99
    return ai - bi
  })
}

export function StatusGrid({ pipelines, onRefresh, isRefreshing, className }: StatusGridProps) {
  const sorted = sortPipelines(pipelines)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Pipelines</h2>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
            bg-surface-1 border border-surface-2 text-muted-foreground
            hover:bg-surface-2 hover:text-foreground transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <path d="M2 8a6 6 0 0110.5-3.5" />
            <path d="M14 8a6 6 0 01-10.5 3.5" />
            <path d="M13 2v3.5h-3.5" />
            <path d="M3 14v-3.5h3.5" />
          </svg>
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sorted.map((pipeline) => (
          <HealthBadge
            key={pipeline.name}
            name={pipeline.name}
            status={pipeline.status}
            lastChecked={pipeline.lastChecked}
            details={pipeline.details}
          />
        ))}
      </div>
    </div>
  )
}

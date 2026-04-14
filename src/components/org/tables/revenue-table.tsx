'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/org/ui/card'

type ProjectRow = {
  project_id: number
  project_name: string
  client: string
  total: number
  rob_pct: number
  rob_take: number
  status: string
}

type Props = {
  data: ProjectRow[]
}

type SortKey = 'project_name' | 'client' | 'total' | 'rob_pct' | 'rob_take' | 'status'
type SortDir = 'asc' | 'desc'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    archived: 'bg-muted text-muted-foreground border-border',
  }
  const cls = classes[status] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {status}
    </span>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export function RevenueTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<ProjectRow | null>(null)

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function exportCSV() {
    const headers = ['Project', 'Client', 'Total Revenue', "Rob's %", "Rob's Take", 'Status']
    const rows = sorted.map((r) => [
      r.project_name,
      r.client,
      r.total,
      r.rob_pct,
      r.rob_take,
      r.status,
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'revenue-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: 'project_name', label: 'Project' },
    { key: 'client', label: 'Client' },
    { key: 'total', label: 'Total Revenue', align: 'right' },
    { key: 'rob_pct', label: "Rob's %", align: 'right' },
    { key: 'rob_take', label: "Rob's Take", align: 'right' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Revenue by Project</CardTitle>
          <button
            onClick={exportCSV}
            className="rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Export CSV
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      className={`cursor-pointer px-4 py-2 text-left text-xs font-medium text-muted-foreground select-none ${
                        col.align === 'right' ? 'text-right' : ''
                      }`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={row.project_id}
                    className={`cursor-pointer border-b border-border transition-colors hover:bg-muted/50 ${
                      selected?.project_id === row.project_id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelected(row)}
                  >
                    <td className="px-4 py-2 font-medium">{row.project_name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{row.client}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(row.total)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{row.rob_pct}%</td>
                    <td className="px-4 py-2 text-right font-medium text-sky-400">
                      {formatCurrency(row.rob_take)}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Side Panel */}
      {selected && (
        <Card className="w-72 shrink-0">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{selected.project_name}</CardTitle>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Client" value={selected.client} />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow label="Total Revenue" value={formatCurrency(selected.total)} />
            <DetailRow label="Rob's %" value={`${selected.rob_pct}%`} />
            <DetailRow
              label="Rob's Take"
              value={formatCurrency(selected.rob_take)}
              highlight
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-semibold text-sky-400' : 'font-medium'}>
        {value}
      </span>
    </div>
  )
}

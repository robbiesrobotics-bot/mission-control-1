'use client'

import { use, useState, useEffect } from 'react'
import { RevenueChart } from '@/components/org/charts/revenue-chart'
import { SplitVisualization } from '@/components/org/charts/split-visualization'
import { RevenueTable } from '@/components/org/tables/revenue-table'

type FinancialsData = {
  companyId: number
  companyName: string
  totalRevenue: number
  robShare: number
  robPct: number
  monthly: Array<{ month: string; total: number; rob_share: number }>
  byProject: Array<{
    project_id: number
    project_name: string
    client: string
    total: number
    rob_pct: number
    rob_take: number
    status: string
  }>
  owners: Array<{ name: string; percentage: number; amount: number; color: string }>
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function FinancialsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  // Data is fetched client-side via SWR in a real implementation.
  // For static rendering, we show a skeleton-like state and rely on the
  // GET /api/org/companies/[slug]/financials endpoint being called by a
  // client component wrapper. Here we render with empty data and let the
  // client-side data flow from the API.
  return <FinancialsClient slug={slug} />
}

function FinancialsClient({ slug }: { slug: string }) {
  // In production this would use useSWR or similar. For now we use fetch-on-render.
  const [data, setData] = useState<FinancialsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/org/companies/${slug}/financials`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load financials')
        return r.json()
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [slug])

  if (error) {
    return (
      <p className="p-4 text-sm text-destructive">Error: {error}</p>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
        <KpiCard
          label="Rob's Take"
          value={formatCurrency(data.robShare)}
          sub={`${data.robPct}% ownership`}
          accent="sky"
        />
        <KpiCard label="Projects" value={String(data.byProject.length)} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart data={data.monthly} />
        <SplitVisualization splits={data.owners} totalRevenue={data.totalRevenue} />
      </div>

      {/* Revenue table */}
      <RevenueTable data={data.byProject} />
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'sky' | 'green'
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          accent === 'sky' ? 'text-sky-400' : accent === 'green' ? 'text-emerald-400' : ''
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

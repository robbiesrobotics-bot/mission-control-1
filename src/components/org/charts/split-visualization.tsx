'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/org/ui/card'
import type { OwnerSplit } from '@/lib/org/split'

type Props = {
  splits: OwnerSplit[]
  totalRevenue: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function SplitVisualization({ splits, totalRevenue }: Props) {
  const isSolo = splits.length === 1 && splits[0].name === 'Rob'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Splits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bar */}
        <div className="relative h-8 w-full overflow-hidden rounded-full bg-muted">
          {isSolo ? (
            <div
              className="h-full rounded-full bg-void-violet"
              style={{ width: '100%' }}
              title="100% Rob"
            />
          ) : (
            splits.map((split, i) => {
              const leftPct = splits.slice(0, i).reduce((sum, s) => sum + s.percentage, 0)
              return (
                <div
                  key={split.name}
                  className="absolute top-0 h-full"
                  style={{
                    left: `${leftPct}%`,
                    width: `${split.percentage}%`,
                    backgroundColor: split.color,
                    borderRadius: i === 0 ? '9999px 0 0 9999px' : i === splits.length - 1 ? '0 9999px 9999px 0' : '0',
                  }}
                  title={`${split.name}: ${split.percentage}%`}
                />
              )
            })
          )}
          {/* Center label for solo */}
          {isSolo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">100% Rob</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {splits.map((split) => (
            <div key={split.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: split.color }}
              />
              <span className="text-xs text-muted-foreground">{split.name}</span>
              <span className="text-xs font-medium">
                {split.percentage}% · {formatCurrency(split.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Total Revenue</span>
            <span className="text-sm font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

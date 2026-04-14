import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'default' && 'bg-void-cyan/20 text-void-cyan border border-void-cyan/30',
        variant === 'secondary' && 'bg-surface-2 text-foreground border border-border',
        variant === 'outline' && 'border border-border text-foreground',
        variant === 'destructive' && 'bg-void-crimson/20 text-void-crimson border border-void-crimson/30',
        variant === 'success' && 'bg-void-mint/20 text-void-mint border border-void-mint/30',
        variant === 'warning' && 'bg-void-amber/20 text-void-amber border border-void-amber/30',
        className
      )}
      {...props}
    />
  )
}

export { Badge }

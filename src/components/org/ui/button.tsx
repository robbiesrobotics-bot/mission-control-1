import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variants
        variant === 'default' && 'bg-void-cyan text-void-foreground shadow hover:bg-void-cyan/90',
        variant === 'destructive' && 'bg-void-crimson text-white shadow-sm hover:bg-void-crimson/90',
        variant === 'outline' && 'border border-border bg-transparent hover:bg-surface-1 hover:text-foreground',
        variant === 'secondary' && 'bg-surface-1 text-foreground shadow-sm hover:bg-surface-2',
        variant === 'ghost' && 'hover:bg-surface-1 hover:text-foreground',
        variant === 'link' && 'text-void-cyan underline-offset-4 hover:underline',
        // Sizes
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-8 rounded-md px-3 text-xs',
        size === 'lg' && 'h-11 rounded-md px-8',
        size === 'icon' && 'h-10 w-10',
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button }

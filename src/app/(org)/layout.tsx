/**
 * src/app/(org)/layout.tsx
 * Root layout for the org dashboard route group.
 * Does NOT extend the MC root layout — fully isolated.
 */

import '../../globals.css'

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  )
}

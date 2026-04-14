/**
 * src/app/(org)/dashboard/page.tsx
 * Main org dashboard — aggregate view across all companies.
 */

export default function OrgDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground">Org Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Multi-company overview — wired by Felix (Foundation).
      </p>
    </div>
  )
}

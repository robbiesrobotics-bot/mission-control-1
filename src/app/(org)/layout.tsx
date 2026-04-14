import { OrgSidebar } from '@/components/org/layout/sidebar'

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden bg-background">
      <OrgSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

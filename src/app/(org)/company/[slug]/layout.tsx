/**
 * src/app/(org)/company/[slug]/layout.tsx
 * Company drill-down layout with tab navigation.
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/org/ui/tabs'
import Link from 'next/link'

const TABS = [
  { value: 'overview', label: 'Overview', href: '' },
  { value: 'financials', label: 'Financials', href: 'financials' },
  { value: 'projects', label: 'Projects', href: 'projects' },
  { value: 'deals', label: 'Deals', href: 'deals' },
  { value: 'contacts', label: 'Contacts', href: 'contacts' },
]

export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold capitalize">{params.slug.replace(/-/g, ' ')}</h1>
          <Tabs defaultValue="overview" className="mr-8">
            <TabsList>
              {TABS.map((tab) => (
                <Link key={tab.value} href={`/company/${params.slug}/${tab.href}`} className="contents">
                  <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}

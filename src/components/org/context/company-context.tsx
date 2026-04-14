'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/** Brand colors per company (matches spec) */
export const COMPANY_BRAND_COLORS: Record<string, string> = {
  'robbies-robotics': '#06b6d4',
  'calcifire-consulting': '#f59e0b',
  'livingassistedapp': '#10b981',
  'mixmasterrob-inc': '#8b5cf6',
  'sanchez-family-ventures': '#f97316',
  'alice-dev-shop': '#6366f1',
}

export interface Company {
  id: number
  name: string
  slug: string
  brandColor: string
  ownership: { name: string; pct: number }[]
  /** Total revenue this month in dollars (for switcher display) */
  revenueThisMonth: number
}

export const ALL_COMPANIES: Company[] = [
  {
    id: 1,
    name: 'Robbies Robotics',
    slug: 'robbies-robotics',
    brandColor: '#06b6d4',
    ownership: [{ name: 'Rob', pct: 100 }],
    revenueThisMonth: 24850,
  },
  {
    id: 2,
    name: 'Calcifire Consulting',
    slug: 'calcifire-consulting',
    brandColor: '#f59e0b',
    ownership: [
      { name: 'Rob', pct: 50 },
      { name: 'Alex Caruso', pct: 50 },
    ],
    revenueThisMonth: 11200,
  },
  {
    id: 3,
    name: 'LivingAssistedApp',
    slug: 'livingassistedapp',
    brandColor: '#10b981',
    ownership: [
      { name: 'Rob', pct: 50 },
      { name: 'Keisha Gist', pct: 50 },
    ],
    revenueThisMonth: 7650,
  },
  {
    id: 4,
    name: 'MixMasterRob Inc',
    slug: 'mixmasterrob-inc',
    brandColor: '#8b5cf6',
    ownership: [{ name: 'Rob', pct: 100 }],
    revenueThisMonth: 18200,
  },
  {
    id: 5,
    name: 'Sanchez Family Ventures',
    slug: 'sanchez-family-ventures',
    brandColor: '#f97316',
    ownership: [
      { name: 'Rob', pct: 25 },
      { name: 'Sloane', pct: 25 },
      { name: 'Sierra', pct: 25 },
      { name: 'Leanna', pct: 25 },
    ],
    revenueThisMonth: 5400,
  },
  {
    id: 6,
    name: 'A.L.I.C.E. Dev Shop',
    slug: 'alice-dev-shop',
    brandColor: '#6366f1',
    ownership: [{ name: 'Rob', pct: 100 }],
    revenueThisMonth: 9300,
  },
]

interface CompanyContextValue {
  currentCompany: Company
  setCurrentCompany: (company: Company) => void
  allCompanies: Company[]
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentCompany, setCurrentCompanyState] = useState<Company>(() => {
    const slug = searchParams.get('company')
    return ALL_COMPANIES.find(c => c.slug === slug) ?? ALL_COMPANIES[0]
  })

  const setCurrentCompany = useCallback(
    (company: Company) => {
      setCurrentCompanyState(company)
      const params = new URLSearchParams(searchParams.toString())
      params.set('company', company.slug)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Sync to URL param on mount
  useEffect(() => {
    const slug = searchParams.get('company')
    if (slug) {
      const found = ALL_COMPANIES.find(c => c.slug === slug)
      if (found) setCurrentCompanyState(found)
    }
  }, [searchParams])

  const value = useMemo(
    () => ({ currentCompany, setCurrentCompany, allCompanies: ALL_COMPANIES }),
    [currentCompany]
  )

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany must be used inside <CompanyProvider>')
  return ctx
}

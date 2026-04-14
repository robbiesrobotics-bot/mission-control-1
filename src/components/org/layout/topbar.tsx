'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useCompany } from '@/components/org/context/company-context'
import { Button } from '@/components/org/ui/button'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Top bar — 64px sticky, contains hamburger + company switcher + right actions */
export function OrgTopbar() {
  const { currentCompany, setCurrentCompany, allCompanies } = useCompany()
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const companyDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(e.target as Node)
      ) {
        setCompanyDropdownOpen(false)
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCompanySelect = useCallback(
    (company: (typeof allCompanies)[0]) => {
      setCurrentCompany(company)
      setCompanyDropdownOpen(false)
    },
    [setCurrentCompany]
  )

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-sm border-b border-border shrink-0"
    >
      <div className="h-full flex items-center px-4 gap-4">
        {/* Left: hamburger + sidebar toggle (placeholder) */}
        <button
          aria-label="Toggle sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-secondary transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="14" y2="8" />
            <line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>

        {/* Company Switcher */}
        <div className="relative" ref={companyDropdownRef}>
          <button
            onClick={() => setCompanyDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/60 hover:bg-secondary border border-border transition-colors min-w-[180px]"
            aria-haspopup="listbox"
            aria-expanded={companyDropdownOpen}
          >
            {/* Brand color dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: currentCompany.brandColor }}
            />
            <span className="text-sm font-medium text-foreground truncate">
              {currentCompany.name}
            </span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-muted-foreground ml-auto">
              <polyline points="4,6 8,10 12,6" />
            </svg>
          </button>

          {companyDropdownOpen && (
            <div
              role="listbox"
              className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] tracking-wider text-muted-foreground/60 font-semibold uppercase">
                  All Companies
                </p>
              </div>
              {allCompanies.map((company) => {
                const robOwnership = company.ownership.find(o => o.name === 'Rob')
                const isSelected = company.slug === currentCompany.slug
                return (
                  <button
                    key={company.slug}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleCompanySelect(company)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 hover:bg-secondary/80 transition-colors text-left ${
                      isSelected ? 'bg-secondary/50' : ''
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                      style={{ backgroundColor: company.brandColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {company.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {robOwnership ? `Rob ${robOwnership.pct}%` : 'No Rob stake'}
                        </span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatCurrency(company.revenueThisMonth)} this month
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-void-cyan shrink-0 mt-0.5">
                        <polyline points="3,8 6,11 13,4" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Search */}
        <button
          aria-label="Search (⌘K)"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/40 hover:bg-secondary border border-border transition-colors text-xs text-muted-foreground"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <circle cx="7" cy="7" r="4" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <span className="hidden sm:inline">
            <kbd className="font-mono">⌘K</kbd>
          </span>
        </button>

        {/* Notifications bell */}
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-secondary transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground">
            <path d="M6 13h4M3.5 10c0-1-1-2-1-4a5.5 5.5 0 0111 0c0 2-1 3-1 4H3.5z" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-void-cyan" />
        </button>

        {/* Alice chat toggle */}
        <button
          aria-label="Open Alice chat"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-void-cyan/10 hover:bg-void-cyan/20 border border-void-cyan/25 transition-colors text-xs text-void-cyan font-medium"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M13 3H3a1 1 0 00-1 1v6l3-2h8a1 1 0 001-1V4a1 1 0 00-1-1z" />
          </svg>
          <span className="hidden sm:inline">Alice</span>
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(v => !v)}
            className="flex items-center gap-2 rounded-md hover:bg-secondary transition-colors"
            aria-haspopup="menu"
            aria-expanded={userDropdownOpen}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
              R
            </div>
            <span className="hidden sm:block text-sm text-foreground">Rob</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground hidden sm:block">
              <polyline points="4,6 8,10 12,6" />
            </svg>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground">Rob</p>
                <p className="text-[11px] text-muted-foreground">admin@rob.dev</p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors">
                  Profile
                </button>
                <button className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors">
                  Settings
                </button>
                <div className="mx-2 border-t border-border my-1" />
                <button className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-secondary transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

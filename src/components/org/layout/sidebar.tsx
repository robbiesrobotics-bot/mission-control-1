'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Infrastructure',
    href: '/infrastructure',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="1" y="3" width="14" height="10" rx="1.5" />
        <path d="M5 13v2M11 13v2M4 15h8" />
        <circle cx="5" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="11" cy="8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

const externalLinks = [
  {
    label: 'Agent Team',
    href: 'http://localhost:3001',
    external: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M12 2l2 2-2 2" />
      </svg>
    ),
  },
]

export function OrgSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface-0 border-r border-surface-2 h-full">
      {/* Logo / Brand */}
      <div className="px-4 py-4 border-b border-surface-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-void-cyan/20 border border-void-cyan/30 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-void-cyan">
            <rect x="1" y="3" width="14" height="10" rx="1.5" />
            <path d="M5 13v2M11 13v2M4 15h8" />
            <circle cx="5" cy="8" r="1" fill="currentColor" stroke="none" />
            <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
            <circle cx="11" cy="8" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">Org Dashboard</p>
          <p className="text-2xs text-muted-foreground">Multi-company</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-2 mb-2">
          Workspace
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium transition-colors
                relative group
                ${active
                  ? 'bg-void-cyan/15 text-void-cyan'
                  : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 w-0.5 h-4 bg-void-cyan rounded-r" />
              )}
              <span className={`shrink-0 ${active ? 'text-void-cyan' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}

        {/* External links */}
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-2 mt-4 mb-2">
          External
        </p>
        {externalLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-surface-1 hover:text-foreground transition-colors group"
          >
            <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
              {link.icon}
            </span>
            {link.label}
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground">
              External
            </span>
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-2">
        <p className="text-2xs text-muted-foreground/50">A.L.I.C.E. Org</p>
      </div>
    </aside>
  )
}

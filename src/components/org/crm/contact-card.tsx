'use client'

import { Contact } from '@/lib/org/db'
import { cn } from '@/lib/utils'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface ContactCardProps {
  contact: Contact
  className?: string
}

export function ContactCard({ contact, className }: ContactCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-1 border border-border rounded-lg p-4',
        'transition-all duration-150',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
        'cursor-default',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">
            {getInitials(contact.name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{contact.name}</h3>
          {contact.role && (
            <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
          )}
          {contact.company_name && (
            <p className="text-xs text-muted-foreground/70 truncate">{contact.company_name}</p>
          )}
          {contact.email && (
            <p className="text-xs text-muted-foreground/60 truncate mt-1">{contact.email}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      {(contact.is_partner || contact.is_team_member) && (
        <div className="flex items-center gap-1.5 mt-3">
          {contact.is_partner && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-void-cyan/20 text-void-cyan border border-void-cyan/30">
              Partner
            </span>
          )}
          {contact.is_team_member && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-void-violet/20 text-void-violet border border-void-violet/30">
              Team
            </span>
          )}
        </div>
      )}
    </div>
  )
}

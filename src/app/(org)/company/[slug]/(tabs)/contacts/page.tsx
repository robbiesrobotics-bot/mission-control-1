'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import { ContactCard } from '@/components/org/crm/contact-card'
import type { Contact } from '@/lib/org/db'

export default function ContactsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/org/companies/${slug}/contacts`)
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts ?? [])
      }
    } catch {
      // silent
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading contacts...
      </div>
    )
  }

  const partnerCount = contacts.filter(c => c.is_partner).length
  const teamCount = contacts.filter(c => c.is_team_member).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Contacts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            {partnerCount > 0 && ` · ${partnerCount} partner${partnerCount !== 1 ? 's' : ''}`}
            {teamCount > 0 && ` · ${teamCount} team member${teamCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
        {contacts.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            No contacts yet. Add contacts via the API or database.
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useFocusTrap } from '@/lib/use-focus-trap'

interface Project {
  id: number
  name: string
}

interface AddDealModalProps {
  companySlug: string
  projectId?: number
  defaultStage?: string
  onClose: () => void
  onSuccess: () => void
}

const STAGES = [
  { value: 'prospecting', label: 'Lead (Prospecting)' },
  { value: 'qualification', label: 'Lead (Qualification)' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
]

export function AddDealModal({ companySlug, projectId, defaultStage = 'prospecting', onClose, onSuccess }: AddDealModalProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    project_id: projectId?.toString() ?? '',
    value: '',
    stage: defaultStage,
    expected_close_date: '',
    notes: '',
  })
  const firstInputRef = useRef<HTMLInputElement>(null)
  const focusTrapRef = useFocusTrap(onClose)

  useEffect(() => {
    fetch(`/api/org/companies/${companySlug}/projects`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.projects) setProjects(data.projects) })
      .catch(() => {})
  }, [companySlug])

  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Deal name is required')
      return
    }
    const value = parseFloat(form.value)
    if (isNaN(value) || value < 0) {
      setError('Value must be a non-negative number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/org/companies/${companySlug}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          project_id: form.project_id ? parseInt(form.project_id) : null,
          value,
          stage: form.stage,
          expected_close_date: form.expected_close_date || null,
          notes: form.notes.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to create deal')
        return
      }

      onSuccess()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={focusTrapRef}
        className="bg-surface-1 border border-border rounded-xl shadow-2xl w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-deal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="add-deal-title" className="text-base font-semibold">Add New Deal</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-void-crimson/10 border border-void-crimson/30 text-void-crimson text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Deal Name <span className="text-void-crimson">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-void-cyan/50"
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Value (USD) <span className="text-void-crimson">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-void-cyan/50"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Stage</label>
              <select
                value={form.stage}
                onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-void-cyan/50"
              >
                {STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Project</label>
              <select
                value={form.project_id}
                onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-void-cyan/50"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Expected Close</label>
              <input
                type="date"
                value={form.expected_close_date}
                onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-void-cyan/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-void-cyan/50 resize-none"
              placeholder="Any additional details..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-void-cyan px-4 py-2 text-sm font-medium text-void-foreground shadow hover:bg-void-cyan/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

# SHARED SPEC — Org Dashboard (mission-control-org)

> **All Felix instances must read this file before starting work.**
> This is the single source of truth for the org dashboard extension.

---

## Overview

The **Org Dashboard** is a multi-company management layer that extends [Mission Control](https://github.com/builderz-labs/mission-control) (Next.js, SQLite). It allows Rob to manage 6 companies — financials, projects, deals, contacts, and infrastructure — from a single unified view.

**Repo:** `https://github.com/robbiesrobotics/mission-control-org`
**Local:** `~/mission-control-org`
**Base:** Forked from `builderz-labs/mission-control` (SHA preserved for upstream merge)

---

## Architecture

```
mission-control-org/
├── src/
│   ├── app/
│   │   ├── (org)/                  ← Org route group (NEW)
│   │   │   ├── dashboard/           ← Main org dashboard
│   │   │   ├── company/[slug]/     ← Company drill-down
│   │   │   │   ├── page.tsx       ← Overview tab
│   │   │   │   ├── financials/     ← Financials tab
│   │   │   │   ├── projects/       ← Projects tab
│   │   │   │   ├── deals/          ← Deals/CRM tab
│   │   │   │   └── contacts/       ← Contacts tab
│   │   │   └── infrastructure/    ← Infra health view
│   │   └── (auth)/                 ← Existing MC auth routes
│   ├── components/
│   │   └── org/                    ← All org-specific components (NEW)
│   │       ├── cards/              ← StatCard, RevenueCard, DealCard
│   │       ├── charts/            ← RevenueChart, SplitChart
│   │       ├── crm/               ← DealKanban, ContactCard
│   │       ├── infrastructure/   ← HealthBadge, PipelineStatus
│   │       ├── layout/            ← OrgSidebar, OrgTopbar, CompanySwitcher
│   │       └── ui/                ← Shared primitives (Button, Input, Badge)
│   └── lib/org/                    ← Org-specific lib (NEW)
│       ├── auth.ts                ← JWT middleware
│       ├── db.ts                  ← Schema queries
│       ├── stripe.ts             ← Webhook handler
│       ├── split.ts              ← Partner split calculator
│       └── companies.ts          ← Company data access
├── db/
│   ├── schema/org-schema.sql       ← Full DDL
│   └── seeds/org-seed.sql         ← 6 companies + sample data
└── styles/org/                    ← Org-specific CSS overrides
```

---

## The 6 Companies

| ID | Name | Slug | Owners |
|----|------|------|--------|
| 1 | Robbies Robotics | `robbies-robotics` | Rob 100% |
| 2 | Calcifire Consulting | `calcifire-consulting` | Rob 50%, Alex Caruso 50% |
| 3 | LivingAssistedApp | `livingassistedapp` | Rob 50%, Keisha Gist 50% |
| 4 | MixMasterRob Inc | `mixmasterrob-inc` | Rob 100% |
| 5 | Sanchez Family Ventures | `sanchez-family-ventures` | Rob 25%, Sloane 25%, Sierra 25%, Leanna 25% |
| 6 | A.L.I.C.E. Dev Shop | `alice-dev-shop` | Rob 100% |

---

## Design Tokens — Mission Control Dark Theme

Colors are HSL-based CSS variables. All components use Tailwind utility classes — **do not hardcode hex values**.

```css
/* Background & Surface */
--background:     215 27% 4%   /* Page background */
--foreground:     210 20% 92%  /* Primary text */
--surface-0:      220 30% 8%   /* Card backgrounds */
--surface-1:      220 25% 11%  /* Elevated surfaces */
--surface-2:      220 20% 14%  /* Borders, dividers */

/* Brand / Accent */
--void-cyan:      187 82% 53%  /* Primary action, links */
--void-mint:       160 60% 52%  /* Success, positive values */
--void-amber:      38 92% 50%   /* Warning, pending */
--void-violet:     263 90% 66%  /* Deals, special states */
--void-crimson:    0 72% 51%    /* Error, destructive */

/* Semantic */
--success:         142 71% 45%
--warning:         38 92% 50%
--info:            217 91% 60%
```

### Typography
- **Sans:** Inter (variable `--font-sans`)
- **Mono:** JetBrains Mono (variable `--font-mono`)
- Scale: Tailwind defaults (text-sm, text-base, text-lg, text-xl, etc.)

### Spacing & Radius
- Border radius: `4px` (sm), `6px` (md), `8px` (lg)
- Consistent use of Tailwind `space-x-*` and `gap-*`

---

## API Routes (planned)

### Dashboard
- `GET /api/org/dashboard` — Aggregated stats across all companies

### Companies
- `GET /api/org/companies` — List all companies accessible to user
- `GET /api/org/companies/[slug]` — Single company detail
- `GET /api/org/companies/[slug]/stats` — Revenue, expenses, deal pipeline

### Financials
- `GET /api/org/companies/[slug]/financials` — Revenue, expenses, profit
- `GET /api/org/companies/[slug]/invoices` — Invoice list
- `POST /api/org/companies/[slug]/invoices` — Create invoice

### Projects
- `GET /api/org/companies/[slug]/projects` — Project list
- `POST /api/org/companies/[slug]/projects` — Create project
- `PATCH /api/org/companies/[slug]/projects/[id]` — Update project

### Deals / CRM
- `GET /api/org/companies/[slug]/deals` — Deal list / kanban view
- `POST /api/org/companies/[slug]/deals` — Create deal
- `PATCH /api/org/companies/[slug]/deals/[id]` — Update deal stage/value
- `GET /api/org/companies/[slug]/contacts` — Contact list
- `POST /api/org/companies/[slug]/contacts` — Create contact

### Infrastructure
- `GET /api/org/infrastructure` — Health status across all projects

### Stripe
- `POST /api/org/webhooks/stripe` — Stripe webhook receiver

---

## Component Inventory

### Cards (`components/org/cards/`)
| Component | Description | States |
|-----------|-------------|--------|
| `StatCard` | Metric tile (label + value + trend) | default, loading, positive-trend, negative-trend |
| `RevenueCard` | Revenue stat with period selector | default, loading |
| `DealCard` | Deal name, value, stage badge, expected close | default, hover |
| `ContactCard` | Contact name, role, company, email | default, hover |
| `OwnerSplitCard` | Owner name, %, split amount | default |

### Charts (`components/org/charts/`)
| Component | Description |
|-----------|-------------|
| `RevenueChart` | Monthly revenue bar/line chart (Recharts) |
| `SplitDonut` | Partner split donut chart |
| `DealPipelineChart` | Deal stage funnel visualization |
| `ExpenseBarChart` | Expense breakdown by category |

### CRM (`components/org/crm/`)
| Component | Description |
|-----------|-------------|
| `DealKanban` | Drag-and-drop deal board by stage |
| `ContactTable` | Sortable/filterable contact list |
| `DealForm` | Create/edit deal modal form |

### Infrastructure (`components/org/infrastructure/`)
| Component | Description |
|-----------|-------------|
| `HealthBadge` | Service health indicator (green/yellow/red) |
| `PipelineStatus` | Deployment pipeline status per project |
| `InfraGrid` | Grid of project health badges |

### Layout (`components/org/layout/`)
| Component | Description |
|-----------|-------------|
| `OrgSidebar` | Left nav with company list + Claw3D link |
| `OrgTopbar` | Breadcrumb, company switcher, user menu |
| `CompanySwitcher` | Dropdown to switch between companies |
| `OrgShell` | Page wrapper (sidebar + topbar + content) |

### UI Primitives (`components/org/ui/`)
Standard shadcn-style primitives: `Button`, `Input`, `Badge`, `Card`, `Select`, `Dialog`, `Tabs`, `Table`, `Skeleton`

---

## Claw3D Connection

**Claw3D** (the 3D agent visualization) runs on **port 3001** of the same host.

- **URL:** `http://localhost:3001`
- **Nav link:** `/agent-team` in the org sidebar
- **Integration:** `<iframe src="http://localhost:3001" />` embedded view or redirect

---

## Auth

- **Method:** JWT (HS256), stored in `org_session` cookie
- **Secret:** `AUTH_JWT_SECRET` env var
- **Middleware:** `lib/org/auth.ts` exports `requireAuth`, `requireOrgAccess`, `requireRole`
- Sessions are NOT shared with Mission Control's session system — org dashboard has its own JWT identity

---

## Key Constraints

1. **Do not modify existing MC files** — No touching `src/app/page.tsx`, `src/components/sidebar.tsx`, etc.
2. **Route group isolation** — All org routes go in `(org)/` which does NOT share the MC root layout
3. **TypeScript everywhere** — No `.js` files in org-specific code
4. **Upstream mergeability** — Keep MC files untouched so future `git merge upstream/main` works cleanly

---

## Notes for Felix Instances

- This spec is live and authoritative. If you find a conflict between this spec and a verbal request, this document wins.
- The `lib/org/auth.ts` helpers are the single auth implementation — do not create alternative auth patterns.
- For UI components, prefer shadcn/ui patterns and Tailwind — no inline styles.
- All monetary values are stored in cents (INTEGER) or dollars (REAL) — be consistent per table.
- The seed data is illustrative — Beta will replace with real data.

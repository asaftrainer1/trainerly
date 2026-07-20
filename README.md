# Trainerly

A premium SaaS web app for personal trainers — client management, workout programming, progress tracking, and payment tracking in one place.

Built with **React + TypeScript + Vite + Tailwind CSS + shadcn-style UI + Supabase**.

---

## What's inside

- **Secure auth** — email/password sign-up, sign-in, password reset (Supabase Auth)
- **Dashboard** — live stats (active clients, monthly revenue, outstanding balances, active programs), upcoming sessions, quick actions
- **Clients** — searchable/filterable roster, full CRUD, per-client detail pages
- **Programming** — build programs with training days and exercises (sets, reps, load), assign to clients or keep as templates
- **Progress tracking** — log weigh-ins and body measurements, visualized with trend charts
- **Payments** — record invoices, track paid/pending/overdue, monthly revenue summary
- **Fully responsive** — sidebar collapses to a mobile drawer; every screen works down to phone width
- **Production concerns** — loading skeletons, empty states, error boundaries, toast notifications, optimistic-friendly React Query caching

## Architecture

```
src/
  components/
    ui/          # shadcn-style primitives (button, dialog, table, toast…)
    layout/      # AppShell, Sidebar, TopBar
    dashboard/   # StatCard
    clients/     # ClientFormDialog
    workouts/    # ProgramFormDialog, WorkoutCard, ExerciseRow
    progress/    # ProgressChart, ProgressEntryDialog
    payments/    # PaymentFormDialog
    shared/      # EmptyState, ErrorBoundary, PageHeader, StatusBadge, LoadingSpinner
  hooks/         # useAuth, useClients, useWorkouts, useProgress, usePayments, useDashboard, use-toast
  lib/           # supabase client, utils
  pages/         # one file per screen (+ auth/)
  routes/        # AppRoutes, ProtectedRoute
  types/         # database.ts (generated-style Supabase types)
supabase/
  schema.sql     # full schema: tables, enums, RLS, triggers, storage buckets
```

Data access is centralized in typed React Query hooks. Every table is protected by Row Level Security so a trainer can only ever read/write their own data.

---

## Local setup

1. **Install**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run the contents of `supabase/schema.sql` in the SQL editor (Dashboard → SQL Editor → paste → Run).

3. **Add environment variables** — copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   (Find these in Supabase → Project Settings → API.)

4. **Run**
   ```bash
   npm run dev
   ```

---

## Moving this into Lovable

You have two options.

### Option A — via GitHub (recommended, keeps the code exactly as-is)

1. Create a new repository on GitHub.
2. Push this folder to it:
   ```bash
   cd trainerly
   git init
   git add .
   git commit -m "Trainerly initial"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/trainerly.git
   git push -u origin main
   ```
3. In Lovable, connect your GitHub account and import the repository. Everything comes across intact, and you can continue editing the UX/UI from there.

### Option B — rebuild from a prompt (no GitHub)

If you'd rather have Lovable generate its own version, describe the app to it and paste in the key files it needs as reference: `tailwind.config.ts` and `src/index.css` (the design system), `src/types/database.ts` (the data model), and `supabase/schema.sql` (the backend). Lovable will approximate the rest.

---

## Design system

Dark, focused workspace aesthetic: deep slate background, indigo primary, emerald for progress/success, amber for money. Inter for UI and data, subtle ambient gradient accents on hero cards and the auth panel. Motion is restrained (fade/scale on mount) and respects `prefers-reduced-motion`.

## Notes

- Sessions are modeled in the schema and surfaced on the dashboard; a full calendar/scheduling UI is a natural next addition.
- Avatar and progress-photo storage buckets are provisioned in the schema; wiring up uploads in Settings and the progress dialog is a small follow-up.

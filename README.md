# Badminton Team Tournament Scoreboard

Production-ready MVP web app for a 4-team badminton tournament with public live scores, umpire scoring, and admin operations.

## Stack
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind
- **Backend:** Supabase Postgres + Auth + Realtime + Storage
- **Deploy:** Vercel (frontend) + Supabase (backend)

## Features
- Public pages: Home, Live Scores, Schedule, Results, Standings
- Tie details page with all 7 categories and set-by-set display
- Live update subscriptions for `ties`, `tie_matches`, `match_sets`
- Umpire login + dashboard + mobile-first scoring controls
- Scoring actions: add point, undo, reset set, complete set, complete match
- Score audit trail in `score_events`
- Admin dashboard with seed trigger
- SQL migration with:
  - relational schema
  - reusable scoring functions
  - automatic tie/match rollups
  - RLS policies (public read, role-based write)
- Seed pipeline for:
  - 4 teams
  - sample players
  - round-robin 6 ties
  - 7 category matches per tie

## Project Structure
- `app/` Next.js pages and routes
- `components/` shared/public/umpire UI
- `lib/services/scoring.ts` reusable match logic abstraction
- `lib/services/actions.ts` server actions for score operations
- `supabase/migrations/001_init.sql` schema + RLS + functions
- `scripts/seed-data.ts` single edit point for teams, players, logos
- `scripts/seed-runner.ts` DB seed implementation

## Setup
1. Create a Supabase project.
2. Run SQL in `supabase/migrations/001_init.sql`.
3. Copy `.env.example` to `.env.local` and fill values.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Seed sample data:
   ```bash
   npm run seed
   ```
6. Start app:
   ```bash
   npm run dev
   ```

## Deployment
### Supabase
- Apply migration in SQL editor (or Supabase CLI migration flow).
- Configure authentication users for admin and umpires.
- Insert matching rows in `user_profiles` with roles.
- Upload logos to Supabase Storage (or keep static `public/logos/*`).

### Vercel
- Import repository.
- Add all env vars from `.env.example`.
- Deploy.

## Role Model
- **Public:** read-only access to schedule/live/results/standings.
- **Umpire:** updates assigned matches (or any match if `open_assignment_mode=true`).
- **Admin:** full CRUD and score correction access.

## Ranking Logic
Standings are computed by SQL function `get_standings()`:
1. Ties won (primary)
2. Match difference (secondary)
3. Set difference (tertiary)

## Customizing Teams/Players/Logos
Edit one file:
- `scripts/seed-data.ts`

Then re-run:
```bash
npm run seed
```

## Notes
- Scoring rules are encapsulated in `lib/services/scoring.ts` and DB functions for easy future adaptation.
- Real-time pages auto-refresh when subscribed table events arrive.
